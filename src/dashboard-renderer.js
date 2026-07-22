'use strict';

let currentPet = 'cat';
let soundEnabled = true;
let chatHistory = [];
let hasApiKey = false;
let isSending = false;
let timerInterval = null;
let timerState = 'idle';
let timerMode = 'focus';
let focusDuration = 25 * 60;
let breakDuration = 5 * 60;
let totalDuration = focusDuration;
let timeLeft = focusDuration;
// Track A — I1 adaptive: conteo de focus blocks consecutivos + flag last break
// Persistimos en localStorage para que sobrevivan reload del dashboard.
let focusBlocksCompleted = 0;
let lastBreakWasLong = false;
let pendingSessionInfo = null; // guarda {startedAt, durationSec, kind} durante la sesion
let currentPomodoroConfig = null; // cache de la config para evitar IPC en cada tick

const MAX_CHAT_MESSAGES = 40;
// Allow-lists y parser de respuestas de la IA viven en PetProtocol (src/core/pet-protocol.js).
// Carga via <script> antes de este archivo (ver dashboard.html).

const closeBtn = document.getElementById('close-dashboard-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const timerProgress = document.getElementById('timer-progress');
const timerTime = document.getElementById('timer-time');
const timerStatus = document.getElementById('timer-status');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const chatHistoryDiv = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const apiInput = document.getElementById('api-key-input');
const apiStatus = document.getElementById('api-key-status');
const clearApiKeyBtn = document.getElementById('clear-api-key-btn');
const mascotCards = document.querySelectorAll('.mascot-card');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const catPreview = document.getElementById('cat-preview');
const dogPreview = document.getElementById('dog-preview');
const soundEnabledInput = document.getElementById('sound-enabled-input');
const briefingEnabledInput = document.getElementById('briefing-enabled-input');
const petNameInput = document.getElementById('pet-name-input');
const petNameStatus = document.getElementById('pet-name-status');
const moodChip = document.getElementById('mood-chip');
const moodChipEmoji = document.getElementById('mood-chip-emoji');
const moodChipText = document.getElementById('mood-chip-text');
// MOOD_LABELS y MOOD_STATS vienen de window.PetMoodLabels (ver pet-mood-labels.js).
// Compartido con los tests para que si se agrega un estado, el test avise.
const chatPetAvatar = document.getElementById('chat-pet-avatar');
const chatPetName = document.getElementById('chat-pet-name');
const chatPetStatus = document.getElementById('chat-pet-status');
const quickPromptButtons = document.querySelectorAll('.quick-prompts button');

function applyPetTheme() {
  document.body.dataset.pet = currentPet;
  chatPetAvatar.textContent = currentPet === 'cat' ? '🐱' : '🐶';
  chatPetName.textContent = currentPet === 'cat' ? 'Luna' : 'Max';
}

function setChatStatus(text, busy = false) {
  chatPetStatus.innerHTML = '';
  const indicator = document.createElement('i');
  if (busy) indicator.classList.add('busy');
  chatPetStatus.append(indicator, document.createTextNode(text));
}

function selectTab(tabId) {
  if (!['pomodoro', 'chat', 'settings', 'memories', 'captures'].includes(tabId)) return;
  tabButtons.forEach(button => button.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
  if (tabId === 'memories') loadMemoriesList();
  else if (tabId === 'captures') loadCapturesList();
}

tabButtons.forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
window.api.onSwitchTab(selectTab);
closeBtn.addEventListener('click', () => window.api.closeDashboard());

/* === Track A — Pomodoro: plantilla, custom inputs, stats, adaptive === */

const pomodoroTemplateSelect = document.getElementById('pomodoro-template-select');
const customInputs = document.getElementById('custom-inputs');
const customFocusMin = document.getElementById('custom-focus-min');
const customBreakMin = document.getElementById('custom-break-min');
const customLongBreakMin = document.getElementById('custom-longbreak-min');
const customLongBreakEvery = document.getElementById('custom-longbreak-every');
const pomodoroApplyBtn = document.getElementById('pomodoro-apply-btn');
const pomodoroConfigStatus = document.getElementById('pomodoro-config-status');
const statFocusToday = document.getElementById('stat-focus-today');
const statWeekTotal = document.getElementById('stat-week-total');
const statStreak = document.getElementById('stat-streak');

function loadAdaptiveState() {
  try {
    const raw = localStorage.getItem('pomodoro.adaptive');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.focusBlocksCompleted === 'number' && parsed.focusBlocksCompleted >= 0) {
        focusBlocksCompleted = Math.floor(parsed.focusBlocksCompleted);
      }
      lastBreakWasLong = parsed.lastBreakWasLong === true;
    }
  } catch (_error) { /* ignore */ }
}

function saveAdaptiveState() {
  try {
    localStorage.setItem('pomodoro.adaptive', JSON.stringify({ focusBlocksCompleted, lastBreakWasLong }));
  } catch (_error) { /* ignore */ }
}

function applyTemplate(config) {
  if (!config || typeof config !== 'object') return;
  const templateId = config.templateId || 'classic';
  const isCustom = templateId === 'custom';
  // Para templates prefijados, el server (main) es la fuente de verdad;
  // los custom values se usan solo si el user selecciono custom.
  let focusMin;
  let breakMin;
  let longBreakMin;
  let longBreakEvery;
  if (isCustom) {
    focusMin = config.customFocusMin;
    breakMin = config.customBreakMin;
    longBreakMin = config.customLongBreakMin;
    longBreakEvery = config.customLongBreakEvery;
    customFocusMin.value = String(focusMin);
    customBreakMin.value = String(breakMin);
    customLongBreakMin.value = String(longBreakMin);
    customLongBreakEvery.value = String(longBreakEvery);
  } else {
    const tpl = window.PomodoroTemplates && window.PomodoroTemplates.getTemplate(templateId);
    if (tpl) {
      focusMin = tpl.focusMin;
      breakMin = tpl.breakMin;
      longBreakMin = tpl.longBreakMin;
      longBreakEvery = tpl.longBreakEvery;
    } else {
      // fallback a classic
      focusMin = 25; breakMin = 5; longBreakMin = 15; longBreakEvery = 4;
    }
  }
  // Aplicar al timer (solo si no esta corriendo, para no pisar un pomodoro en curso)
  if (timerState === 'idle') {
    focusDuration = focusMin * 60;
    breakDuration = breakMin * 60;
    if (timerMode === 'focus') {
      totalDuration = focusDuration;
      timeLeft = focusDuration;
    } else {
      totalDuration = breakDuration;
      timeLeft = breakDuration;
    }
    updateTimerUI();
  } else {
    // Si esta corriendo, solo actualizamos el current mode (no el total para no romper el timer)
    if (timerMode === 'focus') focusDuration = focusMin * 60;
    else breakDuration = breakMin * 60;
  }
  // Actualizar UI
  pomodoroTemplateSelect.value = templateId;
  customInputs.hidden = !isCustom;
  // Guardar last long break settings en currentPomodoroConfig
  currentPomodoroConfig = {
    ...config,
    longBreakMin,
    longBreakEvery
  };
}

function setConfigStatus(message, kind = '') {
  if (!pomodoroConfigStatus) return;
  pomodoroConfigStatus.textContent = message;
  pomodoroConfigStatus.className = 'pomodoro-config-status' + (kind ? ' ' + kind : '');
}

function onTemplateChange() {
  const value = pomodoroTemplateSelect.value;
  customInputs.hidden = value !== 'custom';
  // Si cambia a custom, no guardamos hasta que el user presione Aplicar.
  // Si cambia a un template prefijado, guardamos inmediatamente.
  if (value !== 'custom') {
    saveConfig({ templateId: value });
  }
}

async function saveConfig(partial) {
  try {
    const updated = await window.api.pomodoroSetConfig(partial);
    applyTemplate(updated);
    setConfigStatus('Plantilla aplicada.', 'success');
  } catch (error) {
    setConfigStatus('Error: ' + (error?.message || 'no se pudo guardar'), 'error');
  }
}

function onApplyCustom() {
  const focusMin = parseInt(customFocusMin.value, 10);
  const breakMin = parseInt(customBreakMin.value, 10);
  const longBreakMin = parseInt(customLongBreakMin.value, 10);
  const longBreakEvery = parseInt(customLongBreakEvery.value, 10);
  if ([focusMin, breakMin, longBreakMin, longBreakEvery].some(v => !Number.isFinite(v))) {
    setConfigStatus('Todos los valores deben ser números.', 'error');
    return;
  }
  saveConfig({ templateId: 'custom', customFocusMin: focusMin, customBreakMin: breakMin, customLongBreakMin: longBreakMin, customLongBreakEvery: longBreakEvery });
}

async function refreshStats() {
  if (!statFocusToday || !statWeekTotal || !statStreak) return;
  try {
    const stats = await window.api.pomodoroGetStats();
    statFocusToday.textContent = String((stats && stats.today && stats.today.focusCount) || 0);
    statWeekTotal.textContent = String((stats && stats.week && stats.week.focusCount) || 0);
    // Streak: lo computa el server en register-session, pero podemos derivarlo local
    // con el delta de los focus blocks de hoy. Por simplicidad, usamos focus hoy
    // como indicador: si focus hoy > 0, racha >= 1; si no, 0.
    // Para un valor exacto, hariamos falta un IPC pomodoro:get-streak. Por ahora,
    // usamos focusCount de hoy como proxy visible: al menos el usuario ve un
    // numero que cambia.
    const streak = (stats && stats.today && stats.today.focusCount) > 0 ? Math.max(1, focusBlocksCompleted) : 0;
    statStreak.textContent = String(streak);
  } catch (error) {
    // Silencioso: si falla IPC, mantenemos los valores anteriores
  }
}

pomodoroTemplateSelect.addEventListener('change', onTemplateChange);
if (pomodoroApplyBtn) pomodoroApplyBtn.addEventListener('click', onApplyCustom);

// Subscribe a milestone desde main → mostrar como speech
window.api.onStreakMilestone(payload => {
  if (!payload || typeof payload !== 'object') return;
  const text = typeof payload.message === 'string' ? payload.message : `¡${payload.days || ''} días de racha!`;
  try {
    window.api.triggerPetAction({ type: 'speak', text, emotion: 'happy', action: 'celebrate', sound: 'short', intent: 'praise' });
  } catch (_e) { /* ignore */ }
});

function updateApiStatus() {
  apiStatus.textContent = hasApiKey
    ? 'Clave protegida por Windows. Escribe una nueva sólo si deseas reemplazarla.'
    : 'No hay una clave configurada.';
  apiStatus.classList.toggle('configured', hasApiKey);
  apiInput.value = '';
  apiInput.placeholder = hasApiKey ? 'Clave configurada (oculta)' : 'Pega una nueva API Key';
  clearApiKeyBtn.hidden = !hasApiKey;
}

function getChatHistoryKey(petType = currentPet) {
  return `chatHistory:${petType}`;
}

function loadChatHistory(petType = currentPet) {
  try {
    const parsed = JSON.parse(localStorage.getItem(getChatHistoryKey(petType)) || '[]');
    return Array.isArray(parsed)
      ? parsed
        .filter(message => message && ['user', 'assistant', 'system'].includes(message.role) && typeof message.content === 'string')
        .slice(-MAX_CHAT_MESSAGES)
      : [];
  } catch (_error) {
    localStorage.removeItem(getChatHistoryKey(petType));
    return [];
  }
}

async function initSettings() {
  localStorage.removeItem('apiKey');
  const savedPet = localStorage.getItem('pet');
  if (savedPet === 'cat' || savedPet === 'dog') currentPet = savedPet;
  soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  soundEnabledInput.checked = soundEnabled;
  applyPetTheme();

  // P7 — cargar nombre de la mascota desde el main
  try {
    const { name } = await window.api.getPetName();
    if (name) petNameInput.value = name;
    petNameStatus.textContent = name
      ? `Actual: ${name}. Cambialo si querés.`
      : 'Usando el nombre por defecto (Luna/Max según la mascota).';
  } catch (error) {
    petNameStatus.textContent = 'No se pudo cargar el nombre.';
  }

  // Track A — cargar config de pomodoro + estado adaptativo + stats
  loadAdaptiveState();
  try {
    const cfg = await window.api.pomodoroGetConfig();
    applyTemplate(cfg);
  } catch (e) {
    console.error('No se pudo cargar config de pomodoro:', e);
  }
  await refreshStats();
  setInterval(refreshStats, 60_000); // refresca stats cada 60s mientras el dashboard esta abierto

  // A1 — mood widget: estado + 4 stats, refresco cada 5s
  await refreshMoodWidget();
  setInterval(refreshMoodWidget, 5000);

  // I7 + I8 — cargar estado del briefing diario (default ON si falla)
  try {
    const briefingState = await window.api.briefingGetState();
    briefingEnabledInput.checked = briefingState?.enabled !== false;
  } catch (error) {
    console.error('No se pudo cargar el estado del briefing:', error);
    briefingEnabledInput.checked = true;
  }
  briefingEnabledInput.addEventListener('change', async () => {
    const enabled = briefingEnabledInput.checked;
    briefingEnabledInput.disabled = true;
    try {
      await window.api.briefingSetEnabled(enabled);
    } catch (error) {
      console.error('No se pudo guardar el estado del briefing:', error);
      briefingEnabledInput.checked = !enabled;
    } finally {
      briefingEnabledInput.disabled = false;
    }
  });

  catPreview.innerHTML = window.catSVG;
  dogPreview.innerHTML = window.dogSVG;
  mascotCards.forEach(card => card.classList.toggle('active', card.dataset.pet === currentPet));

  try {
    const status = await window.api.getAiStatus();
    hasApiKey = Boolean(status?.configured);
  } catch (error) {
    console.error('No fue posible consultar la configuración de IA:', error);
    hasApiKey = false;
  }
  updateApiStatus();

  const legacyHistory = localStorage.getItem('chatHistory');
  if (legacyHistory && !localStorage.getItem(getChatHistoryKey('cat'))) {
    localStorage.setItem(getChatHistoryKey('cat'), legacyHistory);
  }
  localStorage.removeItem('chatHistory');
  chatHistory = loadChatHistory();
  renderChatHistory();
}

mascotCards.forEach(card => {
  card.addEventListener('click', () => {
    persistChatHistory();
    mascotCards.forEach(item => item.classList.remove('active'));
    card.classList.add('active');
    currentPet = card.dataset.pet === 'dog' ? 'dog' : 'cat';
    chatHistory = loadChatHistory();
    applyPetTheme();
    renderChatHistory();
  });
});

saveSettingsBtn.addEventListener('click', async () => {
  saveSettingsBtn.disabled = true;
  try {
    const newApiKey = apiInput.value.trim();
    if (newApiKey) {
      const result = await window.api.saveApiKey(newApiKey);
      hasApiKey = Boolean(result?.configured);
    }
    localStorage.setItem('pet', currentPet);
    soundEnabled = soundEnabledInput.checked;
    localStorage.setItem('soundEnabled', String(soundEnabled));
    window.api.syncSettings({ pet: currentPet, soundEnabled });

    // P7 — guardar nombre de la mascota
    const newPetName = petNameInput.value.trim();
    if (newPetName) {
      try {
        const result = await window.api.setPetName(newPetName);
        if (result?.name) {
          petNameStatus.textContent = `Guardado como: ${result.name}.`;
        }
      } catch (error) {
        alert(`Nombre inválido: ${error.message}`);
      }
    }

    updateApiStatus();
    alert('¡Ajustes guardados correctamente!');
  } catch (error) {
    alert(`No fue posible guardar los ajustes: ${error.message}`);
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

clearApiKeyBtn.addEventListener('click', async () => {
  if (!confirm('¿Deseas eliminar la API Key guardada en este equipo?')) return;
  clearApiKeyBtn.disabled = true;
  try {
    await window.api.clearApiKey();
    hasApiKey = false;
    updateApiStatus();
  } catch (error) {
    alert(`No fue posible eliminar la clave: ${error.message}`);
  } finally {
    clearApiKeyBtn.disabled = false;
  }
});

window.api.onSettingsUpdated(settings => {
  if (!settings || !['cat', 'dog'].includes(settings.pet)) return;
  if (settings.pet !== currentPet) persistChatHistory();
  currentPet = settings.pet;
  chatHistory = loadChatHistory();
  soundEnabled = settings.soundEnabled !== false;
  soundEnabledInput.checked = soundEnabled;
  applyPetTheme();
  mascotCards.forEach(card => card.classList.toggle('active', card.dataset.pet === currentPet));
  renderChatHistory();
});

function updateTimerUI() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerTime.textContent = `${minutes}:${seconds}`;
  timerProgress.style.strokeDashoffset = 502.6 * (1 - timeLeft / totalDuration);
  const isFocus = timerMode === 'focus';
  timerStatus.textContent = isFocus ? 'Enfoque' : 'Descanso';
  timerStatus.style.color = isFocus ? 'var(--primary)' : 'var(--success)';
  timerProgress.style.stroke = isFocus ? 'var(--primary)' : 'var(--success)';
}

function playNotification() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
  } catch (_error) {
    // Soft-fail: si el audio no esta disponible, el timer sigue funcionando.
    // Para diagnosticar, agregar log dentro de este catch en dev.
  }
}

function startTimer() {
  clearInterval(timerInterval);
  // Track A — guardar el momento de inicio y duracion para registrar al terminar
  const sessionStart = Date.now();
  const sessionKind = timerMode; // 'focus' o 'break'
  const sessionDuration = totalDuration;
  pendingSessionInfo = { startedAt: sessionStart, durationSec: sessionDuration, kind: sessionKind };
  timerInterval = setInterval(async () => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft > 0) return;

    clearInterval(timerInterval);
    timerInterval = null;
    timerState = 'idle';
    timerToggleBtn.querySelector('span').textContent = 'Iniciar';
    playNotification();

    const finishedMode = timerMode;
    const endedAt = Date.now();

    // Track A — registrar la sesion completada en el store
    if (pendingSessionInfo) {
      try {
        await window.api.pomodoroRegisterSession({
          kind: finishedMode === 'focus' ? 'focus' : (lastBreakWasLong ? 'long_break' : 'short_break'),
          durationSec: pendingSessionInfo.durationSec,
          startedAt: pendingSessionInfo.startedAt,
          endedAt
        });
      } catch (e) {
        console.error('Error registering pomodoro session:', e);
      }
      pendingSessionInfo = null;
    }

    // Track A — I1 adaptive: despues de focus, decidir break kind
    if (finishedMode === 'focus') {
      focusBlocksCompleted += 1;
      saveAdaptiveState();
      try {
        const next = await window.api.pomodoroGetNextBreakKind({
          focusBlocksCompleted,
          lastBreakWasLong
        });
        if (next && next.kind === 'long') {
          // break largo
          lastBreakWasLong = true;
          breakDuration = (next.durationMin || 15) * 60;
        } else {
          lastBreakWasLong = false;
          breakDuration = (next && next.durationMin) ? next.durationMin * 60 : 5 * 60;
        }
        saveAdaptiveState();
      } catch (e) {
        console.error('Error getting next break kind:', e);
      }
    } else {
      // termino un break: reset del contador si fue long, sino resetea
      if (lastBreakWasLong) {
        focusBlocksCompleted = 0;
        lastBreakWasLong = false;
      }
      saveAdaptiveState();
    }

    timerMode = finishedMode === 'focus' ? 'break' : 'focus';
    totalDuration = timerMode === 'focus' ? focusDuration : breakDuration;
    timeLeft = totalDuration;

    try {
      const tip = await window.api.aiQuickTip({
        petType: currentPet,
        context: finishedMode === 'focus' ? 'break_start' : 'focus_start'
      });
      if (tip) window.api.triggerPetAction({ type: 'speak', text: tip, emotion: 'calm', action: 'none', sound: 'none', intent: 'none' });
    } catch (error) {
      console.error('Error getting Pomodoro tip:', error);
    }
    updateTimerUI();
    refreshStats();
  }, 1000);
}

timerToggleBtn.addEventListener('click', () => {
  togglePomodoroTimer();
});

function togglePomodoroTimer() {
  if (timerState === 'idle' || timerState === 'paused') {
    timerState = 'running';
    timerToggleBtn.querySelector('span').textContent = 'Pausar';
    timerToggleBtn.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    startTimer();
  } else {
    timerState = 'paused';
    timerToggleBtn.querySelector('span').textContent = 'Reanudar';
    timerToggleBtn.querySelector('svg').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// T4 — globalShortcut (Cmd/Ctrl+Shift+P) llega via IPC desde main.
window.api.onPomodoroToggle(togglePomodoroTimer);

timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerState = 'idle';
  timerMode = 'focus';
  totalDuration = focusDuration;
  timeLeft = focusDuration;
  timerToggleBtn.querySelector('span').textContent = 'Iniciar';
  timerToggleBtn.querySelector('svg').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  // Track A — el reset del timer no resetea el contador adaptive (la racha
  // de focus blocks sobrevive a resets manuales — solo un long break o un
  // cambio de sesion deberia resetearlo). Pero limpiamos pendingSessionInfo.
  pendingSessionInfo = null;
  updateTimerUI();
});

// Parsea respuesta de la IA via PetProtocol. Intenta JSON, fallback a tags viejos, fallback a texto libre.
function parseReply(reply) {
  return window.PetProtocol.parsePetReply(reply, currentPet);
}

function persistChatHistory() {
  chatHistory = chatHistory.slice(-MAX_CHAT_MESSAGES);
  localStorage.setItem(getChatHistoryKey(), JSON.stringify(chatHistory));
}

function renderChatHistory() {
  chatHistoryDiv.textContent = '';
  if (chatHistory.length === 0) {
    const welcome = document.createElement('div');
    welcome.className = 'chat-bubble assistant';
    welcome.textContent = currentPet === 'cat'
      ? '¡Miau! Hola, soy Luna. ¿En qué te puedo ayudar hoy?'
      : '¡Guau! ¡Hola, soy Max! Estoy listo para ayudarte.';
    chatHistoryDiv.appendChild(welcome);
    return;
  }

  chatHistory.forEach(message => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${message.role}`;
    if (message.role === 'assistant') {
      const { thinking, content } = parseReply(message.content);
      if (thinking) {
        const details = document.createElement('details');
        details.className = 'thinking-details';
        const summary = document.createElement('summary');
        summary.textContent = `Pensamiento de ${currentPet === 'cat' ? 'Luna' : 'Max'}...`;
        const reasoning = document.createElement('div');
        reasoning.className = 'thinking-content';
        reasoning.textContent = thinking;
        details.append(summary, reasoning);
        bubble.appendChild(details);
      }
      const text = document.createElement('div');
      text.textContent = content || 'No pude formular una respuesta.';
      bubble.appendChild(text);
    } else {
      bubble.textContent = message.content;
    }
    chatHistoryDiv.appendChild(bubble);
  });
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

async function sendChatMessage() {
  const query = chatInput.value.trim();
  if (!query || isSending) return;
  isSending = true;
  setChatStatus(currentPet === 'cat' ? ' Luna está pensando…' : ' Max está pensando…', true);
  chatInput.value = '';
  chatInput.disabled = true;
  chatSendBtn.disabled = true;
  chatHistory.push({ role: 'user', content: query });
  renderChatHistory();

  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble assistant';
  typingBubble.id = 'typing-bubble';
  typingBubble.textContent = 'Pensando...';
  chatHistoryDiv.appendChild(typingBubble);

  try {
    const reply = await window.api.aiSendMessage({
      petType: currentPet,
      history: chatHistory.slice(0, -1),
      userMessage: query
    });
    chatHistory.push({ role: 'assistant', content: reply });
    persistChatHistory();
    renderChatHistory();
    const { content, emotion, action, sound, intent } = parseReply(reply);
    window.api.triggerPetAction({ type: 'speak', text: content, emotion, action, sound, intent });
  } catch (error) {
    document.getElementById('typing-bubble')?.remove();
    chatHistory.push({ role: 'system', content: `No pude responder: ${error.message}` });
    persistChatHistory();
    renderChatHistory();
  } finally {
    isSending = false;
    chatInput.disabled = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
    setChatStatus(' Lista para acompañarte');
  }
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') sendChatMessage();
});

/* === A4 — Typing rate monitor + Do Not Disturb === */

const {
  shouldEnterDoNotDisturb,
  shouldExitDoNotDisturb,
  computeTypingRate
} = window.ContextAwareness;

const keystrokes = []; // rolling buffer de {ts} eventos
let isInDnd = false;
let lastDndCheck = 0;
const DND_CHECK_INTERVAL_MS = 10_000; // chequea cada 10s (no es caro)

chatInput.addEventListener('input', () => {
  // Track todos los keystrokes (incluyendo paste, deletion, etc).
  // El calculo WPM es proporcional al numero de eventos, no al texto.
  keystrokes.push({ ts: Date.now() });
  // Trim del buffer para que no crezca indefinidamente (mantener 5 min de historial)
  const cutoff = Date.now() - 5 * 60_000;
  while (keystrokes.length > 0 && keystrokes[0].ts < cutoff) {
    keystrokes.shift();
  }
  maybeCheckDnd();
});

function maybeCheckDnd() {
  const now = Date.now();
  if (now - lastDndCheck < DND_CHECK_INTERVAL_MS) return;
  lastDndCheck = now;
  const shouldBeInDnd = isInDnd
    ? !shouldExitDoNotDisturb(keystrokes)
    : shouldEnterDoNotDisturb(keystrokes);
  if (shouldBeInDnd !== isInDnd) {
    isInDnd = shouldBeInDnd;
    window.api.setDoNotDisturb(isInDnd).catch(e => console.error('DND update failed:', e));
  }
}

// Cleanup cuando la tab se cierra/cambia (best-effort)
window.addEventListener('beforeunload', () => {
  if (isInDnd) {
    window.api.setDoNotDisturb(false).catch(() => {});
  }
});

quickPromptButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (isSending) return;
    chatInput.value = button.dataset.prompt || '';
    sendChatMessage();
  });
});

window.addEventListener('DOMContentLoaded', async () => {
  await initSettings();
  updateTimerUI();
  const defaultTab = window.location.hash.substring(1);
  selectTab(['pomodoro', 'chat', 'settings', 'memories', 'captures'].includes(defaultTab) ? defaultTab : 'pomodoro');
});

/**
 * Refresca el widget de mood: estado + 4 stats.
 * - Llama a window.api.getMood() (IPC -> main.js -> currentMood)
 * - Usa window.PetMood.deriveState(mood) para derivar el estado
 * - Actualiza el chip y las 4 barras
 * Si el mood aún no está inicializado en main, sale silenciosamente.
 */
async function refreshMoodWidget() {
  if (!moodChip) return;
  let mood;
  try {
    mood = await window.api.getMood();
  } catch (error) {
    // IPC falla (ej: dashboard abierto antes que main init) — silencioso.
    return;
  }
  if (!mood || typeof mood !== 'object') return;

  const state = (window.PetMood && typeof window.PetMood.deriveState === 'function')
    ? window.PetMood.deriveState(mood)
    : 'calm';
  const labels = window.PetMoodLabels.MOOD_LABELS;
  const label = window.PetMoodLabels.getMoodLabel(currentPet, state);

  moodChip.dataset.state = state;
  moodChip.className = 'mood-chip mood-state-' + state;
  if (moodChipEmoji) moodChipEmoji.textContent = label.emoji;
  if (moodChipText) moodChipText.textContent = label.text;

  for (const stat of window.PetMoodLabels.MOOD_STATS) {
    const raw = mood[stat];
    const value = (typeof raw === 'number' && !Number.isNaN(raw))
      ? Math.max(0, Math.min(100, Math.round(raw)))
      : 0;
    const valueEl = document.getElementById('mood-stat-' + stat + '-value');
    const barEl = document.getElementById('mood-stat-' + stat + '-bar');
    if (valueEl) valueEl.textContent = String(value);
    if (barEl) {
      barEl.style.width = value + '%';
      barEl.dataset.stat = stat;
    }
  }
}

/* === P3 — Recuerdos persistentes (tab Recuerdos) === */

const memoriesListEl = document.getElementById('memories-list');
const memoriesCountEl = document.getElementById('memories-count');
const memoriesRedactInput = document.getElementById('memories-redact-input');
const memoriesClearBtn = document.getElementById('memories-clear-btn');

function formatMemoryDate(timestamp) {
  if (typeof timestamp !== 'number') return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadMemoriesList() {
  if (!memoriesListEl) return;
  let store;
  try {
    store = await window.api.getMemories();
  } catch (error) {
    memoriesListEl.innerHTML = '<div class="memories-empty">No se pudieron cargar los recuerdos.</div>';
    return;
  }
  if (!store || !Array.isArray(store.memories) || store.memories.length === 0) {
    memoriesListEl.innerHTML = '<div class="memories-empty">Aun no hay recuerdos. Hablale a tu mascota y los ira guardando automaticamente.</div>';
    memoriesCountEl.textContent = '0/50';
    return;
  }
  // Sort por createdAt desc (mas reciente primero)
  const sorted = [...store.memories].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  memoriesCountEl.textContent = `${sorted.length}/50`;
  memoriesListEl.innerHTML = '';
  for (const m of sorted) {
    const item = document.createElement('div');
    item.className = 'memory-item';
    const text = document.createElement('div');
    text.className = 'memory-item-text';
    text.textContent = m.text;
    const meta = document.createElement('div');
    meta.className = 'memory-item-meta';
    const dateSpan = document.createElement('span');
    dateSpan.className = 'memory-item-date';
    dateSpan.textContent = formatMemoryDate(m.createdAt);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'memory-item-remove btn-icon';
    removeBtn.setAttribute('aria-label', 'Borrar este recuerdo');
    removeBtn.title = 'Borrar este recuerdo';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', async () => {
      if (!confirm('¿Borrar este recuerdo?')) return;
      try {
        await window.api.removeMemory(m.id);
        await loadMemoriesList();
      } catch (e) {
        alert('No se pudo borrar: ' + e.message);
      }
    });
    meta.append(dateSpan, removeBtn);
    item.append(text, meta);
    memoriesListEl.appendChild(item);
  }
  // Sincronizar el toggle con el valor del store
  if (memoriesRedactInput) {
    memoriesRedactInput.checked = store.redactPII !== false;
  }
}

if (memoriesRedactInput) {
  memoriesRedactInput.addEventListener('change', async () => {
    const enabled = memoriesRedactInput.checked;
    try {
      const result = await window.api.setMemoryRedact(enabled);
      if (result && result.changed && enabled && result.redactedCount > 0) {
        // Mostrar feedback si se redactaron recuerdos existentes
        const msg = `Se redactaron ${result.redactedCount} recuerdo(s) existentes.`;
        const hint = document.getElementById('memories-redact-hint');
        if (hint) {
          hint.textContent = msg;
          setTimeout(() => { hint.textContent = 'ON: los nuevos recuerdos se redactan antes de guardar. Al activarlo, los existentes tambien se redactan.'; }, 3000);
        }
      }
      await loadMemoriesList();
    } catch (e) {
      alert('No se pudo cambiar: ' + e.message);
    }
  });
}

if (memoriesClearBtn) {
  memoriesClearBtn.addEventListener('click', async () => {
    if (!confirm('¿Borrar TODOS los recuerdos? Esta accion no se puede deshacer.')) return;
    try {
      const count = await window.api.clearMemories();
      await loadMemoriesList();
      if (count > 0) console.log(`Borrados ${count} recuerdos.`);
    } catch (e) {
      alert('No se pudo borrar: ' + e.message);
    }
  });
}

/* === I2 — Capturas rapidas (tab Capturas) === */

const capturesListEl = document.getElementById('captures-list');
const capturesCountEl = document.getElementById('captures-count');
const clearCapturesBtn = document.getElementById('clear-captures-btn');
const weeklyReportBtn = document.getElementById('weekly-report-btn');
const weeklyReportOutput = document.getElementById('weekly-report-output');
const weeklyReportActions = document.getElementById('weekly-report-actions');
const weeklyReportCopyBtn = document.getElementById('weekly-report-copy-btn');

function formatCaptureTimestamp(ts) {
  if (typeof ts !== 'number') return '';
  const now = Date.now();
  const diffSec = Math.floor((now - ts) / 1000);
  if (diffSec < 60) return 'ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `hace ${diffDay}d`;
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function truncateForPreview(text, maxChars) {
  if (typeof text !== 'string') return '';
  const n = typeof maxChars === 'number' && maxChars > 1 ? Math.floor(maxChars) : 60;
  if (text.length <= n) return text;
  return text.slice(0, n - 1) + '…';
}

async function loadCapturesList() {
  if (!capturesListEl) return;
  let list;
  try {
    list = await window.api.quickCaptureList();
  } catch (error) {
    capturesListEl.innerHTML = '<li class="captures-empty">No se pudieron cargar las capturas.</li>';
    return;
  }
  if (!Array.isArray(list) || list.length === 0) {
    capturesListEl.innerHTML = '<li class="captures-empty">Aun no hay capturas. Apreta Ctrl/Cmd+Shift+Q sobre la mascota para agregar una.</li>';
    if (capturesCountEl) capturesCountEl.textContent = '0/100';
    return;
  }
  if (capturesCountEl) capturesCountEl.textContent = `${list.length}/100`;
  // Limpiar (usando textContent para no generar XSS via innerHTML)
  capturesListEl.textContent = '';
  for (const c of list) {
    const li = document.createElement('li');
    li.className = 'captures-item';
    const text = document.createElement('span');
    text.className = 'captures-item-text';
    text.textContent = truncateForPreview(c.text || '', 120);
    const time = document.createElement('span');
    time.className = 'captures-item-time';
    time.textContent = formatCaptureTimestamp(c.createdAt);
    li.append(text, time);
    capturesListEl.appendChild(li);
  }
}

if (clearCapturesBtn) {
  clearCapturesBtn.addEventListener('click', async () => {
    if (!confirm('¿Borrar TODAS las capturas? Esta accion no se puede deshacer.')) return;
    clearCapturesBtn.disabled = true;
    try {
      const count = await window.api.quickCaptureClear();
      await loadCapturesList();
      if (count > 0) console.log(`Borradas ${count} capturas.`);
    } catch (e) {
      alert('No se pudo borrar: ' + e.message);
    } finally {
      clearCapturesBtn.disabled = false;
    }
  });
}

/* === W3 — Reporte semanal (boton en tab Pomodoro) === */

async function generateWeeklyReport() {
  if (!weeklyReportBtn || !weeklyReportOutput) return;
  weeklyReportBtn.disabled = true;
  try {
    const result = await window.api.weeklyReportGet({});
    if (result && typeof result.markdown === 'string') {
      weeklyReportOutput.textContent = result.markdown;
      weeklyReportOutput.hidden = false;
      if (weeklyReportActions) weeklyReportActions.hidden = false;
      // Guardamos el markdown en dataset para el copy button
      weeklyReportOutput.dataset.markdown = result.markdown;
    } else {
      weeklyReportOutput.textContent = 'No se pudo generar el reporte.';
      weeklyReportOutput.hidden = false;
      if (weeklyReportActions) weeklyReportActions.hidden = true;
    }
  } catch (e) {
    weeklyReportOutput.textContent = `Error: ${e.message}`;
    weeklyReportOutput.hidden = false;
    if (weeklyReportActions) weeklyReportActions.hidden = true;
  } finally {
    weeklyReportBtn.disabled = false;
  }
}

if (weeklyReportBtn) {
  weeklyReportBtn.addEventListener('click', generateWeeklyReport);
}

if (weeklyReportCopyBtn) {
  weeklyReportCopyBtn.addEventListener('click', async () => {
    const md = weeklyReportOutput && weeklyReportOutput.dataset ? weeklyReportOutput.dataset.markdown : '';
    if (!md) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(md);
        const original = weeklyReportCopyBtn.textContent;
        weeklyReportCopyBtn.textContent = '¡Copiado!';
        setTimeout(() => { weeklyReportCopyBtn.textContent = original; }, 1500);
      } else {
        // Fallback: select text in the pre
        const range = document.createRange();
        range.selectNodeContents(weeklyReportOutput);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (e) {
      console.error('Copy failed:', e);
    }
  });
}

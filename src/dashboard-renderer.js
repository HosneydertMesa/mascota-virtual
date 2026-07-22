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
  if (!['pomodoro', 'chat', 'settings', 'memories'].includes(tabId)) return;
  tabButtons.forEach(button => button.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
  if (tabId === 'memories') loadMemoriesList();
}

tabButtons.forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
window.api.onSwitchTab(selectTab);
closeBtn.addEventListener('click', () => window.api.closeDashboard());

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

  // A1 — mood widget: estado + 4 stats, refresco cada 5s
  await refreshMoodWidget();
  setInterval(refreshMoodWidget, 5000);

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
  selectTab(['pomodoro', 'chat', 'settings', 'memories'].includes(defaultTab) ? defaultTab : 'pomodoro');
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

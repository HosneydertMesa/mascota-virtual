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
const ALLOWED_EMOTIONS = new Set(['happy', 'calm', 'sleepy', 'sad', 'excited']);
const ALLOWED_ACTIONS = new Set(['jump', 'walk', 'sleep', 'wag', 'none']);
const ALLOWED_SOUNDS = new Set(['meow', 'purr', 'bark', 'whine', 'sniff', 'none']);
const ALLOWED_INTENTS = new Set(['approach', 'retreat', 'play', 'sleep', 'wander', 'stay', 'none']);

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
  if (!['pomodoro', 'chat', 'settings'].includes(tabId)) return;
  tabButtons.forEach(button => button.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
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
});

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

function parseReply(reply) {
  let content = String(reply || '');
  let thinking = '';
  const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
    content = content.replace(thinkMatch[0], '').trim();
  }

  const emotionMatch = content.match(/\[EMOTION:\s*([a-z_]+)\]/i);
  const actionMatch = content.match(/\[ACTION:\s*([a-z_]+)\]/i);
  const soundMatch = content.match(/\[SOUND:\s*([a-z_]+)\]/i);
  const intentMatch = content.match(/\[INTENT:\s*([a-z_]+)\]/i);
  const candidateEmotion = emotionMatch?.[1]?.toLowerCase();
  const candidateAction = actionMatch?.[1]?.toLowerCase();
  const candidateSound = soundMatch?.[1]?.toLowerCase();
  const candidateIntent = intentMatch?.[1]?.toLowerCase();
  // Si la IA no devolvio NINGUN tag, el system prompt no se cumplio.
  if (!emotionMatch && !actionMatch && !soundMatch && !intentMatch) {
    console.warn('[parseReply] IA no devolvio tags. Respuesta:', JSON.stringify(content).slice(0, 200));
  }
  const emotion = ALLOWED_EMOTIONS.has(candidateEmotion) ? candidateEmotion : 'happy';
  const action = ALLOWED_ACTIONS.has(candidateAction) ? candidateAction : 'none';
  const sound = ALLOWED_SOUNDS.has(candidateSound) ? candidateSound : 'none';
  const intent = ALLOWED_INTENTS.has(candidateIntent) ? candidateIntent : 'none';
  content = content
    .replace(/\[EMOTION:\s*[a-z_]+\]/ig, '')
    .replace(/\[ACTION:\s*[a-z_]+\]/ig, '')
    .replace(/\[SOUND:\s*[a-z_]+\]/ig, '')
    .replace(/\[INTENT:\s*[a-z_]+\]/ig, '')
    .trim();
  return { thinking, content, emotion, action, sound, intent };
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
  selectTab(['pomodoro', 'chat', 'settings'].includes(defaultTab) ? defaultTab : 'pomodoro');
});

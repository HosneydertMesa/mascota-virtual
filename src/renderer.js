'use strict';

let currentPet = 'cat';
let soundEnabled = true;
let currentVisualState = null;
let speechTimeout = null;
let sleepTimeout = null;
let dragCandidate = null;
let isDragging = false;
let tailTime = 0;
let tailWagSpeed = 0.04;
let tailWagAmplitude = 1;
let currentPetX = 0;
let isQuickChatSending = false;
let quickChatHistory = [];
let nextEarTwitchAt = 0;

const DRAG_THRESHOLD_PX = 7;
const SLEEP_DELAY_MS = 45000;
const hoveredInteractiveElements = new Set();

const petContainer = document.getElementById('pet-container');
const petSvgWrapper = document.getElementById('pet-svg-wrapper');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');
const settingsBtn = document.getElementById('settings-btn');
const quickChatBtn = document.getElementById('quick-chat-btn');
const quickChatPanel = document.getElementById('quick-chat-panel');
const quickChatClose = document.getElementById('quick-chat-close');
const quickChatTitle = document.getElementById('quick-chat-title');
const quickChatSubtitle = document.getElementById('quick-chat-subtitle');
const quickChatReply = document.getElementById('quick-chat-reply');
const quickChatInput = document.getElementById('quick-chat-input');
const quickChatSend = document.getElementById('quick-chat-send');

// Allow-lists y parser de respuestas de la IA viven en PetProtocol (src/core/pet-protocol.js).
// Carga via <script> antes de este archivo (ver index.html).

function applyPetTheme() {
  document.body.dataset.pet = currentPet;
  quickChatTitle.textContent = currentPet === 'cat' ? 'Habla con Luna' : 'Habla con Max';
  quickChatSubtitle.textContent = currentPet === 'cat'
    ? 'Tu compañera está escuchando'
    : 'Tu compañero está listo';
}

function getQuickHistoryKey(petType = currentPet) {
  return `quickChatHistory:${petType}`;
}

function loadQuickChatHistory(petType = currentPet) {
  try {
    const parsed = JSON.parse(localStorage.getItem(getQuickHistoryKey(petType)) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string').slice(-6)
      : [];
  } catch (_error) {
    localStorage.removeItem(getQuickHistoryKey(petType));
    return [];
  }
}

function initSettings() {
  localStorage.removeItem('apiKey');
  const savedPet = localStorage.getItem('pet');
  if (savedPet === 'cat' || savedPet === 'dog') currentPet = savedPet;
  else localStorage.setItem('pet', currentPet);
  soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  const legacyQuickHistory = localStorage.getItem('quickChatHistory');
  if (legacyQuickHistory && !localStorage.getItem(getQuickHistoryKey())) {
    localStorage.setItem(getQuickHistoryKey(), legacyQuickHistory);
  }
  localStorage.removeItem('quickChatHistory');
  quickChatHistory = loadQuickChatHistory();

  applyPetTheme();
  setVisualState('idle', null, true);
  window.api.syncSettings({ pet: currentPet, soundEnabled });
  scheduleSleep();
}

function loadMascotSVG(petType, state) {
  if (petType === 'cat') {
    petSvgWrapper.innerHTML = state === 'walking'
      ? window.catWalkSVG
      : state === 'sleeping' ? window.catSleepSVG : window.catIdleSVG;
  } else {
    petSvgWrapper.innerHTML = state === 'walking'
      ? window.dogWalkSVG
      : state === 'sleeping' ? window.dogSleepSVG : window.dogIdleSVG;
  }
}

function setVisualState(state, direction = null, force = false) {
  if (force || currentVisualState !== state) {
    currentVisualState = state;
    loadMascotSVG(currentPet, state);
  }

  petContainer.classList.toggle('sleeping', state === 'sleeping');
  petContainer.classList.toggle('walking-bob', state === 'walking');
  petContainer.classList.toggle('cat-walk', state === 'walking' && currentPet === 'cat');
  petContainer.classList.toggle('dog-walk', state === 'walking' && currentPet === 'dog');
  if (direction) petContainer.classList.toggle('flipped', direction === 'right');
}

function updateMousePassthrough() {
  const shouldIgnore = !isDragging && hoveredInteractiveElements.size === 0;
  window.api.setIgnoreMouseEvents(shouldIgnore, shouldIgnore ? { forward: true } : undefined);
}

function setupInteraction() {
  [petContainer, speechBubble, quickChatPanel].forEach(element => {
    element.addEventListener('mouseenter', () => {
      hoveredInteractiveElements.add(element);
      updateMousePassthrough();
    });
    element.addEventListener('mouseleave', () => {
      hoveredInteractiveElements.delete(element);
      setTimeout(updateMousePassthrough, 0);
    });
  });
}

function beginDragCandidate(event) {
  if (event.button !== 0 || event.target.closest('#settings-btn, #quick-chat-btn')) return;
  dragCandidate = { x: event.screenX, y: event.screenY };
  petContainer.style.cursor = 'grabbing';
  wakeUp();
  event.preventDefault();
}

function moveDrag(event) {
  if (!dragCandidate) return;
  const distance = Math.hypot(event.screenX - dragCandidate.x, event.screenY - dragCandidate.y);
  if (!isDragging && distance >= DRAG_THRESHOLD_PX) {
    closeQuickChat();
    isDragging = true;
    hoveredInteractiveElements.add(petContainer);
    window.api.dragStart();
  }
  if (isDragging) window.api.dragMove();
}

function finishDrag() {
  if (!dragCandidate && !isDragging) return;
  const wasDragging = isDragging;
  dragCandidate = null;
  isDragging = false;
  petContainer.style.cursor = 'grab';
  if (wasDragging) window.api.dragEnd();
  scheduleSleep();
  setTimeout(updateMousePassthrough, 0);
}

petContainer.addEventListener('mousedown', beginDragCandidate);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', finishDrag);
window.addEventListener('blur', finishDrag);

settingsBtn.addEventListener('mousedown', event => event.stopPropagation());
quickChatBtn.addEventListener('mousedown', event => event.stopPropagation());
petContainer.addEventListener('dblclick', event => {
  if (event.target.closest('#settings-btn, #quick-chat-btn')) return;
  window.api.openDashboard('chat');
  wakeUp();
});
settingsBtn.addEventListener('click', event => {
  event.stopPropagation();
  window.api.openDashboard('settings');
  wakeUp();
});

function updateQuickChatSide() {
  quickChatPanel.classList.toggle('open-right', currentPetX < 310);
}

function openQuickChat() {
  window.petAudio?.unlock();
  updateQuickChatSide();
  quickChatPanel.hidden = false;
  quickChatBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('quick-chat-open');
  quickChatReply.textContent = currentPet === 'cat' ? '¿Qué tienes en mente?' : '¡Cuéntame! ¿En qué te ayudo?';
  setTimeout(() => quickChatInput.focus(), 0);
}

function closeQuickChat() {
  quickChatPanel.hidden = true;
  quickChatBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('quick-chat-open');
  hoveredInteractiveElements.delete(quickChatPanel);
  updateMousePassthrough();
}

quickChatBtn.addEventListener('click', event => {
  event.stopPropagation();
  if (quickChatPanel.hidden) openQuickChat();
  else closeQuickChat();
  wakeUp();
});
quickChatClose.addEventListener('click', closeQuickChat);

function scheduleSleep() {
  if (sleepTimeout) clearTimeout(sleepTimeout);
  sleepTimeout = setTimeout(goToSleep, SLEEP_DELAY_MS);
}

function goToSleep() {
  if (isDragging) {
    scheduleSleep();
    return;
  }
  closeQuickChat();
  speechBubble.classList.remove('visible');
  setVisualState('sleeping');
  window.api.setSleeping(true);
}

function wakeUp() {
  const wasSleeping = currentVisualState === 'sleeping';
  if (wasSleeping) {
    setVisualState('idle');
    window.api.setSleeping(false);
  }
  scheduleSleep();
}

function triggerHappyBounce() {
  wakeUp();
  petContainer.classList.remove('happy-bounce');
  void petContainer.offsetWidth;
  petContainer.classList.add('happy-bounce');
  setTimeout(() => petContainer.classList.remove('happy-bounce'), 800);
}

function triggerLandingBounce() {
  wakeUp();
  petContainer.classList.remove('landing-bounce');
  void petContainer.offsetWidth;
  petContainer.classList.add('landing-bounce');
  setTimeout(() => petContainer.classList.remove('landing-bounce'), 600);
}

function cleanThinkingTags(text) {
  return String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

// Wrapper que usa PetProtocol con el pet actual.
function parsePetReply(reply) {
  return window.PetProtocol.parsePetReply(reply, currentPet);
}

// Intenta extraer un JSON object de la respuesta. Acepta:
// - JSON puro: {"emotion":"happy",...}
// - JSON en markdown: ```json\n{...}\n```
// - JSON con prosa alrededor: "...texto... {...} ...mas texto..."
// - JSON con thinking antes: <think>...</think>{...}
// Devuelve { parsed, error } donde error explica por qué falló si aplica.
// (Implementado en PetProtocol, expuesto via window.PetProtocol)

// Parsea respuesta de la IA. Intenta JSON, fallback a tags viejos, fallback a texto libre.
// (Implementado en PetProtocol.parsePetReply)

function inferSound(text) {
  const normalized = String(text || '').toLowerCase();
  if (currentPet === 'cat') {
    if (normalized.includes('ronrone') || normalized.includes('purr')) return 'purr';
    if (normalized.includes('miau')) return 'meow';
  } else {
    if (normalized.includes('guau') || normalized.includes('ladra')) return 'bark';
    if (normalized.includes('olfatea') || normalized.includes('sniff')) return 'sniff';
  }
  return 'none';
}

function showSpeech(text, duration = 6000) {
  if (speechTimeout) clearTimeout(speechTimeout);
  const cleanedText = cleanThinkingTags(text);
  if (!cleanedText) return;
  speechText.textContent = cleanedText;
  speechBubble.classList.add('visible');
  speechTimeout = setTimeout(() => {
    speechBubble.classList.remove('visible');
    hoveredInteractiveElements.delete(speechBubble);
    updateMousePassthrough();
  }, duration);
}

window.api.onPetMoveState(data => {
  if (!data || typeof data.state !== 'string') return;
  if (data.state === 'walking') {
    wakeUp();
    setVisualState('walking', data.direction);
    tailWagSpeed = currentPet === 'cat' ? 0.06 : 0.12;
    tailWagAmplitude = 1.1;
  } else if (data.state === 'playing') {
    wakeUp();
    setVisualState('idle');
    tailWagSpeed = currentPet === 'cat' ? 0.08 : 0.16;
    tailWagAmplitude = 1.3;
    if (Math.random() < 0.025) {
      triggerHappyBounce();
      const messages = currentPet === 'cat'
        ? ['¡Miau! ¿Qué hace tu cursor aquí?', '¡Te sigo, humano!', '¡Te tengo!', '¡Miau!']
        : ['¡Guau! ¡Juguemos con el ratón!', '¡Te encontré!', '¿Me das un mimo?', '¡Guau!'];
      showSpeech(messages[Math.floor(Math.random() * messages.length)], 3000);
    }
  } else if (currentVisualState !== 'sleeping') {
    setVisualState('idle');
    scheduleSleep();
    tailWagSpeed = currentPet === 'cat' ? 0.04 : 0.06;
    tailWagAmplitude = 1;
  }
});

window.api.onSettingsUpdated(settings => {
  if (!settings) return;
  soundEnabled = settings.soundEnabled !== false;
  localStorage.setItem('soundEnabled', String(soundEnabled));
  if (!['cat', 'dog'].includes(settings.pet) || settings.pet === currentPet) return;
  localStorage.setItem(getQuickHistoryKey(), JSON.stringify(quickChatHistory.slice(-6)));
  currentPet = settings.pet;
  quickChatHistory = loadQuickChatHistory();
  localStorage.setItem('pet', currentPet);
  applyPetTheme();
  currentVisualState = null;
  setVisualState('idle', null, true);
  const hello = currentPet === 'cat'
    ? '¡Miau! Ahora soy Luna. ¡Vamos a trabajar tranquilos!'
    : '¡Guau! ¡Soy Max, tu fiel compañero! ¡A darle con energía!';
  handlePetAction({ type: 'speak', text: hello, emotion: 'excited', action: 'jump', sound: currentPet === 'cat' ? 'meow' : 'bark' });
});

function handlePetAction(data) {
  if (!data || data.type !== 'speak') return;
  wakeUp();
  showSpeech(data.text);
  const selectedSound = data.sound && data.sound !== 'none' ? data.sound : inferSound(data.text);
  if (soundEnabled && selectedSound !== 'none') window.petAudio?.play(selectedSound);

  if (data.emotion === 'excited') {
    triggerHappyBounce();
    tailWagSpeed = currentPet === 'cat' ? 0.1 : 0.2;
    tailWagAmplitude = 1.4;
  } else if (data.emotion === 'calm') {
    tailWagSpeed = currentPet === 'cat' ? 0.02 : 0.04;
    tailWagAmplitude = 0.7;
  } else if (data.emotion === 'sad') {
    tailWagSpeed = 0.008;
    tailWagAmplitude = 0.3;
  } else if (data.emotion === 'sleepy') {
    goToSleep();
  }

  if (data.action === 'jump') triggerHappyBounce();
  else if (data.action === 'sleep') goToSleep();
  else if (data.action === 'wag') {
    tailWagSpeed = currentPet === 'cat' ? 0.09 : 0.19;
    tailWagAmplitude = 1.35;
  }
}

window.api.onPetAction(handlePetAction);

async function sendQuickChatMessage() {
  const query = quickChatInput.value.trim();
  if (!query || isQuickChatSending) return;
  isQuickChatSending = true;
  quickChatInput.value = '';
  quickChatInput.disabled = true;
  quickChatSend.disabled = true;
  quickChatReply.textContent = currentPet === 'cat' ? 'Luna está pensando…' : 'Max está pensando…';
  quickChatHistory.push({ role: 'user', content: query });

  try {
    const reply = await window.api.aiSendMessage({
      petType: currentPet,
      history: quickChatHistory.slice(0, -1),
      userMessage: query
    });
    quickChatHistory.push({ role: 'assistant', content: reply });
    quickChatHistory = quickChatHistory.slice(-6);
    localStorage.setItem(getQuickHistoryKey(), JSON.stringify(quickChatHistory));
    const reaction = parsePetReply(reply);
    quickChatReply.textContent = reaction.content || 'Estoy contigo.';
    const actionPayload = { type: 'speak', ...reaction };
    handlePetAction(actionPayload);
    window.api.triggerPetAction(actionPayload);
  } catch (error) {
    quickChatReply.textContent = error.message.includes('API Key')
      ? 'Configura una nueva API Key desde Ajustes para poder conversar.'
      : `No pude responder: ${error.message}`;
  } finally {
    isQuickChatSending = false;
    quickChatInput.disabled = false;
    quickChatSend.disabled = false;
    quickChatInput.focus();
  }
}

quickChatSend.addEventListener('click', sendQuickChatMessage);
quickChatInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') sendQuickChatMessage();
  else if (event.key === 'Escape') closeQuickChat();
});

window.api.onWindowModeBar(data => {
  document.body.classList.remove('drag-mode');
  document.body.classList.add('bar-mode');
  currentPetX = Number(data?.petX) || 0;
  document.documentElement.style.setProperty('--pet-x', `${currentPetX}px`);
  document.documentElement.style.setProperty('--pet-y', '0px');
  if (data?.bounce) triggerLandingBounce();
});

window.api.onWindowModeDrag(() => {
  closeQuickChat();
  document.body.classList.remove('bar-mode');
  document.body.classList.add('drag-mode');
});

window.api.onUpdatePetPosition(data => {
  if (!Number.isFinite(data?.x) || !Number.isFinite(data?.y)) return;
  currentPetX = data.x;
  document.documentElement.style.setProperty('--pet-x', `${currentPetX}px`);
  document.documentElement.style.setProperty('--pet-y', `${data.y}px`);
  if (!quickChatPanel.hidden) updateQuickChatSide();
});

window.api.onTriggerAutonomousTip(async () => {
  if (currentVisualState === 'sleeping') return;
  try {
    const tip = await window.api.aiQuickTip({ petType: currentPet, context: 'work_tip' });
    if (tip) {
      handlePetAction({
        type: 'speak',
        text: tip,
        emotion: 'calm',
        action: 'none',
        sound: inferSound(tip)
      });
    }
  } catch (error) {
    console.error('Error triggering autonomous tip:', error);
  }
});

// Eventos del sistema operativo (lock/unlock/suspend/resume) llegan desde
// main via IPC `pet-system-event`. Reaccionamos igual que si el usuario
// hubiera puesto a dormir a la mascota manualmente.
window.api.onSystemEvent(data => {
  if (!data || typeof data.event !== 'string') return;
  if (data.event === 'lock' || data.event === 'suspend') {
    // El main process ya seteó isSleeping=true y frena el movimiento.
    // Solo tenemos que actualizar la visual.
    if (sleepTimeout) {
      clearTimeout(sleepTimeout);
      sleepTimeout = null;
    }
    closeQuickChat();
    speechBubble.classList.remove('visible');
    setVisualState('sleeping');
  } else if (data.event === 'unlock' || data.event === 'resume') {
    // El main espera 5s antes de marcar isSleeping=false; nosotros
    // podemos reflejar el wake visualmente alineados con eso usando el
    // mismo delay para evitar un flash "despierto → durmiendo".
    setTimeout(() => {
      if (currentVisualState === 'sleeping') {
        setVisualState('idle');
        window.api.setSleeping(false);
      }
      scheduleSleep();
    }, 5000);
  }
});

function maybeTwitchEar() {
  if (currentVisualState === 'sleeping' || isDragging) return;
  // ~0.25% por frame => ~1 twitch cada ~6.6s a 60fps
  if (Math.random() > 0.0025) return;
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const ear = petSvgWrapper.querySelector(`.pet-ear-${side}`);
  if (!ear || ear.classList.contains('ear-twitching')) return;
  ear.classList.add('ear-twitching');
  // Forzar reflow para reiniciar la animacion si ya estaba aplicada
  void ear.offsetWidth;
  setTimeout(() => ear.classList.remove('ear-twitching'), 500);
}

function animateTail() {
  tailTime += tailWagSpeed;
  maybeTwitchEar();
  const catTail = document.getElementById('cat-tail');
  const dogTail = document.getElementById('dog-tail');

  if (catTail) {
    const w1 = Math.sin(tailTime) * 12 * tailWagAmplitude;
    const w2 = Math.sin(tailTime - 0.7) * 18 * tailWagAmplitude;
    const w3 = Math.sin(tailTime - 1.4) * 22 * tailWagAmplitude;
    if (currentVisualState === 'walking') {
      catTail.setAttribute('d', `M 140,110 C ${160 + w1},100 ${170 + w2},75 ${175 + w3},55`);
    } else {
      catTail.setAttribute('d', `M 130,130 C ${148 + w1},120 ${160 + w2},92 ${165 + w3},70`);
    }
  }
  if (dogTail) {
    const w1 = Math.sin(tailTime * 2.5) * 8 * tailWagAmplitude;
    const w2 = Math.sin(tailTime * 2.5 - 0.5) * 14 * tailWagAmplitude;
    const w3 = Math.sin(tailTime * 2.5 - 1) * 18 * tailWagAmplitude;
    if (currentVisualState === 'walking') {
      dogTail.setAttribute('d', `M 138,110 C ${155 + w1},100 ${160 + w2},85 ${165 + w3},70`);
    } else {
      dogTail.setAttribute('d', `M 130,130 C ${145 + w1},118 ${151 + w2},100 ${157 + w3},84`);
    }
  }
  requestAnimationFrame(animateTail);
}

window.addEventListener('DOMContentLoaded', () => {
  setupInteraction();
  initSettings();
  initMicroPresence();
  requestAnimationFrame(animateTail);
  setTimeout(() => {
    triggerHappyBounce();
    showSpeech(currentPet === 'cat'
      ? '¡Miau! Hola, soy Luna. Trabajemos juntos hoy. Haz doble clic en mí para charlar.'
      : '¡Hola! ¡Soy Max! Hoy será un gran día de trabajo. Haz doble clic en mí.');
  }, 2000);
});

/* === Micro presence (batch 1) === */
/* Las funciones puras viven en src/core/pet-micro-presence.js pero el renderer
   no tiene require; las reimplementamos minimalmente acá (mismas formulas).
   En proxima iteracion se puede exponer via preload. */

const PUPIL_MAX_RADIUS = 4;
const YAWN_INTERVAL_MS = 5 * 60 * 1000;       // 5 min — estado normal
const YAWN_INTERVAL_TIRED_MS = 2 * 60 * 1000; // 2 min — energy < 25 (M4 mood-aware)
const YAWN_ENERGY_TIRED_THRESHOLD = 25;
let lastYawnAt = new Date();
let lastInteractionAt = Date.now();

// M4 — mood-aware yawn: si la mascota está cansada, bosteza más seguido.
// Reimplementacion local de getYawnIntervalMs (ver src/core/pet-micro-presence.js).
function getYawnIntervalMsLocal(mood) {
  if (mood && typeof mood.energy === 'number' && mood.energy < YAWN_ENERGY_TIRED_THRESHOLD) {
    return YAWN_INTERVAL_TIRED_MS;
  }
  return YAWN_INTERVAL_MS;
}

function shouldPupilDilateLocal() {
  const h = new Date().getHours();
  return h >= 20 || h < 7;
}

function clampLocal(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function computePupilPositionLocal(eyeCenter, cursorPos) {
  const dx = cursorPos.x - eyeCenter.x;
  const dy = cursorPos.y - eyeCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= PUPIL_MAX_RADIUS || dist === 0) {
    return { x: eyeCenter.x, y: eyeCenter.y };
  }
  const scale = PUPIL_MAX_RADIUS / dist;
  return { x: eyeCenter.x + dx * scale, y: eyeCenter.y + dy * scale };
}

function initMicroPresence() {
  // M1 — agregar clase 'breathing' al wrapper
  if (petSvgWrapper) petSvgWrapper.classList.add('breathing');

  // M3 — pupil dilation
  if (shouldPupilDilateLocal()) {
    document.body.classList.add('pupils-dilated');
  }
  // Re-evaluar cada hora
  setInterval(() => {
    document.body.classList.toggle('pupils-dilated', shouldPupilDilateLocal());
  }, 60 * 60 * 1000);

  // M2 — eye tracking (mousemove)
  document.addEventListener('mousemove', handlePupilTracking);
  // Inicializar pupilas al centro
  initPupilPositions();

  // M4 — yawn trigger cada 5 min en idle
  setInterval(checkYawn, 30 * 1000); // check cada 30s
}

function initPupilPositions() {
  const pupils = document.querySelectorAll('.pet-pupil');
  if (pupils.length === 0) return; // SVGs no tienen pupilas todavia
  pupils.forEach(pupil => {
    const cx = parseFloat(pupil.getAttribute('data-anchor-x') || pupil.getAttribute('cx') || '0');
    const cy = parseFloat(pupil.getAttribute('data-anchor-y') || pupil.getAttribute('cy') || '0');
    const r = shouldPupilDilateLocal() ? 3.2 : 2.0;
    pupil.setAttribute('r', String(r));
    pupil.setAttribute('cx', String(cx));
    pupil.setAttribute('cy', String(cy));
  });
}

function handlePupilTracking(event) {
  lastInteractionAt = Date.now();
  const pupils = document.querySelectorAll('.pet-pupil');
  if (pupils.length === 0) return;
  const wrapper = petSvgWrapper;
  if (!wrapper) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  // Las coordenadas de la pupila estan en el sistema del SVG.
  // Por ahora usamos una aproximacion: cursor en pixeles de pantalla
  // contra el anchor del ojo (tambien en pixeles de pantalla via getBoundingClientRect).
  // viewBox real de cat/dog SVGs es 0 0 200 200 (ver src/assets/cat.js, dog.js).
  const SVG_VIEWBOX = 200;
  const scale = wrapperRect.width / SVG_VIEWBOX;
  const cursorSvg = {
    x: (event.clientX - wrapperRect.left) / Math.max(scale, 0.01),
    y: (event.clientY - wrapperRect.top) / Math.max(scale, 0.01)
  };
  pupils.forEach(pupil => {
    const anchorX = parseFloat(pupil.getAttribute('data-anchor-x') || '0');
    const anchorY = parseFloat(pupil.getAttribute('data-anchor-y') || '0');
    const newPos = computePupilPositionLocal({ x: anchorX, y: anchorY }, cursorSvg);
    pupil.setAttribute('cx', newPos.x.toFixed(2));
    pupil.setAttribute('cy', newPos.y.toFixed(2));
  });
}

async function checkYawn() {
  const idleMs = Date.now() - lastInteractionAt;

  // M4 — mood-aware: el intervalo depende de la energy actual.
  // Si la IPC falla (main aún no inicializó), caemos al default (5 min).
  let intervalMs = YAWN_INTERVAL_MS;
  try {
    if (window.api && typeof window.api.getMood === 'function') {
      const mood = await window.api.getMood();
      intervalMs = getYawnIntervalMsLocal(mood);
    }
  } catch (_error) {
    // IPC no disponible → default.
  }

  if (idleMs < intervalMs) return;
  const elapsed = Date.now() - lastYawnAt.getTime();
  if (elapsed < intervalMs) return;
  triggerYawn();
  lastYawnAt = new Date();
}

function triggerYawn() {
  if (!petSvgWrapper) return;
  petSvgWrapper.classList.add('pet-yawn');
  setTimeout(() => petSvgWrapper.classList.remove('pet-yawn'), 1700);
  // Sugerir break via speech bubble (placeholder; en batch 1.5 lo conectamos a mood system)
  showSpeech(currentPet === 'cat'
    ? '*bosteza* ... ¿un descansito quizás?'
    : '*bosteza* ... ¿salimos a estirar las patas?');
}

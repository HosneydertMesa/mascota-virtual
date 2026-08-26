/* ============================================================
   MASCOTA VIRTUAL — MAIN RENDERER COORDINATOR
   Coordinates modular controllers: Viewport, Speech, Interaction,
   EyeTracker, Pomodoro, and IPC bridge.
   ============================================================ */

const MOOD_CLASSES = ['mood-happy', 'mood-calm', 'mood-sleepy', 'mood-sad', 'mood-bored'];

let viewport = null;
let speech = null;
let interaction = null;
let pomodoro = null;
let soundEnabled = true;
let currentPet = 'cat';
let sleepTimeout = null;
let sitTimeout = null;
let stretchTimeout = null;
let moodPollTimer = null;

// Ear twitch idle timer
let earTwitchTimer = null;

function moodStateFromApi(mood) {
  if (typeof window !== 'undefined' && window.PetMood && typeof window.PetMood.deriveState === 'function' && mood) {
    return window.PetMood.deriveState(mood);
  }
  if (!mood || typeof mood !== 'object') return 'calm';
  if (mood.energy < 25) return 'sleepy';
  if (mood.happiness < 25) return 'sad';
  if (mood.curiosity < 20 && mood.energy < 50) return 'bored';
  if (mood.happiness >= 70 && mood.energy >= 50) return 'happy';
  return 'calm';
}

function applyMoodClassTo(el, moodState) {
  if (!el) return;
  for (const cls of MOOD_CLASSES) el.classList.remove(cls);
  const next = MOOD_CLASSES.includes('mood-' + moodState) ? 'mood-' + moodState : 'mood-calm';
  el.classList.add(next);
}

function pickRestPose(moodState, random = Math.random) {
  if (moodState === 'bored') return 'stretching';
  if (moodState === 'sleepy') return random() < 0.5 ? 'laying' : 'sitting';
  return 'sitting';
}

function pickSitDelayMs(random = Math.random) {
  return 15000 + random() * 10000;
}

function pickStretchMs(random = Math.random) {
  return 1200 + random() * 800;
}

function isRestableState(state) {
  return state === 'idle' || state === 'sitting' || state === 'laying';
}

async function getMoodState() {
  try {
    if (typeof window === 'undefined' || !window.api || typeof window.api.getMood !== 'function') {
      return 'calm';
    }
    const mood = await window.api.getMood();
    return moodStateFromApi(mood);
  } catch (_err) {
    return 'calm';
  }
}

async function refreshMoodClass() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('pet-container');
  const state = await getMoodState();
  applyMoodClassTo(el, state);
}

function triggerEarTwitch() {
  if (document.body.classList.contains('sleeping') || document.body.classList.contains('drag-mode')) return;
  const leftEar = document.querySelector('.pet-ear-left');
  const rightEar = document.querySelector('.pet-ear-right');
  const ear = Math.random() < 0.5 ? leftEar : rightEar;
  if (!ear) return;
  ear.classList.remove('ear-twitching');
  void ear.offsetWidth; // reflow
  ear.classList.add('ear-twitching');
  setTimeout(() => ear.classList.remove('ear-twitching'), 450);
}

function clearIdleTimers() {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  if (sitTimeout) {
    clearTimeout(sitTimeout);
    sitTimeout = null;
  }
  if (stretchTimeout) {
    clearTimeout(stretchTimeout);
    stretchTimeout = null;
  }
}

function scheduleSleep(delayMs = 45000) {
  if (sleepTimeout) clearTimeout(sleepTimeout);
  sleepTimeout = setTimeout(() => {
    if (viewport && isRestableState(viewport.currentState)) {
      viewport.setState('sleeping');
      if (window.api?.setSleeping) window.api.setSleeping(true);
    }
  }, delayMs);
}

function scheduleIdleVariety() {
  clearIdleTimers();
  sitTimeout = setTimeout(() => {
    void (async () => {
      if (!viewport || viewport.currentState === 'walking') return;
      const moodState = await getMoodState();
      if (!viewport || viewport.currentState === 'walking') return;
      const pose = pickRestPose(moodState);
      if (pose === 'stretching') {
        startStretchThenIdle();
        return;
      }
      if (pose === 'laying') {
        viewport.setState('laying');
      } else {
        viewport.setState('sitting');
      }
    })();
  }, pickSitDelayMs());
  scheduleSleep(45000);
}

function startStretchThenIdle() {
  if (!viewport) return;
  if (viewport.currentState === 'walking') return;
  if (stretchTimeout) {
    clearTimeout(stretchTimeout);
    stretchTimeout = null;
  }
  viewport.setState('stretching');
  stretchTimeout = setTimeout(() => {
    stretchTimeout = null;
    if (viewport && viewport.currentState === 'stretching') {
      viewport.setState('idle');
      scheduleIdleVariety();
    }
  }, pickStretchMs());
}

function wakeUp(opts = {}) {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  const wasSleeping = viewport && viewport.currentState === 'sleeping';
  if (wasSleeping && window.api?.setSleeping) window.api.setSleeping(false);
  if (opts.skipStretch) return;
  if (wasSleeping) {
    startStretchThenIdle();
  }
}

function triggerHappyBounce() {
  const container = document.getElementById('pet-container');
  if (container) {
    container.classList.remove('landing-bounce');
    void container.offsetWidth;
    container.classList.add('landing-bounce');
    setTimeout(() => container.classList.remove('landing-bounce'), 600);
  }
  if (viewport && viewport.currentState !== 'walking') {
    startStretchThenIdle();
  }
}

function initQuickChat() {
  const panel = document.getElementById('quick-chat-panel');
  const btn = document.getElementById('quick-chat-btn');
  const closeBtn = document.getElementById('quick-chat-close');
  const input = document.getElementById('quick-chat-input');
  const sendBtn = document.getElementById('quick-chat-send');
  const reply = document.getElementById('quick-chat-reply');

  if (!panel || !btn) return;

  function toggle(open) {
    const isOpen = open !== undefined ? open : panel.hidden;
    panel.hidden = !isOpen;
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('quick-chat-open', isOpen);
    if (isOpen && input) setTimeout(() => input.focus(), 50);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));

  async function handleSend() {
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    if (reply) reply.textContent = 'Pensando...';
    try {
      if (window.api?.aiSendMessage) {
        const res = await window.api.aiSendMessage({
          userMessage: text,
          petType: currentPet,
          history: []
        });
        // B1 fix (commit chat-bugs-leak): raw LLM response viene envuelto en
        // <think>...</think> + JSON. Sin cleanChatResponse, el chat mostraba
        // el JSON crudo. Ver docs/plans/chat-bugs-leak-and-close-2026-08-25.md
        const fallback = currentPet === 'cat' ? '¡Miau! Hola amigo.' : '¡Guau! Hola amigo.';
        const resText = cleanChatResponse(res, currentPet, fallback);
        if (reply) reply.textContent = resText;
        if (speech) speech.show(resText);
      } else {
        const fallback = currentPet === 'cat' ? '¡Miau! ¿En qué te ayudo?' : '¡Guau! ¿Qué hacemos hoy?';
        if (reply) reply.textContent = fallback;
        if (speech) speech.show(fallback);
      }
    } catch (_err) {
      const fallback = currentPet === 'cat' ? '¡Miau! ¿Cómo estás hoy?' : '¡Guau! ¡Listo para trabajar!';
      if (reply) reply.textContent = fallback;
      if (speech) speech.show(fallback);
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
      if (e.key === 'Escape') toggle(false);
    });
  }
}

function initSettingsButton() {
  const btn = document.getElementById('settings-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.api?.openDashboard) window.api.openDashboard('pomodoro');
  });
}

function setupIPCListeners() {
  if (!window.api) return;

  window.api.onWindowModeBar((data) => {
    document.body.classList.add('bar-mode');
    document.body.classList.remove('drag-mode');
    if (data && typeof data.petX === 'number') {
      document.documentElement.style.setProperty('--pet-x', `${data.petX}px`);
    }
  });

  window.api.onWindowModeDrag(() => {
    document.body.classList.add('drag-mode');
    document.body.classList.remove('bar-mode');
  });

  window.api.onUpdatePetPosition((data) => {
    if (data && typeof data.x === 'number') {
      document.documentElement.style.setProperty('--pet-x', `${data.x}px`);
    }
    if (data && typeof data.y === 'number') {
      document.documentElement.style.setProperty('--pet-y', `${data.y}px`);
    }
  });

  window.api.onPetMoveState((data) => {
    if (!data || typeof data.state !== 'string') return;
    if (data.state === 'walking') {
      wakeUp({ skipStretch: true });
      clearIdleTimers();
      if (viewport) viewport.setState('walking', data.direction);
    } else if (data.state === 'playing') {
      wakeUp();
      if (viewport && viewport.currentState !== 'stretching') {
        viewport.setState('idle');
      }
      if (Math.random() < 0.05) triggerHappyBounce();
    } else if (viewport && viewport.currentState !== 'sleeping') {
      viewport.setState('idle');
      scheduleIdleVariety();
    }
  });

  window.api.onPomodoroTick((data) => {
    if (pomodoro) pomodoro.update(data);
  });

  window.api.onPomodoroState((data) => {
    if (pomodoro) pomodoro.update(data);
  });

  window.api.onPetSpeech((text) => {
    if (speech) speech.show(text);
  });

  window.api.onSettingsUpdated((settings) => {
    if (!settings) return;
    if (settings.pet && settings.pet !== currentPet) {
      currentPet = settings.pet;
      if (viewport) viewport.setPetType(currentPet);
    }
    if (typeof settings.soundEnabled === 'boolean') {
      soundEnabled = settings.soundEnabled;
    }
  });
}

function bootPetRenderer() {
  viewport = new window.PetViewport();
  speech = new window.SpeechController();
  interaction = new window.InteractionController();
  pomodoro = new window.PomodoroUI();

  viewport.init(currentPet);
  interaction.init();
  pomodoro.init();
  if (window.eyeTracker) window.eyeTracker.init();

  initQuickChat();
  initSettingsButton();
  setupIPCListeners();

  // Ear twitch every 8-15 seconds in idle
  earTwitchTimer = setInterval(() => {
    if (Math.random() < 0.4) triggerEarTwitch();
  }, 10000);

  scheduleIdleVariety();
  void refreshMoodClass();
  moodPollTimer = setInterval(() => { void refreshMoodClass(); }, 8000);

  setTimeout(() => {
    triggerHappyBounce();
    if (speech) {
      speech.show(currentPet === 'cat'
        ? '¡Miau! Hola, soy Luna. Trabajemos juntos hoy. Haz doble clic en mí para charlar.'
        : '¡Hola! ¡Soy Max! Hoy será un gran día de trabajo. Haz doble clic en mí.');
    }
  }, 1500);
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('DOMContentLoaded', bootPetRenderer);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MOOD_CLASSES,
    moodStateFromApi,
    applyMoodClassTo,
    pickRestPose,
    pickSitDelayMs,
    pickStretchMs,
    isRestableState,
    getMoodState,
    refreshMoodClass,
    scheduleIdleVariety,
    startStretchThenIdle,
    wakeUp
  };
}

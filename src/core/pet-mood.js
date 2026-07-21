'use strict';

/**
 * Pet mood — pure functions para el estado emocional de la mascota.
 *
 * Sin side effects. Logica testeable para:
 *   - 4 stats internos (energy, happiness, curiosity, hunger), 0-100
 *   - 5 estados derivados (happy, calm, sleepy, sad, bored) segun umbrales
 *   - Decay temporal (valores bajan con el tiempo)
 *   - Recharge por interaccion (chat aumenta happiness + curiosity)
 *
 * Uso:
 *   - src/core/pet-mood.js (este archivo) — pure
 *   - src/services/mood-store.js — persistencia
 *   - src/services/mood-tick.js — setInterval que llama applyDecay
 *   - main.js — wire: init mood, integrar con chat, integrar con IA system prompt
 */

const STAT_MIN = 0;
const STAT_MAX = 100;

// Estado inicial: calm, valores medios
const INITIAL_MOOD = Object.freeze({
  energy: 70,
  happiness: 60,
  curiosity: 50,
  hunger: 50
});

const INITIAL_LAST_DECAY = (() => {
  // Marcamos "ahora" como ultimo decay para que el primer tick no decaiga de golpe
  // (la primera vez que se inicia la app, no deberia perder valores).
  return Date.now();
})();

// Umbrales para derivar el estado de los 4 stats
// (formato: [nombre_estado, predicate])
function getStateFromStats(mood) {
  // sleepy: poca energy
  if (mood.energy < 25) return 'sleepy';
  // sad: poca happiness
  if (mood.happiness < 25) return 'sad';
  // bored: poca curiosity y poca energy
  if (mood.curiosity < 20 && mood.energy < 50) return 'bored';
  // happy: happiness alta, energy OK
  if (mood.happiness >= 70 && mood.energy >= 50) return 'happy';
  // default: calm
  return 'calm';
}

/**
 * Crea un mood inicial.
 * @returns {object} mood con {energy, happiness, curiosity, hunger, lastDecayAt}
 */
function createInitialMood() {
  return {
    ...INITIAL_MOOD,
    lastDecayAt: Date.now()
  };
}

/**
 * Clamp un valor entre STAT_MIN y STAT_MAX.
 * @param {number} v
 * @returns {number}
 */
function clampStat(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return STAT_MIN;
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(v)));
}

/**
 * Valida que un objeto tenga la estructura de mood.
 * @param {any} obj
 * @returns {boolean}
 */
function isValidMood(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const required = ['energy', 'happiness', 'curiosity', 'hunger'];
  for (const k of required) {
    if (typeof obj[k] !== 'number') return false;
  }
  return true;
}

/**
 * Aplica decay temporal al mood.
 * Por cada minuto transcurrido desde lastDecayAt:
 *   - energy: -1
 *   - happiness: -0.5
 *   - curiosity: -0.3
 *   - hunger: +0.7 (la mascota tiene hambre con el tiempo)
 *
 * @param {object} mood
 * @param {number} minutes - minutos a aplicar (puede ser fraccional)
 * @returns {object} nuevo mood con lastDecayAt actualizado a Date.now() + minutes*60_000
 */
function applyDecay(mood, minutes) {
  if (!isValidMood(mood)) return createInitialMood();
  if (typeof minutes !== 'number' || minutes < 0 || Number.isNaN(minutes)) {
    return { ...mood, lastDecayAt: Date.now() };
  }
  return {
    energy: clampStat(mood.energy - minutes * 1.0),
    happiness: clampStat(mood.happiness - minutes * 0.5),
    curiosity: clampStat(mood.curiosity - minutes * 0.3),
    hunger: clampStat(mood.hunger + minutes * 0.7),
    lastDecayAt: Date.now() + Math.floor(minutes * 60_000)
  };
}

/**
 * Aplica el efecto de una interaccion del usuario.
 * @param {object} mood
 * @param {'chat' | 'pet' | 'play' | 'feed' | 'rest'} type
 * @returns {object} nuevo mood
 */
function applyInteraction(mood, type) {
  if (!isValidMood(mood)) return createInitialMood();
  switch (type) {
    case 'chat':
      // Hablar con la IA aumenta happiness y curiosity
      return clampMood({
        ...mood,
        happiness: mood.happiness + 5,
        curiosity: mood.curiosity + 3
      });
    case 'pet':
      // Acariciar aumenta happiness
      return clampMood({
        ...mood,
        happiness: mood.happiness + 2,
        energy: mood.energy - 1
      });
    case 'play':
      // Jugar aumenta happiness pero baja energy
      return clampMood({
        ...mood,
        happiness: mood.happiness + 4,
        energy: mood.energy - 5,
        curiosity: mood.curiosity - 2
      });
    case 'feed':
      // Alimentar baja hunger y sube happiness
      return clampMood({
        ...mood,
        hunger: mood.hunger - 30,
        happiness: mood.happiness + 1
      });
    case 'rest':
      // Descansar sube energy
      return clampMood({
        ...mood,
        energy: mood.energy + 25
      });
    default:
      return mood;
  }
}

function clampMood(mood) {
  return {
    energy: clampStat(mood.energy),
    happiness: clampStat(mood.happiness),
    curiosity: clampStat(mood.curiosity),
    hunger: clampStat(mood.hunger),
    lastDecayAt: mood.lastDecayAt || Date.now()
  };
}

/**
 * Deriva el estado actual del mood segun los stats.
 * @param {object} mood
 * @returns {'happy' | 'calm' | 'sleepy' | 'sad' | 'bored'}
 */
function deriveState(mood) {
  if (!isValidMood(mood)) return 'calm';
  return getStateFromStats(mood);
}

/**
 * Calcula los minutos entre lastDecayAt y "ahora" (o now).
 * @param {object} mood
 * @param {number} [now=Date.now()]
 * @returns {number} minutos (pueden ser negativos si lastDecayAt es futuro)
 */
function minutesSinceLastDecay(mood, now) {
  if (!mood || typeof mood.lastDecayAt !== 'number') return 0;
  const nowMs = typeof now === 'number' ? now : Date.now();
  return (nowMs - mood.lastDecayAt) / 60_000;
}

/**
 * Construye un fragmento de system prompt que describe el mood actual.
 * Lo usa ai.js para que la IA sepa el estado emocional.
 * @param {object} mood
 * @returns {string}
 */
function buildMoodContext(mood) {
  if (!isValidMood(mood)) return '';
  const state = deriveState(mood);
  const lines = [
    `Estado emocional actual: ${state}`,
    `Stats: energy=${mood.energy}/100, happiness=${mood.happiness}/100, curiosity=${mood.curiosity}/100, hunger=${mood.hunger}/100.`
  ];
  // Sugerencias de comportamiento segun estado
  if (state === 'sleepy') {
    lines.push('Estas cansada. Sugierele al usuario tomar un break o ir a descansar.');
  } else if (state === 'sad') {
    lines.push('Te sentis un poco triste. Podes preguntar que tal el dia del usuario.');
  } else if (state === 'bored') {
    lines.push('Te estas aburriendo. Podes proponer un juego o algo divertido.');
  } else if (state === 'happy') {
    lines.push('Estas muy contenta. Se juguetona y carinosa.');
  } else {
    // calm
    lines.push('Estas tranquila. Acompanialo en lo que esta haciendo.');
  }
  if (mood.hunger >= 80) {
    lines.push('Tenes mucha hambre. Podes mencionarlo.');
  }
  return lines.join(' ');
}

module.exports = {
  STAT_MIN,
  STAT_MAX,
  INITIAL_MOOD,
  createInitialMood,
  clampStat,
  clampMood,
  isValidMood,
  applyDecay,
  applyInteraction,
  deriveState,
  minutesSinceLastDecay,
  buildMoodContext
};

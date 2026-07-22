'use strict';

/**
 * Context awareness — pure functions para reactividad al contexto del usuario.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Idle detection: cuanto tiempo lleva el usuario sin input a nivel SO
 *   - Break suggestion: cuando sugerir un break (idle + cooldown)
 *   - Typing rate: WPM en una ventana de tiempo
 *   - Do Not Disturb (DND): cuando entrar/salir segun typing rate
 *
 * Uso:
 *   - src/core/context-awareness.js (este archivo) — pure
 *   - src/services/idle-monitor.js — main process (usa powerMonitor)
 *   - src/dashboard-renderer.js — mide keystrokes en chat input
 *   - main.js — wire: tick de idle, broadcast events
 */

const DEFAULT_IDLE_THRESHOLD_SECONDS = 600;  // 10 min
const DEFAULT_BREAK_COOLDOWN_MS = 5 * 60 * 1000;  // 5 min entre tips
const DEFAULT_TYPING_WINDOW_MS = 30 * 1000;  // 30s rolling window
const DEFAULT_DND_WPM_THRESHOLD = 80;
const DEFAULT_DND_SUSTAINED_MS = 2 * 60 * 1000;  // 2 min sostenido
const DEFAULT_DND_EXIT_WPM = 60;  // salir si baja de 60 WPM
const DEFAULT_DND_EXIT_SUSTAINED_MS = 30 * 1000;  // por 30s

/**
 * Decide si el sistema esta en idle segun los segundos sin input.
 * @param {number} idleSeconds - segundos desde el ultimo input del SO
 * @param {number} [thresholdSeconds=600]
 * @returns {boolean}
 */
function isSystemIdle(idleSeconds, thresholdSeconds = DEFAULT_IDLE_THRESHOLD_SECONDS) {
  if (typeof idleSeconds !== 'number' || Number.isNaN(idleSeconds)) return false;
  if (idleSeconds < 0) return false;
  return idleSeconds >= thresholdSeconds;
}

/**
 * Decide si debemos sugerir un break. Considera:
 * - El sistema esta en idle >= threshold
 * - No sugerimos en cooldown (ultimo break fue hace poco)
 *
 * @param {number} idleSeconds
 * @param {Date|null} lastBreakAt - cuando fue el ultimo break tip
 * @param {number} [thresholdSeconds=600]
 * @param {number} [cooldownMs=300000] (5 min)
 * @returns {boolean}
 */
function shouldSuggestBreak(idleSeconds, lastBreakAt, thresholdSeconds = DEFAULT_IDLE_THRESHOLD_SECONDS, cooldownMs = DEFAULT_BREAK_COOLDOWN_MS) {
  if (!isSystemIdle(idleSeconds, thresholdSeconds)) return false;
  if (lastBreakAt instanceof Date) {
    const elapsed = Date.now() - lastBreakAt.getTime();
    if (elapsed < cooldownMs) return false;
  }
  return true;
}

/**
 * Calcula el WPM (words per minute) dado un buffer de keystrokes con timestamps.
 * Cada keystroke cuenta como 1 char. 5 chars = 1 word (regla estandar).
 *
 * @param {Array<{ts: number}>} keystrokes - eventos de teclado (con timestamp ms)
 * @param {number} [windowMs=30000] - ventana de tiempo a considerar (ms)
 * @param {number} [now=Date.now()]
 * @returns {number} WPM (0 si no hay keystrokes en la ventana)
 */
function computeTypingRate(keystrokes, windowMs = DEFAULT_TYPING_WINDOW_MS, now = Date.now()) {
  if (!Array.isArray(keystrokes) || keystrokes.length === 0) return 0;
  if (typeof windowMs !== 'number' || windowMs <= 0) return 0;
  const cutoff = now - windowMs;
  let count = 0;
  for (const k of keystrokes) {
    if (typeof k?.ts === 'number' && k.ts >= cutoff) count++;
  }
  // WPM = (chars / 5) / minutes = chars * 60_000 / (5 * windowMs)
  return (count * 60_000) / (5 * windowMs);
}

/**
 * Decide si debemos entrar en modo Do Not Disturb (DND).
 * Criterio: typing rate >= threshold SOSTENIDO por sustainedMs.
 *
 * @param {Array<{ts: number}>} keystrokes
 * @param {number} [wpmThreshold=80]
 * @param {number} [sustainedMs=120000]
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
function shouldEnterDoNotDisturb(keystrokes, wpmThreshold = DEFAULT_DND_WPM_THRESHOLD, sustainedMs = DEFAULT_DND_SUSTAINED_MS, now = Date.now()) {
  if (!Array.isArray(keystrokes) || keystrokes.length === 0) return false;
  const cutoff = now - sustainedMs;
  let count = 0;
  for (const k of keystrokes) {
    if (typeof k?.ts === 'number' && k.ts >= cutoff) count++;
  }
  if (count === 0) return false;
  // WPM sobre la ventana de sustainedMs
  const wpm = (count * 60_000) / (5 * sustainedMs);
  return wpm >= wpmThreshold;
}

/**
 * Decide si debemos salir del modo DND.
 * Criterio: typing rate < exitThreshold SOSTENIDO por exitSustainedMs.
 *
 * @param {Array<{ts: number}>} keystrokes
 * @param {number} [exitWpmThreshold=60]
 * @param {number} [exitSustainedMs=30000]
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
function shouldExitDoNotDisturb(keystrokes, exitWpmThreshold = DEFAULT_DND_EXIT_WPM, exitSustainedMs = DEFAULT_DND_EXIT_SUSTAINED_MS, now = Date.now()) {
  if (!Array.isArray(keystrokes) || keystrokes.length === 0) return true;
  const cutoff = now - exitSustainedMs;
  let count = 0;
  for (const k of keystrokes) {
    if (typeof k?.ts === 'number' && k.ts >= cutoff) count++;
  }
  if (count === 0) return true; // sin keystrokes recientes → salir
  const wpm = (count * 60_000) / (5 * exitSustainedMs);
  return wpm < exitWpmThreshold;
}

/**
 * Formatea segundos en un string legible "X min" o "X h Y min".
 * @param {number} seconds
 * @returns {string}
 */
function formatIdleTime(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '0 seg';
  if (seconds < 60) return `${Math.floor(seconds)} seg`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `${hours} h ${remMin} min` : `${hours} h`;
}

// UMD-lite: expone en module.exports (Node) o window.ContextAwareness (browser).
const ContextAwareness = {
  DEFAULT_IDLE_THRESHOLD_SECONDS,
  DEFAULT_BREAK_COOLDOWN_MS,
  DEFAULT_TYPING_WINDOW_MS,
  DEFAULT_DND_WPM_THRESHOLD,
  DEFAULT_DND_SUSTAINED_MS,
  DEFAULT_DND_EXIT_WPM,
  DEFAULT_DND_EXIT_SUSTAINED_MS,
  isSystemIdle,
  shouldSuggestBreak,
  computeTypingRate,
  shouldEnterDoNotDisturb,
  shouldExitDoNotDisturb,
  formatIdleTime
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextAwareness;
} else if (typeof window !== 'undefined') {
  window.ContextAwareness = ContextAwareness;
}

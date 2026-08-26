'use strict';

/**
 * Pomodoro adaptive — pure functions para decidir el tipo de break.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Decidir si toca break largo segun el contador de focus blocks
 *     completados
 *   - Evitar 2 long breaks consecutivos (independientemente del
 *     contador)
 *   - Threshold configurable (no todos quieren long cada 4)
 *
 * Por que este diseno:
 *   - El break largo se activa DESPUES de N focus blocks consecutivos
 *     (no antes, no durante). Eso significa que si recien terminaste
 *     un break largo, el contador se reseteo a 0.
 *   - Hay un caso edge: si arrancas la app, completas 4 focus blocks
 *     rapido, y el "lastBreakWasLong" todavia esta en false (porque
 *     no hubo break previo), entonces se gatilla long break. Eso esta
 *     bien.
 *   - Caso edge problematico: completas 4 focus blocks, tienes un long
 *     break, vuelves a completar 4 focus blocks. El 4to foco (8vo en
 *     total) deberia triggear otro long break. Para eso, despues del
 *     long break, el contador se resetea a 0 y arranca de nuevo. Asi
 *     un usuario que trabaja 2 horas seguidas tendra varios long
 *     breaks.
 *   - "no 2 long breaks consecutivos" es una salvaguarda: si por algun
 *     bug el contador quedo en 4 al volver del long break, no se
 *     dispara otro long break inmediatamente. El `lastBreakWasLong`
 *     flag es la red de seguridad.
 *
 * Uso:
 *   - src/core/pomodoro-adaptive.js (este archivo) — pure
 *   - main.js — IPC handler pomodoro:get-next-break-kind
 *   - src/dashboard-renderer.js — consulta antes de iniciar break
 */

const DEFAULT_LONG_BREAK_EVERY = 4;
const DEFAULT_LONG_BREAK_MIN = 15;

/**
 * Decide si toca long break. True si focusBlocksCompleted > 0 y es
 * multiplo de longBreakEvery.
 *
 * @param {number} focusBlocksCompleted
 * @param {number} [longBreakEvery=4]
 * @returns {boolean}
 */
function shouldUseLongBreak(focusBlocksCompleted, longBreakEvery = DEFAULT_LONG_BREAK_EVERY) {
  if (typeof focusBlocksCompleted !== 'number' || !Number.isFinite(focusBlocksCompleted)) return false;
  if (typeof longBreakEvery !== 'number' || longBreakEvery < 1) return false;
  if (focusBlocksCompleted <= 0) return false;
  return focusBlocksCompleted % longBreakEvery === 0;
}

/**
 * Decide que tipo de break sigue. Considera 2 seniales:
 *   1. focusBlocksCompleted modulo longBreakEvery (deberia tocar long?)
 *   2. lastBreakWasLong (red de seguridad: no 2 long consecutivos)
 *
 * Reglas:
 *   - Si lastBreakWasLong → 'short' (nunca 2 long consecutivos)
 *   - Si focusBlocksCompleted % longBreakEvery === 0 Y > 0 Y
 *     !lastBreakWasLong → 'long'
 *   - Else → 'short'
 *
 * @param {{focusBlocksCompleted: number, lastBreakWasLong: boolean, longBreakEvery?: number}} params
 * @returns {'long'|'short'}
 */
function nextBreakKind(params) {
  if (!params || typeof params !== 'object') return 'short';
  const {
    focusBlocksCompleted,
    lastBreakWasLong = false,
    longBreakEvery = DEFAULT_LONG_BREAK_EVERY
  } = params;
  if (typeof focusBlocksCompleted !== 'number' || !Number.isFinite(focusBlocksCompleted)) return 'short';
  if (typeof longBreakEvery !== 'number' || longBreakEvery < 1) return 'short';
  // Red de seguridad: nunca 2 long breaks consecutivos
  if (lastBreakWasLong === true) return 'short';
  // focusBlocksCompleted = 0 → recien arranca, primer focus, no toca long
  if (focusBlocksCompleted <= 0) return 'short';
  // Multiplo de longBreakEvery → long
  if (focusBlocksCompleted % longBreakEvery === 0) return 'long';
  return 'short';
}

// UMD-lite: expone en module.exports (Node) o window.PomodoroAdaptive (browser).
const PomodoroAdaptive = {
  DEFAULT_LONG_BREAK_EVERY,
  DEFAULT_LONG_BREAK_MIN,
  shouldUseLongBreak,
  nextBreakKind
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PomodoroAdaptive;
} else if (typeof window !== 'undefined') {
  window.PomodoroAdaptive = PomodoroAdaptive;
}

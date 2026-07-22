'use strict';

/**
 * Pomodoro templates — pure functions para las plantillas del timer.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Catalogo de plantillas predefinidas (classic 25/5, long-focus 50/10,
 *     deep-work 90/20, custom)
 *   - Validacion de rangos min/max (focus 5-120, break 1-30, longBreak
 *     5-60, longBreakEvery 2-10)
 *   - Formato legible para mostrar al usuario
 *
 * Por que los rangos:
 *   - focusMin 5-120: bajo 5 min no alcanza para concentrarse, mas de 120
 *     genera fatigue (los 90 min son el techo realista de Ultradian cycles)
 *   - breakMin 1-30: 1 min es solo "estirar las piernas", 30+ es descansar
 *     del descanso
 *   - longBreakMin 5-60: el break largo es para reset, 5 es lo minimo
 *     util, 60 es exagerado
 *   - longBreakEvery 2-10: minimo 2 para que tenga sentido, maximo 10
 *     para no acumular demasiada fatigue
 *
 * Uso:
 *   - src/core/pomodoro-templates.js (este archivo) — pure
 *   - src/services/pomodoro-store.js — persistencia
 *   - main.js — IPC handlers
 *   - src/dashboard-renderer.js — UI dropdown
 */

const FOCUS_MIN_LIMIT = { min: 5, max: 120 };
const BREAK_MIN_LIMIT = { min: 1, max: 30 };
const LONG_BREAK_MIN_LIMIT = { min: 5, max: 60 };
const LONG_BREAK_EVERY_LIMIT = { min: 2, max: 10 };

/**
 * Catalogo de plantillas. `custom` arranca con defaults 25/5 pero el
 * renderer (y `pomodoro-store`) guarda los custom values por separado.
 * El `longBreakMin` y `longBreakEvery` se mantienen por template para que
 * el default del long break sea razonable (90/20 implica un long break
 * mas largo que 25/5, por ejemplo).
 */
const TEMPLATES = Object.freeze([
  Object.freeze({
    id: 'classic',
    label: 'Classic (25/5)',
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    longBreakEvery: 4
  }),
  Object.freeze({
    id: 'long-focus',
    label: 'Long focus (50/10)',
    focusMin: 50,
    breakMin: 10,
    longBreakMin: 20,
    longBreakEvery: 4
  }),
  Object.freeze({
    id: 'deep-work',
    label: 'Deep work (90/20)',
    focusMin: 90,
    breakMin: 20,
    longBreakMin: 30,
    longBreakEvery: 3
  }),
  Object.freeze({
    id: 'custom',
    label: 'Custom',
    focusMin: 25, // default, se sobreescribe con customFocusMin en runtime
    breakMin: 5,
    longBreakMin: 15,
    longBreakEvery: 4
  })
]);

/**
 * Busca un template por id. Retorna null si el id no existe.
 * Hace freeze copy para que mutaciones del caller no rompan el catalogo.
 *
 * @param {string} id
 * @returns {object|null}
 */
function getTemplate(id) {
  if (typeof id !== 'string' || id.length === 0) return null;
  for (const t of TEMPLATES) {
    if (t.id === id) return { ...t };
  }
  return null;
}

/**
 * Valida un template (o un subset de sus valores). Retorna {ok, value}
 * con el value normalizado (numeros enteros) o {ok: false, error} con
 * mensaje legible.
 *
 * @param {{focusMin?: number, breakMin?: number, longBreakMin?: number, longBreakEvery?: number}} candidate
 * @returns {{ok: true, value: object} | {ok: false, error: string}}
 */
function validateTemplate(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return { ok: false, error: 'template invalido' };
  }

  const checks = [
    { key: 'focusMin', limits: FOCUS_MIN_LIMIT, label: 'focus' },
    { key: 'breakMin', limits: BREAK_MIN_LIMIT, label: 'break' },
    { key: 'longBreakMin', limits: LONG_BREAK_MIN_LIMIT, label: 'long break' },
    { key: 'longBreakEvery', limits: LONG_BREAK_EVERY_LIMIT, label: 'long break every' }
  ];

  const value = {};
  for (const c of checks) {
    const raw = candidate[c.key];
    // Si no se pasa, lo dejamos fuera del value (validacion parcial OK).
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== 'number' || Number.isNaN(raw)) {
      return { ok: false, error: `${c.label} debe ser un número` };
    }
    if (raw < c.limits.min || raw > c.limits.max) {
      return { ok: false, error: `${c.label} debe estar entre ${c.limits.min} y ${c.limits.max} minutos` };
    }
    if (!Number.isFinite(raw)) {
      return { ok: false, error: `${c.label} debe ser un número finito` };
    }
    value[c.key] = Math.floor(raw);
  }
  return { ok: true, value };
}

/**
 * Formatea un template para mostrar en UI. Ej: "25 / 5 (long 15 cada 4)".
 * Si el template no tiene todos los campos, muestra los disponibles.
 *
 * @param {{focusMin?: number, breakMin?: number, longBreakMin?: number, longBreakEvery?: number}} template
 * @returns {string}
 */
function formatTemplateForDisplay(template) {
  if (!template || typeof template !== 'object') return '';
  const parts = [];
  if (typeof template.focusMin === 'number' && typeof template.breakMin === 'number') {
    parts.push(`${template.focusMin} / ${template.breakMin}`);
  } else if (typeof template.focusMin === 'number') {
    parts.push(`focus ${template.focusMin}`);
  } else if (typeof template.breakMin === 'number') {
    parts.push(`break ${template.breakMin}`);
  }
  if (typeof template.longBreakMin === 'number' && typeof template.longBreakEvery === 'number') {
    parts.push(`(long ${template.longBreakMin} cada ${template.longBreakEvery})`);
  } else if (typeof template.longBreakMin === 'number') {
    parts.push(`(long ${template.longBreakMin})`);
  } else if (typeof template.longBreakEvery === 'number') {
    parts.push(`(cada ${template.longBreakEvery})`);
  }
  return parts.join(' ');
}

// UMD-lite: expone en module.exports (Node) o window.PomodoroTemplates (browser).
const PomodoroTemplates = {
  TEMPLATES,
  FOCUS_MIN_LIMIT,
  BREAK_MIN_LIMIT,
  LONG_BREAK_MIN_LIMIT,
  LONG_BREAK_EVERY_LIMIT,
  getTemplate,
  validateTemplate,
  formatTemplateForDisplay
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PomodoroTemplates;
} else if (typeof window !== 'undefined') {
  window.PomodoroTemplates = PomodoroTemplates;
}

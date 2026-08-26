'use strict';

/**
 * Silent mode — pure functions para W1 (modo compañía silenciosa) y
 * W2 (retreat automático por reunión en .ics).
 *
 * Sin side effects, sin Electron. Logica testeable:
 *   - `isSilentModeActive`: true si silentMode flag o retreatOverride activo
 *   - `applySilentModeToContext`: deriva los flags `allow*` que el resto
 *     de la app (context-awareness, pet-mood, daily-briefing, idle) consulta
 *   - `getPetVisualState`: opacity/scale/retreat para el renderer
 *
 * Por que pure: para que los tests puedan mockear `now` y `silentMode` sin
 * tener que arrancar Electron ni esperar timers reales. Toda la decision de
 * "esta activa la silent mode?" vive acá; el resto del codigo solo consulta.
 */

const DEFAULT_SILENT_OPACITY = 0.5;
const DEFAULT_SILENT_SCALE = 0.7;
const DEFAULT_NORMAL_OPACITY = 1;
const DEFAULT_NORMAL_SCALE = 1;

/**
 * Decide si la silent mode (visual only) está activa en este momento.
 *
 * @param {object} params
 * @param {boolean} [params.silentMode] - flag persistido en pet-config.json
 * @param {number} [params.retreatUntil] - timestamp ms; 0 o undefined = sin retreat
 * @param {number|Date} [params.now] - timestamp actual (ms) o Date. Default Date.now()
 * @returns {boolean}
 */
function isSilentModeActive({ silentMode, retreatUntil, now } = {}) {
  const nowMs = toMs(now);
  const untilMs = toMs(retreatUntil);
  // Retreat override: si hay un retreatUntil futuro, fuerzo silent.
  if (untilMs > 0 && nowMs < untilMs) return true;
  // Caso normal: flag del usuario.
  return silentMode === true;
}

/**
 * Aplica silent mode al contexto que consume el resto de la app.
 * Devuelve el `baseConfig` enriquecido con flags `allow*`. Cuando silent
 * está activa, todos los `allow*` se setean a `false` (la mascota no inicia
 * chat, no reacciona a mood changes, no muestra idle tips, no dispara DND,
 * no muestra daily briefing). Las animaciones idle SÍ siguen (la visual
 * only no frena idle animations — eso se maneja en el renderer via CSS).
 *
 * @param {object} params
 * @param {boolean} [params.silentMode]
 * @param {number} [params.retreatUntil]
 * @param {number|Date} [params.now]
 * @param {object} [params.baseConfig={}] - cualquier flag previo a preservar
 * @returns {object} baseConfig con allow* flags agregados/sobreescritos
 */
function applySilentModeToContext({ silentMode, retreatUntil, now, baseConfig = {} } = {}) {
  const active = isSilentModeActive({ silentMode, retreatUntil, now });
  if (!active) {
    return {
      ...baseConfig,
      allowChatInit: true,
      allowMoodChange: true,
      allowIdleTips: true,
      allowDndWarnings: true,
      allowBriefing: true
    };
  }
  return {
    ...baseConfig,
    allowChatInit: false,
    allowMoodChange: false,
    allowIdleTips: false,
    allowDndWarnings: false,
    allowBriefing: false
  };
}

/**
 * Estado visual para el petWindow: opacity, scale, y flag retreat.
 * El renderer usa esto para aplicar CSS classes (`pet--retreat` o
 * `pet--silent`) o transformaciones inline.
 *
 * @param {object} params
 * @param {boolean} [params.silentMode]
 * @param {number} [params.retreatUntil]
 * @param {number|Date} [params.now]
 * @returns {{opacity: number, scale: number, retreat: boolean, silent: boolean}}
 */
function getPetVisualState({ silentMode, retreatUntil, now } = {}) {
  const active = isSilentModeActive({ silentMode, retreatUntil, now });
  if (!active) {
    return {
      opacity: DEFAULT_NORMAL_OPACITY,
      scale: DEFAULT_NORMAL_SCALE,
      retreat: false,
      silent: false
    };
  }
  return {
    opacity: DEFAULT_SILENT_OPACITY,
    scale: DEFAULT_SILENT_SCALE,
    retreat: toMs(retreatUntil) > 0,
    silent: toMs(retreatUntil) > 0 ? false : true
  };
}

// --- helpers ---------------------------------------------------------------

function toMs(value) {
  if (value === undefined || value === null) return 0;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  return 0;
}

// UMD-lite: expone en module.exports (Node) o window.SilentMode (browser).
const SilentMode = {
  isSilentModeActive,
  applySilentModeToContext,
  getPetVisualState,
  DEFAULT_SILENT_OPACITY,
  DEFAULT_SILENT_SCALE,
  DEFAULT_NORMAL_OPACITY,
  DEFAULT_NORMAL_SCALE
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SilentMode;
} else if (typeof window !== 'undefined') {
  window.SilentMode = SilentMode;
}

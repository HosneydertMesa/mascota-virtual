'use strict';

/**
 * Idle monitor — detecta inactividad system-wide del usuario.
 *
 * Bridge entre `electron.powerMonitor.getSystemIdleTime()` y la logica
 * de sugerir breaks (pure functions de context-awareness.js).
 *
 * Por que existe como modulo separado:
 *   - Permite mockear `powerMonitor` en tests sin levantar Electron.
 *   - Encapsula el setInterval del tick (60s por default).
 *   - Encapsula el cooldown de breaks (no spam).
 *
 * API:
 *   const handle = createIdleMonitor({
 *     powerMonitor,         // electron.powerMonitor (o mock)
 *     onBreakSuggest,       // fn({idleSeconds, idleFormatted}) → tip en renderer
 *     logDebug,             // fn(message: string) → logger del main
 *     tickIntervalMs,       // opcional, default 60_000 (1 min)
 *     idleThresholdSeconds, // opcional, default 600 (10 min)
 *     breakCooldownMs,      // opcional, default 5 * 60_000 (5 min)
 *     setIntervalFn,        // opcional (para tests)
 *     clearIntervalFn,      // opcional
 *   });
 *   handle.detach()  → cleanup
 *   handle.getState() → { lastBreakAt, lastTickAt }
 */

const { shouldSuggestBreak, formatIdleTime } = require('../core/context-awareness');

const DEFAULT_TICK_INTERVAL_MS = 60_000; // 1 min
const DEFAULT_IDLE_THRESHOLD_SECONDS = 600; // 10 min
const DEFAULT_BREAK_COOLDOWN_MS = 5 * 60_000; // 5 min

function createIdleMonitor(deps) {
  const {
    powerMonitor,
    onBreakSuggest = () => {},
    logDebug = () => {},
    tickIntervalMs = DEFAULT_TICK_INTERVAL_MS,
    idleThresholdSeconds = DEFAULT_IDLE_THRESHOLD_SECONDS,
    breakCooldownMs = DEFAULT_BREAK_COOLDOWN_MS,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
    DateCtor = Date
  } = deps || {};

  // Defensivo: si electron no expone powerMonitor (o no tiene
  // getSystemIdleTime), devolvemos un no-op. No queremos crashear
  // el main process por esto.
  if (!powerMonitor || typeof powerMonitor.getSystemIdleTime !== 'function') {
    logDebug('idle-monitor: powerMonitor.getSystemIdleTime no disponible, idle detection desactivado');
    return {
      detach() {},
      getState() { return { lastBreakAt: null, lastTickAt: null }; },
      isAvailable() { return false; }
    };
  }

  let lastBreakAt = null;
  let lastTickAt = null;
  let intervalHandle = null;

  function tick() {
    lastTickAt = new DateCtor();
    let idleSeconds;
    try {
      // powerMonitor.getSystemIdleTime() retorna segundos
      idleSeconds = powerMonitor.getSystemIdleTime();
    } catch (error) {
      logDebug(`idle-monitor:tick-error: ${error && error.message ? error.message : String(error)}`);
      return;
    }
    if (!shouldSuggestBreak(idleSeconds, lastBreakAt, idleThresholdSeconds, breakCooldownMs)) {
      return;
    }
    // Sistema idle >= threshold y no estamos en cooldown → sugerir break
    const idleFormatted = formatIdleTime(idleSeconds);
    logDebug(`idle-monitor: break suggest (idle=${idleFormatted})`);
    lastBreakAt = new DateCtor();
    try {
      onBreakSuggest({ idleSeconds, idleFormatted });
    } catch (error) {
      logDebug(`idle-monitor:onBreakSuggest-error: ${error && error.message ? error.message : String(error)}`);
    }
  }

  // Primer tick inmediato (asi no esperamos 60s para el primer check),
  // despues cada tickIntervalMs.
  tick();
  intervalHandle = setIntervalFn(tick, tickIntervalMs);

  function detach() {
    if (intervalHandle) {
      clearIntervalFn(intervalHandle);
      intervalHandle = null;
    }
  }

  function getState() {
    return {
      lastBreakAt,
      lastTickAt
    };
  }

  function isAvailable() {
    return true;
  }

  return { detach, getState, isAvailable };
}

module.exports = {
  createIdleMonitor,
  DEFAULT_TICK_INTERVAL_MS,
  DEFAULT_IDLE_THRESHOLD_SECONDS,
  DEFAULT_BREAK_COOLDOWN_MS
};

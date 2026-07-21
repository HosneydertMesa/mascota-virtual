'use strict';

const { applyDecay, minutesSinceLastDecay, isValidMood } = require('../core/pet-mood');

/**
 * Mood tick — setInterval que aplica decay al mood y lo persiste.
 *
 * Separamos la logica del timer (setInterval) de la logica de decay
 * para poder testear sin timers reales.
 *
 * Uso:
 *   const handle = startMoodTick({
 *     getMood: () => currentMood,
 *     setMood: (newMood) => { currentMood = newMood; saveMood(...); },
 *     intervalMs: 60_000,
 *     logDebug: logDebug
 *   });
 *   // ...
 *   stopMoodTick(handle);
 */

const DEFAULT_INTERVAL_MS = 60_000; // 1 min

/**
 * Aplica el decay basado en el tiempo transcurrido desde lastDecayAt.
 * Esta funcion es pura (excepto Date.now()), testeable sin timers.
 *
 * @param {object} mood
 * @param {number} [now=Date.now()]
 * @returns {object} nuevo mood con decay aplicado
 */
function applyDecayIfNeeded(mood, now) {
  if (!isValidMood(mood)) return mood;
  const minutes = minutesSinceLastDecay(mood, now);
  if (minutes <= 0) return mood;
  return applyDecay(mood, minutes);
}

/**
 * Inicia un tick periodico que aplica decay al mood.
 *
 * @param {object} deps
 *   - getMood(): mood actual
 *   - setMood(newMood): persistir el nuevo mood
 *   - intervalMs?: cada cuanto tick (default 60_000)
 *   - now?: override de Date.now() (para tests)
 *   - setIntervalFn?: override de setInterval (para tests)
 *   - clearIntervalFn?: override de clearInterval (para tests)
 *   - logDebug?(msg, meta): logger
 * @returns {object} handle con { stop(): void, tick(): void (manual) }
 */
function startMoodTick(deps) {
  const getMood = deps.getMood;
  const setMood = deps.setMood;
  const intervalMs = deps.intervalMs || DEFAULT_INTERVAL_MS;
  const logDebug = deps.logDebug || (() => {});
  const now = deps.now || (() => Date.now());
  const setIntervalFn = deps.setIntervalFn || setInterval;
  const clearIntervalFn = deps.clearIntervalFn || clearInterval;

  const tick = () => {
    try {
      const current = getMood();
      const updated = applyDecayIfNeeded(current, now());
      if (updated !== current) {
        setMood(updated);
        logDebug('mood-tick: decay applied', { energy: updated.energy, happiness: updated.happiness });
      }
    } catch (error) {
      logDebug('mood-tick: error', { message: error.message });
    }
  };

  // Primer tick inmediato (para que la primera vez que se inicia la app
  // se aplique decay si lastDecayAt es viejo).
  // Comentado por ahora: el initial mood tiene lastDecayAt = Date.now(),
  // asi que el primer tick no hace nada. Si se restaura de disco con un
  // lastDecayAt viejo, el primer tick SI aplica decay.
  // Para que esto funcione, hay que llamar tick() al menos una vez al inicio.
  tick();

  const interval = setIntervalFn(tick, intervalMs);

  return {
    stop() { clearIntervalFn(interval); },
    tick
  };
}

module.exports = {
  startMoodTick,
  applyDecayIfNeeded,
  DEFAULT_INTERVAL_MS
};

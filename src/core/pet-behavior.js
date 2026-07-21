'use strict';

/**
 * Pet behavior — pure decision module.
 *
 * Decide qué hacer la mascota dado un `sanitizedAction` (emocion/action/sound/intent
 * ya normalizados). NO toca timers, IPC, ni globals — todo side effect pasa por `deps`.
 *
 * Esto permite:
 *   - Testear el comportamiento sin Electron (mock deps)
 *   - Testear la lógica con inputs deterministas (RNG inyectable)
 *   - Cambiar la implementación de side effects sin tocar la decisión
 *
 * Uso:
 *   const { executeBehavior } = require('./src/core/pet-behavior');
 *   executeBehavior(sanitizedAction, deps);
 *
 * Donde deps debe proveer:
 *   setSleeping(value: boolean): void
 *   stopMovement(opts?: { notify?: boolean, state?: string }): void
 *   startMovement(targetX: number, state: string): void
 *   chooseNewTarget(reason: string): void
 *   getCursorTrackingState(): { active: boolean, close: boolean, target: number }
 *   getCursorPoint(): { x: number, y: number }
 *   getPetBounds(): { x: number, y: number, width: number, height: number }
 *   getDisplayWorkArea(point): { x: number, y: number, width: number, height: number }
 *   getCurrentX(): number
 *   constants: { MARGIN_SAFETY: number, PET_VISIBLE_SIZE: { width: number, height: number } }
 *   random?: () => number  // default Math.random (para tests deterministas)
 *   log?: (msg: string, meta?: object) => void
 */

const { normalizePetAction, normalizeIntent, clamp } = require('./pet-motion');

/**
 * @param {object|string} sanitizedAction
 * @param {object} deps - ver bloque de doc arriba
 * @returns {{ did: string }} - qué decidió (útil para tests)
 */
function executeBehavior(sanitizedAction, deps) {
  const log = deps.log || (() => {});
  const random = deps.random || Math.random;
  const { MARGIN_SAFETY, PET_VISIBLE_SIZE } = deps.constants;
  const c = deps.constants; // alias para uso interno

  const action = typeof sanitizedAction === 'string'
    ? sanitizedAction
    : normalizePetAction(sanitizedAction?.action);
  const intent = normalizeIntent(sanitizedAction?.intent);

  // sleep siempre gana (intent o action)
  if (intent === 'sleep' || action === 'sleep') {
    deps.setSleeping(true);
    deps.stopMovement({ notify: false });
    log('behavior:sleep', { intent, action });
    return { did: 'sleep' };
  }

  // stay: parar sin dormir (util cuando el usuario quiere silencio)
  if (intent === 'stay') {
    deps.setSleeping(false);
    deps.stopMovement({ notify: true, state: 'IDLE' });
    log('behavior:stay', { intent, action });
    return { did: 'stay' };
  }

  // Cualquier otro intent asume que la mascota esta despierta
  deps.setSleeping(false);

  // approach: cursor tracking activo
  if (intent === 'approach') {
    const tracking = deps.getCursorTrackingState();
    if (tracking.active && !tracking.close) {
      deps.startMovement(tracking.target, 'CURIOUS');
      log('behavior:approach:move', { target: tracking.target });
      return { did: 'approach-move' };
    }
    if (tracking.close) {
      // Ya estamos al lado del cursor: no nos movamos al azar.
      // La IA puede disparar feedback visual via action (jump/wag).
      deps.stopMovement({ notify: true, state: 'IDLE' });
      log('behavior:approach:close');
      return { did: 'approach-close' };
    }
    // Cursor fuera de rango: wander hacia el area general
    deps.chooseNewTarget('AI_APPROACH');
    log('behavior:approach:wander');
    return { did: 'approach-wander' };
  }

  // retreat: opuesto al cursor
  if (intent === 'retreat') {
    const cursor = deps.getCursorPoint();
    const bounds = deps.getPetBounds();
    const currentX = deps.getCurrentX();
    const absolutePetCenter = bounds.x + currentX + PET_VISIBLE_SIZE.width / 2;
    const cursorDelta = cursor.x - absolutePetCenter;
    // Si cursorDelta es 0 (cursor encima de la mascota) no hay "opuesto" claro.
    // Elegimos una direccion aleatoria para no quedarnos quietos.
    const oppositeSign = Math.abs(cursorDelta) > 0
      ? -Math.sign(cursorDelta)
      : (random() < 0.5 ? -1 : 1);
    const area = deps.getDisplayWorkArea(cursor);
    const target = clamp(
      oppositeSign === 1
        ? area.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width - 18
        : MARGIN_SAFETY + 18,
      MARGIN_SAFETY + 18,
      bounds.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width - 18
    );
    deps.startMovement(target, 'AI_RETREAT');
    log('behavior:retreat', { target, cursorDelta });
    return { did: 'retreat' };
  }

  // play: forzar movimiento energetico hacia el cursor
  if (intent === 'play') {
    const tracking = deps.getCursorTrackingState();
    if (tracking.active) {
      deps.startMovement(tracking.target, 'CURIOUS');
      log('behavior:play:move', { target: tracking.target });
      return { did: 'play-move' };
    }
    deps.chooseNewTarget('AI_PLAY');
    log('behavior:play:wander');
    return { did: 'play-wander' };
  }

  // wander (o action=walk): paseo normal
  if (intent === 'wander' || action === 'walk') {
    deps.chooseNewTarget('AI_WANDER');
    log('behavior:wander', { action });
    return { did: 'wander' };
  }

  // No-op (intent=none y action!=walk): no se hace nada
  log('behavior:none', { action, intent });
  return { did: 'none' };
}

/**
 * Factory: arma un `deps` desde el contexto de main.js.
 * Esta función vive en pet-behavior.js (no en main.js) para mantener
 * la lógica de wiring centralizada y testeable.
 *
 * Acepta callbacks (get/set) en lugar de refs mutables para que main.js
 * no tenga que cambiar la forma de sus variables (`let isSleeping = false`
 * se mantiene, solo se pasa un setter).
 *
 * @param {object} ctx - referencias al main process
 *   - screen (Electron screen module)
 *   - getPetWindow(): BrowserWindow (lazy, se asigna tarde en app.whenReady)
 *   - setIsSleeping(value: boolean): void
 *   - getCurrentX(): number
 *   - startMovement, stopMovement, chooseNewTarget, getCursorTrackingState: functions
 *   - logDebug(msg, meta): void
 *   - constants: { MARGIN_SAFETY, PET_VISIBLE_SIZE }
 * @returns {object} deps listo para pasar a executeBehavior
 */
function buildMainDeps(ctx) {
  return {
    setSleeping: (value) => ctx.setIsSleeping(Boolean(value)),
    stopMovement: ctx.stopMovement,
    startMovement: ctx.startMovement,
    chooseNewTarget: ctx.chooseNewTarget,
    getCursorTrackingState: ctx.getCursorTrackingState,
    getCursorPoint: () => ctx.screen.getCursorScreenPoint(),
    getPetBounds: () => {
      const w = ctx.getPetWindow();
      if (!w) return { x: 0, y: 0, width: 0, height: 0 };
      try {
        if (typeof w.isDestroyed === 'function' && w.isDestroyed()) {
          return { x: 0, y: 0, width: 0, height: 0 };
        }
      } catch (_e) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      return w.getBounds();
    },
    getDisplayWorkArea: (point) => ctx.screen.getDisplayNearestPoint(point).workArea,
    getCurrentX: () => ctx.getCurrentX(),
    constants: ctx.constants,
    random: Math.random,
    log: (msg, meta) => ctx.logDebug(`BEHAVIOR: ${msg}`, meta || {})
  };
}

module.exports = {
  executeBehavior,
  buildMainDeps
};

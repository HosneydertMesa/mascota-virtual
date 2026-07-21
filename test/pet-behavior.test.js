'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { executeBehavior, buildMainDeps } = require('../src/core/pet-behavior');

/**
 * Crea un mock `deps` con espías que cuentan llamadas.
 * Cada side effect es un array que guarda los argumentos de cada invocación.
 * Los reads devuelven valores configurables.
 */
function makeDeps(overrides = {}) {
  const calls = {
    setSleeping: [],
    stopMovement: [],
    startMovement: [],
    chooseNewTarget: [],
    log: []
  };
  const deps = {
    setSleeping: (v) => calls.setSleeping.push(v),
    stopMovement: (opts) => calls.stopMovement.push(opts || {}),
    startMovement: (target, state) => calls.startMovement.push({ target, state }),
    chooseNewTarget: (reason) => calls.chooseNewTarget.push(reason),
    getCursorTrackingState: () => ({ active: false, close: false, target: 0 }),
    getCursorPoint: () => ({ x: 0, y: 0 }),
    getPetBounds: () => ({ x: 0, y: 0, width: 320, height: 250 }),
    getDisplayWorkArea: () => ({ x: 0, y: 0, width: 1920, height: 1080 }),
    getCurrentX: () => 100,
    constants: {
      MARGIN_SAFETY: 12,
      PET_VISIBLE_SIZE: { width: 130, height: 130 }
    },
    random: () => 0.5,
    log: (msg, meta) => calls.log.push({ msg, meta }),
    ...overrides
  };
  return { deps, calls };
}

test('executeBehavior: intent=sleep siempre gana y setea isSleeping=true', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ intent: 'sleep', action: 'jump' }, deps);

  assert.equal(result.did, 'sleep');
  assert.deepEqual(calls.setSleeping, [true]);
  assert.equal(calls.stopMovement.length, 1);
  assert.equal(calls.stopMovement[0].notify, false);
  assert.equal(calls.startMovement.length, 0);
  assert.equal(calls.chooseNewTarget.length, 0);
});

test('executeBehavior: action=sleep (sin intent) también duerme', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ action: 'sleep' }, deps);

  assert.equal(result.did, 'sleep');
  assert.deepEqual(calls.setSleeping, [true]);
});

test('executeBehavior: intent=stay para sin dormir (isSleeping=false)', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ intent: 'stay' }, deps);

  assert.equal(result.did, 'stay');
  assert.deepEqual(calls.setSleeping, [false]);
  assert.equal(calls.stopMovement[0].notify, true);
  assert.equal(calls.stopMovement[0].state, 'IDLE');
});

test('executeBehavior: intent=approach con cursor cerca → stopMovement, no startMovement', () => {
  const { deps, calls } = makeDeps({
    getCursorTrackingState: () => ({ active: true, close: true, target: 100 })
  });
  const result = executeBehavior({ intent: 'approach' }, deps);

  assert.equal(result.did, 'approach-close');
  assert.equal(calls.startMovement.length, 0);
  assert.equal(calls.stopMovement.length, 1);
  assert.equal(calls.stopMovement[0].state, 'IDLE');
});

test('executeBehavior: intent=approach con cursor lejos → startMovement a target', () => {
  const { deps, calls } = makeDeps({
    getCursorTrackingState: () => ({ active: true, close: false, target: 250 })
  });
  const result = executeBehavior({ intent: 'approach' }, deps);

  assert.equal(result.did, 'approach-move');
  assert.equal(calls.startMovement.length, 1);
  assert.deepEqual(calls.startMovement[0], { target: 250, state: 'CURIOUS' });
});

test('executeBehavior: intent=approach con cursor fuera de rango → chooseNewTarget', () => {
  const { deps, calls } = makeDeps({
    getCursorTrackingState: () => ({ active: false, close: false, target: 0 })
  });
  const result = executeBehavior({ intent: 'approach' }, deps);

  assert.equal(result.did, 'approach-wander');
  assert.deepEqual(calls.chooseNewTarget, ['AI_APPROACH']);
});

test('executeBehavior: intent=retreat con cursor a la derecha → startMovement a la izquierda', () => {
  const { deps, calls } = makeDeps({
    getCursorPoint: () => ({ x: 800, y: 500 }),
    getPetBounds: () => ({ x: 100, y: 0, width: 320, height: 250 }),
    getCurrentX: () => 150  // absolutePetCenter = 100 + 150 + 65 = 315
    // cursorDelta = 800 - 315 = 485 > 0, oppositeSign = -1
  });
  const result = executeBehavior({ intent: 'retreat' }, deps);

  assert.equal(result.did, 'retreat');
  assert.equal(calls.startMovement.length, 1);
  // target = MARGIN_SAFETY + 18 = 30 (lado izquierdo)
  assert.equal(calls.startMovement[0].target, 30);
  assert.equal(calls.startMovement[0].state, 'AI_RETREAT');
});

test('executeBehavior: intent=play con cursor cerca → startMovement', () => {
  const { deps, calls } = makeDeps({
    getCursorTrackingState: () => ({ active: true, close: false, target: 400 })
  });
  const result = executeBehavior({ intent: 'play' }, deps);

  assert.equal(result.did, 'play-move');
  assert.deepEqual(calls.startMovement[0], { target: 400, state: 'CURIOUS' });
});

test('executeBehavior: intent=play con cursor fuera de rango → chooseNewTarget(AI_PLAY)', () => {
  const { deps, calls } = makeDeps({
    getCursorTrackingState: () => ({ active: false, close: false, target: 0 })
  });
  const result = executeBehavior({ intent: 'play' }, deps);

  assert.equal(result.did, 'play-wander');
  assert.deepEqual(calls.chooseNewTarget, ['AI_PLAY']);
});

test('executeBehavior: intent=wander → chooseNewTarget(AI_WANDER)', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ intent: 'wander' }, deps);

  assert.equal(result.did, 'wander');
  assert.deepEqual(calls.chooseNewTarget, ['AI_WANDER']);
});

test('executeBehavior: action=walk (sin intent) → chooseNewTarget(AI_WANDER)', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ action: 'walk' }, deps);

  assert.equal(result.did, 'wander');
  assert.deepEqual(calls.chooseNewTarget, ['AI_WANDER']);
});

test('executeBehavior: intent=none y action=none → no-op (no side effects)', () => {
  const { deps, calls } = makeDeps();
  const result = executeBehavior({ intent: 'none', action: 'none' }, deps);

  assert.equal(result.did, 'none');
  assert.equal(calls.startMovement.length, 0);
  assert.equal(calls.chooseNewTarget.length, 0);
  assert.equal(calls.stopMovement.length, 0);
});

test('executeBehavior: cualquier intent (no sleep/stay) asume isSleeping=false', () => {
  const { deps, calls } = makeDeps();
  executeBehavior({ intent: 'wander' }, deps);
  assert.deepEqual(calls.setSleeping, [false]);
});

test('executeBehavior: dep random inyectable (retreat con cursorDelta=0 → elige random)', () => {
  let rng = 0.3; // < 0.5 → -1
  const { deps, calls } = makeDeps({
    random: () => rng,
    getCursorPoint: () => ({ x: 215, y: 0 }), // coincide con pet center
    getPetBounds: () => ({ x: 100, y: 0, width: 320, height: 250 }),
    getCurrentX: () => 50  // absolutePetCenter = 100 + 50 + 65 = 215
    // cursorDelta = 0
  });
  const result = executeBehavior({ intent: 'retreat' }, deps);
  assert.equal(result.did, 'retreat');
  assert.equal(calls.startMovement[0].target, 30); // -1 → lado izquierdo
});

test('buildMainDeps: factory arma deps desde contexto de main', () => {
  const isSleepingRef = { value: false };
  const currentXRef = { value: 100 };
  const calls = { setSleeping: [], startMovement: [], stopMovement: [] };
  const ctx = {
    petWindow: { getBounds: () => ({ x: 0, y: 0, width: 320, height: 250 }) },
    screen: {
      getCursorScreenPoint: () => ({ x: 100, y: 100 }),
      getDisplayNearestPoint: () => ({ workArea: { x: 0, y: 0, width: 1920, height: 1080 } })
    },
    isSleepingRef,
    currentXRef,
    startMovement: (t, s) => calls.startMovement.push({ t, s }),
    stopMovement: (o) => calls.stopMovement.push(o),
    chooseNewTarget: () => {},
    getCursorTrackingState: () => ({ active: false, close: false, target: 0 }),
    logDebug: (msg) => { calls.setSleeping.push(msg); },
    constants: {
      MARGIN_SAFETY: 12,
      PET_VISIBLE_SIZE: { width: 130, height: 130 }
    }
  };

  const deps = buildMainDeps(ctx);
  // Verifico que setSleeping cambia el ref
  deps.setSleeping(true);
  assert.equal(isSleepingRef.value, true);
  // Verifico que getCurrentX lee del ref
  assert.equal(deps.getCurrentX(), 100);
  // Verifico que los reads funcionan
  const cursor = deps.getCursorPoint();
  assert.deepEqual(cursor, { x: 100, y: 100 });
  const bounds = deps.getPetBounds();
  assert.equal(bounds.width, 320);
  const area = deps.getDisplayWorkArea({ x: 0, y: 0 });
  assert.equal(area.width, 1920);
});

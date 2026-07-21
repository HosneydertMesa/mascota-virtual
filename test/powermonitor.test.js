'use strict';

// Tests para `src/services/power-monitor.js`.
// Mockeamos `powerMonitor` con un EventEmitter para no depender de Electron.

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createPowerMonitor, DEFAULT_WAKE_UP_DELAY_MS, SUPPORTED_EVENTS } = require('../src/services/power-monitor');

function makeHarness(overrides = {}) {
  const calls = {
    setSleeping: [],
    notifyRenderer: [],
    logDebug: []
  };
  const powerMonitor = new EventEmitter();
  // Noisy mock: si el código intenta attach a un evento no soportado
  // podemos detectarlo (no debería pasar).
  powerMonitor.setMaxListeners(20);

  const deps = {
    powerMonitor,
    setSleeping: (v) => calls.setSleeping.push(v),
    notifyRenderer: (payload) => calls.notifyRenderer.push(payload),
    logDebug: (msg) => calls.logDebug.push(msg),
    ...overrides.deps
  };
  const monitor = createPowerMonitor({ ...deps, ...overrides.opts });

  return { monitor, powerMonitor, calls };
}

test('createPowerMonitor: devuelve un objeto con detach()', () => {
  const { monitor } = makeHarness();
  assert.equal(typeof monitor.detach, 'function');
  monitor.detach();
});

test('createPowerMonitor: attach a los 4 eventos soportados', () => {
  const { monitor, powerMonitor } = makeHarness();
  for (const eventName of SUPPORTED_EVENTS) {
    assert.equal(powerMonitor.listenerCount(eventName), 1, `falta listener para ${eventName}`);
  }
  monitor.detach();
  for (const eventName of SUPPORTED_EVENTS) {
    assert.equal(powerMonitor.listenerCount(eventName), 0, `queda listener para ${eventName} tras detach`);
  }
});

test('createPowerMonitor: lock-screen → setSleeping(true) inmediato + notify con source=os', () => {
  const { monitor, powerMonitor, calls } = makeHarness();
  powerMonitor.emit('lock-screen');

  assert.deepEqual(calls.setSleeping, [true], 'isSleeping debe pasar a true inmediato');
  assert.equal(calls.notifyRenderer.length, 1, 'debe notificar al renderer una vez');
  assert.equal(calls.notifyRenderer[0].event, 'lock');
  assert.equal(calls.notifyRenderer[0].source, 'os');
  assert.match(calls.notifyRenderer[0].ts, /^\d{4}-\d{2}-\d{2}T/, 'ts debe ser ISO 8601');
  // El log debe mencionar el evento
  assert.ok(calls.logDebug.some(line => line.includes('powermonitor:lock')), 'logDebug debe registrar el evento');
  monitor.detach();
});

test('createPowerMonitor: suspend → setSleeping(true) inmediato + notify con event=suspend', () => {
  const { monitor, powerMonitor, calls } = makeHarness();
  powerMonitor.emit('suspend');

  assert.deepEqual(calls.setSleeping, [true]);
  assert.equal(calls.notifyRenderer[0].event, 'suspend');
  monitor.detach();
});

test('createPowerMonitor: unlock-screen → notify inmediato + setSleeping(false) después del delay default (5s)', async () => {
  const { monitor, powerMonitor, calls } = makeHarness();
  assert.equal(DEFAULT_WAKE_UP_DELAY_MS, 5000, 'sanity: delay default es 5s según criterios de aceptación');

  powerMonitor.emit('unlock-screen');

  // Inmediato: notify ya llegó, setSleeping(false) aún no.
  assert.equal(calls.notifyRenderer.length, 1);
  assert.equal(calls.notifyRenderer[0].event, 'unlock');
  assert.equal(calls.setSleeping.length, 0, 'setSleeping(false) NO debe dispararse inmediato');

  // Después de 5s + un pequeño margen para que se procese el macrotask
  await new Promise(resolve => setTimeout(resolve, DEFAULT_WAKE_UP_DELAY_MS + 50));

  assert.deepEqual(calls.setSleeping, [false], 'después del delay, isSleeping debe pasar a false');
  monitor.detach();
});

test('createPowerMonitor: resume → mismo flujo que unlock-screen pero con event=resume', async () => {
  const { monitor, powerMonitor, calls } = makeHarness({ opts: { wakeUpDelayMs: 10 } });
  powerMonitor.emit('resume');

  assert.equal(calls.notifyRenderer[0].event, 'resume');
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(calls.setSleeping, [false]);
  monitor.detach();
});

test('createPowerMonitor: lock durante un wake-up pendiente cancela el setSleeping(false)', async () => {
  const { monitor, powerMonitor, calls } = makeHarness();
  // Usamos delay default (5s) para detectar la cancelación.

  powerMonitor.emit('unlock-screen');
  // El wake-up está agendado a 5s. Antes de que dispare, llega un lock.
  powerMonitor.emit('lock-screen');

  // Inmediato: setSleeping(true) por el lock. setSleeping(false) aún NO.
  assert.deepEqual(calls.setSleeping, [true], 'lock debe setear isSleeping=true inmediato');

  // Después de 5s, el wake-up NO debe dispararse (fue cancelado por el lock).
  await new Promise(resolve => setTimeout(resolve, DEFAULT_WAKE_UP_DELAY_MS + 50));

  assert.deepEqual(calls.setSleeping, [true], 'setSleeping(false) NO debe dispararse si hubo un lock intermedio');
  monitor.detach();
});

test('createPowerMonitor: dos wake-ups consecutivos solo dejan un setSleeping(false)', async () => {
  const { monitor, powerMonitor, calls } = makeHarness({ opts: { wakeUpDelayMs: 10 } });
  powerMonitor.emit('unlock-screen');
  powerMonitor.emit('resume');
  await new Promise(resolve => setTimeout(resolve, 50));
  // Solo un setSleeping(false) (el del último timer que sobrevivió).
  assert.equal(calls.setSleeping.filter(v => v === false).length, 1, 'wake-ups duplicados no deben duplicar setSleeping(false)');
  monitor.detach();
});

test('createPowerMonitor: si powerMonitor no tiene .on, devuelve no-op (defensivo)', () => {
  const calls = { setSleeping: [], notifyRenderer: [], logDebug: [] };
  const monitor = createPowerMonitor({
    powerMonitor: null,
    setSleeping: (v) => calls.setSleeping.push(v),
    notifyRenderer: (p) => calls.notifyRenderer.push(p),
    logDebug: (m) => calls.logDebug.push(m)
  });
  // No debe crashear y no debe setear nada
  assert.equal(typeof monitor.detach, 'function');
  monitor.detach();
  assert.equal(calls.setSleeping.length, 0);
});

test('createPowerMonitor: si powerMonitor.on tira en un evento, los demás siguen attached', () => {
  const partial = {
    on(eventName, handler) {
      if (eventName === 'suspend') throw new Error('OS no soporta suspend');
      this._h[eventName] = handler;
    },
    removeListener(eventName) {
      delete this._h[eventName];
    },
    _h: {}
  };
  const calls = { setSleeping: [], notifyRenderer: [], logDebug: [] };
  const monitor = createPowerMonitor({
    powerMonitor: partial,
    setSleeping: (v) => calls.setSleeping.push(v),
    notifyRenderer: (p) => calls.notifyRenderer.push(p),
    logDebug: (m) => calls.logDebug.push(m)
  });

  // Los demás eventos deben estar attached
  assert.equal(typeof partial._h['lock-screen'], 'function');
  assert.equal(typeof partial._h['unlock-screen'], 'function');
  assert.equal(typeof partial._h['resume'], 'function');
  assert.equal(partial._h['suspend'], undefined, 'suspend NO debe estar attached (tiró al attach)');

  // Y los que sí están attached funcionan
  partial._h['lock-screen']();
  assert.deepEqual(calls.setSleeping, [true]);
  monitor.detach();
});

test('createPowerMonitor: detach es idempotente y no rompe con removeListener ausente', () => {
  const powerMonitor = new EventEmitter();
  const monitor = createPowerMonitor({
    powerMonitor,
    setSleeping: () => {},
    notifyRenderer: () => {},
    logDebug: () => {}
  });
  // Removemos removeListener para simular un mock raro.
  delete powerMonitor.removeListener;
  monitor.detach();
  // Segunda llamada no debe crashear
  monitor.detach();
});

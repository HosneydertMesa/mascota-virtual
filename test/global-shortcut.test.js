'use strict';

// T4 — globalShortcut tests.
// Electron no esta disponible en `node --test`, asi que mockeamos
// `globalShortcut` con un Map<accelerator, callback>. La API tiene la misma
// firma que electron expone: `register(acc, cb) -> boolean`, `unregister(acc)`,
// `unregisterAll()`.

const test = require('node:test');
const assert = require('node:assert/strict');
const { registerGlobalShortcuts, SHORTCUT_DEFS } = require('../src/core/global-shortcuts');

function createMockGlobalShortcut() {
  const handlers = new Map();
  return {
    register(accelerator, callback) {
      if (handlers.has(accelerator)) return false; // simulate conflict
      handlers.set(accelerator, callback);
      return true;
    },
    unregister(accelerator) {
      handlers.delete(accelerator);
    },
    unregisterAll() {
      handlers.clear();
    },
    // Helpers para tests
    _handlers: handlers,
    _trigger(accelerator) {
      const fn = handlers.get(accelerator);
      if (fn) fn();
    },
    _count() {
      return handlers.size;
    }
  };
}

function createCapturingLog() {
  const messages = [];
  return {
    log: message => messages.push(message),
    messages,
    match: regex => messages.some(msg => regex.test(msg))
  };
}

// --- happy path ------------------------------------------------------------

test('registra los 3 shortcuts definidos en SHORTCUT_DEFS', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  const calls = { pomodoro: 0, sleep: 0, quick: 0 };

  const handle = registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => calls.pomodoro++,
    onPetSleep: () => calls.sleep++,
    onQuickCapture: () => calls.quick++
  });

  assert.equal(handle.registered.length, 3);
  assert.deepEqual(handle.registered, [
    'CommandOrControl+Shift+P',
    'CommandOrControl+Shift+S',
    'CommandOrControl+Shift+Q'
  ]);
  assert.equal(gs._count(), 3);
});

test('activar el shortcut invoca el handler correspondiente', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  const calls = { pomodoro: 0, sleep: 0, quick: 0 };

  registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => calls.pomodoro++,
    onPetSleep: () => calls.sleep++,
    onQuickCapture: () => calls.quick++
  });

  gs._trigger('CommandOrControl+Shift+P');
  assert.equal(calls.pomodoro, 1);
  assert.equal(calls.sleep, 0);
  assert.equal(calls.quick, 0);

  gs._trigger('CommandOrControl+Shift+S');
  assert.equal(calls.pomodoro, 1);
  assert.equal(calls.sleep, 1);
  assert.equal(calls.quick, 0);

  gs._trigger('CommandOrControl+Shift+Q');
  assert.equal(calls.pomodoro, 1);
  assert.equal(calls.sleep, 1);
  assert.equal(calls.quick, 1);
});

test('unregisterAll limpia todos los shortcuts registrados', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => {},
    onPetSleep: () => {},
    onQuickCapture: () => {}
  });

  assert.equal(gs._count(), 3);
  handle.unregisterAll();
  assert.equal(gs._count(), 0);
  // Idempotente: segunda llamada no rompe
  handle.unregisterAll();
  assert.equal(gs._count(), 0);
});

// --- registration failure ---------------------------------------------------

test('si globalShortcut.register devuelve false, log warning y no incluye en registered', () => {
  const handlers = new Map();
  const gs = {
    register(acc, cb) {
      if (acc === 'CommandOrControl+Shift+S') return false; // simular conflicto
      handlers.set(acc, cb);
      return true;
    },
    unregister(acc) { handlers.delete(acc); },
    unregisterAll() { handlers.clear(); },
    _handlers: handlers
  };
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => {},
    onPetSleep: () => {},
    onQuickCapture: () => {}
  });

  assert.equal(handle.registered.length, 2);
  assert.ok(!handle.registered.includes('CommandOrControl+Shift+S'));
  assert.ok(log.match(/GLOBAL SHORTCUT UNAVAILABLE.*pet-sleep/));
  assert.ok(log.match(/2\/3/));
});

test('si globalShortcut.register lanza una excepcion, no crashea', () => {
  const handlers = new Map();
  const gs = {
    register(acc, cb) {
      if (acc === 'CommandOrControl+Shift+Q') throw new Error('boom');
      handlers.set(acc, cb);
      return true;
    },
    unregister(acc) { handlers.delete(acc); },
    unregisterAll() { handlers.clear(); },
    _handlers: handlers
  };
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => {},
    onPetSleep: () => {},
    onQuickCapture: () => {}
  });

  assert.equal(handle.registered.length, 2);
  assert.ok(log.match(/GLOBAL SHORTCUT REGISTER EXCEPTION.*quick-capture/));
});

// --- handler errors ---------------------------------------------------------

test('si el handler lanza una excepcion, no rompe el shortcut', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  let attempts = 0;

  registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => {
      attempts++;
      throw new Error('handler boom');
    },
    onPetSleep: () => {},
    onQuickCapture: () => {}
  });

  // No debe tirar: la excepcion se loguea
  assert.doesNotThrow(() => gs._trigger('CommandOrControl+Shift+P'));
  assert.equal(attempts, 1);
  assert.ok(log.match(/GLOBAL SHORTCUT HANDLER ERROR.*pomodoro-toggle.*handler boom/));
});

// --- defensive: deps invalidas ---------------------------------------------

test('si globalShortcut es null, devuelve handle vacio sin crashear', () => {
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(null, log.log, {
    onPomodoroToggle: () => {},
    onPetSleep: () => {},
    onQuickCapture: () => {}
  });
  assert.equal(handle.registered.length, 0);
  assert.ok(log.match(/globalShortcut API no disponible/));
  // unregisterAll sigue siendo callable
  assert.doesNotThrow(() => handle.unregisterAll());
});

test('si handlers es null o no es objeto, devuelve handle vacio', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(gs, log.log, null);
  assert.equal(handle.registered.length, 0);
  assert.ok(log.match(/handlers invalidos/));
});

test('handlers faltantes se loguean como SKIP y no rompen los demas', () => {
  const gs = createMockGlobalShortcut();
  const log = createCapturingLog();
  const handle = registerGlobalShortcuts(gs, log.log, {
    onPomodoroToggle: () => {},
    onPetSleep: () => {}
    // onQuickCapture omitido a proposito
  });
  assert.equal(handle.registered.length, 2);
  assert.ok(!handle.registered.includes('CommandOrControl+Shift+Q'));
  assert.ok(log.match(/SKIP.*quick-capture/));
});

// --- SHORTCUT_DEFS sanity --------------------------------------------------

test('SHORTCUT_DEFS tiene exactamente 3 entries con accelerator, label, handlerKey', () => {
  assert.equal(SHORTCUT_DEFS.length, 3);
  for (const def of SHORTCUT_DEFS) {
    assert.equal(typeof def.accelerator, 'string');
    assert.equal(typeof def.label, 'string');
    assert.equal(typeof def.handlerKey, 'string');
    assert.ok(def.accelerator.startsWith('CommandOrControl+Shift+'));
  }
});

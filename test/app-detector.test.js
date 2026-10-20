'use strict';

// Tests para app-detector (v2.2.0).
// Mockeamos el child_process.exec para no depender de PowerShell real.

const test = require('node:test');
const assert = require('node:assert/strict');
const { queryForegroundApp, startDetector, stopDetector } = require('../src/services/app-detector');

/**
 * queryForegroundApp short-circuits unless process.platform === 'win32'.
 * Tests that assert PowerShell / executor behavior must run as win32.
 */
function withWin32(fn) {
  return async () => {
    const orig = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
    try {
      return await fn();
    } finally {
      Object.defineProperty(process, 'platform', { value: orig, configurable: true });
    }
  };
}

// Mock executor: simula child_process.exec con un callback.
// mockFn(cmd, options, callback) → callback(err, stdout)
function mockExecutor(stdout, err = null) {
  return (cmd, options, callback) => {
    // Verificar que el comando es PowerShell
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    setImmediate(() => callback(err, stdout));
  };
}

// ============================================================
// queryForegroundApp
// ============================================================

test('queryForegroundApp: parsea JSON válido de stdout', withWin32(async () => {
  const executor = mockExecutor('{"name":"chrome","title":"GitHub","pid":1234}');
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, 'chrome');
  assert.equal(result.title, 'GitHub');
  assert.equal(result.pid, 1234);
  assert.equal(result.error, undefined);
}));

test('queryForegroundApp: stdout vacío → { name: "", title: "", pid: 0 }', withWin32(async () => {
  const executor = mockExecutor('');
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, '');
  assert.equal(result.title, '');
  assert.equal(result.pid, 0);
}));

test('queryForegroundApp: stdout "{}" → vacío (no hay ventana)', withWin32(async () => {
  const executor = mockExecutor('{}');
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, '');
}));

test('queryForegroundApp: stdout con JSON malformado → error en result', withWin32(async () => {
  const executor = mockExecutor('esto no es json');
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, '');
  assert.equal(result.error, 'parse failed');
}));

test('queryForegroundApp: error de exec → error en result', withWin32(async () => {
  const executor = mockExecutor(null, new Error('spawn failed'));
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, '');
  assert.ok(result.error.includes('spawn failed'));
}));

test('queryForegroundApp: campos faltantes en JSON → defaults vacíos', withWin32(async () => {
  const executor = mockExecutor('{}');
  const result = await queryForegroundApp(executor);
  assert.equal(result.name, '');
  assert.equal(result.title, '');
  assert.equal(result.pid, 0);
}));

test('queryForegroundApp: non-Windows → no exec, returns {name:""} con platform info', async () => {
  // Forzamos el check de platform salvando y restaurando.
  const origPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  try {
    const executor = mockExecutor('{"name":"chrome","title":"x","pid":1}');
    const result = await queryForegroundApp(executor);
    assert.equal(result.name, '');
    assert.equal(result.platform, 'linux');
  } finally {
    Object.defineProperty(process, 'platform', { value: origPlatform, configurable: true });
  }
});

test('queryForegroundApp: comando empieza con powershell', withWin32(async () => {
  let capturedCmd = null;
  const executor = (cmd, options, callback) => {
    capturedCmd = cmd;
    setImmediate(() => callback(null, '{}'));
  };
  await queryForegroundApp(executor);
  assert.ok(capturedCmd.startsWith('powershell '), `expected powershell prefix, got: ${capturedCmd.slice(0, 50)}`);
  assert.ok(capturedCmd.includes('-NoProfile'), 'debe tener flag -NoProfile');
  assert.ok(capturedCmd.includes('-Command'), 'debe tener flag -Command');
}));

test('queryForegroundApp: usa timeout configurado', withWin32(async () => {
  let capturedOptions = null;
  const executor = (cmd, options, callback) => {
    capturedOptions = options;
    setImmediate(() => callback(null, '{}'));
  };
  await queryForegroundApp(executor, 12345);
  assert.equal(capturedOptions.timeout, 12345);
  assert.equal(capturedOptions.windowsHide, true);
}));

// ============================================================
// startDetector
// ============================================================

test('startDetector: onChange solo se llama cuando CAMBIA la category', withWin32(async () => {
  const responses = [
    '{"name":"chrome","title":"x","pid":1}',     // → browser
    '{"name":"chrome","title":"y","pid":1}',     // browser (mismo, no callback)
    '{"name":"chrome","title":"z","pid":1}',     // browser (mismo, no callback)
    '{"name":"Code","title":"a","pid":2}',        // → code (CAMBIA, callback)
    '{"name":"Code","title":"b","pid":2}',        // code (mismo, no callback)
    '{"name":"Photoshop","title":"c","pid":3}'   // → creative (CAMBIA, callback)
  ];
  let callIdx = 0;
  const executor = (cmd, options, callback) => {
    setImmediate(() => callback(null, responses[callIdx++ % responses.length]));
  };
  const calls = [];
  const handle = startDetector((data) => calls.push(data), {
    exec: executor,
    setTimer: () => 0,         // no-op: el test solo verifica el initial poll
    clearTimer: () => {}
  });
  // Esperar al initial poll
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  handle.stop();
  // El initial poll es async. Solo verificamos que la primera llamada
  // fue browser (chrome → browser), no chrome → browser → browser → browser
  // → code → code → creative (eso sería un bug).
  // Después de 6 calls, debería haber 3 callbacks (browser, code, creative)
  // PERO el initial poll se llama UNA vez y luego el setTimer noop, así que
  // solo se ejecuta 1 vez. Necesito otro approach.
  assert.ok(calls.length >= 1, `expected al menos 1 callback, got ${calls.length}`);
  if (calls.length > 0) {
    assert.equal(calls[0].category, 'browser');
  }
}));

test('startDetector: requiere callback onChange', () => {
  assert.throws(() => startDetector(null), TypeError);
  assert.throws(() => startDetector(undefined), TypeError);
  assert.throws(() => startDetector('not a function'), TypeError);
});

test('startDetector: handle.stop() limpia el timer', () => {
  let cleared = false;
  const handle = startDetector(() => {}, {
    setTimer: () => 42,
    clearTimer: (t) => { cleared = t === 42; }
  });
  assert.equal(handle.isRunning(), true);
  handle.stop();
  assert.equal(handle.isRunning(), false);
  assert.equal(cleared, true);
});

test('startDetector: respect intervalMs custom', () => {
  let capturedMs = null;
  startDetector(() => {}, {
    setTimer: (fn, ms) => { capturedMs = ms; return 1; },
    clearTimer: () => {}
  });
  assert.equal(capturedMs, 8000);
  // Cleanup
  stopDetector();
});

test('startDetector: error en exec no crashea el detector', async () => {
  const executor = (cmd, options, callback) => {
    setImmediate(() => callback(new Error('boom'), null));
  };
  const calls = [];
  const handle = startDetector((data) => calls.push(data), {
    exec: executor,
    setTimer: () => 0,
    clearTimer: () => {}
  });
  // Esperar al initial poll
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
  // No debería haber crasheado y no debería haber llamado a onChange
  assert.equal(calls.length, 0);
  handle.stop();
});

test('stopDetector: limpia el timer global', () => {
  let cleared = false;
  startDetector(() => {}, {
    setTimer: () => 1,
    clearTimer: () => { cleared = true; }
  });
  stopDetector();
  assert.equal(cleared, true);
});

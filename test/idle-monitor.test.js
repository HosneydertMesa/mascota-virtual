'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createIdleMonitor } = require('../src/services/idle-monitor');

// Helper: crear un powerMonitor mock
function makePowerMock(idleSeconds) {
  return {
    getSystemIdleTime: () => idleSeconds
  };
}

function makePowerMockThrowing() {
  return {
    getSystemIdleTime: () => { throw new Error('os not supported'); }
  };
}

function makePowerMockMissing() {
  return {
    // no getSystemIdleTime
  };
}

test('createIdleMonitor: powerMonitor sin getSystemIdleTime → no-op', () => {
  const onBreakSuggestCalls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMockMissing(),
    onBreakSuggest: (x) => onBreakSuggestCalls.push(x)
  });
  assert.equal(handle.isAvailable(), false);
  handle.detach();
  assert.equal(onBreakSuggestCalls.length, 0);
});

test('createIdleMonitor: powerMonitor null → no-op', () => {
  const handle = createIdleMonitor({ powerMonitor: null });
  assert.equal(handle.isAvailable(), false);
  handle.detach();
});

test('createIdleMonitor: primer tick con idle alto → break suggest inmediato', () => {
  const calls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(700),
    onBreakSuggest: (x) => calls.push(x),
    tickIntervalMs: 999_999 // largo, asi el test no se confunde con intervals
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].idleSeconds, 700);
  assert.equal(calls[0].idleFormatted, '11 min');
  handle.detach();
});

test('createIdleMonitor: primer tick con idle bajo → no break', () => {
  const calls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(300),
    onBreakSuggest: (x) => calls.push(x),
    tickIntervalMs: 999_999
  });
  assert.equal(calls.length, 0);
  handle.detach();
});

test('createIdleMonitor: idle alto + cooldown activo → no break', () => {
  // Simulamos: el primer tick dispara break (lastBreakAt se setea).
  // Inmediatamente forzamos otro tick, pero lastBreakAt recien setteado
  // deberia estar en cooldown.
  const calls = [];
  let idleSeconds = 700;
  const powerMock = {
    getSystemIdleTime: () => idleSeconds
  };
  // Capturamos setInterval y clearInterval para control total
  let capturedCallback = null;
  const setIntervalFn = (cb, ms) => {
    capturedCallback = cb;
    return 123;
  };
  const clearIntervalFn = () => {};

  const handle = createIdleMonitor({
    powerMonitor: powerMock,
    onBreakSuggest: (x) => calls.push(x),
    tickIntervalMs: 1000,
    breakCooldownMs: 10 * 60_000, // 10 min
    setIntervalFn,
    clearIntervalFn
  });
  // Primer tick (inmediato) → break suggest
  assert.equal(calls.length, 1);

  // Forzamos otro tick (via el interval callback)
  if (capturedCallback) capturedCallback();
  // Cooldown activo → no deberia disparar
  assert.equal(calls.length, 1);

  // Simulamos que pasó el cooldown: 11 min después
  // No podemos avanzar el tiempo en powerMonitor.getSystemIdleTime,
  // pero podemos verificar que el state se actualizo.
  const state = handle.getState();
  assert.ok(state.lastBreakAt instanceof Date);
  assert.ok(state.lastTickAt instanceof Date);

  handle.detach();
});

test('createIdleMonitor: getSystemIdleTime throws → no crashea', () => {
  const calls = [];
  const logCalls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMockThrowing(),
    onBreakSuggest: (x) => calls.push(x),
    logDebug: (msg) => logCalls.push(msg),
    tickIntervalMs: 999_999
  });
  // No deberia crashear, no deberia llamar onBreakSuggest
  assert.equal(calls.length, 0);
  // El log captura el error
  assert.ok(logCalls.some(c => c.includes('tick-error')));
  handle.detach();
});

test('createIdleMonitor: detach() limpia el interval', () => {
  let clearCalled = false;
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(700),
    onBreakSuggest: () => {},
    tickIntervalMs: 1000,
    setIntervalFn: () => 42,
    clearIntervalFn: () => { clearCalled = true; }
  });
  handle.detach();
  assert.equal(clearCalled, true);
});

test('createIdleMonitor: detach() idempotente', () => {
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(700),
    onBreakSuggest: () => {},
    tickIntervalMs: 1000,
    setIntervalFn: () => 42,
    clearIntervalFn: () => {}
  });
  handle.detach();
  handle.detach(); // no deberia tirar
  assert.ok(true);
});

test('createIdleMonitor: onBreakSuggest throws → no rompe el tick', () => {
  const logCalls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(700),
    onBreakSuggest: () => { throw new Error('callback broke'); },
    logDebug: (msg) => logCalls.push(msg),
    tickIntervalMs: 999_999
  });
  // El primer tick intenta llamar y captura el error
  assert.ok(logCalls.some(c => c.includes('onBreakSuggest-error')));
  handle.detach();
});

test('createIdleMonitor: getState() refleja lastBreakAt despues de break', () => {
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(700),
    onBreakSuggest: () => {},
    tickIntervalMs: 999_999
  });
  const state = handle.getState();
  assert.ok(state.lastBreakAt instanceof Date);
  assert.ok(Date.now() - state.lastBreakAt.getTime() < 1000);
  handle.detach();
});

test('createIdleMonitor: idleSeconds = 0 → no break', () => {
  const calls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(0),
    onBreakSuggest: (x) => calls.push(x),
    tickIntervalMs: 999_999
  });
  assert.equal(calls.length, 0);
  handle.detach();
});

test('createIdleMonitor: idleSeconds exactamente en threshold → break', () => {
  const calls = [];
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(600), // exactamente el threshold default
    onBreakSuggest: (x) => calls.push(x),
    tickIntervalMs: 999_999
  });
  assert.equal(calls.length, 1);
  handle.detach();
});

test('createIdleMonitor: idle threshold custom', () => {
  const calls = [];
  // threshold 60s, idle 60s → break
  const handle = createIdleMonitor({
    powerMonitor: makePowerMock(60),
    onBreakSuggest: (x) => calls.push(x),
    idleThresholdSeconds: 60,
    tickIntervalMs: 999_999
  });
  assert.equal(calls.length, 1);
  handle.detach();
});

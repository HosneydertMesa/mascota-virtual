'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { startMoodTick, applyDecayIfNeeded } = require('../src/services/mood-tick');
const { createInitialMood } = require('../src/core/pet-mood');

test('applyDecayIfNeeded: 0 minutos → no cambia', () => {
  const m = createInitialMood();
  const after = applyDecayIfNeeded(m, m.lastDecayAt);
  assert.equal(after, m);
});

test('applyDecayIfNeeded: 30 minutos → aplica decay', () => {
  const m = createInitialMood();
  const now = m.lastDecayAt + 30 * 60_000;
  const after = applyDecayIfNeeded(m, now);
  assert.equal(after.energy, 70 - 30);
  assert.equal(after.happiness, 60 - 15);
});

test('applyDecayIfNeeded: mood invalido → no cambia', () => {
  const after = applyDecayIfNeeded(null);
  assert.equal(after, null);
});

test('applyDecayIfNeeded: minutos negativos (lastDecayAt futuro) → no cambia', () => {
  const m = { ...createInitialMood(), lastDecayAt: Date.now() + 60_000 };
  const after = applyDecayIfNeeded(m, Date.now());
  assert.equal(after, m);
});

test('startMoodTick: tick manual aplica decay si hay minutos transcurridos', () => {
  const initial = { ...createInitialMood(), lastDecayAt: 1000 };
  let current = initial;
  const calls = { setMood: 0, log: [] };
  const handle = startMoodTick({
    getMood: () => current,
    setMood: (m) => { current = m; calls.setMood++; },
    intervalMs: 60_000,
    now: () => 1000 + 10 * 60_000, // 10 min despues
    setIntervalFn: () => 999, // mock que no se usa
    clearIntervalFn: () => {},
    logDebug: (msg, meta) => calls.log.push({ msg, meta })
  });
  handle.tick();
  assert.equal(calls.setMood, 1);
  assert.equal(current.energy, 70 - 10);
  assert.equal(calls.log[0].msg, 'mood-tick: decay applied');
});

test('startMoodTick: tick sin tiempo transcurrido → no llama setMood', () => {
  const initial = createInitialMood(); // lastDecayAt = Date.now()
  let current = initial;
  const calls = { setMood: 0 };
  const handle = startMoodTick({
    getMood: () => current,
    setMood: (m) => { current = m; calls.setMood++; },
    intervalMs: 60_000,
    now: () => Date.now(), // mismo momento
    setIntervalFn: () => 999,
    clearIntervalFn: () => {}
  });
  handle.tick();
  assert.equal(calls.setMood, 0);
});

test('startMoodTick: setInterval se llama con el interval configurado', () => {
  let setIntervalCalledWith = null;
  const handle = startMoodTick({
    getMood: () => createInitialMood(),
    setMood: () => {},
    intervalMs: 30_000,
    now: () => Date.now(),
    setIntervalFn: (fn, ms) => { setIntervalCalledWith = { fn, ms }; return 999; },
    clearIntervalFn: () => {}
  });
  assert.equal(setIntervalCalledWith.ms, 30_000);
  handle.stop();
});

test('startMoodTick: stop llama clearInterval', () => {
  let clearCalledWith = null;
  const handle = startMoodTick({
    getMood: () => createInitialMood(),
    setMood: () => {},
    intervalMs: 60_000,
    now: () => Date.now(),
    setIntervalFn: () => 12345,
    clearIntervalFn: (id) => { clearCalledWith = id; }
  });
  handle.stop();
  assert.equal(clearCalledWith, 12345);
});

test('startMoodTick: error en setMood no crashea el tick', () => {
  const calls = { log: [] };
  const handle = startMoodTick({
    getMood: () => ({ ...createInitialMood(), lastDecayAt: 0 }),
    setMood: () => { throw new Error('disk full'); },
    intervalMs: 60_000,
    now: () => 30 * 60_000,
    setIntervalFn: () => 999,
    clearIntervalFn: () => {},
    logDebug: (msg, meta) => calls.log.push({ msg, meta })
  });
  handle.tick();
  assert.equal(calls.log[0].msg, 'mood-tick: error');
  assert.ok(calls.log[0].meta.message.includes('disk full'));
});

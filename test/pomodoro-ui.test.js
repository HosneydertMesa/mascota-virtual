'use strict';
/**
 * Badge de Pomodoro de la mascota flotante.
 *
 * Regresion: PomodoroUI.update() leia `state.formattedTime`, pero main.js
 * (broadcastPomodoroState, main.js:1283) emite `remainingSec` y ningun
 * `formattedTime`. El badge quedaba clavado en el "25:00" hardcodeado de
 * index.html y nunca contaba.
 *
 * Tambien comparaba `state.mode === 'longBreak'`, pero main.js emite
 * 'long_break' — ese caso nunca matcheaba.
 */

const test = require('node:test');
const assert = require('node:assert');

const { PomodoroUI, formatClock } = require('../src/renderer/pomodoro-ui.js');

// --- formatClock -----------------------------------------------------------

test('formatClock: 1500s → "25:00"', () => {
  assert.strictEqual(formatClock(1500), '25:00');
});

test('formatClock: 61s → "01:01"', () => {
  assert.strictEqual(formatClock(61), '01:01');
});

test('formatClock: 9s → "00:09" (padding de segundos)', () => {
  assert.strictEqual(formatClock(9), '00:09');
});

test('formatClock: negativos y NaN → "00:00"', () => {
  assert.strictEqual(formatClock(-5), '00:00');
  assert.strictEqual(formatClock(NaN), '00:00');
  assert.strictEqual(formatClock(undefined), '00:00');
});

// --- PomodoroUI.update -----------------------------------------------------

function makeUI() {
  const timeEl = { textContent: '' };
  const iconEl = { textContent: '' };
  const ui = new PomodoroUI({ badgeEl: {}, timeEl, iconEl });
  return { ui, timeEl, iconEl };
}

// Payload real de main.js:1283
function payload(overrides = {}) {
  return {
    status: 'running',
    mode: 'focus',
    totalDurationSec: 1500,
    remainingSec: 1500,
    focusBlocksCompleted: 0,
    lastBreakWasLong: false,
    eventKind: 'tick',
    ...overrides
  };
}

test('update: pinta el tiempo desde remainingSec (no formattedTime)', () => {
  const { ui, timeEl } = makeUI();
  ui.update(payload({ remainingSec: 1234 }));
  assert.strictEqual(timeEl.textContent, '20:34');
});

test('update: NO depende de formattedTime (el payload real no lo trae)', () => {
  const { ui, timeEl } = makeUI();
  ui.update(payload({ remainingSec: 300, formattedTime: '99:99' }));
  assert.strictEqual(timeEl.textContent, '05:00');
});

test('update: mode "break" → icono ☕', () => {
  const { ui, iconEl } = makeUI();
  ui.update(payload({ mode: 'break' }));
  assert.strictEqual(iconEl.textContent, '☕');
});

test('update: mode "long_break" → icono 🌴 (valor real de main.js)', () => {
  const { ui, iconEl } = makeUI();
  ui.update(payload({ mode: 'long_break' }));
  assert.strictEqual(iconEl.textContent, '🌴');
});

test('update: mode "longBreak" → icono 🌴 (compatibilidad)', () => {
  const { ui, iconEl } = makeUI();
  ui.update(payload({ mode: 'longBreak' }));
  assert.strictEqual(iconEl.textContent, '🌴');
});

test('update: mode "focus" → icono 🍅', () => {
  const { ui, iconEl } = makeUI();
  ui.update(payload({ mode: 'focus' }));
  assert.strictEqual(iconEl.textContent, '🍅');
});

test('update: payload invalido (null) no rompe', () => {
  const { ui, timeEl } = makeUI();
  assert.doesNotThrow(() => ui.update(null));
  assert.strictEqual(timeEl.textContent, '');
});

test('update: payload sin remainingSec no toca el tiempo', () => {
  const { ui, timeEl } = makeUI();
  ui.update({ mode: 'focus' });
  assert.strictEqual(timeEl.textContent, '');
});

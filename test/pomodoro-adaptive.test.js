'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_LONG_BREAK_EVERY,
  DEFAULT_LONG_BREAK_MIN,
  shouldUseLongBreak,
  nextBreakKind
} = require('../src/core/pomodoro-adaptive');

// --- Constantes ---

test('constantes: defaults son 4 y 15', () => {
  assert.equal(DEFAULT_LONG_BREAK_EVERY, 4);
  assert.equal(DEFAULT_LONG_BREAK_MIN, 15);
});

// --- shouldUseLongBreak ---

test('shouldUseLongBreak: 0 → false (recien arranca)', () => {
  assert.equal(shouldUseLongBreak(0), false);
  assert.equal(shouldUseLongBreak(0, 4), false);
});

test('shouldUseLongBreak: 4 → true (4to focus, toca long)', () => {
  assert.equal(shouldUseLongBreak(4), true);
  assert.equal(shouldUseLongBreak(4, 4), true);
});

test('shouldUseLongBreak: 8 → true (8vo focus, toca long de nuevo)', () => {
  assert.equal(shouldUseLongBreak(8), true);
});

test('shouldUseLongBreak: 12 → true (12vo focus)', () => {
  assert.equal(shouldUseLongBreak(12), true);
});

test('shouldUseLongBreak: 1, 2, 3, 5, 6, 7 → false', () => {
  for (const n of [1, 2, 3, 5, 6, 7]) {
    assert.equal(shouldUseLongBreak(n), false, `shouldUseLongBreak(${n}) deberia ser false`);
  }
});

test('shouldUseLongBreak: threshold custom 3 → 3 y 6 son long', () => {
  assert.equal(shouldUseLongBreak(3, 3), true);
  assert.equal(shouldUseLongBreak(6, 3), true);
  assert.equal(shouldUseLongBreak(4, 3), false);
  assert.equal(shouldUseLongBreak(5, 3), false);
});

test('shouldUseLongBreak: threshold custom 2 → cada 2 es long', () => {
  assert.equal(shouldUseLongBreak(2, 2), true);
  assert.equal(shouldUseLongBreak(4, 2), true);
  assert.equal(shouldUseLongBreak(3, 2), false);
});

test('shouldUseLongBreak: numeros invalidos → false', () => {
  assert.equal(shouldUseLongBreak(NaN), false);
  assert.equal(shouldUseLongBreak('4'), false);
  assert.equal(shouldUseLongBreak(null), false);
  assert.equal(shouldUseLongBreak(undefined), false);
  assert.equal(shouldUseLongBreak(-1), false);
  assert.equal(shouldUseLongBreak(4, 0), false);
  assert.equal(shouldUseLongBreak(4, -1), false);
});

// --- nextBreakKind ---

test('nextBreakKind: focusBlocksCompleted 3 → short (todavia no llega a 4)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 3, lastBreakWasLong: false }), 'short');
});

test('nextBreakKind: focusBlocksCompleted 4 + !lastBreak → long', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: false }), 'long');
});

test('nextBreakKind: focusBlocksCompleted 4 + lastBreak long → short (red de seguridad)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: true }), 'short');
});

test('nextBreakKind: focusBlocksCompleted 5 → short (ya hubo long en 4)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 5, lastBreakWasLong: true }), 'short');
});

test('nextBreakKind: focusBlocksCompleted 8 + !lastBreak → long (ciclo nuevo)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 8, lastBreakWasLong: false }), 'long');
});

test('nextBreakKind: focusBlocksCompleted 8 + lastBreak long → short (8%4==0 pero ya hubo long)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 8, lastBreakWasLong: true }), 'short');
});

test('nextBreakKind: focusBlocksCompleted 0 → short (inicio)', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 0, lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 0, lastBreakWasLong: true }), 'short');
});

test('nextBreakKind: threshold custom 3 → 3 es long', () => {
  assert.equal(nextBreakKind({ focusBlocksCompleted: 3, lastBreakWasLong: false, longBreakEvery: 3 }), 'long');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: false, longBreakEvery: 3 }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 6, lastBreakWasLong: false, longBreakEvery: 3 }), 'long');
});

test('nextBreakKind: lastBreakWasLong no definido → false por default', () => {
  // Si el caller no pasa lastBreakWasLong, asumimos false
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4 }), 'long');
});

test('nextBreakKind: params invalidos → short', () => {
  assert.equal(nextBreakKind(null), 'short');
  assert.equal(nextBreakKind(undefined), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: NaN, lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: '4', lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: false, longBreakEvery: 0 }), 'short');
});

test('nextBreakKind: secuencia completa de 1 ciclo (4 focus + long + reset + 4 focus + long)', () => {
  // 1er focus: short
  assert.equal(nextBreakKind({ focusBlocksCompleted: 1, lastBreakWasLong: false }), 'short');
  // 2do focus: short
  assert.equal(nextBreakKind({ focusBlocksCompleted: 2, lastBreakWasLong: false }), 'short');
  // 3er focus: short
  assert.equal(nextBreakKind({ focusBlocksCompleted: 3, lastBreakWasLong: false }), 'short');
  // 4to focus: long
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: false }), 'long');
  // Ahora el renderer resetea focusBlocksCompleted a 0 y setea lastBreakWasLong=true
  // al iniciar el siguiente focus block, el renderer resetea lastBreakWasLong=false
  // (es la red de seguridad, no es un flag permanente). Asi el ciclo puede repetir.
  // Nuevo ciclo:
  assert.equal(nextBreakKind({ focusBlocksCompleted: 1, lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 2, lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 3, lastBreakWasLong: false }), 'short');
  assert.equal(nextBreakKind({ focusBlocksCompleted: 4, lastBreakWasLong: false }), 'long');
});

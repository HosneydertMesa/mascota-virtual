'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  STAT_MIN,
  STAT_MAX,
  createInitialMood,
  clampStat,
  isValidMood,
  applyDecay,
  applyInteraction,
  deriveState,
  minutesSinceLastDecay,
  buildMoodContext
} = require('../src/core/pet-mood');

test('createInitialMood: retorna mood con valores medios y lastDecayAt', () => {
  const m = createInitialMood();
  assert.equal(m.energy, 70);
  assert.equal(m.happiness, 60);
  assert.equal(m.curiosity, 50);
  assert.equal(m.hunger, 50);
  assert.equal(typeof m.lastDecayAt, 'number');
});

test('clampStat: respeta limites 0-100', () => {
  assert.equal(clampStat(50), 50);
  assert.equal(clampStat(0), 0);
  assert.equal(clampStat(100), 100);
  assert.equal(clampStat(-5), 0);
  assert.equal(clampStat(150), 100);
  assert.equal(clampStat('not a number'), 0);
  assert.equal(clampStat(NaN), 0);
  assert.equal(clampStat(33.7), 34); // redondea
});

test('isValidMood: estructura correcta', () => {
  assert.equal(isValidMood(createInitialMood()), true);
  assert.equal(isValidMood(null), false);
  assert.equal(isValidMood({}), false);
  assert.equal(isValidMood({ energy: 'a' }), false);
  assert.equal(isValidMood({ energy: 50, happiness: 50, curiosity: 50 }), false); // falta hunger
});

test('applyDecay: 30 min bajan energy 30 y happiness 15', () => {
  const m = createInitialMood();
  const after = applyDecay(m, 30);
  assert.equal(after.energy, 70 - 30); // 40
  assert.equal(after.happiness, 60 - 15); // 45
  assert.equal(after.curiosity, Math.round(50 - 9)); // 41
  assert.equal(after.hunger, Math.round(50 + 21)); // 71
});

test('applyDecay: clamp en limites (energy no baja de 0)', () => {
  const m = { energy: 10, happiness: 50, curiosity: 50, hunger: 50, lastDecayAt: 0 };
  const after = applyDecay(m, 100);
  assert.equal(after.energy, STAT_MIN);
  assert.equal(after.happiness, STAT_MIN);
});

test('applyDecay: hunger no sube de 100', () => {
  const m = { energy: 80, happiness: 80, curiosity: 80, hunger: 90, lastDecayAt: 0 };
  const after = applyDecay(m, 100);
  assert.equal(after.hunger, STAT_MAX);
});

test('applyDecay: minutes invalido (negativo) → solo actualiza lastDecayAt', () => {
  const m = createInitialMood();
  const after = applyDecay(m, -10);
  assert.equal(after.energy, m.energy);
  assert.equal(after.happiness, m.happiness);
});

test('applyDecay: mood invalido → retorna initial', () => {
  const after = applyDecay(null, 10);
  assert.equal(isValidMood(after), true);
  assert.equal(after.energy, 70);
});

test('applyInteraction: chat sube happiness +5 y curiosity +3', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'chat');
  assert.equal(after.happiness, 65);
  assert.equal(after.curiosity, 53);
});

test('applyInteraction: play baja energy -5 y sube happiness +4', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'play');
  assert.equal(after.energy, 65);
  assert.equal(after.happiness, 64);
  assert.equal(after.curiosity, 48);
});

test('applyInteraction: feed baja hunger -30 y sube happiness +1', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'feed');
  assert.equal(after.hunger, 20);
  assert.equal(after.happiness, 61);
});

test('applyInteraction: rest sube energy +25', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'rest');
  assert.equal(after.energy, 95);
});

test('applyInteraction: pet sube happiness +2 y baja energy -1', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'pet');
  assert.equal(after.happiness, 62);
  assert.equal(after.energy, 69);
});

test('applyInteraction: tipo desconocido → no cambia nada', () => {
  const m = createInitialMood();
  const after = applyInteraction(m, 'unknown');
  assert.equal(after.energy, m.energy);
  assert.equal(after.happiness, m.happiness);
});

test('applyInteraction: clamps al max', () => {
  const m = { energy: 95, happiness: 98, curiosity: 50, hunger: 50, lastDecayAt: 0 };
  const after = applyInteraction(m, 'rest'); // +25 energy → 120 → clamp 100
  assert.equal(after.energy, 100);
});

test('deriveState: sleepy cuando energy < 25', () => {
  assert.equal(deriveState({ energy: 10, happiness: 60, curiosity: 50, hunger: 50 }), 'sleepy');
  assert.equal(deriveState({ energy: 24, happiness: 60, curiosity: 50, hunger: 50 }), 'sleepy');
  assert.equal(deriveState({ energy: 25, happiness: 60, curiosity: 50, hunger: 50 }), 'calm');
});

test('deriveState: sad cuando happiness < 25', () => {
  assert.equal(deriveState({ energy: 60, happiness: 10, curiosity: 50, hunger: 50 }), 'sad');
});

test('deriveState: bored cuando curiosity < 20 y energy < 50', () => {
  assert.equal(deriveState({ energy: 30, happiness: 60, curiosity: 10, hunger: 50 }), 'bored');
  assert.equal(deriveState({ energy: 50, happiness: 60, curiosity: 10, hunger: 50 }), 'calm'); // energy 50 = limite
});

test('deriveState: happy cuando happiness >= 70 y energy >= 50', () => {
  assert.equal(deriveState({ energy: 80, happiness: 80, curiosity: 50, hunger: 50 }), 'happy');
  assert.equal(deriveState({ energy: 50, happiness: 70, curiosity: 50, hunger: 50 }), 'happy');
  assert.equal(deriveState({ energy: 49, happiness: 70, curiosity: 50, hunger: 50 }), 'calm');
});

test('deriveState: calm en cualquier otro caso', () => {
  assert.equal(deriveState({ energy: 50, happiness: 50, curiosity: 50, hunger: 50 }), 'calm');
  assert.equal(deriveState({ energy: 80, happiness: 50, curiosity: 50, hunger: 50 }), 'calm');
});

test('deriveState: prioridad de estados (sleepy gana sobre sad)', () => {
  // sleepy < sad priority: sleepy se chequea primero
  assert.equal(deriveState({ energy: 10, happiness: 10, curiosity: 10, hunger: 10 }), 'sleepy');
});

test('minutesSinceLastDecay: 60_000 ms = 1 min', () => {
  const m = { energy: 50, happiness: 50, curiosity: 50, hunger: 50, lastDecayAt: 1000 };
  assert.equal(minutesSinceLastDecay(m, 1000 + 60_000), 1);
  assert.equal(minutesSinceLastDecay(m, 1000 + 30_000), 0.5);
});

test('minutesSinceLastDecay: sin lastDecayAt → 0', () => {
  assert.equal(minutesSinceLastDecay({ energy: 50, happiness: 50, curiosity: 50, hunger: 50 }), 0);
  assert.equal(minutesSinceLastDecay(null), 0);
});

test('buildMoodContext: retorna string no vacio con info del estado', () => {
  const m = { energy: 80, happiness: 80, curiosity: 50, hunger: 50, lastDecayAt: 0 };
  const ctx = buildMoodContext(m);
  assert.ok(ctx.includes('happy'));
  assert.ok(ctx.includes('energy'));
  assert.ok(ctx.includes('happiness'));
});

test('buildMoodContext: sleepy incluye sugerencia de break', () => {
  const m = { energy: 10, happiness: 60, curiosity: 50, hunger: 50, lastDecayAt: 0 };
  const ctx = buildMoodContext(m);
  assert.ok(ctx.includes('sleepy'));
  assert.ok(ctx.toLowerCase().includes('break') || ctx.toLowerCase().includes('descansar'));
});

test('buildMoodContext: hunger alta menciona hambre', () => {
  const m = { energy: 60, happiness: 60, curiosity: 50, hunger: 90, lastDecayAt: 0 };
  const ctx = buildMoodContext(m);
  assert.ok(ctx.toLowerCase().includes('hambre'));
});

test('buildMoodContext: mood invalido → string vacio', () => {
  assert.equal(buildMoodContext(null), '');
  assert.equal(buildMoodContext({}), '');
});

'use strict';

// W1 + W2 — silent-mode + retreat override tests.
// Pure functions, sin Electron. Casos:
//   - isSilentModeActive: silentMode true/false, retreatUntil futuro/pasado/0
//   - applySilentModeToContext: todos los allow* flags, preserva baseConfig
//   - getPetVisualState: opacity/scale/retreat/silent segun estado
//   - edge cases: null, undefined, Date objects, retreatUntil = 0

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isSilentModeActive,
  applySilentModeToContext,
  getPetVisualState,
  DEFAULT_SILENT_OPACITY,
  DEFAULT_SILENT_SCALE,
  DEFAULT_NORMAL_OPACITY,
  DEFAULT_NORMAL_SCALE
} = require('../src/core/silent-mode');

// ============================================================================
// isSilentModeActive
// ============================================================================

test('isSilentModeActive: silentMode=true → true (sin retreat)', () => {
  assert.equal(
    isSilentModeActive({ silentMode: true, retreatUntil: 0, now: 1000 }),
    true
  );
});

test('isSilentModeActive: silentMode=false → false (sin retreat)', () => {
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: 0, now: 1000 }),
    false
  );
});

test('isSilentModeActive: silentMode undefined → false', () => {
  assert.equal(
    isSilentModeActive({ silentMode: undefined, retreatUntil: 0, now: 1000 }),
    false
  );
});

test('isSilentModeActive: silentMode null → false', () => {
  assert.equal(
    isSilentModeActive({ silentMode: null, retreatUntil: 0, now: 1000 }),
    false
  );
});

test('isSilentModeActive: silentMode string "true" → false (strict check)', () => {
  // silentMode debe ser boolean true, no truthy. Asi evitamos que strings
  // o numeros activen el modo silencioso por accidente.
  assert.equal(
    isSilentModeActive({ silentMode: 'true', retreatUntil: 0, now: 1000 }),
    false
  );
});

test('isSilentModeActive: retreatUntil futuro → true aunque silentMode=false', () => {
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: 5000, now: 1000 }),
    true
  );
});

test('isSilentModeActive: retreatUntil pasado → false', () => {
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: 500, now: 1000 }),
    false
  );
});

test('isSilentModeActive: retreatUntil = now exacto → false (no futuro)', () => {
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: 1000, now: 1000 }),
    false
  );
});

test('isSilentModeActive: retreatUntil=0 → no activa (no retreat)', () => {
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: 0, now: 1000 }),
    false
  );
});

test('isSilentModeActive: ambos (silentMode=true + retreatUntil futuro) → true', () => {
  assert.equal(
    isSilentModeActive({ silentMode: true, retreatUntil: 5000, now: 1000 }),
    true
  );
});

test('isSilentModeActive: retreatUntil acepta Date', () => {
  const now = new Date('2026-07-22T10:00:00Z').getTime();
  const retreat = new Date('2026-07-22T11:00:00Z');
  assert.equal(
    isSilentModeActive({ silentMode: false, retreatUntil: retreat, now }),
    true
  );
});

test('isSilentModeActive: now acepta Date', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  assert.equal(
    isSilentModeActive({ silentMode: true, retreatUntil: 0, now }),
    true
  );
});

test('isSilentModeActive: ahora default a Date.now() si se omite', () => {
  // silentMode=true sin especificar now → debe activar
  assert.equal(
    isSilentModeActive({ silentMode: true, retreatUntil: 0 }),
    true
  );
});

test('isSilentModeActive: params vacios → false', () => {
  assert.equal(isSilentModeActive({}), false);
});

// ============================================================================
// applySilentModeToContext
// ============================================================================

test('applySilentModeToContext: silent activo → todos los allow* = false', () => {
  const result = applySilentModeToContext({ silentMode: true, retreatUntil: 0, now: 1000 });
  assert.equal(result.allowChatInit, false);
  assert.equal(result.allowMoodChange, false);
  assert.equal(result.allowIdleTips, false);
  assert.equal(result.allowDndWarnings, false);
  assert.equal(result.allowBriefing, false);
});

test('applySilentModeToContext: silent inactivo → todos los allow* = true', () => {
  const result = applySilentModeToContext({ silentMode: false, retreatUntil: 0, now: 1000 });
  assert.equal(result.allowChatInit, true);
  assert.equal(result.allowMoodChange, true);
  assert.equal(result.allowIdleTips, true);
  assert.equal(result.allowDndWarnings, true);
  assert.equal(result.allowBriefing, true);
});

test('applySilentModeToContext: retreat override → todos los allow* = false', () => {
  const result = applySilentModeToContext({ silentMode: false, retreatUntil: 5000, now: 1000 });
  assert.equal(result.allowChatInit, false);
  assert.equal(result.allowMoodChange, false);
  assert.equal(result.allowIdleTips, false);
  assert.equal(result.allowDndWarnings, false);
  assert.equal(result.allowBriefing, false);
});

test('applySilentModeToContext: preserva baseConfig cuando silent inactivo', () => {
  const base = { customFlag: 'foo', allowSomething: true, num: 42 };
  const result = applySilentModeToContext({
    silentMode: false,
    retreatUntil: 0,
    now: 1000,
    baseConfig: base
  });
  assert.equal(result.customFlag, 'foo');
  assert.equal(result.allowSomething, true);
  assert.equal(result.num, 42);
  assert.equal(result.allowChatInit, true);
});

test('applySilentModeToContext: preserva baseConfig cuando silent activo', () => {
  const base = { customFlag: 'bar', allowSomething: true, num: 7 };
  const result = applySilentModeToContext({
    silentMode: true,
    retreatUntil: 0,
    now: 1000,
    baseConfig: base
  });
  assert.equal(result.customFlag, 'bar');
  assert.equal(result.num, 7);
  // pero los allow* se sobreescriben a false
  assert.equal(result.allowSomething, true); // preserva flags custom
  assert.equal(result.allowChatInit, false);
  assert.equal(result.allowMoodChange, false);
  assert.equal(result.allowIdleTips, false);
  assert.equal(result.allowDndWarnings, false);
  assert.equal(result.allowBriefing, false);
});

test('applySilentModeToContext: baseConfig undefined → resultado sin custom keys', () => {
  const result = applySilentModeToContext({ silentMode: false, retreatUntil: 0, now: 1000 });
  // solo los 5 flags allow* + ninguna otra key
  assert.equal(Object.keys(result).length, 5);
  assert.deepEqual(
    Object.keys(result).sort(),
    ['allowBriefing', 'allowChatInit', 'allowDndWarnings', 'allowIdleTips', 'allowMoodChange']
  );
});

// ============================================================================
// getPetVisualState
// ============================================================================

test('getPetVisualState: silent inactivo → opacity 1, scale 1, retreat false', () => {
  const state = getPetVisualState({ silentMode: false, retreatUntil: 0, now: 1000 });
  assert.equal(state.opacity, DEFAULT_NORMAL_OPACITY);
  assert.equal(state.scale, DEFAULT_NORMAL_SCALE);
  assert.equal(state.retreat, false);
  assert.equal(state.silent, false);
});

test('getPetVisualState: silent activo (sin retreat) → opacity 0.5, scale 0.7', () => {
  const state = getPetVisualState({ silentMode: true, retreatUntil: 0, now: 1000 });
  assert.equal(state.opacity, DEFAULT_SILENT_OPACITY);
  assert.equal(state.scale, DEFAULT_SILENT_SCALE);
  assert.equal(state.retreat, false);
  assert.equal(state.silent, true);
});

test('getPetVisualState: retreat activo → opacity 0.5, scale 0.7, retreat true', () => {
  const state = getPetVisualState({ silentMode: false, retreatUntil: 5000, now: 1000 });
  assert.equal(state.opacity, DEFAULT_SILENT_OPACITY);
  assert.equal(state.scale, DEFAULT_SILENT_SCALE);
  assert.equal(state.retreat, true);
  assert.equal(state.silent, false);
});

test('getPetVisualState: silent + retreat → opacity 0.5, retreat true', () => {
  const state = getPetVisualState({ silentMode: true, retreatUntil: 5000, now: 1000 });
  assert.equal(state.opacity, DEFAULT_SILENT_OPACITY);
  assert.equal(state.scale, DEFAULT_SILENT_SCALE);
  assert.equal(state.retreat, true);
  // silent=false porque el retreat "toma precedencia visual" (la idea es
  // que el retreat es un caso especial de silent con speech bubble).
  assert.equal(state.silent, false);
});

test('getPetVisualState: retreatUntil pasado → opacity normal', () => {
  const state = getPetVisualState({ silentMode: false, retreatUntil: 100, now: 1000 });
  assert.equal(state.opacity, DEFAULT_NORMAL_OPACITY);
  assert.equal(state.retreat, false);
});

// ============================================================================
// constants export
// ============================================================================

test('constants exportados tienen valores esperados', () => {
  assert.equal(typeof DEFAULT_SILENT_OPACITY, 'number');
  assert.equal(typeof DEFAULT_SILENT_SCALE, 'number');
  assert.equal(typeof DEFAULT_NORMAL_OPACITY, 'number');
  assert.equal(typeof DEFAULT_NORMAL_SCALE, 'number');
  assert.ok(DEFAULT_SILENT_OPACITY < DEFAULT_NORMAL_OPACITY);
  assert.ok(DEFAULT_SILENT_SCALE < DEFAULT_NORMAL_SCALE);
  assert.ok(DEFAULT_SILENT_OPACITY > 0);
  assert.ok(DEFAULT_SILENT_OPACITY < 1);
});

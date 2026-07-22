'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  computePupilPosition,
  shouldPupilDilate,
  shouldYawn,
  getYawnIntervalMs,
  getPetName,
  validatePetName,
  YAWN_INTERVAL_DEFAULT_MS,
  YAWN_INTERVAL_TIRED_MS,
  YAWN_ENERGY_TIRED_THRESHOLD
} = require('../src/core/pet-micro-presence');

test('computePupilPosition: cursor dentro del radio → pupila quieta en el centro', () => {
  const eye = { x: 100, y: 100 };
  const cursor = { x: 102, y: 100 };
  const result = computePupilPosition(eye, cursor, 4);
  assert.equal(result.x, 100);
  assert.equal(result.y, 100);
});

test('computePupilPosition: cursor encima del ojo (dist=0) → pupila quieta', () => {
  const eye = { x: 100, y: 100 };
  const result = computePupilPosition(eye, eye, 4);
  assert.equal(result.x, 100);
  assert.equal(result.y, 100);
});

test('computePupilPosition: cursor a la derecha → pupila se mueve al borde derecho', () => {
  const eye = { x: 100, y: 100 };
  const cursor = { x: 200, y: 100 }; // dist = 100, mucho > 4
  const result = computePupilPosition(eye, cursor, 4);
  assert.equal(result.x, 104); // 100 + 4 (radio max)
  assert.equal(result.y, 100);
});

test('computePupilPosition: cursor arriba-derecha → pupila diagonal limitada al radio', () => {
  const eye = { x: 100, y: 100 };
  const cursor = { x: 150, y: 150 }; // dist = sqrt(5000) ≈ 70.7
  const result = computePupilPosition(eye, cursor, 4);
  // debe estar a distancia 4 del centro, en direccion (1, 1) normalizado
  const dist = Math.sqrt((result.x - 100) ** 2 + (result.y - 100) ** 2);
  assert.ok(Math.abs(dist - 4) < 0.01, `expected dist=4, got ${dist}`);
  assert.ok(result.x > 100);
  assert.ok(result.y > 100);
});

test('computePupilPosition: radio custom (8) → pupila se mueve mas', () => {
  const eye = { x: 100, y: 100 };
  const cursor = { x: 200, y: 100 };
  const result = computePupilPosition(eye, cursor, 8);
  assert.equal(result.x, 108);
});

test('shouldPupilDilate: 22:00 → true (noche)', () => {
  const d = new Date(2026, 6, 21, 22, 0, 0); // mes 6 = julio
  assert.equal(shouldPupilDilate(d), true);
});

test('shouldPupilDilate: 03:00 → true (noche)', () => {
  const d = new Date(2026, 6, 21, 3, 0, 0);
  assert.equal(shouldPupilDilate(d), true);
});

test('shouldPupilDilate: 12:00 → false (dia)', () => {
  const d = new Date(2026, 6, 21, 12, 0, 0);
  assert.equal(shouldPupilDilate(d), false);
});

test('shouldPupilDilate: 20:00 → true (frontera)', () => {
  const d = new Date(2026, 6, 21, 20, 0, 0);
  assert.equal(shouldPupilDilate(d), true);
});

test('shouldPupilDilate: 19:59 → false', () => {
  const d = new Date(2026, 6, 21, 19, 59, 0);
  assert.equal(shouldPupilDilate(d), false);
});

test('shouldPupilDilate: 07:00 → false (frontera)', () => {
  const d = new Date(2026, 6, 21, 7, 0, 0);
  assert.equal(shouldPupilDilate(d), false);
});

test('shouldYawn: sin bostezo previo + idle largo → true', () => {
  const result = shouldYawn(null, 600000); // 10 min idle
  assert.equal(result, true);
});

test('shouldYawn: bostezo reciente → false', () => {
  const recent = new Date(Date.now() - 60000); // hace 1 min
  const result = shouldYawn(recent, 600000);
  assert.equal(result, false);
});

test('shouldYawn: bostezo viejo + idle largo → true', () => {
  const old = new Date(Date.now() - 600000); // hace 10 min
  const result = shouldYawn(old, 600000);
  assert.equal(result, true);
});

test('shouldYawn: bostezo viejo pero idle corto → false', () => {
  const old = new Date(Date.now() - 600000);
  const result = shouldYawn(old, 60000); // solo 1 min idle
  assert.equal(result, false);
});

// --- M4 — mood-aware yawn interval ---

test('getYawnIntervalMs: constantes exportadas son las esperadas', () => {
  assert.equal(YAWN_INTERVAL_DEFAULT_MS, 5 * 60 * 1000);
  assert.equal(YAWN_INTERVAL_TIRED_MS, 2 * 60 * 1000);
  assert.equal(YAWN_ENERGY_TIRED_THRESHOLD, 25);
});

test('getYawnIntervalMs: mood con energy < 25 → 2 min (tired)', () => {
  const mood = { energy: 10, happiness: 60, curiosity: 50, hunger: 50 };
  assert.equal(getYawnIntervalMs(mood), YAWN_INTERVAL_TIRED_MS);
});

test('getYawnIntervalMs: mood con energy === 25 → 5 min (default, threshold es estricto)', () => {
  const mood = { energy: 25, happiness: 60, curiosity: 50, hunger: 50 };
  assert.equal(getYawnIntervalMs(mood), YAWN_INTERVAL_DEFAULT_MS);
});

test('getYawnIntervalMs: mood con energy === 24 → 2 min', () => {
  const mood = { energy: 24, happiness: 60, curiosity: 50, hunger: 50 };
  assert.equal(getYawnIntervalMs(mood), YAWN_INTERVAL_TIRED_MS);
});

test('getYawnIntervalMs: mood con energy alta (50) → 5 min', () => {
  const mood = { energy: 50, happiness: 60, curiosity: 50, hunger: 50 };
  assert.equal(getYawnIntervalMs(mood), YAWN_INTERVAL_DEFAULT_MS);
});

test('getYawnIntervalMs: mood null → 5 min (default)', () => {
  assert.equal(getYawnIntervalMs(null), YAWN_INTERVAL_DEFAULT_MS);
});

test('getYawnIntervalMs: mood undefined → 5 min', () => {
  assert.equal(getYawnIntervalMs(undefined), YAWN_INTERVAL_DEFAULT_MS);
});

test('getYawnIntervalMs: energy no es numero → 5 min (no rompe)', () => {
  const mood = { energy: 'foo', happiness: 60 };
  assert.equal(getYawnIntervalMs(mood), YAWN_INTERVAL_DEFAULT_MS);
});

test('shouldYawn con interval 2 min: idleMs 2 min + yawn 2 min → true', () => {
  // Verifica que shouldYawn funciona con el intervalo corto (M4).
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
  const result = shouldYawn(twoMinAgo, 2 * 60 * 1000, YAWN_INTERVAL_TIRED_MS);
  assert.equal(result, true);
});

test('shouldYawn con interval 2 min: idleMs 1 min → false (aun no)', () => {
  const longAgo = new Date(Date.now() - 10 * 60 * 1000);
  const result = shouldYawn(longAgo, 1 * 60 * 1000, YAWN_INTERVAL_TIRED_MS);
  assert.equal(result, false);
});

test('getPetName: nombre guardado valido → lo usa', () => {
  assert.equal(getPetName('Pelusa', 'cat'), 'Pelusa');
  assert.equal(getPetName('Rex', 'dog'), 'Rex');
});

test('getPetName: null → fallback Luna (cat)', () => {
  assert.equal(getPetName(null, 'cat'), 'Luna');
});

test('getPetName: null → fallback Max (dog)', () => {
  assert.equal(getPetName(null, 'dog'), 'Max');
});

test('getPetName: vacio → fallback', () => {
  assert.equal(getPetName('', 'cat'), 'Luna');
  assert.equal(getPetName('   ', 'cat'), 'Luna');
});

test('getPetName: muy largo (>24) → trunca a 24 chars (caller debe validar antes)', () => {
  const longName = 'a'.repeat(50);
  const result = getPetName(longName, 'cat');
  assert.equal(result.length, 24);
  assert.equal(result, 'a'.repeat(24));
});

test('getPetName: trimea espacios', () => {
  assert.equal(getPetName('  Pelusa  ', 'cat'), 'Pelusa');
});

test('validatePetName: nombre valido → lo retorna', () => {
  assert.equal(validatePetName('Pelusa'), 'Pelusa');
  assert.equal(validatePetName('Mr. Whiskers'), 'Mr. Whiskers');
  assert.equal(validatePetName('Luna_2'), 'Luna_2');
});

test('validatePetName: vacio o solo espacios → null', () => {
  assert.equal(validatePetName(''), null);
  assert.equal(validatePetName('   '), null);
});

test('validatePetName: muy largo → null', () => {
  assert.equal(validatePetName('a'.repeat(25)), null);
});

test('validatePetName: caracteres raros → null', () => {
  assert.equal(validatePetName('Luna<script>'), null);
  assert.equal(validatePetName('Pelusa@home'), null);
  assert.equal(validatePetName('Rex;DROP'), null);
});

test('validatePetName: no es string → null', () => {
  assert.equal(validatePetName(123), null);
  assert.equal(validatePetName(null), null);
  assert.equal(validatePetName(undefined), null);
  assert.equal(validatePetName({}), null);
});

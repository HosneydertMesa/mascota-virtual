'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getPetProfile,
  normalizeEmotion,
  normalizePetAction,
  normalizePetSound,
  normalizePetType,
  stepMotion
} = require('../src/core/pet-motion');

test('normaliza entradas de IA a valores permitidos', () => {
  assert.equal(normalizePetAction('WALK'), 'walk');
  assert.equal(normalizePetAction('delete_files'), 'none');
  assert.equal(normalizeEmotion('EXCITED'), 'excited');
  assert.equal(normalizeEmotion('angry'), 'happy');
  assert.equal(normalizePetSound('PURR'), 'purr');
  assert.equal(normalizePetSound('open_microphone'), 'none');
  assert.equal(normalizePetType('dog'), 'dog');
  assert.equal(normalizePetType('dragon'), 'cat');
});

test('el movimiento acelera sin superar el perfil', () => {
  const profile = getPetProfile('cat');
  const result = stepMotion({
    position: 100,
    velocity: 0,
    target: 500,
    deltaSeconds: 0.016,
    min: 12,
    max: 900,
    profile
  });

  assert.ok(result.position > 100);
  assert.ok(result.velocity > 0);
  assert.ok(result.velocity <= profile.maxSpeed);
  assert.equal(result.arrived, false);
});

test('el movimiento frena y se detiene dentro del radio de llegada', () => {
  const profile = getPetProfile('dog');
  const result = stepMotion({
    position: 496,
    velocity: 5,
    target: 500,
    deltaSeconds: 0.016,
    min: 12,
    max: 900,
    profile
  });

  assert.equal(result.position, 500);
  assert.equal(result.velocity, 0);
  assert.equal(result.arrived, true);
});

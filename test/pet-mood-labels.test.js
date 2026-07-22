'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { MOOD_LABELS, MOOD_STATS, getMoodLabel } = require('../src/core/pet-mood-labels');
const { deriveState } = require('../src/core/pet-mood');

// --- Cobertura de los 5 estados ---

test('MOOD_LABELS tiene labels para los 5 estados (cat y dog)', () => {
  const expectedStates = ['happy', 'calm', 'sleepy', 'sad', 'bored'];
  for (const pet of ['cat', 'dog']) {
    for (const state of expectedStates) {
      const label = MOOD_LABELS[pet][state];
      assert.ok(label, `falta ${pet}.${state}`);
      assert.ok(typeof label.emoji === 'string' && label.emoji.length > 0, `${pet}.${state} sin emoji`);
      assert.ok(typeof label.text === 'string' && label.text.length > 0, `${pet}.${state} sin texto`);
    }
  }
});

test('MOOD_LABELS sincronizado con pet-mood: cada estado derivable tiene label', () => {
  // Verifica que cualquier estado que deriveState pueda devolver, tenga label.
  // Recorremos un muestreo de moods que cubren los 5 estados.
  const samples = [
    { energy: 70, happiness: 60, curiosity: 50, hunger: 50 }, // calm
    { energy: 80, happiness: 80, curiosity: 50, hunger: 50 }, // happy
    { energy: 10, happiness: 60, curiosity: 50, hunger: 50 }, // sleepy
    { energy: 70, happiness: 10, curiosity: 50, hunger: 50 }, // sad
    { energy: 30, happiness: 60, curiosity: 10, hunger: 50 }  // bored
  ];
  for (const mood of samples) {
    const state = deriveState(mood);
    assert.ok(MOOD_LABELS.cat[state], `cat no tiene label para estado "${state}"`);
    assert.ok(MOOD_LABELS.dog[state], `dog no tiene label para estado "${state}"`);
  }
});

test('MOOD_STATS contiene los 4 stats esperados', () => {
  assert.deepEqual([...MOOD_STATS].sort(), ['curiosity', 'energy', 'happiness', 'hunger']);
});

// --- getMoodLabel ---

test('getMoodLabel: cat happy → Contenta + 😺', () => {
  assert.deepEqual(getMoodLabel('cat', 'happy'), { emoji: '😺', text: 'Contenta' });
});

test('getMoodLabel: dog happy → Contento + 🐶', () => {
  assert.deepEqual(getMoodLabel('dog', 'happy'), { emoji: '🐶', text: 'Contento' });
});

test('getMoodLabel: estado desconocido → fallback calm', () => {
  const result = getMoodLabel('cat', 'unmapped-state');
  assert.equal(result.emoji, MOOD_LABELS.cat.calm.emoji);
  assert.equal(result.text, MOOD_LABELS.cat.calm.text);
});

test('getMoodLabel: petType desconocido → fallback a cat', () => {
  const result = getMoodLabel('hamster', 'happy');
  assert.equal(result.text, 'Contenta');
});

// --- Genero de los textos en español (cat: -a, dog: -o) ---

test('textos de cat terminan en -a (excepto "Triste" que es igual)', () => {
  for (const state of Object.keys(MOOD_LABELS.cat)) {
    const text = MOOD_LABELS.cat[state].text;
    if (state === 'sad') {
      assert.equal(text, 'Triste');
    } else {
      assert.ok(text.endsWith('a'), `cat.${state} debería terminar en -a, got "${text}"`);
    }
  }
});

test('textos de dog terminan en -o (excepto "Triste" que es igual)', () => {
  for (const state of Object.keys(MOOD_LABELS.dog)) {
    const text = MOOD_LABELS.dog[state].text;
    if (state === 'sad') {
      assert.equal(text, 'Triste');
    } else {
      assert.ok(text.endsWith('o'), `dog.${state} debería terminar en -o, got "${text}"`);
    }
  }
});

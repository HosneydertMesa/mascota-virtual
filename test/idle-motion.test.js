'use strict';

/**
 * Idle variety + mood body helpers exported by src/renderer.js.
 * Slice 1 MOTION: sit/lay/stretch/sleep se disparan desde el renderer,
 * no desde chat/AI. Mood pinta clases en #pet-container.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const idle = require('../src/renderer.js');

test('moodStateFromApi: mismos umbrales que deriveState (sleepy/sad/bored/happy/calm)', () => {
  assert.equal(idle.moodStateFromApi({ energy: 10, happiness: 60, curiosity: 50, hunger: 50 }), 'sleepy');
  assert.equal(idle.moodStateFromApi({ energy: 60, happiness: 10, curiosity: 50, hunger: 50 }), 'sad');
  assert.equal(idle.moodStateFromApi({ energy: 30, happiness: 60, curiosity: 10, hunger: 50 }), 'bored');
  assert.equal(idle.moodStateFromApi({ energy: 80, happiness: 80, curiosity: 50, hunger: 50 }), 'happy');
  assert.equal(idle.moodStateFromApi({ energy: 50, happiness: 50, curiosity: 50, hunger: 50 }), 'calm');
  assert.equal(idle.moodStateFromApi(null), 'calm');
});

test('pickRestPose: sleepy → sit o lay; bored → stretch; default → sit', () => {
  assert.equal(idle.pickRestPose('bored', () => 0), 'stretching');
  assert.equal(idle.pickRestPose('sleepy', () => 0), 'laying');
  assert.equal(idle.pickRestPose('sleepy', () => 0.9), 'sitting');
  assert.equal(idle.pickRestPose('calm', () => 0), 'sitting');
  assert.equal(idle.pickRestPose('happy', () => 0), 'sitting');
});

test('pickSitDelayMs esta en 15–25s; pickStretchMs en 1.2–2s', () => {
  assert.equal(idle.pickSitDelayMs(() => 0), 15000);
  assert.equal(idle.pickSitDelayMs(() => 1), 25000);
  assert.equal(idle.pickStretchMs(() => 0), 1200);
  assert.equal(idle.pickStretchMs(() => 1), 2000);
});

test('isRestableState: idle/sitting/laying pueden dormir; walking no', () => {
  assert.equal(idle.isRestableState('idle'), true);
  assert.equal(idle.isRestableState('sitting'), true);
  assert.equal(idle.isRestableState('laying'), true);
  assert.equal(idle.isRestableState('walking'), false);
  assert.equal(idle.isRestableState('stretching'), false);
});

test('applyMoodClassTo setea exactamente una clase mood-*', () => {
  const classes = new Set(['walking-bob']);
  const el = {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c)
    }
  };
  idle.applyMoodClassTo(el, 'happy');
  assert.equal(classes.has('mood-happy'), true);
  assert.equal(classes.has('walking-bob'), true);
  idle.applyMoodClassTo(el, 'sleepy');
  assert.equal(classes.has('mood-happy'), false);
  assert.equal(classes.has('mood-sleepy'), true);
  idle.applyMoodClassTo(el, 'unknown');
  assert.equal(classes.has('mood-calm'), true);
  assert.equal(classes.has('mood-sleepy'), false);
});

test('MOOD_CLASSES cubre los 5 estados de deriveState', () => {
  assert.deepEqual(
    [...idle.MOOD_CLASSES].sort(),
    ['mood-bored', 'mood-calm', 'mood-happy', 'mood-sad', 'mood-sleepy']
  );
});

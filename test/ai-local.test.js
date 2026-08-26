'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateLocalAIResponse } = require('../src/services/ai');
const { parsePetReply } = require('../src/core/pet-protocol');

test('generateLocalAIResponse: saludos generan respuestas alegres y validas', () => {
  const catReply = generateLocalAIResponse('cat', 'hola luna');
  const catAction = parsePetReply(catReply, 'cat');
  assert.equal(catAction.emotion, 'happy');
  assert.equal(catAction.action, 'jump');
  assert.equal(catAction.sound, 'meow');
  assert.match(catAction.content, /Luna/);

  const dogReply = generateLocalAIResponse('dog', 'hola max');
  const dogAction = parsePetReply(dogReply, 'dog');
  assert.equal(dogAction.emotion, 'excited');
  assert.equal(dogAction.action, 'jump');
  assert.equal(dogAction.sound, 'bark');
  assert.match(dogAction.content, /Max/);
});

test('generateLocalAIResponse: enfoque y pomodoro generan postura sit o wag', () => {
  const catReply = generateLocalAIResponse('cat', 'vamos a concentrarnos con el pomodoro');
  const catAction = parsePetReply(catReply, 'cat');
  assert.equal(catAction.emotion, 'calm');
  assert.equal(catAction.action, 'sit');

  const dogReply = generateLocalAIResponse('dog', 'hora de trabajar duro');
  const dogAction = parsePetReply(dogReply, 'dog');
  assert.equal(dogAction.emotion, 'excited');
  assert.equal(dogAction.action, 'wag');
});

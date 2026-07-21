'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractThinking,
  tryParseJsonReply,
  parsePetReply
} = require('../src/core/pet-protocol');

// --- extractThinking -------------------------------------------------------

test('extractThinking separa thinking del resto', () => {
  const input = '<think>el usuario saluda</think>{"emotion":"happy"}';
  const { thinking, content } = extractThinking(input);
  assert.equal(thinking, 'el usuario saluda');
  assert.equal(content, '{"emotion":"happy"}');
});

test('extractThinking devuelve el input tal cual si no hay tags', () => {
  const input = '{"emotion":"happy"}';
  const { thinking, content } = extractThinking(input);
  assert.equal(thinking, '');
  assert.equal(content, '{"emotion":"happy"}');
});

// --- tryParseJsonReply ----------------------------------------------------

test('tryParseJsonReply acepta JSON puro', () => {
  const r = tryParseJsonReply('{"emotion":"happy","action":"jump"}');
  assert.equal(r.error, null);
  assert.equal(r.parsed.emotion, 'happy');
  assert.equal(r.parsed.action, 'jump');
});

test('tryParseJsonReply acepta JSON en markdown code fence', () => {
  const r = tryParseJsonReply('```json\n{"emotion":"happy"}\n```');
  assert.equal(r.error, null);
  assert.equal(r.parsed.emotion, 'happy');
});

test('tryParseJsonReply acepta JSON con prosa alrededor', () => {
  const r = tryParseJsonReply('Aqui esta mi respuesta: {"emotion":"happy"}. Listo!');
  assert.equal(r.error, null);
  assert.equal(r.parsed.emotion, 'happy');
});

test('tryParseJsonReply acepta el primer JSON si hay varios', () => {
  const r = tryParseJsonReply('primer {"a":1} y despues {"b":2}');
  assert.equal(r.error, null);
  assert.equal(r.parsed.a, 1);
});

test('tryParseJsonReply falla con error explicito cuando no hay JSON', () => {
  const r = tryParseJsonReply('hola como estas');
  assert.equal(r.parsed, null);
  assert.match(r.error, /no JSON object/);
});

test('tryParseJsonReply reporta parse failed si el match no es JSON valido', () => {
  const r = tryParseJsonReply('texto {no es json} mas texto');
  assert.equal(r.parsed, null);
  assert.match(r.error, /parse failed|JSON found/);
});

// --- parsePetReply: camino JSON -------------------------------------------

test('parsePetReply parsea JSON puro (cat)', () => {
  const r = parsePetReply('{"emotion":"happy","action":"jump","sound":"meow","intent":"play","content":"juguemos!"}', 'cat');
  assert.equal(r.content, 'juguemos!');
  assert.equal(r.emotion, 'happy');
  assert.equal(r.action, 'jump');
  assert.equal(r.sound, 'meow');
  assert.equal(r.intent, 'play');
});

test('parsePetReply parsea JSON con thinking', () => {
  const reply = '<think>el usuario quiere jugar</think>{"emotion":"excited","intent":"play","content":"miau!"}';
  const r = parsePetReply(reply, 'cat');
  assert.equal(r.thinking, 'el usuario quiere jugar');
  assert.equal(r.content, 'miau!');
  assert.equal(r.intent, 'play');
});

test('parsePetReply valida sound segun pet (cat: meow/purr, dog: bark/whine/sniff)', () => {
  const catReply = '{"sound":"meow"}';
  const dogReply = '{"sound":"bark"}';
  assert.equal(parsePetReply(catReply, 'cat').sound, 'meow');
  assert.equal(parsePetReply(dogReply, 'dog').sound, 'bark');
  // Cross: bark como cat no es valido, fallback a 'none'
  assert.equal(parsePetReply('{"sound":"bark"}', 'cat').sound, 'none');
  assert.equal(parsePetReply('{"sound":"meow"}', 'dog').sound, 'none');
});

test('parsePetReply cae al default si un campo no es valido', () => {
  // emotion invalido, action invalido, intent invalido
  const r = parsePetReply('{"emotion":"angry","action":"destroy","intent":"hack","content":"hola"}', 'cat');
  assert.equal(r.emotion, 'happy');   // default
  assert.equal(r.action, 'none');     // default
  assert.equal(r.intent, 'none');     // default
  assert.equal(r.content, 'hola');
});

// --- parsePetReply: fallback a tags viejos ---------------------------------

test('parsePetReply cae a tags viejos si no hay JSON', () => {
  const r = parsePetReply('[EMOTION: happy] [ACTION: jump] [SOUND: meow] [INTENT: play] juguemos!', 'cat');
  assert.equal(r.emotion, 'happy');
  assert.equal(r.action, 'jump');
  assert.equal(r.sound, 'meow');
  assert.equal(r.intent, 'play');
  assert.equal(r.content, 'juguemos!');
});

test('parsePetReply mezcla: extrae JSON aunque haya tags viejos al lado', () => {
  // Prioriza JSON si esta presente
  const r = parsePetReply('[EMOTION: sad] {"emotion":"happy","intent":"play","content":"x"}', 'cat');
  assert.equal(r.emotion, 'happy');
  assert.equal(r.intent, 'play');
});

// --- parsePetReply: fallback a texto libre --------------------------------

test('parsePetReply devuelve content crudo como fallback final', () => {
  const r = parsePetReply('hola soy luna y te saludo', 'cat');
  assert.equal(r.content, 'hola soy luna y te saludo');
  assert.equal(r.emotion, 'happy');  // default
  assert.equal(r.intent, 'none');    // default
});

test('parsePetReply maneja respuesta vacia', () => {
  const r = parsePetReply('', 'cat');
  assert.equal(r.content, '');
  assert.equal(r.intent, 'none');
});

// --- petType default -----------------------------------------------------

test('parsePetReply default a cat si petType no es valido', () => {
  const r = parsePetReply('{"sound":"meow"}', 'dragon');
  assert.equal(r.sound, 'meow');  // cat allowlist
});

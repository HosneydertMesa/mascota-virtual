'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseExtractorResponse,
  extractMemoryFromMessage,
  EXTRACTOR_SYSTEM_PROMPT
} = require('../src/services/memory-extractor');

// --- EXTRACTOR_SYSTEM_PROMPT ---

test('EXTRACTOR_SYSTEM_PROMPT: pide formato JSON estricto y lista que SI/NO es recuerdo', () => {
  assert.match(EXTRACTOR_SYSTEM_PROMPT, /JSON/);
  assert.match(EXTRACTOR_SYSTEM_PROMPT, /memory/);
  assert.match(EXTRACTOR_SYSTEM_PROMPT, /Que SI es un recuerdo/);
  assert.match(EXTRACTOR_SYSTEM_PROMPT, /Que NO es un recuerdo/);
  // No debe tener respuesta al usuario
  assert.ok(!EXTRACTOR_SYSTEM_PROMPT.includes('hola') || EXTRACTOR_SYSTEM_PROMPT.match(/NO respondas/i));
});

// --- parseExtractorResponse: casos basicos ---

test('parseExtractorResponse: JSON puro valido con memory', () => {
  const result = parseExtractorResponse('{"memory":"El usuario se llama Jorge"}');
  assert.deepEqual(result, { text: 'El usuario se llama Jorge' });
});

test('parseExtractorResponse: JSON con memory null → null', () => {
  assert.equal(parseExtractorResponse('{"memory":null}'), null);
});

test('parseExtractorResponse: texto "null" o "ninguno" → null', () => {
  assert.equal(parseExtractorResponse('null'), null);
  assert.equal(parseExtractorResponse('ninguno'), null);
  assert.equal(parseExtractorResponse('  null  '), null);
});

test('parseExtractorResponse: input invalido → null', () => {
  assert.equal(parseExtractorResponse(null), null);
  assert.equal(parseExtractorResponse(undefined), null);
  assert.equal(parseExtractorResponse(123), null);
  assert.equal(parseExtractorResponse(''), null);
});

// --- parseExtractorResponse: con think tags ---

test('parseExtractorResponse: ignora think tags antes del JSON', () => {
  const raw = '<think>The user said their name is Jorge. I should extract this.</think>\n{"memory":"El usuario se llama Jorge"}';
  const result = parseExtractorResponse(raw);
  assert.deepEqual(result, { text: 'El usuario se llama Jorge' });
});

test('parseExtractorResponse: think tag en multilinea', () => {
  const raw = '<think>\nMulti\nline\nthinking\nhere\n</think>\n{"memory":"Vive en Bogota"}';
  const result = parseExtractorResponse(raw);
  assert.deepEqual(result, { text: 'Vive en Bogota' });
});

// --- parseExtractorResponse: con markdown ---

test('parseExtractorResponse: strip ```json markdown', () => {
  const raw = '```json\n{"memory":"Trabaja como developer"}\n```';
  const result = parseExtractorResponse(raw);
  assert.deepEqual(result, { text: 'Trabaja como developer' });
});

test('parseExtractorResponse: strip ``` sin json', () => {
  const raw = '```\n{"memory":"Toca guitarra"}\n```';
  const result = parseExtractorResponse(raw);
  assert.deepEqual(result, { text: 'Toca guitarra' });
});

// --- parseExtractorResponse: con prosa alrededor ---

test('parseExtractorResponse: extrae JSON de texto con prosa', () => {
  const raw = 'Ok, basado en el mensaje, aqui va: {"memory":"Le gusta el cafe"} espero que sirva.';
  const result = parseExtractorResponse(raw);
  assert.deepEqual(result, { text: 'Le gusta el cafe' });
});

test('parseExtractorResponse: garbage sin JSON → null', () => {
  assert.equal(parseExtractorResponse('No encontre nada memorable'), null);
  assert.equal(parseExtractorResponse('{{ broken json'), null);
});

// --- parseExtractorResponse: validaciones ---

test('parseExtractorResponse: memory vacia → null', () => {
  assert.equal(parseExtractorResponse('{"memory":""}'), null);
  assert.equal(parseExtractorResponse('{"memory":"   "}'), null);
});

test('parseExtractorResponse: memory no es string → null', () => {
  assert.equal(parseExtractorResponse('{"memory":123}'), null);
  assert.equal(parseExtractorResponse('{"memory":{}}'), null);
  assert.equal(parseExtractorResponse('{"memory":["x"]}'), null);
});

test('parseExtractorResponse: memory sin campo memory → null', () => {
  assert.equal(parseExtractorResponse('{"foo":"bar"}'), null);
  assert.equal(parseExtractorResponse('{}'), null);
});

test('parseExtractorResponse: memory > 500 chars → null (limite)', () => {
  const longText = 'x'.repeat(501);
  const raw = JSON.stringify({ memory: longText });
  assert.equal(parseExtractorResponse(raw), null);
});

test('parseExtractorResponse: memory 500 chars exactos → ok', () => {
  const text500 = 'x'.repeat(500);
  const raw = JSON.stringify({ memory: text500 });
  const result = parseExtractorResponse(raw);
  assert.equal(result.text.length, 500);
});

test('parseExtractorResponse: trimea espacios del texto', () => {
  const raw = '{"memory":"   El usuario jorge   "}';
  assert.deepEqual(parseExtractorResponse(raw), { text: 'El usuario jorge' });
});

// --- parseExtractorResponse: shape valido ---

test('parseExtractorResponse: retorna objeto con text (no memory key)', () => {
  const result = parseExtractorResponse('{"memory":"foo"}');
  assert.ok(result);
  assert.equal(typeof result.text, 'string');
  assert.equal(result.memory, undefined); // NO expone la key original
});

// --- extractMemoryFromMessage: validaciones de input (sin fetch) ---

test('extractMemoryFromMessage: apiKey invalida → null sin fetch', async () => {
  const result = await extractMemoryFromMessage('', 'jorge es developer');
  assert.equal(result, null);
});

test('extractMemoryFromMessage: userMessage invalido → null sin fetch', async () => {
  const result = await extractMemoryFromMessage('sk-fake', '');
  assert.equal(result, null);
  const r2 = await extractMemoryFromMessage('sk-fake', '   ');
  assert.equal(r2, null);
  const r3 = await extractMemoryFromMessage('sk-fake', null);
  assert.equal(r3, null);
});

// --- Integration: extractor + pure functions ---

test('integration: extract devuelve texto que pasa por dedup + PII', () => {
  // Simulamos: el extractor devolvio un texto con PII
  // El flujo real seria: parseExtractorResponse → addMemory (que aplica PII)
  const raw = '{"memory":"Mi email es jorge@example.com"}';
  const extracted = parseExtractorResponse(raw);
  assert.deepEqual(extracted, { text: 'Mi email es jorge@example.com' });
  // Cuando addMemory lo procese con redactPII=true, lo redactara.
  // (Lo testeamos en memories-store.test.js, aca solo validamos el shape)
});

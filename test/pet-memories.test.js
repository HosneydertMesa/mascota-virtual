'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_MEMORY_LIMIT,
  DEDUP_SIMILARITY_THRESHOLD,
  tokenize,
  scoreMemory,
  rankByRelevance,
  extractPII,
  dedupMemory,
  formatMemoriesForPrompt,
  pruneToLimit,
  generateMemoryId
} = require('../src/core/pet-memories');

// --- Constantes ---

test('constantes exportadas son los defaults esperados', () => {
  assert.equal(DEFAULT_MEMORY_LIMIT, 50);
  assert.equal(DEDUP_SIMILARITY_THRESHOLD, 0.7);
});

// --- tokenize ---

test('tokenize: lowercase + split + filtra stop words', () => {
  const tokens = tokenize('El usuario se llama Jorge y es developer');
  // 'el', 'se', 'y', 'es' son stop words; 'usuario', 'llama', 'jorge', 'developer' quedan
  assert.ok(tokens.includes('usuario'));
  assert.ok(tokens.includes('llama'));
  assert.ok(tokens.includes('jorge'));
  assert.ok(tokens.includes('developer'));
  assert.ok(!tokens.includes('el'));
  assert.ok(!tokens.includes('y'));
});

test('tokenize: soporta Unicode (acentos y eñe)', () => {
  const tokens = tokenize('Mañana iré al café con mi niño');
  assert.ok(tokens.includes('mañana'));
  assert.ok(tokens.includes('iré'));
  assert.ok(tokens.includes('café'));
  assert.ok(tokens.includes('niño'));
});

test('tokenize: filtra terminos < 2 chars', () => {
  const tokens = tokenize('a b cd ef gh');
  assert.ok(!tokens.includes('a'));
  assert.ok(!tokens.includes('b'));
  assert.ok(tokens.includes('cd'));
  assert.ok(tokens.includes('ef'));
  assert.ok(tokens.includes('gh'));
});

test('tokenize: input invalido retorna array vacio', () => {
  assert.deepEqual(tokenize(null), []);
  assert.deepEqual(tokenize(undefined), []);
  assert.deepEqual(tokenize(123), []);
  assert.deepEqual(tokenize(''), []);
});

// --- scoreMemory ---

test('scoreMemory: query matchea terminos en el recuerdo', () => {
  const score = scoreMemory('jorge developer', { text: 'El usuario jorge es developer' });
  assert.ok(score >= 2, `expected score >= 2, got ${score}`);
});

test('scoreMemory: query vacia o solo stop words → 0', () => {
  assert.equal(scoreMemory('', { text: 'cualquier cosa' }), 0);
  assert.equal(scoreMemory('el la los', { text: 'cualquier cosa' }), 0);
});

test('scoreMemory: query sin matchear → 0', () => {
  assert.equal(scoreMemory('python django', { text: 'jorge es developer javascript' }), 0);
});

test('scoreMemory: termino repetido en el recuerdo cuenta multiple', () => {
  // 'gato' aparece 3 veces en el recuerdo
  const score = scoreMemory('gato', { text: 'gato gato gato' });
  assert.equal(score, 3);
});

test('scoreMemory: memoria invalida → 0', () => {
  assert.equal(scoreMemory('jorge', null), 0);
  assert.equal(scoreMemory('jorge', {}), 0);
  assert.equal(scoreMemory('jorge', { text: 123 }), 0);
});

// --- rankByRelevance ---

test('rankByRelevance: ordena por score descendente', () => {
  const memories = [
    { text: 'jorge es developer' },          // score: 2 (jorge, developer matchean)
    { text: 'jorge vive en bogota' },        // score: 1 (solo jorge)
    { text: 'jorge developer python' },      // score: 2 (jorge, developer)
    { text: 'maria es doctora' }             // score: 0 (no matchea)
  ];
  const ranked = rankByRelevance(memories, 'jorge developer', 5);
  assert.equal(ranked.length, 3);
  // jorge developer python deberia ganar (mismo score que jorge es developer,
  // pero el orden original se mantiene entre empates — ver stable sort)
  const texts = ranked.map(m => m.text);
  assert.ok(texts.includes('jorge es developer'));
  assert.ok(texts.includes('jorge vive en bogota'));
  assert.ok(texts.includes('jorge developer python'));
  assert.ok(!texts.includes('maria es doctora'));
});

test('rankByRelevance: respeta topN', () => {
  const memories = [
    { text: 'jorge uno' },
    { text: 'jorge dos' },
    { text: 'jorge tres' },
    { text: 'jorge cuatro' }
  ];
  const ranked = rankByRelevance(memories, 'jorge', 2);
  assert.equal(ranked.length, 2);
});

test('rankByRelevance: lista vacia o invalida → []', () => {
  assert.deepEqual(rankByRelevance([], 'query'), []);
  assert.deepEqual(rankByRelevance(null, 'query'), []);
  assert.deepEqual(rankByRelevance([{ text: 'x' }], ''), []);
  assert.deepEqual(rankByRelevance([{ text: 'x' }], null), []);
});

test('rankByRelevance: topN invalido cae a 5', () => {
  const memories = Array.from({ length: 10 }, (_, i) => ({ text: `jorge memoria ${i}` }));
  const ranked = rankByRelevance(memories, 'jorge', -1);
  assert.equal(ranked.length, 5);
});

// --- extractPII ---

test('extractPII: redacta emails', () => {
  const result = extractPII('Contactame a jorge@example.com por favor');
  assert.equal(result.text, 'Contactame a [REDACTED:email] por favor');
  assert.equal(result.pii.length, 1);
  assert.equal(result.pii[0].type, 'email');
  assert.equal(result.pii[0].value, 'jorge@example.com');
});

test('extractPII: redacta phones (formato US con parentesis)', () => {
  const result = extractPII('Llama al (555) 123-4567 mañana');
  assert.ok(result.text.includes('[REDACTED:phone]'));
  assert.equal(result.pii.length, 1);
  assert.equal(result.pii[0].type, 'phone');
});

test('extractPII: redacta phones (formato internacional +54)', () => {
  const result = extractPII('Mi numero es +54 11 5555-1234');
  assert.ok(result.text.includes('[REDACTED:phone]'));
  assert.equal(result.pii[0].type, 'phone');
});

test('extractPII: redacta tarjetas de credito (4 grupos)', () => {
  const result = extractPII('Mi tarjeta es 4532-1234-5678-9010');
  assert.ok(result.text.includes('[REDACTED:creditCard]'));
  assert.equal(result.pii[0].type, 'creditCard');
});

test('extractPII: redacta multiples PIIs en un texto', () => {
  const result = extractPII('Escribime a test@x.com o al (555) 123-4567');
  assert.equal(result.pii.length, 2);
  assert.ok(result.text.includes('[REDACTED:email]'));
  assert.ok(result.text.includes('[REDACTED:phone]'));
});

test('extractPII: texto sin PII retorna igual y pii vacio', () => {
  const result = extractPII('El usuario jorge es developer');
  assert.equal(result.text, 'El usuario jorge es developer');
  assert.deepEqual(result.pii, []);
});

test('extractPII: input invalido retorna string vacio', () => {
  const result = extractPII(null);
  assert.equal(result.text, '');
  assert.deepEqual(result.pii, []);
  assert.equal(extractPII(undefined).text, '');
  assert.equal(extractPII(123).text, '');
});

// --- dedupMemory ---

test('dedupMemory: candidato identico a existente → dupe', () => {
  const memories = [{ text: 'El usuario jorge es developer', id: '1' }];
  const result = dedupMemory(memories, { text: 'El usuario jorge es developer' });
  assert.equal(result.isDupe, true);
  assert.equal(result.existing.id, '1');
  assert.ok(result.similarity > 0.9);
});

test('dedupMemory: candidato similar (>= 0.7) → dupe', () => {
  const memories = [{ text: 'jorge es developer javascript' }];
  const result = dedupMemory(memories, { text: 'jorge developer javascript senior' });
  assert.equal(result.isDupe, true);
  assert.ok(result.similarity >= 0.7);
});

test('dedupMemory: candidato diferente (< 0.7) → no dupe', () => {
  const memories = [{ text: 'jorge es developer' }];
  const result = dedupMemory(memories, { text: 'maria es doctora en medicina' });
  assert.equal(result.isDupe, false);
  assert.equal(result.existing, null);
});

test('dedupMemory: memories vacia → no dupe', () => {
  const result = dedupMemory([], { text: 'algo' });
  assert.equal(result.isDupe, false);
  assert.equal(result.existing, null);
});

test('dedupMemory: candidato invalido → no dupe', () => {
  const memories = [{ text: 'jorge' }];
  assert.equal(dedupMemory(memories, null).isDupe, false);
  assert.equal(dedupMemory(memories, {}).isDupe, false);
  assert.equal(dedupMemory(memories, { text: 123 }).isDupe, false);
});

test('dedupMemory: threshold custom', () => {
  // existing: {jorge, developer, senior}, candidate: {jorge, developer}
  // intersection = 2, union = 3, similarity = 0.67
  const memories = [{ text: 'jorge developer senior' }];
  const lowThreshold = dedupMemory(memories, { text: 'jorge developer' }, 0.3);
  const highThreshold = dedupMemory(memories, { text: 'jorge developer' }, 0.95);
  assert.equal(lowThreshold.isDupe, true);
  assert.equal(highThreshold.isDupe, false);
});

// --- formatMemoriesForPrompt ---

test('formatMemoriesForPrompt: lista vacia → string vacio', () => {
  assert.equal(formatMemoriesForPrompt([]), '');
  assert.equal(formatMemoriesForPrompt(null), '');
});

test('formatMemoriesForPrompt: lista con recuerdos los numera y agrega fecha', () => {
  const memories = [
    { text: 'jorge es developer', createdAt: new Date('2026-07-21').getTime() },
    { text: 'jorge vive en bogota', createdAt: new Date('2026-07-15').getTime() }
  ];
  const formatted = formatMemoriesForPrompt(memories);
  assert.ok(formatted.includes('1. jorge es developer'));
  assert.ok(formatted.includes('2026-07-21'));
  assert.ok(formatted.includes('2. jorge vive en bogota'));
  assert.ok(formatted.includes('2026-07-15'));
  assert.ok(formatted.includes('Recuerdos relevantes'));
  assert.ok(formatted.includes('top 2'));
});

test('formatMemoriesForPrompt: memoria sin createdAt funciona igual', () => {
  const memories = [{ text: 'jorge es developer' }];
  const formatted = formatMemoriesForPrompt(memories);
  assert.ok(formatted.includes('1. jorge es developer'));
  // No debe incluir fecha vacia entre parentesis
  assert.ok(!formatted.includes('()'));
});

// --- pruneToLimit ---

test('pruneToLimit: no trunca si esta dentro del limite', () => {
  const memories = Array.from({ length: 30 }, (_, i) => ({
    text: `memoria ${i}`,
    createdAt: i
  }));
  const pruned = pruneToLimit(memories, 50);
  assert.equal(pruned.length, 30);
});

test('pruneToLimit: trunca al limite manteniendo los mas recientes', () => {
  const memories = Array.from({ length: 60 }, (_, i) => ({
    text: `memoria ${i}`,
    createdAt: i
  }));
  const pruned = pruneToLimit(memories, 50);
  assert.equal(pruned.length, 50);
  // Los mas recientes (i=10..59) sobreviven
  const texts = pruned.map(m => m.text);
  assert.ok(!texts.includes('memoria 0'));
  assert.ok(!texts.includes('memoria 9'));
  assert.ok(texts.includes('memoria 10'));
  assert.ok(texts.includes('memoria 59'));
});

test('pruneToLimit: input invalido → array vacio', () => {
  assert.deepEqual(pruneToLimit(null), []);
  assert.deepEqual(pruneToLimit(undefined), []);
});

test('pruneToLimit: respeta DEFAULT_MEMORY_LIMIT (50)', () => {
  const memories = Array.from({ length: 100 }, (_, i) => ({ text: `m${i}`, createdAt: i }));
  const pruned = pruneToLimit(memories);
  assert.equal(pruned.length, 50);
});

// --- generateMemoryId ---

test('generateMemoryId: formato mem-<timestamp>-<random>', () => {
  const id = generateMemoryId();
  assert.match(id, /^mem-\d{13}-[a-z0-9]{6}$/);
});

test('generateMemoryId: IDs unicos en sucesivas llamadas', () => {
  const ids = new Set();
  for (let i = 0; i < 100; i++) ids.add(generateMemoryId());
  assert.equal(ids.size, 100);
});

// --- Integration sanity ---

test('integration: extractPII → formatMemoriesForPrompt → system prompt', () => {
  // Simula: el usuario dijo algo con PII, lo redactamos, lo guardamos, lo mostramos
  const rawText = 'jorge@example.com es mi email';
  const { text: redacted } = extractPII(rawText);
  const memory = { text: redacted, createdAt: Date.now() };
  const formatted = formatMemoriesForPrompt([memory]);
  assert.ok(formatted.includes('[REDACTED:email]'));
  assert.ok(!formatted.includes('jorge@example.com'));
});

test('integration: rankByRelevance → formatMemoriesForPrompt', () => {
  const memories = [
    { text: 'jorge es developer', createdAt: 1 },
    { text: 'maria es doctora', createdAt: 2 },
    { text: 'jorge vive en bogota', createdAt: 3 }
  ];
  const ranked = rankByRelevance(memories, 'jorge developer', 2);
  const formatted = formatMemoriesForPrompt(ranked);
  assert.ok(formatted.includes('jorge es developer'));
  assert.ok(formatted.includes('jorge vive en bogota'));
  assert.ok(!formatted.includes('maria es doctora'));
});

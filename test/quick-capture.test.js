'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MAX_CAPTURE_LENGTH,
  PREVIEW_DEFAULT_MAX,
  ELLIPSIS,
  validateCaptureText,
  truncateForPreview,
  formatTimestamp,
  applyPIIRedaction,
  generateCaptureId
} = require('../src/core/quick-capture');

// --- Constantes ---

test('constantes exportadas son los defaults esperados', () => {
  assert.equal(MAX_CAPTURE_LENGTH, 200);
  assert.equal(PREVIEW_DEFAULT_MAX, 60);
  assert.equal(ELLIPSIS, '…');
});

// --- validateCaptureText ---

test('validateCaptureText: string no vacio → ok', () => {
  const r = validateCaptureText('revisar PR de Jorge');
  assert.equal(r.ok, true);
  assert.equal(r.value, 'revisar PR de Jorge');
  assert.equal(r.error, null);
});

test('validateCaptureText: string con espacios al rededor → ok y trimea', () => {
  const r = validateCaptureText('   hola mundo   ');
  assert.equal(r.ok, true);
  assert.equal(r.value, 'hola mundo');
});

test('validateCaptureText: string vacio → error', () => {
  const r = validateCaptureText('');
  assert.equal(r.ok, false);
  assert.equal(r.error, 'La captura no puede estar vacia.');
  assert.equal(r.value, '');
});

test('validateCaptureText: solo espacios → error', () => {
  const r = validateCaptureText('     ');
  assert.equal(r.ok, false);
  assert.equal(r.error, 'La captura no puede estar vacia.');
});

test('validateCaptureText: mas de 200 chars → error', () => {
  const text = 'x'.repeat(201);
  const r = validateCaptureText(text);
  assert.equal(r.ok, false);
  assert.equal(r.error.includes('200'), true);
});

test('validateCaptureText: exactamente 200 chars → ok', () => {
  const text = 'x'.repeat(200);
  const r = validateCaptureText(text);
  assert.equal(r.ok, true);
  assert.equal(r.value.length, 200);
});

test('validateCaptureText: input no-string → error', () => {
  assert.equal(validateCaptureText(null).ok, false);
  assert.equal(validateCaptureText(undefined).ok, false);
  assert.equal(validateCaptureText(123).ok, false);
  assert.equal(validateCaptureText({}).ok, false);
  assert.equal(validateCaptureText([]).ok, false);
});

// --- truncateForPreview ---

test('truncateForPreview: texto mas corto que limite → retorna igual', () => {
  assert.equal(truncateForPreview('hola', 60), 'hola');
  assert.equal(truncateForPreview('', 60), '');
});

test('truncateForPreview: texto mas largo que limite → trunca y agrega …', () => {
  const text = 'a'.repeat(80);
  const out = truncateForPreview(text, 60);
  assert.equal(out.length, 60);
  assert.ok(out.endsWith(ELLIPSIS));
  assert.equal(out, 'a'.repeat(59) + ELLIPSIS);
});

test('truncateForPreview: limite custom 10', () => {
  const out = truncateForPreview('abcdefghijklmno', 10);
  assert.equal(out, 'abcdefghi' + ELLIPSIS);
  assert.equal(out.length, 10);
});

test('truncateForPreview: limite invalido cae a default 60', () => {
  const out = truncateForPreview('a'.repeat(80), 0);
  assert.equal(out.length, 60);
  const out2 = truncateForPreview('a'.repeat(80), -1);
  assert.equal(out2.length, 60);
});

test('truncateForPreview: input no-string → ""', () => {
  assert.equal(truncateForPreview(null, 60), '');
  assert.equal(truncateForPreview(undefined, 60), '');
  assert.equal(truncateForPreview(123, 60), '');
});

// --- formatTimestamp ---

test('formatTimestamp: < 60s → "ahora"', () => {
  const now = 1_700_000_000_000;
  assert.equal(formatTimestamp(now - 5_000, now), 'ahora');
  assert.equal(formatTimestamp(now - 30_000, now), 'ahora');
  assert.equal(formatTimestamp(now - 59_000, now), 'ahora');
});

test('formatTimestamp: 60s..60min → "hace Xm"', () => {
  const now = 1_700_000_000_000;
  assert.equal(formatTimestamp(now - 60_000, now), 'hace 1m');
  assert.equal(formatTimestamp(now - 5 * 60_000, now), 'hace 5m');
  assert.equal(formatTimestamp(now - 59 * 60_000, now), 'hace 59m');
});

test('formatTimestamp: 1h..24h → "hace Xh"', () => {
  const now = 1_700_000_000_000;
  assert.equal(formatTimestamp(now - 60 * 60_000, now), 'hace 1h');
  assert.equal(formatTimestamp(now - 5 * 60 * 60_000, now), 'hace 5h');
  assert.equal(formatTimestamp(now - 23 * 60 * 60_000, now), 'hace 23h');
});

test('formatTimestamp: 1d..6d → "hace Xd"', () => {
  const now = 1_700_000_000_000;
  const oneDay = 24 * 60 * 60_000;
  assert.equal(formatTimestamp(now - oneDay, now), 'hace 1d');
  assert.equal(formatTimestamp(now - 3 * oneDay, now), 'hace 3d');
  assert.equal(formatTimestamp(now - 6 * oneDay, now), 'hace 6d');
});

test('formatTimestamp: >= 7d → "DD/MM"', () => {
  const now = new Date('2026-07-22T12:00:00Z').getTime();
  // 7 dias antes = 2026-07-15
  const sevenDaysAgo = new Date('2026-07-15T12:00:00Z').getTime();
  const d = new Date(sevenDaysAgo);
  const expected = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  assert.equal(formatTimestamp(sevenDaysAgo, now), expected);
});

test('formatTimestamp: input invalido → ""', () => {
  assert.equal(formatTimestamp(null), '');
  assert.equal(formatTimestamp(undefined), '');
  assert.equal(formatTimestamp('no-es-fecha'), '');
  assert.equal(formatTimestamp(NaN), '');
});

test('formatTimestamp: acepta Date como now', () => {
  const now = new Date('2026-07-22T12:00:00Z');
  const fiveMinAgo = now.getTime() - 5 * 60_000;
  assert.equal(formatTimestamp(fiveMinAgo, now), 'hace 5m');
});

// --- applyPIIRedaction ---

test('applyPIIRedaction: usa extractPII provisto', () => {
  const mockExtractPII = (t) => ({ text: t + '-redacted', pii: [{ type: 'x', value: t }] });
  const result = applyPIIRedaction('foo', mockExtractPII);
  assert.equal(result.text, 'foo-redacted');
  assert.equal(result.pii.length, 1);
});

test('applyPIIRedaction: extractPII no es funcion → retorna texto sin tocar', () => {
  const result = applyPIIRedaction('foo', null);
  assert.equal(result.text, 'foo');
  assert.deepEqual(result.pii, []);
});

test('applyPIIRedaction: input invalido con extractPII valido', () => {
  const mockExtractPII = (t) => ({ text: typeof t === 'string' ? t : '', pii: [] });
  assert.equal(applyPIIRedaction(null, mockExtractPII).text, '');
  assert.equal(applyPIIRedaction(123, mockExtractPII).text, '');
});

// --- generateCaptureId ---

test('generateCaptureId: formato cap-<id>', () => {
  const id = generateCaptureId();
  assert.match(id, /^cap-.+/);
});

test('generateCaptureId: IDs son unicos en sucesivas llamadas', () => {
  const ids = new Set();
  for (let i = 0; i < 100; i++) ids.add(generateCaptureId());
  assert.equal(ids.size, 100);
});

// --- Integration: el ciclo validate → truncate → format ---

test('integration: validar + truncar + formatear como haria el renderer', () => {
  const raw = '   revisar PR de Jorge antes del viernes (no olvidar)   ';
  const v = validateCaptureText(raw);
  assert.equal(v.ok, true);
  // El preview es el value trimado, ya esta dentro del limite
  const preview = truncateForPreview(v.value, 30);
  assert.ok(preview.length <= 30);
  assert.ok(preview.length > 0);
  // formatTimestamp con now=Date.now() retorna "ahora" para un ts reciente
  const now = Date.now();
  assert.equal(formatTimestamp(now - 10_000, now), 'ahora');
});

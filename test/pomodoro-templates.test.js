'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  TEMPLATES,
  FOCUS_MIN_LIMIT,
  BREAK_MIN_LIMIT,
  LONG_BREAK_MIN_LIMIT,
  LONG_BREAK_EVERY_LIMIT,
  getTemplate,
  validateTemplate,
  formatTemplateForDisplay
} = require('../src/core/pomodoro-templates');

// --- Constantes ---

test('constantes exportadas son los rangos esperados', () => {
  assert.deepEqual(FOCUS_MIN_LIMIT, { min: 5, max: 120 });
  assert.deepEqual(BREAK_MIN_LIMIT, { min: 1, max: 30 });
  assert.deepEqual(LONG_BREAK_MIN_LIMIT, { min: 5, max: 60 });
  assert.deepEqual(LONG_BREAK_EVERY_LIMIT, { min: 2, max: 10 });
});

// --- TEMPLATES ---

test('TEMPLATES: catalogo tiene los 4 esperados', () => {
  assert.equal(TEMPLATES.length, 4);
  const ids = TEMPLATES.map(t => t.id);
  assert.ok(ids.includes('classic'));
  assert.ok(ids.includes('long-focus'));
  assert.ok(ids.includes('deep-work'));
  assert.ok(ids.includes('custom'));
});

test('TEMPLATES: classic tiene 25/5 + long 15 cada 4', () => {
  const c = TEMPLATES.find(t => t.id === 'classic');
  assert.equal(c.focusMin, 25);
  assert.equal(c.breakMin, 5);
  assert.equal(c.longBreakMin, 15);
  assert.equal(c.longBreakEvery, 4);
  assert.ok(typeof c.label === 'string' && c.label.length > 0);
});

test('TEMPLATES: long-focus tiene 50/10 + long 20 cada 4', () => {
  const c = TEMPLATES.find(t => t.id === 'long-focus');
  assert.equal(c.focusMin, 50);
  assert.equal(c.breakMin, 10);
  assert.equal(c.longBreakMin, 20);
  assert.equal(c.longBreakEvery, 4);
});

test('TEMPLATES: deep-work tiene 90/20 + long 30 cada 3', () => {
  const c = TEMPLATES.find(t => t.id === 'deep-work');
  assert.equal(c.focusMin, 90);
  assert.equal(c.breakMin, 20);
  assert.equal(c.longBreakMin, 30);
  assert.equal(c.longBreakEvery, 3);
});

test('TEMPLATES: custom tiene defaults 25/5 (los custom values los pone el usuario)', () => {
  const c = TEMPLATES.find(t => t.id === 'custom');
  assert.equal(c.focusMin, 25);
  assert.equal(c.breakMin, 5);
});

test('TEMPLATES: son inmutables (no se pueden mutar desde afuera)', () => {
  // Object.freeze a nivel catalogo y por entry
  assert.throws(() => { TEMPLATES.push({ id: 'x' }); });
  assert.throws(() => { TEMPLATES[0].focusMin = 999; });
});

// --- getTemplate ---

test('getTemplate: retorna copia por id valido', () => {
  const t = getTemplate('classic');
  assert.ok(t);
  assert.equal(t.focusMin, 25);
  assert.equal(t.breakMin, 5);
});

test('getTemplate: retorna null para id invalido', () => {
  assert.equal(getTemplate('no-existe'), null);
  assert.equal(getTemplate(''), null);
  assert.equal(getTemplate(null), null);
  assert.equal(getTemplate(undefined), null);
  assert.equal(getTemplate(123), null);
});

test('getTemplate: la copia retornada es mutable, no afecta el catalogo', () => {
  const t1 = getTemplate('classic');
  t1.focusMin = 999;
  const t2 = getTemplate('classic');
  assert.equal(t2.focusMin, 25); // no se modifico el original
});

// --- validateTemplate ---

test('validateTemplate: acepta todos los campos en rango', () => {
  const result = validateTemplate({ focusMin: 30, breakMin: 10, longBreakMin: 20, longBreakEvery: 4 });
  assert.equal(result.ok, true);
  assert.equal(result.value.focusMin, 30);
  assert.equal(result.value.breakMin, 10);
  assert.equal(result.value.longBreakMin, 20);
  assert.equal(result.value.longBreakEvery, 4);
});

test('validateTemplate: acepta validacion parcial (solo focus)', () => {
  const result = validateTemplate({ focusMin: 45 });
  assert.equal(result.ok, true);
  assert.equal(result.value.focusMin, 45);
  assert.equal(result.value.breakMin, undefined);
});

test('validateTemplate: rechaza focus fuera de rango (muy bajo)', () => {
  const result = validateTemplate({ focusMin: 3 });
  assert.equal(result.ok, false);
  assert.match(result.error, /focus.*entre 5 y 120/);
});

test('validateTemplate: rechaza focus fuera de rango (muy alto)', () => {
  const result = validateTemplate({ focusMin: 150 });
  assert.equal(result.ok, false);
  assert.match(result.error, /focus/);
});

test('validateTemplate: rechaza break fuera de rango', () => {
  assert.equal(validateTemplate({ breakMin: 0 }).ok, false);
  assert.equal(validateTemplate({ breakMin: 45 }).ok, false);
});

test('validateTemplate: rechaza longBreak fuera de rango', () => {
  assert.equal(validateTemplate({ longBreakMin: 3 }).ok, false);
  assert.equal(validateTemplate({ longBreakMin: 90 }).ok, false);
});

test('validateTemplate: rechaza longBreakEvery fuera de rango', () => {
  assert.equal(validateTemplate({ longBreakEvery: 1 }).ok, false);
  assert.equal(validateTemplate({ longBreakEvery: 15 }).ok, false);
});

test('validateTemplate: rechaza tipos no-numericos', () => {
  assert.equal(validateTemplate({ focusMin: '30' }).ok, false);
  assert.equal(validateTemplate({ focusMin: NaN }).ok, false);
  assert.equal(validateTemplate({ focusMin: {} }).ok, false);
  // null se trata como "no provisto" (validacion parcial lo permite)
  assert.equal(validateTemplate({ focusMin: null }).ok, true);
});

test('validateTemplate: rechaza candidate invalido', () => {
  assert.equal(validateTemplate(null).ok, false);
  assert.equal(validateTemplate(undefined).ok, false);
  assert.equal(validateTemplate('string').ok, false);
  assert.equal(validateTemplate(123).ok, false);
});

test('validateTemplate: bordes inclusivos (min y max aceptados)', () => {
  assert.equal(validateTemplate({ focusMin: 5 }).ok, true);
  assert.equal(validateTemplate({ focusMin: 120 }).ok, true);
  assert.equal(validateTemplate({ breakMin: 1 }).ok, true);
  assert.equal(validateTemplate({ breakMin: 30 }).ok, true);
  assert.equal(validateTemplate({ longBreakMin: 5 }).ok, true);
  assert.equal(validateTemplate({ longBreakMin: 60 }).ok, true);
  assert.equal(validateTemplate({ longBreakEvery: 2 }).ok, true);
  assert.equal(validateTemplate({ longBreakEvery: 10 }).ok, true);
});

test('validateTemplate: bordes exclusivos (1 menos o 1 mas rechazado)', () => {
  assert.equal(validateTemplate({ focusMin: 4 }).ok, false);
  assert.equal(validateTemplate({ focusMin: 121 }).ok, false);
  assert.equal(validateTemplate({ longBreakEvery: 1 }).ok, false);
  assert.equal(validateTemplate({ longBreakEvery: 11 }).ok, false);
});

test('validateTemplate: trunca a entero (Math.floor)', () => {
  const result = validateTemplate({ focusMin: 25.7 });
  assert.equal(result.ok, true);
  assert.equal(result.value.focusMin, 25);
});

// --- formatTemplateForDisplay ---

test('formatTemplateForDisplay: formato completo', () => {
  const display = formatTemplateForDisplay({ focusMin: 25, breakMin: 5, longBreakMin: 15, longBreakEvery: 4 });
  assert.equal(display, '25 / 5 (long 15 cada 4)');
});

test('formatTemplateForDisplay: solo focus y break', () => {
  const display = formatTemplateForDisplay({ focusMin: 50, breakMin: 10 });
  assert.equal(display, '50 / 10');
});

test('formatTemplateForDisplay: solo long break', () => {
  const display = formatTemplateForDisplay({ longBreakMin: 20, longBreakEvery: 3 });
  assert.equal(display, '(long 20 cada 3)');
});

test('formatTemplateForDisplay: input invalido → string vacio', () => {
  assert.equal(formatTemplateForDisplay(null), '');
  assert.equal(formatTemplateForDisplay(undefined), '');
  assert.equal(formatTemplateForDisplay('x'), '');
});

test('formatTemplateForDisplay: todos los 4 templates del catalogo formatean sin error', () => {
  for (const t of TEMPLATES) {
    const display = formatTemplateForDisplay(t);
    assert.ok(typeof display === 'string' && display.length > 0, `template ${t.id} no formatea`);
  }
});

// --- Integration ---

test('integration: getTemplate + validateTemplate + formatTemplateForDisplay', () => {
  // 1. el renderer pide una plantilla
  const t = getTemplate('long-focus');
  assert.ok(t);

  // 2. la valida (deberia pasar porque es del catalogo)
  const v = validateTemplate(t);
  assert.equal(v.ok, true);

  // 3. la formatea para mostrar
  const display = formatTemplateForDisplay(t);
  assert.ok(display.includes('50 / 10'));
  assert.ok(display.includes('long 20 cada 4'));
});

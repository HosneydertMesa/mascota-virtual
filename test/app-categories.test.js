'use strict';

// Tests para app-categories (v2.2.0).
// Cubre: categorización, lookup de mood, lookup de wag targets, casos edge.

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  categorize,
  getMoodForCategory,
  getWagTargetsForCategory,
  CATEGORY_RULES
} = require('../src/core/app-categories');

// ============================================================
// categorize
// ============================================================

test('categorize: null/undefined/empty → "unknown"', () => {
  assert.equal(categorize(null), 'unknown');
  assert.equal(categorize(undefined), 'unknown');
  assert.equal(categorize(''), 'unknown');
  assert.equal(categorize(0), 'unknown');
});

test('categorize: app no listada → "unknown"', () => {
  assert.equal(categorize('SomeRandomApp'), 'unknown');
  assert.equal(categorize('MyCustomThing'), 'unknown');
});

test('categorize: code (devuelve category code)', () => {
  assert.equal(categorize('Code'), 'code');              // VSCode
  assert.equal(categorize('code'), 'code');
  assert.equal(categorize('webstorm64'), 'code');
  assert.equal(categorize('sublime_text'), 'code');
  assert.equal(categorize('notepad++'), 'code');
  assert.equal(categorize('cursor'), 'code');
  assert.equal(categorize('pycharm64'), 'code');
});

test('categorize: creative (devuelve category creative)', () => {
  assert.equal(categorize('Photoshop'), 'creative');
  assert.equal(categorize('figma'), 'creative');
  assert.equal(categorize('sketch'), 'creative');
  assert.equal(categorize('Figma Desktop'), 'creative');
  assert.equal(categorize('blender'), 'creative');
  assert.equal(categorize('Affinity Designer 2'), 'creative');
});

test('categorize: office (devuelve category office)', () => {
  assert.equal(categorize('EXCEL'), 'office');
  assert.equal(categorize('soffice'), 'office');
  assert.equal(categorize('Pages'), 'office');
  assert.equal(categorize('keynote'), 'office');
  assert.equal(categorize('Notion'), 'office');
});

test('categorize: browser (devuelve category browser)', () => {
  assert.equal(categorize('chrome'), 'browser');
  assert.equal(categorize('Google Chrome'), 'browser');
  assert.equal(categorize('msedge'), 'browser');
  assert.equal(categorize('firefox'), 'browser');
  assert.equal(categorize('Brave-Browser'), 'browser');
  assert.equal(categorize('vivaldi'), 'browser');
});

test('categorize: social (devuelve category social)', () => {
  assert.equal(categorize('Slack'), 'social');
  assert.equal(categorize('discord'), 'social');
  assert.equal(categorize('Telegram'), 'social');
  assert.equal(categorize('WhatsApp'), 'social');
  assert.equal(categorize('Teams'), 'social');
  assert.equal(categorize('zoomit'), 'social');           // zoom meeting
});

test('categorize: game (devuelve category game)', () => {
  assert.equal(categorize('steam'), 'game');
  assert.equal(categorize('EpicGamesLauncher'), 'game');
  assert.equal(categorize('League of Legends'), 'game');
  assert.equal(categorize('VALORANT-Win64-Shipping'), 'game');
  assert.equal(categorize('Minecraft'), 'game');
  assert.equal(categorize('cs2'), 'game');
  assert.equal(categorize('RobloxPlayerBeta'), 'game');
});

test('categorize: system (devuelve category system)', () => {
  assert.equal(categorize('explorer'), 'system');
  assert.equal(categorize('Taskmgr'), 'system');
  assert.equal(categorize('dwm'), 'system');
  assert.equal(categorize('SystemSettings'), 'system');
});

test('categorize: case-insensitive', () => {
  assert.equal(categorize('CHROME'), 'browser');
  assert.equal(categorize('Chrome'), 'browser');
  assert.equal(categorize('ChRoMe'), 'browser');
});

test('categorize: substring match (no solo exact match)', () => {
  // "Code" en "Code Helper" debería matchear
  assert.equal(categorize('Code Helper'), 'code');
  assert.equal(categorize('Microsoft Edge WebView2'), 'browser'); // contiene "edge"
  assert.equal(categorize('msedgewebview2'), 'browser');
});

test('categorize: orden de las reglas — code gana antes que creative en conflicto', () => {
  // Si una app tiene "code" en su nombre, va a code aunque tenga
  // otra palabra. La primera regla que matchea gana.
  // (No tenemos un caso real de conflicto, pero validamos que el
  // orden es estable.)
  const categories = CATEGORY_RULES.map(r => r.category);
  assert.deepEqual(categories, [
    'code', 'creative', 'office', 'browser', 'social', 'game', 'system'
  ]);
});

// ============================================================
// getMoodForCategory
// ============================================================

test('getMoodForCategory: cada category mapea a un mood del allow-list', () => {
  const { ALLOWED_EMOTIONS } = require('../src/core/pet-protocol');
  for (const cat of ['code', 'creative', 'office', 'browser', 'social', 'game', 'system']) {
    const mood = getMoodForCategory(cat);
    assert.ok(mood, `category "${cat}" debe tener un mood`);
    assert.ok(ALLOWED_EMOTIONS.has(mood), `mood "${mood}" debe estar en ALLOWED_EMOTIONS`);
  }
});

test('getMoodForCategory: unknown → null (no cambiar)', () => {
  assert.equal(getMoodForCategory('unknown'), null);
});

test('getMoodForCategory: category invalida → null', () => {
  assert.equal(getMoodForCategory('nonexistent'), null);
  assert.equal(getMoodForCategory(''), null);
  assert.equal(getMoodForCategory(null), null);
});

// ============================================================
// getWagTargetsForCategory
// ============================================================

test('getWagTargetsForCategory: cada category mapea a un target válido', () => {
  for (const cat of ['code', 'creative', 'office', 'browser', 'social', 'game', 'system']) {
    const target = getWagTargetsForCategory(cat);
    assert.ok(target, `category "${cat}" debe tener targets`);
    assert.ok(typeof target.speed === 'number' && target.speed > 0, 'speed > 0');
    assert.ok(typeof target.amplitude === 'number' && target.amplitude > 0, 'amplitude > 0');
    assert.ok(target.speed < 1, 'speed < 1 (es un factor, no absoluto)');
    assert.ok(target.amplitude <= 2, 'amplitude <= 2 (rango razonable)');
  }
});

test('getWagTargetsForCategory: office (sleepy) tiene los targets MÁS bajos', () => {
  const office = getWagTargetsForCategory('office');
  const social = getWagTargetsForCategory('social');
  const game = getWagTargetsForCategory('game');
  assert.ok(office.speed < social.speed, 'office (sleepy) < social (happy)');
  assert.ok(office.amplitude < social.amplitude, 'office amplitude < social amplitude');
  assert.ok(game.speed > social.speed, 'game (excited) > social (happy)');
  assert.ok(game.amplitude > social.amplitude, 'game amplitude > social amplitude');
});

test('getWagTargetsForCategory: unknown → null (no cambiar)', () => {
  assert.equal(getWagTargetsForCategory('unknown'), null);
});

test('getWagTargetsForCategory: category invalida → null', () => {
  assert.equal(getWagTargetsForCategory('made-up'), null);
  assert.equal(getWagTargetsForCategory(undefined), null);
});

// ============================================================
// Estabilidad
// ============================================================

test('CATEGORY_RULES: shape consistente (cada rule tiene category + patterns array)', () => {
  for (const rule of CATEGORY_RULES) {
    assert.ok(typeof rule.category === 'string' && rule.category.length > 0);
    assert.ok(Array.isArray(rule.patterns) && rule.patterns.length > 0);
    for (const p of rule.patterns) {
      assert.ok(typeof p === 'string' && p.length > 0, `pattern "${p}" no es string no-vacio`);
    }
  }
});

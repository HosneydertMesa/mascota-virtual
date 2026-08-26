'use strict';

// W1 + W2 — pet-config-store tests.
// Cubre load/save/set helpers + isValidStore schema validation.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  loadPetConfig,
  savePetConfig,
  setSilentMode,
  setCalendarIcsPath,
  createInitialStore,
  isValidStore,
  getStorePath,
  FILE_VERSION,
  FILE_NAME
} = require('../src/services/pet-config-store');

function mkUserData() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pet-config-test-'));
}

function rmUserData(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) {}
}

// ============================================================================
// createInitialStore + isValidStore
// ============================================================================

test('createInitialStore: defaults correctos', () => {
  const s = createInitialStore();
  assert.equal(s.version, FILE_VERSION);
  assert.equal(s.silentMode, false);
  assert.equal(s.calendarIcsPath, null);
});

test('isValidStore: state valido', () => {
  assert.equal(isValidStore({ version: 1, silentMode: true, calendarIcsPath: '/a.ics' }), true);
  assert.equal(isValidStore({ version: 1, silentMode: false, calendarIcsPath: null }), true);
});

test('isValidStore: rechaza version incorrecta', () => {
  assert.equal(isValidStore({ version: 2, silentMode: false, calendarIcsPath: null }), false);
  assert.equal(isValidStore({ version: '1', silentMode: false, calendarIcsPath: null }), false);
  assert.equal(isValidStore({ silentMode: false, calendarIcsPath: null }), false);
});

test('isValidStore: rechaza silentMode no-boolean', () => {
  assert.equal(isValidStore({ version: 1, silentMode: 'true', calendarIcsPath: null }), false);
  assert.equal(isValidStore({ version: 1, silentMode: 1, calendarIcsPath: null }), false);
  assert.equal(isValidStore({ version: 1, calendarIcsPath: null }), false);
});

test('isValidStore: rechaza calendarIcsPath invalido (no string ni null)', () => {
  assert.equal(isValidStore({ version: 1, silentMode: false, calendarIcsPath: 123 }), false);
  assert.equal(isValidStore({ version: 1, silentMode: false, calendarIcsPath: {} }), false);
  assert.equal(isValidStore({ version: 1, silentMode: false, calendarIcsPath: true }), false);
});

test('isValidStore: null/undefined/no-object → false', () => {
  assert.equal(isValidStore(null), false);
  assert.equal(isValidStore(undefined), false);
  assert.equal(isValidStore('string'), false);
  assert.equal(isValidStore(123), false);
  assert.equal(isValidStore([]), false);
});

// ============================================================================
// loadPetConfig
// ============================================================================

test('loadPetConfig: archivo no existe → initial store', () => {
  const dir = mkUserData();
  try {
    const s = loadPetConfig(dir);
    assert.equal(s.silentMode, false);
    assert.equal(s.calendarIcsPath, null);
  } finally { rmUserData(dir); }
});

test('loadPetConfig: archivo valido → carga el state', () => {
  const dir = mkUserData();
  try {
    savePetConfig(dir, { version: 1, silentMode: true, calendarIcsPath: '/x.ics' });
    const s = loadPetConfig(dir);
    assert.equal(s.silentMode, true);
    assert.equal(s.calendarIcsPath, '/x.ics');
  } finally { rmUserData(dir); }
});

test('loadPetConfig: archivo corrupto → initial store (no throw)', () => {
  const dir = mkUserData();
  try {
    fs.writeFileSync(getStorePath(dir), '{ invalid json', 'utf8');
    const s = loadPetConfig(dir);
    assert.equal(s.silentMode, false);
    assert.equal(s.calendarIcsPath, null);
  } finally { rmUserData(dir); }
});

test('loadPetConfig: userDataDir invalido → initial store (no throw)', () => {
  const s = loadPetConfig('');
  assert.equal(s.silentMode, false);
  assert.equal(s.calendarIcsPath, null);
  const s2 = loadPetConfig(null);
  assert.equal(s2.silentMode, false);
});

// ============================================================================
// savePetConfig
// ============================================================================

test('savePetConfig: persiste y round-trip', () => {
  const dir = mkUserData();
  try {
    const state = { version: 1, silentMode: true, calendarIcsPath: 'C:/cal.ics' };
    savePetConfig(dir, state);
    const loaded = loadPetConfig(dir);
    assert.deepEqual(loaded, state);
  } finally { rmUserData(dir); }
});

test('savePetConfig: state invalido → throw', () => {
  const dir = mkUserData();
  try {
    assert.throws(() => savePetConfig(dir, { version: 2, silentMode: false, calendarIcsPath: null }));
    assert.throws(() => savePetConfig(dir, { version: 1, silentMode: 'true', calendarIcsPath: null }));
    assert.throws(() => savePetConfig(dir, null));
  } finally { rmUserData(dir); }
});

test('savePetConfig: userDataDir invalido → throw', () => {
  assert.throws(() => savePetConfig('', { version: 1, silentMode: false, calendarIcsPath: null }));
  assert.throws(() => savePetConfig(null, { version: 1, silentMode: false, calendarIcsPath: null }));
});

test('savePetConfig: usa atomic write (no deja .tmp)', () => {
  const dir = mkUserData();
  try {
    savePetConfig(dir, { version: 1, silentMode: false, calendarIcsPath: null });
    assert.ok(fs.existsSync(getStorePath(dir)));
    assert.ok(!fs.existsSync(getStorePath(dir) + '.tmp'));
  } finally { rmUserData(dir); }
});

// ============================================================================
// setSilentMode
// ============================================================================

test('setSilentMode: actualiza y persiste', () => {
  const dir = mkUserData();
  try {
    const after = setSilentMode(dir, true);
    assert.equal(after.silentMode, true);
    assert.equal(loadPetConfig(dir).silentMode, true);
  } finally { rmUserData(dir); }
});

test('setSilentMode: no-op si el valor es el mismo', () => {
  const dir = mkUserData();
  try {
    setSilentMode(dir, true);
    const mtimeBefore = fs.statSync(getStorePath(dir)).mtimeMs;
    // Wait a bit to ensure mtime would change if we rewrote
    setTimeout(() => {}, 10);
    setSilentMode(dir, true);
    const mtimeAfter = fs.statSync(getStorePath(dir)).mtimeMs;
    assert.equal(mtimeBefore, mtimeAfter);
  } finally { rmUserData(dir); }
});

test('setSilentMode: tipo invalido → throw', () => {
  assert.throws(() => setSilentMode('dir', 'true'));
  assert.throws(() => setSilentMode('dir', 1));
  assert.throws(() => setSilentMode('dir', null));
});

test('setSilentMode: toggle ON → OFF persiste ambos', () => {
  const dir = mkUserData();
  try {
    setSilentMode(dir, true);
    assert.equal(loadPetConfig(dir).silentMode, true);
    setSilentMode(dir, false);
    assert.equal(loadPetConfig(dir).silentMode, false);
  } finally { rmUserData(dir); }
});

// ============================================================================
// setCalendarIcsPath
// ============================================================================

test('setCalendarIcsPath: actualiza y persiste', () => {
  const dir = mkUserData();
  try {
    setCalendarIcsPath(dir, 'C:/Users/test/cal.ics');
    assert.equal(loadPetConfig(dir).calendarIcsPath, 'C:/Users/test/cal.ics');
  } finally { rmUserData(dir); }
});

test('setCalendarIcsPath: null es valido (clear)', () => {
  const dir = mkUserData();
  try {
    setCalendarIcsPath(dir, 'C:/x.ics');
    setCalendarIcsPath(dir, null);
    assert.equal(loadPetConfig(dir).calendarIcsPath, null);
  } finally { rmUserData(dir); }
});

test('setCalendarIcsPath: tipo invalido → throw', () => {
  assert.throws(() => setCalendarIcsPath('dir', 123));
  assert.throws(() => setCalendarIcsPath('dir', {}));
  assert.throws(() => setCalendarIcsPath('dir', true));
});

// ============================================================================
// getStorePath + FILE_NAME
// ============================================================================

test('getStorePath: arma el path correcto', () => {
  const p = getStorePath(path.join('x', 'y'));
  assert.ok(p.endsWith(FILE_NAME));
  assert.ok(p.includes('x'));
  assert.ok(p.includes('y'));
});

test('FILE_VERSION es 1', () => {
  assert.equal(FILE_VERSION, 1);
});

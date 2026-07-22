'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createInitialStore,
  isValidStore,
  loadBriefingState,
  saveBriefingState,
  markShown,
  setEnabled,
  clearBriefingState,
  getStorePath,
  FILE_VERSION
} = require('../src/services/daily-briefing-store');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'briefing-test-'));
}

test('FILE_VERSION es 1', () => {
  assert.equal(FILE_VERSION, 1);
});

test('createInitialStore: estructura valida con enabled=true y lastShownDate=null', () => {
  const s = createInitialStore();
  assert.equal(s.version, FILE_VERSION);
  assert.equal(s.enabled, true);
  assert.equal(s.lastShownDate, null);
  assert.ok(isValidStore(s));
});

test('isValidStore: rechaza invalidos', () => {
  assert.equal(isValidStore(null), false);
  assert.equal(isValidStore(undefined), false);
  assert.equal(isValidStore('string'), false);
  assert.equal(isValidStore(123), false);
  assert.equal(isValidStore({}), false);
  assert.equal(isValidStore({ version: 999, enabled: true, lastShownDate: null }), false);
  assert.equal(isValidStore({ version: 1, enabled: 'yes', lastShownDate: null }), false);
  assert.equal(isValidStore({ version: 1, enabled: true, lastShownDate: 123 }), false);
  assert.equal(isValidStore({ version: 1, enabled: true, lastShownDate: 'bad-date' }), false);
});

test('isValidStore: acepta validos', () => {
  assert.ok(isValidStore({ version: 1, enabled: true, lastShownDate: null }));
  assert.ok(isValidStore({ version: 1, enabled: false, lastShownDate: '2026-07-15' }));
});

test('getStorePath: retorna <userData>/daily-briefing.json', () => {
  const p = getStorePath('C:/foo/bar');
  assert.ok(p.endsWith('daily-briefing.json'));
  assert.ok(p.includes('bar'));
});

test('loadBriefingState: directorio invalido → initial (no throw)', () => {
  const state = loadBriefingState('');
  assert.deepEqual(state, createInitialStore());
  const state2 = loadBriefingState(null);
  assert.deepEqual(state2, createInitialStore());
});

test('loadBriefingState: archivo no existe → initial', () => {
  const dir = makeTempDir();
  const state = loadBriefingState(dir);
  assert.deepEqual(state, createInitialStore());
  fs.rmSync(dir, { recursive: true, force: true });
});

test('loadBriefingState: archivo corrupto → initial (no crashea)', () => {
  const dir = makeTempDir();
  const filePath = getStorePath(dir);
  fs.writeFileSync(filePath, 'NOT JSON', 'utf8');
  const state = loadBriefingState(dir);
  assert.deepEqual(state, createInitialStore());
  fs.rmSync(dir, { recursive: true, force: true });
});

test('loadBriefingState: archivo con version incorrecta → initial', () => {
  const dir = makeTempDir();
  const filePath = getStorePath(dir);
  fs.writeFileSync(filePath, JSON.stringify({ version: 999, enabled: true, lastShownDate: null }), 'utf8');
  const state = loadBriefingState(dir);
  assert.deepEqual(state, createInitialStore());
  fs.rmSync(dir, { recursive: true, force: true });
});

test('saveBriefingState + loadBriefingState: round-trip', () => {
  const dir = makeTempDir();
  saveBriefingState(dir, { version: 1, enabled: false, lastShownDate: '2026-07-15' });
  const loaded = loadBriefingState(dir);
  assert.equal(loaded.enabled, false);
  assert.equal(loaded.lastShownDate, '2026-07-15');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('saveBriefingState: directorio se crea si no existe', () => {
  const dir = makeTempDir();
  const nested = path.join(dir, 'sub', 'dir');
  saveBriefingState(nested, createInitialStore());
  assert.ok(fs.existsSync(getStorePath(nested)));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('saveBriefingState: userDataDir invalido → throw', () => {
  assert.throws(() => saveBriefingState('', createInitialStore()), /userDataDir/);
  assert.throws(() => saveBriefingState(null, createInitialStore()), /userDataDir/);
});

test('saveBriefingState: state invalido → throw', () => {
  const dir = makeTempDir();
  assert.throws(() => saveBriefingState(dir, { version: 1, enabled: 'yes', lastShownDate: null }), /state invalido/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('markShown: graba fecha en formato YYYY-MM-DD', () => {
  const dir = makeTempDir();
  const d = new Date(2026, 6, 15, 10, 30, 0);
  const next = markShown(dir, d);
  assert.equal(next.lastShownDate, '2026-07-15');
  const loaded = loadBriefingState(dir);
  assert.equal(loaded.lastShownDate, '2026-07-15');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('markShown: idempotente si ya estaba esa fecha', () => {
  const dir = makeTempDir();
  const d = new Date(2026, 6, 15, 10, 30, 0);
  markShown(dir, d);
  const before = fs.readFileSync(getStorePath(dir), 'utf8');
  markShown(dir, d);
  const after = fs.readFileSync(getStorePath(dir), 'utf8');
  assert.equal(before, after);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('markShown: cambia fecha', () => {
  const dir = makeTempDir();
  const d1 = new Date(2026, 6, 15, 10, 30, 0);
  const d2 = new Date(2026, 6, 16, 10, 30, 0);
  markShown(dir, d1);
  markShown(dir, d2);
  assert.equal(loadBriefingState(dir).lastShownDate, '2026-07-16');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('markShown: date invalido → throw', () => {
  const dir = makeTempDir();
  assert.throws(() => markShown(dir, null), /date invalido/);
  assert.throws(() => markShown(dir, new Date('invalid')), /date invalido/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('setEnabled: cambia flag y persiste', () => {
  const dir = makeTempDir();
  const next = setEnabled(dir, false);
  assert.equal(next.enabled, false);
  assert.equal(loadBriefingState(dir).enabled, false);
  setEnabled(dir, true);
  assert.equal(loadBriefingState(dir).enabled, true);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('setEnabled: idempotente si ya esta en el valor', () => {
  const dir = makeTempDir();
  setEnabled(dir, false);
  const before = fs.readFileSync(getStorePath(dir), 'utf8');
  setEnabled(dir, false);
  const after = fs.readFileSync(getStorePath(dir), 'utf8');
  assert.equal(before, after);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('setEnabled: valor invalido → throw', () => {
  const dir = makeTempDir();
  assert.throws(() => setEnabled(dir, 'yes'), /boolean/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('clearBriefingState: elimina archivo', () => {
  const dir = makeTempDir();
  saveBriefingState(dir, createInitialStore());
  assert.ok(fs.existsSync(getStorePath(dir)));
  clearBriefingState(dir);
  assert.ok(!fs.existsSync(getStorePath(dir)));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('clearBriefingState: no existe → no-op', () => {
  const dir = makeTempDir();
  assert.doesNotThrow(() => clearBriefingState(dir));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('clearBriefingState: userDataDir invalido → throw', () => {
  assert.throws(() => clearBriefingState(''), /userDataDir/);
});

test('integration: flujo completo', () => {
  const dir = makeTempDir();
  let state = loadBriefingState(dir);
  assert.deepEqual(state, createInitialStore());
  state = setEnabled(dir, false);
  assert.equal(state.enabled, false);
  state = setEnabled(dir, true);
  assert.equal(state.enabled, true);
  state = markShown(dir, new Date(2026, 6, 15, 9, 0, 0));
  assert.equal(state.lastShownDate, '2026-07-15');
  const loaded = loadBriefingState(dir);
  assert.equal(loaded.enabled, true);
  assert.equal(loaded.lastShownDate, '2026-07-15');
  clearBriefingState(dir);
  assert.equal(loadBriefingState(dir).lastShownDate, null);
  fs.rmSync(dir, { recursive: true, force: true });
});

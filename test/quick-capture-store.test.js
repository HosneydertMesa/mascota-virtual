'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  FILE_VERSION,
  MAX_CAPTURES,
  DEFAULT_GET_LIMIT,
  MAX_CAPTURE_LENGTH,
  createInitialStore,
  isValidStore,
  loadCaptures,
  saveCaptures,
  pruneCaptures,
  appendCapture,
  getRecentCaptures,
  clearCaptures,
  clearCapturesFile,
  getStorePath
} = require('../src/services/quick-capture-store');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pet-captures-test-'));
}

function cleanupTmpDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ok */ }
}

// --- Constantes y paths ---

test('FILE_VERSION es 1', () => {
  assert.equal(FILE_VERSION, 1);
});

test('MAX_CAPTURES es 100', () => {
  assert.equal(MAX_CAPTURES, 100);
});

test('MAX_CAPTURE_LENGTH re-exportado de quick-capture es 200', () => {
  assert.equal(MAX_CAPTURE_LENGTH, 200);
});

test('DEFAULT_GET_LIMIT es 20', () => {
  assert.equal(DEFAULT_GET_LIMIT, 20);
});

test('getStorePath retorna <userData>/quick-captures.json', () => {
  assert.equal(getStorePath('C:/Users/foo'), path.join('C:/Users/foo', 'quick-captures.json'));
});

// --- createInitialStore ---

test('createInitialStore: estructura valida con captures=[]', () => {
  const store = createInitialStore();
  assert.equal(store.version, FILE_VERSION);
  assert.deepEqual(store.captures, []);
  assert.ok(isValidStore(store));
});

// --- isValidStore ---

test('isValidStore: rechaza null, undefined, no-objeto', () => {
  assert.equal(isValidStore(null), false);
  assert.equal(isValidStore(undefined), false);
  assert.equal(isValidStore(123), false);
  assert.equal(isValidStore('string'), false);
});

test('isValidStore: rechaza version incorrecta', () => {
  assert.equal(isValidStore({ version: 99, captures: [] }), false);
});

test('isValidStore: rechaza captures no-array', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, captures: 'x' }), false);
});

test('isValidStore: rechaza capture sin text o text vacio', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, captures: [{}] }), false);
  assert.equal(isValidStore({ version: FILE_VERSION, captures: [{ id: '1' }] }), false);
  assert.equal(isValidStore({ version: FILE_VERSION, captures: [{ id: '1', text: '' }] }), false);
});

test('isValidStore: rechaza capture sin createdAt numerico', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, captures: [{ id: '1', text: 'x' }] }), false);
  assert.equal(isValidStore({ version: FILE_VERSION, captures: [{ id: '1', text: 'x', createdAt: 't' }] }), false);
});

test('isValidStore: acepta capture valida', () => {
  assert.equal(isValidStore({
    version: FILE_VERSION,
    captures: [{ id: 'cap-1', text: 'una idea', createdAt: 1 }]
  }), true);
});

// --- loadCaptures ---

test('loadCaptures: directorio invalido → initial store', () => {
  const store = loadCaptures('');
  assert.ok(isValidStore(store));
  assert.equal(store.captures.length, 0);
});

test('loadCaptures: archivo no existe → initial store', () => {
  const dir = makeTmpDir();
  try {
    const store = loadCaptures(dir);
    assert.ok(isValidStore(store));
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('loadCaptures: archivo corrupto → initial store (no crashea)', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getStorePath(dir), '{ esto no es json valido', 'utf8');
    const store = loadCaptures(dir);
    assert.ok(isValidStore(store));
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('loadCaptures: archivo con version incorrecta → initial store', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getStorePath(dir), JSON.stringify({ version: 99, captures: [] }), 'utf8');
    const store = loadCaptures(dir);
    assert.equal(store.version, FILE_VERSION);
  } finally { cleanupTmpDir(dir); }
});

// --- saveCaptures + loadCaptures (roundtrip) ---

test('saveCaptures + loadCaptures: roundtrip basico', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.captures.push({ id: 'cap-1', text: 'una idea', createdAt: 1000 });
    store.captures.push({ id: 'cap-2', text: 'otra idea', createdAt: 2000 });
    saveCaptures(dir, store);

    const loaded = loadCaptures(dir);
    assert.equal(loaded.captures.length, 2);
    assert.equal(loaded.captures[0].id, 'cap-1');
    assert.equal(loaded.captures[0].text, 'una idea');
    assert.equal(loaded.captures[1].id, 'cap-2');
  } finally { cleanupTmpDir(dir); }
});

test('saveCaptures: pruna automaticamente si excede limite', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    for (let i = 0; i < 110; i++) {
      store.captures.push({ id: `cap-${i}`, text: `texto ${i}`, createdAt: i });
    }
    saveCaptures(dir, store);
    const loaded = loadCaptures(dir);
    assert.equal(loaded.captures.length, MAX_CAPTURES);
  } finally { cleanupTmpDir(dir); }
});

test('saveCaptures: archivo temporal .tmp no queda si todo OK', () => {
  const dir = makeTmpDir();
  try {
    saveCaptures(dir, createInitialStore());
    assert.ok(fs.existsSync(getStorePath(dir)));
    assert.ok(!fs.existsSync(getStorePath(dir) + '.tmp'));
  } finally { cleanupTmpDir(dir); }
});

test('saveCaptures: directorio se crea si no existe', () => {
  const dir = path.join(os.tmpdir(), 'pet-captures-test-' + Date.now() + '-new');
  try {
    assert.ok(!fs.existsSync(dir));
    saveCaptures(dir, createInitialStore());
    assert.ok(fs.existsSync(dir));
    assert.ok(fs.existsSync(getStorePath(dir)));
  } finally { cleanupTmpDir(dir); }
});

test('saveCaptures: rechaza userDataDir invalido', () => {
  const store = createInitialStore();
  assert.throws(() => saveCaptures('', store), /requerido/);
  assert.throws(() => saveCaptures(null, store), /requerido/);
});

test('saveCaptures: rechaza store invalido', () => {
  const dir = makeTmpDir();
  try {
    assert.throws(() => saveCaptures(dir, { version: 99 }), /invalido/);
    assert.throws(() => saveCaptures(dir, null), /invalido/);
  } finally { cleanupTmpDir(dir); }
});

// --- pruneCaptures ---

test('pruneCaptures: no trunca si esta dentro del limite', () => {
  const captures = Array.from({ length: 30 }, (_, i) => ({ text: `c${i}`, createdAt: i }));
  const pruned = pruneCaptures(captures, 50);
  assert.equal(pruned.length, 30);
});

test('pruneCaptures: trunca al limite manteniendo las mas recientes', () => {
  const captures = Array.from({ length: 60 }, (_, i) => ({ text: `c${i}`, createdAt: i }));
  const pruned = pruneCaptures(captures, 50);
  assert.equal(pruned.length, 50);
  const texts = pruned.map(c => c.text);
  assert.ok(!texts.includes('c0'));
  assert.ok(!texts.includes('c9'));
  assert.ok(texts.includes('c10'));
  assert.ok(texts.includes('c59'));
});

test('pruneCaptures: input invalido → array vacio', () => {
  assert.deepEqual(pruneCaptures(null), []);
  assert.deepEqual(pruneCaptures(undefined), []);
});

// --- appendCapture ---

test('appendCapture: agrega texto valido', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = appendCapture(dir, store, '  revisar PR  ');
    assert.equal(result.added, true);
    assert.ok(result.capture);
    assert.equal(result.capture.text, 'revisar PR');
    assert.equal(store.captures.length, 1);
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: rechaza texto vacio', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    assert.equal(appendCapture(dir, store, '').added, false);
    assert.equal(appendCapture(dir, store, '   ').added, false);
    assert.equal(appendCapture(dir, store, null).added, false);
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: rechaza texto > 200 chars', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const text = 'x'.repeat(201);
    const r = appendCapture(dir, store, text);
    assert.equal(r.added, false);
    assert.ok(r.reason.includes('200'));
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: redacta PII si redactPII=true', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = appendCapture(dir, store, 'jorge@example.com es mi email', { redactPII: true });
    assert.equal(result.added, true);
    assert.ok(result.capture.text.includes('[REDACTED:email]'));
    assert.ok(!result.capture.text.includes('jorge@example.com'));
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: NO redacta PII si redactPII=false', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = appendCapture(dir, store, 'jorge@example.com es mi email', { redactPII: false });
    assert.equal(result.added, true);
    assert.equal(result.capture.text, 'jorge@example.com es mi email');
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: redactPII default es false (no rompe si no se pasa)', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = appendCapture(dir, store, 'jorge@example.com');
    assert.equal(result.added, true);
    // Sin redactPII explicito, no se redacta (el toggle esta en main)
    assert.equal(result.capture.text, 'jorge@example.com');
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: usa extractPII custom si se provee', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const customExtract = (t) => ({ text: t + '-CUSTOM', pii: [] });
    const result = appendCapture(dir, store, 'hola', { redactPII: true, extractPII: customExtract });
    assert.equal(result.added, true);
    assert.equal(result.capture.text, 'hola-CUSTOM');
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: genera id con cap- prefix', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = appendCapture(dir, store, 'idea');
    assert.match(result.capture.id, /^cap-/);
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: genera createdAt como number', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const before = Date.now();
    const result = appendCapture(dir, store, 'idea');
    const after = Date.now();
    assert.equal(typeof result.capture.createdAt, 'number');
    assert.ok(result.capture.createdAt >= before);
    assert.ok(result.capture.createdAt <= after);
  } finally { cleanupTmpDir(dir); }
});

test('appendCapture: prunea a 100 cuando se agrega el 101', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    for (let i = 0; i < MAX_CAPTURES; i++) {
      store.captures.push({ id: `c${i}`, text: `texto ${i}`, createdAt: i });
    }
    const result = appendCapture(dir, store, 'captura 101');
    assert.equal(result.added, true);
    assert.equal(store.captures.length, MAX_CAPTURES);
    // La mas vieja (createdAt=0) se fue
    assert.ok(!store.captures.find(c => c.id === 'c0'));
  } finally { cleanupTmpDir(dir); }
});

// --- getRecentCaptures ---

test('getRecentCaptures: retorna ordenadas desc por createdAt', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.captures.push({ id: 'a', text: 'uno', createdAt: 1 });
    store.captures.push({ id: 'b', text: 'dos', createdAt: 5 });
    store.captures.push({ id: 'c', text: 'tres', createdAt: 3 });
    const recent = getRecentCaptures(dir, store);
    assert.equal(recent.length, 3);
    assert.equal(recent[0].id, 'b'); // createdAt=5
    assert.equal(recent[1].id, 'c'); // createdAt=3
    assert.equal(recent[2].id, 'a'); // createdAt=1
  } finally { cleanupTmpDir(dir); }
});

test('getRecentCaptures: respeta limit', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    for (let i = 0; i < 10; i++) {
      store.captures.push({ id: `c${i}`, text: `t${i}`, createdAt: i });
    }
    const recent = getRecentCaptures(dir, store, 3);
    assert.equal(recent.length, 3);
    assert.equal(recent[0].id, 'c9');
  } finally { cleanupTmpDir(dir); }
});

test('getRecentCaptures: store invalido → []', () => {
  assert.deepEqual(getRecentCaptures('', null), []);
});

// --- clearCaptures ---

test('clearCaptures: vacia el array y retorna count', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.captures.push({ id: 'a', text: 'uno', createdAt: 1 });
    store.captures.push({ id: 'b', text: 'dos', createdAt: 2 });
    const count = clearCaptures(dir, store);
    assert.equal(count, 2);
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

// --- clearCapturesFile ---

test('clearCapturesFile: elimina el archivo', () => {
  const dir = makeTmpDir();
  try {
    saveCaptures(dir, createInitialStore());
    assert.ok(fs.existsSync(getStorePath(dir)));
    clearCapturesFile(dir);
    assert.ok(!fs.existsSync(getStorePath(dir)));
  } finally { cleanupTmpDir(dir); }
});

test('clearCapturesFile: no crashea si archivo no existe', () => {
  const dir = makeTmpDir();
  try {
    clearCapturesFile(dir);
    assert.ok(true);
  } finally { cleanupTmpDir(dir); }
});

// --- Integration: flujo completo ---

test('integration: append → save → load → list → clear', () => {
  const dir = makeTmpDir();
  try {
    // 1. Inicio: store vacio
    let store = loadCaptures(dir);
    assert.equal(store.captures.length, 0);

    // 2. Usuario captura 2 ideas
    appendCapture(dir, store, 'revisar PR', { redactPII: true });
    appendCapture(dir, store, 'jorge@example.com es mi email', { redactPII: true });

    // 3. Persisto
    saveCaptures(dir, store);

    // 4. Sesion nueva: cargo de disco
    store = loadCaptures(dir);
    assert.equal(store.captures.length, 2);
    assert.ok(store.captures[1].text.includes('[REDACTED:email]'));

    // 5. getRecentCaptures
    const recent = getRecentCaptures(dir, store, 5);
    assert.equal(recent.length, 2);

    // 6. clear
    const cleared = clearCaptures(dir, store);
    assert.equal(cleared, 2);
    saveCaptures(dir, store);
    store = loadCaptures(dir);
    assert.equal(store.captures.length, 0);
  } finally { cleanupTmpDir(dir); }
});

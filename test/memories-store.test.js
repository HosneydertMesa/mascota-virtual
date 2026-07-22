'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  FILE_VERSION,
  createInitialStore,
  isValidStore,
  isValidCandidate,
  loadMemories,
  saveMemories,
  addMemory,
  removeMemory,
  clearAllMemories,
  setRedactPII,
  clearMemoriesFile,
  getStorePath
} = require('../src/services/memories-store');

// Helper: crea un tmp dir unico para cada test
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pet-memories-test-'));
}

function cleanupTmpDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ok */ }
}

// --- Constantes y paths ---

test('FILE_VERSION es 1', () => {
  assert.equal(FILE_VERSION, 1);
});

test('getStorePath retorna <userData>/pet-memories.json', () => {
  assert.equal(getStorePath('C:/Users/foo'), path.join('C:/Users/foo', 'pet-memories.json'));
});

// --- createInitialStore ---

test('createInitialStore: estructura valida con redactPII=true y memories=[]', () => {
  const store = createInitialStore();
  assert.equal(store.version, FILE_VERSION);
  assert.equal(store.redactPII, true);
  assert.deepEqual(store.memories, []);
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
  assert.equal(isValidStore({ version: 99, redactPII: true, memories: [] }), false);
});

test('isValidStore: rechaza redactPII no-boolean', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, redactPII: 'yes', memories: [] }), false);
});

test('isValidStore: rechaza memories no-array', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, redactPII: true, memories: 'x' }), false);
});

test('isValidStore: rechaza memory sin text o text vacio', () => {
  assert.equal(isValidStore({ version: FILE_VERSION, redactPII: true, memories: [{}] }), false);
  assert.equal(isValidStore({ version: FILE_VERSION, redactPII: true, memories: [{ id: '1', text: '' }] }), false);
});

test('isValidStore: acepta memory valida', () => {
  assert.equal(isValidStore({
    version: FILE_VERSION,
    redactPII: true,
    memories: [{ id: 'mem-1', text: 'jorge es developer', createdAt: 1 }]
  }), true);
});

// --- isValidCandidate ---

test('isValidCandidate: acepta text no vacio', () => {
  assert.equal(isValidCandidate({ text: 'jorge' }), true);
  assert.equal(isValidCandidate({ text: '  con espacios  ' }), true);
});

test('isValidCandidate: rechaza invalidos', () => {
  assert.equal(isValidCandidate(null), false);
  assert.equal(isValidCandidate({}), false);
  assert.equal(isValidCandidate({ text: '' }), false);
  assert.equal(isValidCandidate({ text: '   ' }), false);
  assert.equal(isValidCandidate({ text: 123 }), false);
  assert.equal(isValidCandidate({ text: 'x'.repeat(501) }), false); // > 500
});

// --- loadMemories ---

test('loadMemories: directorio invalido → initial store', () => {
  const store = loadMemories('');
  assert.ok(isValidStore(store));
  assert.equal(store.memories.length, 0);
});

test('loadMemories: archivo no existe → initial store', () => {
  const dir = makeTmpDir();
  try {
    const store = loadMemories(dir);
    assert.ok(isValidStore(store));
    assert.equal(store.memories.length, 0);
    assert.equal(store.redactPII, true);
  } finally { cleanupTmpDir(dir); }
});

test('loadMemories: archivo corrupto → initial store (no crashea)', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getStorePath(dir), '{ esto no es json valido', 'utf8');
    const store = loadMemories(dir);
    assert.ok(isValidStore(store));
    assert.equal(store.memories.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('loadMemories: archivo con version incorrecta → initial store', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getStorePath(dir), JSON.stringify({ version: 99, memories: [] }), 'utf8');
    const store = loadMemories(dir);
    assert.equal(store.version, FILE_VERSION);
  } finally { cleanupTmpDir(dir); }
});

// --- saveMemories + loadMemories (roundtrip) ---

test('saveMemories + loadMemories: roundtrip basico', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.memories.push({ id: 'mem-1', text: 'jorge es developer', createdAt: 1000, source: 'chat', occurrences: 1 });
    store.memories.push({ id: 'mem-2', text: 'jorge vive en bogota', createdAt: 2000, source: 'chat', occurrences: 1 });
    saveMemories(dir, store);

    const loaded = loadMemories(dir);
    assert.equal(loaded.memories.length, 2);
    assert.equal(loaded.memories[0].id, 'mem-1');
    assert.equal(loaded.memories[0].text, 'jorge es developer');
    assert.equal(loaded.memories[1].id, 'mem-2');
  } finally { cleanupTmpDir(dir); }
});

test('saveMemories: pruna automaticamente si excede limite', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    for (let i = 0; i < 60; i++) {
      store.memories.push({
        id: `mem-${i}`,
        text: `memoria ${i}`,
        createdAt: i,
        source: 'chat',
        occurrences: 1
      });
    }
    saveMemories(dir, store);
    const loaded = loadMemories(dir);
    assert.equal(loaded.memories.length, 50);
    // pruneToLimit ordena por createdAt DESC, asi que mem-59 esta primero
    assert.equal(loaded.memories[0].id, 'mem-59');
    assert.equal(loaded.memories[49].id, 'mem-10');
  } finally { cleanupTmpDir(dir); }
});

test('saveMemories: archivo temporal .tmp no queda si todo OK', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    saveMemories(dir, store);
    assert.ok(fs.existsSync(getStorePath(dir)));
    assert.ok(!fs.existsSync(getStorePath(dir) + '.tmp'));
  } finally { cleanupTmpDir(dir); }
});

test('saveMemories: directorio se crea si no existe', () => {
  const dir = path.join(os.tmpdir(), 'pet-memories-test-' + Date.now() + '-new');
  try {
    assert.ok(!fs.existsSync(dir));
    const store = createInitialStore();
    saveMemories(dir, store);
    assert.ok(fs.existsSync(dir));
    assert.ok(fs.existsSync(getStorePath(dir)));
  } finally { cleanupTmpDir(dir); }
});

test('saveMemories: rechaza userDataDir invalido', () => {
  const store = createInitialStore();
  assert.throws(() => saveMemories('', store), /requerido/);
  assert.throws(() => saveMemories(null, store), /requerido/);
});

test('saveMemories: rechaza store invalido', () => {
  const dir = makeTmpDir();
  try {
    assert.throws(() => saveMemories(dir, { version: 99 }), /invalido/);
    assert.throws(() => saveMemories(dir, null), /invalido/);
  } finally { cleanupTmpDir(dir); }
});

// --- addMemory ---

test('addMemory: agrega candidato valido', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = addMemory(dir, store, { text: 'jorge es developer' });
    assert.equal(result.added, true);
    assert.ok(result.memory);
    assert.equal(result.memory.text, 'jorge es developer');
    assert.equal(store.memories.length, 1);
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: rechaza candidato invalido', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    assert.equal(addMemory(dir, store, null).added, false);
    assert.equal(addMemory(dir, store, {}).added, false);
    assert.equal(addMemory(dir, store, { text: '' }).added, false);
    assert.equal(addMemory(dir, store, { text: 123 }).added, false);
    assert.equal(store.memories.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: dedupe (no agrega duplicado)', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    addMemory(dir, store, { text: 'jorge es developer javascript senior' });
    const result = addMemory(dir, store, { text: 'jorge developer javascript' }); // similar
    assert.equal(result.added, false);
    assert.equal(result.reason, 'duplicate');
    assert.equal(store.memories.length, 1);
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: redacta PII si redactPII esta ON', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.redactPII = true;
    const result = addMemory(dir, store, { text: 'jorge@example.com es mi email' });
    assert.equal(result.added, true);
    assert.ok(result.memory.text.includes('[REDACTED:email]'));
    assert.ok(!result.memory.text.includes('jorge@example.com'));
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: NO redacta PII si redactPII esta OFF', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.redactPII = false;
    const result = addMemory(dir, store, { text: 'jorge@example.com es mi email' });
    assert.equal(result.added, true);
    assert.equal(result.memory.text, 'jorge@example.com es mi email');
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: respeta id custom si se pasa', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = addMemory(dir, store, { text: 'jorge', id: 'mi-id-custom' });
    assert.equal(result.memory.id, 'mi-id-custom');
  } finally { cleanupTmpDir(dir); }
});

test('addMemory: prunea al limite cuando se agrega el 51', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    for (let i = 0; i < 50; i++) {
      store.memories.push({ id: `m${i}`, text: `texto ${i} unico`, createdAt: i });
    }
    // El 51 deberia reemplazar el mas viejo (createdAt=0)
    const result = addMemory(dir, store, { text: 'memoria 51 nueva' });
    assert.equal(result.added, true);
    assert.equal(store.memories.length, 50);
    assert.ok(!store.memories.find(m => m.id === 'm0'));
    assert.ok(store.memories.find(m => m.text === 'memoria 51 nueva'));
  } finally { cleanupTmpDir(dir); }
});

// --- removeMemory ---

test('removeMemory: elimina por id', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.memories.push({ id: 'a', text: 'uno', createdAt: 1 });
    store.memories.push({ id: 'b', text: 'dos', createdAt: 2 });
    const removed = removeMemory(store, 'a');
    assert.equal(removed, true);
    assert.equal(store.memories.length, 1);
    assert.equal(store.memories[0].id, 'b');
  } finally { cleanupTmpDir(dir); }
});

test('removeMemory: retorna false si id no existe', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    assert.equal(removeMemory(store, 'no-existe'), false);
  } finally { cleanupTmpDir(dir); }
});

// --- clearAllMemories ---

test('clearAllMemories: vacia el array y retorna count', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.memories.push({ id: 'a', text: 'uno' });
    store.memories.push({ id: 'b', text: 'dos' });
    const count = clearAllMemories(store);
    assert.equal(count, 2);
    assert.equal(store.memories.length, 0);
  } finally { cleanupTmpDir(dir); }
});

// --- setRedactPII ---

test('setRedactPII: cambia flag y redacta existentes al pasar a ON', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.redactPII = false;
    store.memories.push({ id: 'a', text: 'mi email es jorge@example.com' });
    const result = setRedactPII(store, true);
    assert.equal(result.changed, true);
    assert.equal(result.redactedCount, 1);
    assert.equal(store.redactPII, true);
    assert.ok(store.memories[0].text.includes('[REDACTED:email]'));
  } finally { cleanupTmpDir(dir); }
});

test('setRedactPII: no cambia si flag ya esta en el valor', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    const result = setRedactPII(store, true);
    assert.equal(result.changed, false);
  } finally { cleanupTmpDir(dir); }
});

test('setRedactPII: al pasar a OFF deja los recuerdos como estan (no des-redacta)', () => {
  const dir = makeTmpDir();
  try {
    const store = createInitialStore();
    store.memories.push({ id: 'a', text: 'email es [REDACTED:email]' });
    const result = setRedactPII(store, false);
    assert.equal(result.changed, true);
    assert.equal(store.redactPII, false);
    // El texto sigue redactado — no recuperamos el email original
    assert.equal(store.memories[0].text, 'email es [REDACTED:email]');
  } finally { cleanupTmpDir(dir); }
});

// --- clearMemoriesFile ---

test('clearMemoriesFile: elimina el archivo', () => {
  const dir = makeTmpDir();
  try {
    saveMemories(dir, createInitialStore());
    assert.ok(fs.existsSync(getStorePath(dir)));
    clearMemoriesFile(dir);
    assert.ok(!fs.existsSync(getStorePath(dir)));
  } finally { cleanupTmpDir(dir); }
});

test('clearMemoriesFile: no crashea si archivo no existe', () => {
  const dir = makeTmpDir();
  try {
    clearMemoriesFile(dir); // no-op
    assert.ok(true);
  } finally { cleanupTmpDir(dir); }
});

// --- Integration: save + load + add + clear ---

test('integration: flujo completo', () => {
  const dir = makeTmpDir();
  try {
    // 1. Inicio: store vacio
    let store = loadMemories(dir);
    assert.equal(store.memories.length, 0);

    // 2. Usuario chatea: agrego 2 recuerdos
    addMemory(dir, store, { text: 'jorge es developer javascript' });
    addMemory(dir, store, { text: 'jorge vive en bogota' });

    // 3. Persisto
    saveMemories(dir, store);

    // 4. Sesion nueva: cargo de disco
    store = loadMemories(dir);
    assert.equal(store.memories.length, 2);

    // 5. Otro chat: agrego un duplicado (no deberia entrar)
    const r = addMemory(dir, store, { text: 'jorge developer javascript senior' });
    assert.equal(r.added, false);
    assert.equal(store.memories.length, 2);

    // 6. Usuario pide borrar todo
    const cleared = clearAllMemories(store);
    assert.equal(cleared, 2);
    saveMemories(dir, store);

    // 7. Verificar que quedo vacio
    store = loadMemories(dir);
    assert.equal(store.memories.length, 0);
  } finally { cleanupTmpDir(dir); }
});

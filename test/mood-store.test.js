'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadMood, saveMood, clearMood, getStorePath, FILE_VERSION } =
  require('../src/services/mood-store');
const { createInitialMood } = require('../src/core/pet-mood');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-mood-'));
}

test('loadMood: archivo no existe → initial', () => {
  const tmp = makeTmpDir();
  try {
    const m = loadMood(tmp);
    assert.equal(m.energy, 70);
    assert.equal(m.happiness, 60);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('saveMood + loadMood: round-trip', () => {
  const tmp = makeTmpDir();
  try {
    const m = { energy: 30, happiness: 80, curiosity: 25, hunger: 60, lastDecayAt: 12345 };
    saveMood(tmp, m);
    const loaded = loadMood(tmp);
    assert.equal(loaded.energy, 30);
    assert.equal(loaded.happiness, 80);
    assert.equal(loaded.curiosity, 25);
    assert.equal(loaded.hunger, 60);
    assert.equal(loaded.lastDecayAt, 12345);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadMood: JSON invalido → initial (no crashea)', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(path.join(tmp, 'pet-mood.json'), 'invalid json {{{', 'utf8');
    const m = loadMood(tmp);
    assert.equal(m.energy, 70);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadMood: version incorrecta → initial', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(
      path.join(tmp, 'pet-mood.json'),
      JSON.stringify({ version: 99, mood: createInitialMood() }),
      'utf8'
    );
    const m = loadMood(tmp);
    assert.equal(m.energy, 70);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadMood: mood invalido → initial', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(
      path.join(tmp, 'pet-mood.json'),
      JSON.stringify({ version: FILE_VERSION, mood: { energy: 'bad' } }),
      'utf8'
    );
    const m = loadMood(tmp);
    assert.equal(m.energy, 70);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearMood: elimina archivo', () => {
  const tmp = makeTmpDir();
  try {
    saveMood(tmp, createInitialMood());
    assert.ok(fs.existsSync(getStorePath(tmp)));
    clearMood(tmp);
    assert.equal(fs.existsSync(getStorePath(tmp)), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearMood: no existe → no-op', () => {
  const tmp = makeTmpDir();
  try {
    assert.doesNotThrow(() => clearMood(tmp));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('saveMood: userDataDir invalido → throw', () => {
  assert.throws(() => saveMood('', createInitialMood()), /requerido/);
  assert.throws(() => saveMood(null, createInitialMood()), /requerido/);
  assert.throws(() => saveMood('/tmp', null), /invalido/);
});

test('saveMood: crea directorio si no existe', () => {
  const tmp = makeTmpDir();
  const nested = path.join(tmp, 'a', 'b', 'c');
  try {
    saveMood(nested, createInitialMood());
    const loaded = loadMood(nested);
    assert.equal(loaded.energy, 70);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('saveMood: clamp al guardar (no se puede guardar energy=999)', () => {
  const tmp = makeTmpDir();
  try {
    saveMood(tmp, {
      energy: 999, happiness: -50, curiosity: 50, hunger: 200, lastDecayAt: 0
    });
    const loaded = loadMood(tmp);
    assert.equal(loaded.energy, 100);
    assert.equal(loaded.happiness, 0);
    assert.equal(loaded.hunger, 100);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadMood: userDataDir invalido → initial (no throw)', () => {
  const m = loadMood('');
  assert.equal(m.energy, 70);
  const m2 = loadMood(null);
  assert.equal(m2.energy, 70);
});

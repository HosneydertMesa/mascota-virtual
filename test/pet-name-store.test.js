'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadPetName, savePetName, clearPetName, getStorePath, FILE_VERSION } =
  require('../src/services/pet-name-store');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-name-'));
}

test('loadPetName: archivo no existe → null', () => {
  const tmp = makeTmpDir();
  try {
    assert.equal(loadPetName(tmp), null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('savePetName + loadPetName: round-trip', () => {
  const tmp = makeTmpDir();
  try {
    savePetName(tmp, 'Pelusa');
    assert.equal(loadPetName(tmp), 'Pelusa');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadPetName: JSON invalido → null (no crashea)', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(path.join(tmp, 'pet-name.json'), 'esto no es JSON {', 'utf8');
    assert.equal(loadPetName(tmp), null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadPetName: version incorrecta → null', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(
      path.join(tmp, 'pet-name.json'),
      JSON.stringify({ version: 99, name: 'X' }),
      'utf8'
    );
    assert.equal(loadPetName(tmp), null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadPetName: name no es string → null', () => {
  const tmp = makeTmpDir();
  try {
    fs.writeFileSync(
      path.join(tmp, 'pet-name.json'),
      JSON.stringify({ version: FILE_VERSION, name: 123 }),
      'utf8'
    );
    assert.equal(loadPetName(tmp), null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearPetName: elimina archivo', () => {
  const tmp = makeTmpDir();
  try {
    savePetName(tmp, 'Pelusa');
    assert.ok(fs.existsSync(getStorePath(tmp)));
    clearPetName(tmp);
    assert.equal(fs.existsSync(getStorePath(tmp)), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearPetName: no existe → no-op (no crashea)', () => {
  const tmp = makeTmpDir();
  try {
    assert.doesNotThrow(() => clearPetName(tmp));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('savePetName: userDataDir invalido → throw', () => {
  assert.throws(() => savePetName('', 'X'), /requerido/);
  assert.throws(() => savePetName(null, 'X'), /requerido/);
  assert.throws(() => savePetName('/tmp', null), /string/);
});

test('savePetName: crea directorio si no existe', () => {
  const tmp = makeTmpDir();
  const nested = path.join(tmp, 'sub', 'dir', 'que', 'no', 'existe');
  try {
    savePetName(nested, 'Pelusa');
    assert.equal(loadPetName(nested), 'Pelusa');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

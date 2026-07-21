'use strict';

const fs = require('fs');
const path = require('path');
const { createInitialMood, isValidMood, clampMood } = require('../core/pet-mood');

/**
 * Mood store — persistencia del mood en JSON.
 *
 * Guarda el mood en `<userData>/pet-mood.json`.
 * Si el archivo no existe, retorna el mood inicial.
 */

const FILE_VERSION = 1;

function getStorePath(userDataDir) {
  return path.join(userDataDir, 'pet-mood.json');
}

/**
 * Carga el mood. Retorna el mood inicial si no existe o esta corrupto.
 * @param {string} userDataDir
 * @returns {object} mood
 */
function loadMood(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialMood();
  }
  const filePath = getStorePath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return createInitialMood();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.version !== FILE_VERSION) return createInitialMood();
    if (!isValidMood(parsed.mood)) return createInitialMood();
    // Restaurar lastDecayAt (viene del JSON)
    return clampMood({
      ...parsed.mood,
      lastDecayAt: typeof parsed.mood.lastDecayAt === 'number' ? parsed.mood.lastDecayAt : Date.now()
    });
  } catch (_e) {
    return createInitialMood();
  }
}

/**
 * Guarda el mood. Lanza Error si userDataDir no es valido.
 * @param {string} userDataDir
 * @param {object} mood
 */
function saveMood(userDataDir, mood) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (!isValidMood(mood)) {
    throw new Error('mood invalido');
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  const filePath = getStorePath(userDataDir);
  fs.writeFileSync(
    filePath,
    JSON.stringify({ version: FILE_VERSION, mood: clampMood(mood) }, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
}

/**
 * Elimina el archivo. No-op si no existe.
 * @param {string} userDataDir
 */
function clearMood(userDataDir) {
  const filePath = getStorePath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* no existe, ok */ }
}

module.exports = {
  loadMood,
  saveMood,
  clearMood,
  getStorePath,
  FILE_VERSION
};

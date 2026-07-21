'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Pet name store — persistencia simple en JSON.
 *
 * Guarda el nombre de la mascota en `<userData>/pet-name.json`.
 * Si el archivo no existe, retorna null (el caller usa el fallback Luna/Max).
 */

const FILE_VERSION = 1;

function getStorePath(userDataDir) {
  return path.join(userDataDir, 'pet-name.json');
}

/**
 * Carga el nombre guardado. Retorna string valido o null.
 * @param {string} userDataDir
 * @returns {string|null}
 */
function loadPetName(userDataDir) {
  const filePath = getStorePath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.version !== FILE_VERSION) return null;
    if (typeof parsed.name !== 'string') return null;
    return parsed.name;
  } catch (_e) {
    return null;
  }
}

/**
 * Guarda el nombre. Lanza Error si el userDataDir no es valido.
 * @param {string} userDataDir
 * @param {string} name - nombre ya validado (usar validatePetName antes)
 */
function savePetName(userDataDir, name) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (typeof name !== 'string') {
    throw new Error('name debe ser string');
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  const filePath = getStorePath(userDataDir);
  fs.writeFileSync(
    filePath,
    JSON.stringify({ version: FILE_VERSION, name }, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
}

/**
 * Elimina el archivo. No-op si no existe.
 * @param {string} userDataDir
 */
function clearPetName(userDataDir) {
  const filePath = getStorePath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* no existe, ok */ }
}

module.exports = {
  loadPetName,
  savePetName,
  clearPetName,
  getStorePath,
  FILE_VERSION
};

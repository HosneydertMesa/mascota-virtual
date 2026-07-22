'use strict';

// W1 + W2 — Pet config store.
//
// Persiste los settings opt-in del usuario en `<userData>/pet-config.json`.
// Schema versionado:
//   { version: 1, silentMode: boolean, calendarIcsPath: string | null }
//
// Por que archivo separado:
//   - silentMode y calendarIcsPath son 2 settings relacionados (W1+W2) que
//     viven juntos en el toggle de "Modo compania silenciosa".
//   - Atomic write (.tmp + rename) para evitar corruption si la app crashea
//     mid-save. Patron copiado de daily-briefing-store.js.

const fs = require('fs');
const path = require('path');

const FILE_VERSION = 1;
const FILE_NAME = 'pet-config.json';

function createInitialStore() {
  return { version: FILE_VERSION, silentMode: false, calendarIcsPath: null };
}

function isValidStore(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (typeof obj.silentMode !== 'boolean') return false;
  if (obj.calendarIcsPath !== null && typeof obj.calendarIcsPath !== 'string') {
    return false;
  }
  return true;
}

function getStorePath(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('pet-config-store: userDataDir invalido');
  }
  return path.join(userDataDir, FILE_NAME);
}

/**
 * Carga el config. Si el archivo no existe o es invalido, retorna el initial
 * store (no lanza). Asi la primera vez que se abre la app, los flags quedan
 * en sus defaults (silentMode=false, calendarIcsPath=null).
 */
function loadPetConfig(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialStore();
  }
  const filePath = getStorePath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return createInitialStore();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidStore(parsed)) return createInitialStore();
    return parsed;
  } catch (_error) {
    return createInitialStore();
  }
}

/**
 * Persiste el config. Atomic write (tmp + rename) para evitar corruption.
 * Lanza si el state es invalido.
 */
function savePetConfig(userDataDir, state) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('pet-config-store: userDataDir invalido');
  }
  if (!isValidStore(state)) {
    throw new Error('pet-config-store: state invalido');
  }
  const filePath = getStorePath(userDataDir);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Helper: actualiza silentMode en el store y persiste.
 * Retorna el nuevo state.
 */
function setSilentMode(userDataDir, enabled) {
  if (typeof enabled !== 'boolean') {
    throw new Error('pet-config-store: enabled debe ser boolean');
  }
  const current = loadPetConfig(userDataDir);
  if (current.silentMode === enabled) return current;
  const next = { ...current, silentMode: enabled };
  savePetConfig(userDataDir, next);
  return next;
}

/**
 * Helper: actualiza calendarIcsPath en el store y persiste.
 * Acepta null para "sin path" o string (sin validacion de path traversal;
 * eso lo hace el IPC handler).
 */
function setCalendarIcsPath(userDataDir, filePath) {
  if (filePath !== null && typeof filePath !== 'string') {
    throw new Error('pet-config-store: filePath debe ser string o null');
  }
  const current = loadPetConfig(userDataDir);
  if (current.calendarIcsPath === filePath) return current;
  const next = { ...current, calendarIcsPath: filePath };
  savePetConfig(userDataDir, next);
  return next;
}

module.exports = {
  FILE_VERSION,
  FILE_NAME,
  createInitialStore,
  isValidStore,
  getStorePath,
  loadPetConfig,
  savePetConfig,
  setSilentMode,
  setCalendarIcsPath
};

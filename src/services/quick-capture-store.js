'use strict';

const fs = require('fs');
const path = require('path');
const {
  validateCaptureText,
  applyPIIRedaction,
  generateCaptureId,
  MAX_CAPTURE_LENGTH
} = require('../core/quick-capture');
const { extractPII } = require('../core/pet-memories');

/**
 * Quick captures store — persistencia de las capturas rapidas (I2).
 *
 * Guarda en `<userData>/quick-captures.json`. Estructura:
 * {
 *   version: 1,
 *   captures: [
 *     { id, text, createdAt },
 *     ...
 *   ]
 * }
 *
 * Las capturas son ideas rapidas (max 200 chars). Se prunan a las ultimas
 * 100 para no crecer sin limite. PII se redacta si `deps.redactPII` es true
 * (controlado por el toggle global en el main, no por la captura individual).
 *
 * Patron identico a memories-store.js: atomic write (tmp + rename),
 * isValidStore, clearFile.
 */

const FILE_VERSION = 1;
const MAX_CAPTURES = 100;
const DEFAULT_GET_LIMIT = 20;

function getStorePath(userDataDir) {
  return path.join(userDataDir, 'quick-captures.json');
}

/**
 * Estado inicial: sin capturas.
 * @returns {{version: number, captures: Array}}
 */
function createInitialStore() {
  return {
    version: FILE_VERSION,
    captures: []
  };
}

/**
 * Valida la estructura minima del store.
 * @param {any} obj
 * @returns {boolean}
 */
function isValidStore(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (!Array.isArray(obj.captures)) return false;
  for (const c of obj.captures) {
    if (!c || typeof c !== 'object') return false;
    if (typeof c.id !== 'string' || c.id.length === 0) return false;
    if (typeof c.text !== 'string' || c.text.length === 0) return false;
    if (typeof c.createdAt !== 'number') return false;
  }
  return true;
}

/**
 * Carga el store. Retorna estado inicial si no existe o esta corrupto.
 * @param {string} userDataDir
 * @returns {object}
 */
function loadCaptures(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialStore();
  }
  const filePath = getStorePath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return createInitialStore();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidStore(parsed)) return createInitialStore();
    return {
      version: FILE_VERSION,
      captures: parsed.captures
    };
  } catch (_e) {
    return createInitialStore();
  }
}

/**
 * Guarda el store. Lanza Error si userDataDir es invalido o store malformado.
 * Escritura atomica: primero a .tmp, despues rename.
 *
 * @param {string} userDataDir
 * @param {object} store
 */
function saveCaptures(userDataDir, store) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (!isValidStore(store)) {
    throw new Error('store de capturas invalido');
  }
  // Prune antes de guardar para no acumular basura
  const captures = pruneCaptures(store.captures, MAX_CAPTURES);
  const toSave = {
    version: FILE_VERSION,
    captures
  };
  fs.mkdirSync(userDataDir, { recursive: true });
  const filePath = getStorePath(userDataDir);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(
    tmpPath,
    JSON.stringify(toSave, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
  fs.renameSync(tmpPath, filePath);
}

/**
 * Si la lista excede maxN, mantiene las N mas recientes (por createdAt).
 *
 * @param {Array<{createdAt?: number}>} captures
 * @param {number} [maxN=100]
 * @returns {Array}
 */
function pruneCaptures(captures, maxN = MAX_CAPTURES) {
  if (!Array.isArray(captures)) return [];
  if (captures.length <= maxN) return captures;
  return [...captures]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, maxN);
}

/**
 * Agrega una captura al store. Aplica validateCaptureText, PII redaction
 * si deps.redactPII es true, genera id, agrega al final, y prunea a 100.
 *
 * @param {string} userDataDir
 * @param {object} store (mutado in-place)
 * @param {string} text
 * @param {object} [deps]
 * @param {boolean} [deps.redactPII=true]
 * @param {(t: string) => {text: string, pii: Array}} [deps.extractPII]
 * @returns {{added: boolean, capture: object|null, reason: string|null}}
 */
function appendCapture(userDataDir, store, text, deps = {}) {
  if (!isValidStore(store)) {
    return { added: false, capture: null, reason: 'invalid_store' };
  }
  const v = validateCaptureText(text);
  if (!v.ok) {
    return { added: false, capture: null, reason: v.error };
  }

  let finalText = v.value;
  if (deps.redactPII === true) {
    const extractFn = typeof deps.extractPII === 'function' ? deps.extractPII : extractPII;
    const { text: redacted } = applyPIIRedaction(finalText, extractFn);
    finalText = redacted;
  }

  const capture = {
    id: generateCaptureId(),
    text: finalText,
    createdAt: Date.now()
  };
  store.captures.push(capture);
  // Prune in-place
  store.captures = pruneCaptures(store.captures, MAX_CAPTURES);
  return { added: true, capture, reason: null };
}

/**
 * Retorna las N capturas mas recientes (por createdAt desc).
 *
 * @param {string} userDataDir
 * @param {object} store
 * @param {number} [limit=20]
 * @returns {Array}
 */
function getRecentCaptures(userDataDir, store, limit = DEFAULT_GET_LIMIT) {
  if (!isValidStore(store)) return [];
  const n = typeof limit === 'number' && limit > 0 ? Math.floor(limit) : DEFAULT_GET_LIMIT;
  return [...store.captures]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, n);
}

/**
 * Elimina todas las capturas. Retorna cantidad eliminada.
 * @param {string} userDataDir
 * @param {object} store
 * @returns {number}
 */
function clearCaptures(userDataDir, store) {
  if (!isValidStore(store)) return 0;
  const count = store.captures.length;
  store.captures = [];
  return count;
}

/**
 * Elimina el archivo de disco. No-op si no existe.
 * @param {string} userDataDir
 */
function clearCapturesFile(userDataDir) {
  const filePath = getStorePath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* no existe, ok */ }
}

module.exports = {
  FILE_VERSION,
  MAX_CAPTURES,
  DEFAULT_GET_LIMIT,
  MAX_CAPTURE_LENGTH,
  getStorePath,
  createInitialStore,
  isValidStore,
  loadCaptures,
  saveCaptures,
  pruneCaptures,
  appendCapture,
  getRecentCaptures,
  clearCaptures,
  clearCapturesFile
};

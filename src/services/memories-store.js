'use strict';

const fs = require('fs');
const path = require('path');
const {
  generateMemoryId,
  pruneToLimit,
  DEFAULT_MEMORY_LIMIT,
  extractPII,
  dedupMemory
} = require('../core/pet-memories');

/**
 * Memories store — persistencia de los recuerdos persistentes de la mascota.
 *
 * Guarda en `<userData>/pet-memories.json`. Estructura:
 * {
 *   version: 1,
 *   redactPII: true,
 *   memories: [
 *     { id, text, createdAt, source, occurrences },
 *     ...
 *   ]
 * }
 *
 * Si el archivo no existe o esta corrupto, retorna estado inicial.
 * Si redactPII esta activo, los textos se redactan antes de persistir.
 */

const FILE_VERSION = 1;

function getStorePath(userDataDir) {
  return path.join(userDataDir, 'pet-memories.json');
}

/**
 * Estado inicial: sin recuerdos, PII redaction ON por default.
 * @returns {{version: number, redactPII: boolean, memories: Array}}
 */
function createInitialStore() {
  return {
    version: FILE_VERSION,
    redactPII: true,
    memories: []
  };
}

/**
 * Valida que un objeto tenga la estructura minima de store.
 * @param {any} obj
 * @returns {boolean}
 */
function isValidStore(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (typeof obj.redactPII !== 'boolean') return false;
  if (!Array.isArray(obj.memories)) return false;
  for (const m of obj.memories) {
    if (!m || typeof m !== 'object') return false;
    if (typeof m.text !== 'string' || m.text.length === 0) return false;
    if (typeof m.id !== 'string') return false;
  }
  return true;
}

/**
 * Valida un candidato a recuerdo (antes de agregarlo al store).
 * @param {any} candidate
 * @returns {boolean}
 */
function isValidCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;
  if (typeof candidate.text !== 'string' || candidate.text.trim().length === 0) return false;
  if (candidate.text.length > 500) return false; // limite sano
  return true;
}

/**
 * Carga el store. Retorna estado inicial si no existe o esta corrupto.
 * @param {string} userDataDir
 * @returns {object}
 */
function loadMemories(userDataDir) {
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
      redactPII: parsed.redactPII,
      memories: parsed.memories
    };
  } catch (_e) {
    return createInitialStore();
  }
}

/**
 * Guarda el store. Lanza Error si userDataDir es invalido o store malformado.
 * Escritura atomica: primero a .tmp, despues rename. Asi si se corta la
 * energia a mitad de escritura, no queda un JSON corrupto.
 *
 * @param {string} userDataDir
 * @param {object} store
 */
function saveMemories(userDataDir, store) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (!isValidStore(store)) {
    throw new Error('store de recuerdos invalido');
  }
  // Prune antes de guardar para no acumular basura
  const memories = pruneToLimit(store.memories, DEFAULT_MEMORY_LIMIT);
  const toSave = {
    version: FILE_VERSION,
    redactPII: store.redactPII,
    memories
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
 * Agrega un recuerdo al store. Aplica PII redaction si esta activo,
 * corre dedup contra los existentes, y prunea al limite.
 * Retorna { added: boolean, memory: object|null, reason: string|null }
 *
 * @param {string} userDataDir
 * @param {object} store (mutado in-place si se agrega)
 * @param {{text: string, [source]: string}} candidate
 * @returns {{added: boolean, memory: object|null, reason: string|null}}
 */
function addMemory(userDataDir, store, candidate) {
  if (!isValidCandidate(candidate)) {
    return { added: false, memory: null, reason: 'invalid' };
  }
  if (!isValidStore(store)) {
    return { added: false, memory: null, reason: 'invalid_store' };
  }

  let text = candidate.text.trim();

  // PII redaction (si esta activo)
  if (store.redactPII) {
    const { text: redacted } = extractPII(text);
    text = redacted;
  }

  // Dedup
  const dedup = dedupMemory(store.memories, { text });
  if (dedup.isDupe) {
    return { added: false, memory: dedup.existing, reason: 'duplicate' };
  }

  const memory = {
    id: candidate.id || generateMemoryId(),
    text,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
    source: typeof candidate.source === 'string' ? candidate.source : 'chat',
    occurrences: 1
  };
  store.memories.push(memory);
  // Prune in-place
  store.memories = pruneToLimit(store.memories, DEFAULT_MEMORY_LIMIT);
  return { added: true, memory, reason: null };
}

/**
 * Elimina un recuerdo por id. Retorna true si se elimino, false si no existia.
 * @param {string} userDataDir
 * @param {object} store
 * @param {string} memoryId
 * @returns {boolean}
 */
function removeMemory(store, memoryId) {
  if (!isValidStore(store) || typeof memoryId !== 'string') return false;
  const idx = store.memories.findIndex(m => m.id === memoryId);
  if (idx === -1) return false;
  store.memories.splice(idx, 1);
  return true;
}

/**
 * Limpia todos los recuerdos. Retorna cantidad eliminada.
 * @param {string} userDataDir
 * @param {object} store
 * @returns {number}
 */
function clearAllMemories(store) {
  if (!isValidStore(store)) return 0;
  const count = store.memories.length;
  store.memories = [];
  return count;
}

/**
 * Setea el flag redactPII. Si cambia de false a true, redacta los recuerdos
 * existentes in-place. Si cambia de true a false, deja los recuerdos como
 * estan (no "des-redacta" — eso seria riesgoso porque perderiamos la marca
 * de que algo fue redactado).
 *
 * @param {object} store
 * @param {boolean} enabled
 * @returns {{changed: boolean, redactedCount: number}}
 */
function setRedactPII(store, enabled) {
  if (!isValidStore(store) || typeof enabled !== 'boolean') {
    return { changed: false, redactedCount: 0 };
  }
  if (store.redactPII === enabled) {
    return { changed: false, redactedCount: 0 };
  }
  let redactedCount = 0;
  if (enabled) {
    // ON: redactar los existentes
    for (const m of store.memories) {
      const before = m.text;
      const { text: redacted } = extractPII(before);
      if (redacted !== before) {
        m.text = redacted;
        redactedCount++;
      }
    }
  }
  store.redactPII = enabled;
  return { changed: true, redactedCount };
}

/**
 * Elimina el archivo de disco. No-op si no existe.
 * @param {string} userDataDir
 */
function clearMemoriesFile(userDataDir) {
  const filePath = getStorePath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* no existe, ok */ }
}

module.exports = {
  FILE_VERSION,
  getStorePath,
  createInitialStore,
  isValidStore,
  isValidCandidate,
  loadMemories,
  saveMemories,
  addMemory,
  removeMemory,
  clearAllMemories,
  setRedactPII,
  clearMemoriesFile
};

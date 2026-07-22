'use strict';

/**
 * Pet memories — pure functions para la memoria larga de la mascota.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Tokenizacion (lowercase + split por no-alphanumerico)
 *   - Ranking por relevancia (bag-of-words + TF simple, sin IDF completo
 *     porque el corpus es chico y queremos simplicidad)
 *   - Redaccion de PII (emails, phones, tarjetas de credito)
 *   - Deduplicacion (Jaccard similarity >= 0.7 = dupe)
 *   - Formato para system prompt
 *   - Prune al limite N
 *
 * Diseno:
 *   - Bag-of-words: cada term cuenta una vez por ocurrencia en el doc
 *   - Score(query, memory) = sum over query terms: count(memory, term)
 *   - Es TF sin IDF. Razon: el corpus es chico (max 50 recuerdos), el IDF
 *     aporta poco y agrega complejidad. Si en el futuro crece, se cambia.
 *
 * Uso:
 *   - src/core/pet-memories.js (este archivo) — pure
 *   - src/services/memories-store.js — persistencia
 *   - src/services/memory-extractor.js — orquestacion IA (en main)
 *   - main.js — wire: load, inject en system prompt, save despues de chat
 */

const DEFAULT_MEMORY_LIMIT = 50;
const DEDUP_SIMILARITY_THRESHOLD = 0.7;
// Stop words espanol basico. Si el corpus crece, considerar lista completa.
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'en', 'por', 'para', 'con', 'sin',
  'y', 'o', 'u', 'que', 'se', 'es', 'son', 'fue', 'fui',
  'mi', 'tu', 'su', 'me', 'te', 'se', 'nos', 'os',
  'yo', 'tu', 'el', 'ella', 'ellos', 'ellas',
  'lo', 'le', 'les', 'si', 'no', 'mas', 'muy',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'como', 'pero', 'porque', 'cuando', 'donde', 'cual', 'quien',
  'ha', 'han', 'he', 'has', 'hay', 'tener', 'ser', 'estar',
  'si', 'tambien', 'solo', 'aqui', 'alli', 'hoy', 'ayer', 'manana',
  'muy', 'poco', 'mucho', 'algo', 'nada', 'todo'
]);

/**
 * Tokeniza un texto. Lowercase, split por no-alphanumeric, filtra stop words
 * y terminos muy cortos (< 2 chars). Soporta Unicode (acentos, eñe).
 *
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  if (typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
}

/**
 * Calcula el score de un recuerdo contra una query. Mayor = mas relevante.
 * Usa bag-of-words simple: cuenta ocurrencias de cada term de la query en el recuerdo.
 *
 * @param {string} query
 * @param {{text: string}} memory
 * @returns {number}
 */
function scoreMemory(query, memory) {
  if (!memory || typeof memory.text !== 'string') return 0;
  const queryTerms = new Set(tokenize(query));
  if (queryTerms.size === 0) return 0;
  const memoryTerms = tokenize(memory.text);
  const counts = new Map();
  for (const t of memoryTerms) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  let score = 0;
  for (const qt of queryTerms) {
    const c = counts.get(qt) || 0;
    if (c > 0) score += c;
  }
  return score;
}

/**
 * Rankea los recuerdos por relevancia contra una query. Retorna los top N.
 * Si la query no matchea nada, retorna lista vacia.
 *
 * @param {Array<{text: string, [createdAt]: number, [id]: string}>} memories
 * @param {string} query
 * @param {number} [topN=5]
 * @returns {Array}
 */
function rankByRelevance(memories, query, topN = 5) {
  if (!Array.isArray(memories) || memories.length === 0) return [];
  if (typeof query !== 'string' || query.trim().length === 0) return [];
  const n = typeof topN === 'number' && topN > 0 ? Math.floor(topN) : 5;
  const scored = [];
  for (const m of memories) {
    const s = scoreMemory(query, m);
    if (s > 0) scored.push({ memory: m, score: s });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map(x => x.memory);
}

// --- PII redaction ---

// Email: local@domain.tld (no perfecto, cubre 99% de los casos)
const RE_EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
// Tarjeta de credito: 16 digitos consecutivos O 4 grupos de 4 separados por
// espacio/dash. Va ANTES de phone porque un CC con guiones matchearia
// tambien como phone (4+4+4 digitos) si el orden fuera al reves.
const RE_CREDIT_CARD = /\b(?:\d{16}|\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4})\b/g;
// Telefono: codigo pais opcional + 2-4 digitos + 3-4 digitos + 3-4 digitos
// Cubre formatos US (555-123-4567), con parentesis ((555) 123-4567), e internacionales
// como Argentina (+54 11 5555-1234). Puede dar falsos positivos en numeros arbitrarios
// de 4+4+4 digitos — aceptable porque ese patron es raro fuera de telefonos.
const RE_PHONE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

// Orden importante: creditCard antes que phone para que CCs con guiones
// no se matcheen primero como phone (4+4+4 digitos).
const PII_PATTERNS = [
  { name: 'email', re: RE_EMAIL },
  { name: 'creditCard', re: RE_CREDIT_CARD },
  { name: 'phone', re: RE_PHONE }
];

/**
 * Redacta PII (emails, phones, tarjetas) de un texto.
 * Reemplaza cada match con [REDACTED:tipo].
 *
 * @param {string} text
 * @returns {{text: string, pii: Array<{type: string, value: string}>}}
 */
function extractPII(text) {
  const input = typeof text === 'string' ? text : '';
  const pii = [];
  let out = input;
  for (const p of PII_PATTERNS) {
    // Reset lastIndex (regex con /g mantiene estado)
    p.re.lastIndex = 0;
    out = out.replace(p.re, (match) => {
      pii.push({ type: p.name, value: match });
      return `[REDACTED:${p.name}]`;
    });
  }
  return { text: out, pii };
}

// --- Dedup ---

/**
 * Compara un candidato contra los recuerdos existentes usando Jaccard similarity.
 * Si la similitud >= DEDUP_SIMILARITY_THRESHOLD (0.7), se considera dupe.
 *
 * @param {Array<{text: string}>} memories
 * @param {{text: string}} candidate
 * @param {number} [threshold=0.7]
 * @returns {{isDupe: boolean, existing: object|null, similarity: number}}
 */
function dedupMemory(memories, candidate, threshold = DEDUP_SIMILARITY_THRESHOLD) {
  if (!Array.isArray(memories) || memories.length === 0) {
    return { isDupe: false, existing: null, similarity: 0 };
  }
  if (!candidate || typeof candidate.text !== 'string') {
    return { isDupe: false, existing: null, similarity: 0 };
  }
  const candidateTokens = new Set(tokenize(candidate.text));
  if (candidateTokens.size === 0) {
    return { isDupe: false, existing: null, similarity: 0 };
  }
  for (const m of memories) {
    if (!m || typeof m.text !== 'string') continue;
    const existingTokens = new Set(tokenize(m.text));
    if (existingTokens.size === 0) continue;
    let intersection = 0;
    for (const t of candidateTokens) {
      if (existingTokens.has(t)) intersection++;
    }
    const union = candidateTokens.size + existingTokens.size - intersection;
    const similarity = union > 0 ? intersection / union : 0;
    if (similarity >= threshold) {
      return { isDupe: true, existing: m, similarity };
    }
  }
  return { isDupe: false, existing: null, similarity: 0 };
}

// --- Format ---

/**
 * Formatea una lista de recuerdos para inyectar al system prompt del IA.
 * Retorna string vacio si la lista esta vacia.
 *
 * @param {Array<{text: string, [createdAt]: number}>} memories
 * @returns {string}
 */
function formatMemoriesForPrompt(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return '';
  const lines = memories.map((m, i) => {
    const date = m.createdAt ? new Date(m.createdAt).toISOString().slice(0, 10) : '';
    return `${i + 1}. ${m.text}${date ? ` (${date})` : ''}`;
  });
  return `Recuerdos relevantes que tenes sobre el usuario (top ${memories.length}):\n${lines.join('\n')}`;
}

// --- Prune ---

/**
 * Si la lista excede maxN, mantiene los N mas recientes (por createdAt).
 *
 * @param {Array<{createdAt?: number}>} memories
 * @param {number} [maxN=50]
 * @returns {Array}
 */
function pruneToLimit(memories, maxN = DEFAULT_MEMORY_LIMIT) {
  if (!Array.isArray(memories)) return [];
  if (memories.length <= maxN) return memories;
  return [...memories]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, maxN);
}

/**
 * Genera un ID unico para un nuevo recuerdo.
 * Formato: mem-<timestamp>-<random6>
 *
 * @returns {string}
 */
function generateMemoryId() {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// UMD-lite: expone en module.exports (Node) o window.PetMemories (browser).
const PetMemories = {
  DEFAULT_MEMORY_LIMIT,
  DEDUP_SIMILARITY_THRESHOLD,
  STOP_WORDS,
  tokenize,
  scoreMemory,
  rankByRelevance,
  extractPII,
  dedupMemory,
  formatMemoriesForPrompt,
  pruneToLimit,
  generateMemoryId
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PetMemories;
} else if (typeof window !== 'undefined') {
  window.PetMemories = PetMemories;
}

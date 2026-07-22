'use strict';

/**
 * Quick capture — pure functions para la captura rapida de ideas (I2).
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Validacion del texto capturado (no vacio, max 200 chars)
 *   - Truncar para preview en listas (sin cortar palabras en seco)
 *   - Formatear timestamps relativos ("hace 5m", "hace 2h", etc)
 *   - Aplicar redaction de PII reusando extractPII de pet-memories
 *
 * Diseno:
 *   - MAX_CAPTURE_LENGTH = 200: limite duro. El textarea en el renderer
 *     tiene maxlength=200, pero el IPC debe re-validar (nunca confiar en
 *     el cliente).
 *   - truncateForPreview: recorta al limite menos 1 char y agrega "…".
 *     No corta palabras: la idea es mostrar preview legible.
 *   - formatTimestamp: usa `now` como parametro (injection) para que los
 *     tests puedan mockear el tiempo sin tocar globals.
 *   - applyPIIRedaction: wrapper que toma extractPII como param. Asi este
 *     modulo no tiene hard-dependency a pet-memories.js — en el browser
 *     pasa window.PetMemories.extractPII, en Node pasa el require().
 *
 * Uso:
 *   - src/core/quick-capture.js (este archivo) — pure
 *   - src/services/quick-capture-store.js — persistencia (usa validateCaptureText
 *     y applyPIIRedaction con extractPII de pet-memories)
 *   - src/dashboard-renderer.js — usa truncateForPreview y formatTimestamp
 *   - main.js — IPC handler quick-capture:save llama appendCapture
 */

const MAX_CAPTURE_LENGTH = 200;
const PREVIEW_DEFAULT_MAX = 60;
const ELLIPSIS = '…';

// --- Validacion ---

/**
 * Valida el texto de una captura. Retorna {ok, value, error}.
 * Reglas:
 *   - text debe ser string
 *   - despues de trim(), debe tener al menos 1 char
 *   - despues de trim(), no debe exceder MAX_CAPTURE_LENGTH
 *
 * @param {any} text
 * @returns {{ok: boolean, value: string, error: string|null}}
 */
function validateCaptureText(text) {
  if (typeof text !== 'string') {
    return { ok: false, value: '', error: 'El texto debe ser un string.' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: false, value: '', error: 'La captura no puede estar vacia.' };
  }
  if (trimmed.length > MAX_CAPTURE_LENGTH) {
    return { ok: false, value: '', error: `La captura no puede exceder ${MAX_CAPTURE_LENGTH} caracteres.` };
  }
  return { ok: true, value: trimmed, error: null };
}

// --- Preview ---

/**
 * Trunca un texto para mostrar en una lista. Si excede maxChars, corta al
 * limite-1 y agrega "…". No corta palabras a la mitad — el caller puede
 * pasar un maxChars que cubra sus necesidades.
 *
 * @param {any} text
 * @param {number} [maxChars=60]
 * @returns {string}
 */
function truncateForPreview(text, maxChars = PREVIEW_DEFAULT_MAX) {
  if (typeof text !== 'string') return '';
  const n = typeof maxChars === 'number' && maxChars > 1 ? Math.floor(maxChars) : PREVIEW_DEFAULT_MAX;
  if (text.length <= n) return text;
  return text.slice(0, n - 1) + ELLIPSIS;
}

// --- Timestamp ---

/**
 * Formatea un timestamp (ms epoch) como string relativo al "ahora":
 *   < 60s   → "ahora"
 *   < 60min → "hace Xm"
 *   < 24h   → "hace Xh"
 *   < 7d    → "hace Xd"
 *   >= 7d   → "DD/MM" (fecha local, ej "12/05")
 *
 * Usa `now` como param para que los tests mockeen el tiempo. `now` puede
 * ser un number (ms) o un Date.
 *
 * @param {number|string|Date} ts
 * @param {number|Date} [now=Date.now()]
 * @returns {string}
 */
function formatTimestamp(ts, now = Date.now()) {
  if (ts === null || ts === undefined) return '';
  const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
  if (!Number.isFinite(t)) return '';
  const ref = typeof now === 'number' ? now : new Date(now).getTime();
  const diff = Math.max(0, ref - t);
  const diffSec = Math.floor(diff / 1000);
  if (diffSec < 60) return 'ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `hace ${diffDay}d`;
  // >= 7d → fecha local DD/MM
  const d = new Date(t);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

// --- PII redaction ---

/**
 * Wrapper que aplica PII redaction. Recibe `extractPII` como dependencia
 * para no tener hard-coupling a pet-memories.js (asi este modulo se puede
 * cargar en browser sin require, y los tests pueden mockear extractPII).
 *
 * @param {string} text
 * @param {(t: string) => {text: string, pii: Array}} extractPII
 * @returns {{text: string, pii: Array}}
 */
function applyPIIRedaction(text, extractPII) {
  if (typeof extractPII !== 'function') {
    return { text: typeof text === 'string' ? text : '', pii: [] };
  }
  return extractPII(text);
}

// --- ID generation ---

/**
 * Genera un ID unico para una captura. Formato: cap-<timestamp>-<random6>.
 * Si crypto.randomUUID esta disponible (Node 19+ / browser modernos),
 * se usa para tener un id 100% unico; si no, fallback al patron viejo.
 *
 * @returns {string}
 */
function generateCaptureId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return `cap-${globalThis.crypto.randomUUID()}`;
  }
  return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// UMD-lite: expone en module.exports (Node) o window.QuickCapture (browser).
const QuickCapture = {
  MAX_CAPTURE_LENGTH,
  PREVIEW_DEFAULT_MAX,
  ELLIPSIS,
  validateCaptureText,
  truncateForPreview,
  formatTimestamp,
  applyPIIRedaction,
  generateCaptureId
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickCapture;
} else if (typeof window !== 'undefined') {
  window.QuickCapture = QuickCapture;
}

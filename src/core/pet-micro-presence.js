'use strict';

/**
 * Pet micro presence — pure functions.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Eye tracking (calculo de posicion de pupilas)
 *   - Pupil dilation (modo nocturno segun hora)
 *   - Yawn timing (cuando bostezar)
 *   - Pet name (con fallback a Luna/Max)
 *
 * Uso en main/renderer: importar las funciones, pasar valores puros
 * (coordenadas, fechas, strings), obtener resultados.
 */

const { clamp } = require('./pet-motion');

/**
 * Calcula la posicion de la pupila dado el centro del ojo y la posicion del cursor.
 * La pupila se mueve dentro de un radio maximo alrededor del centro del ojo.
 *
 * @param {{x: number, y: number}} eyeCenter - centro del ojo en pixeles (relativo al SVG)
 * @param {{x: number, y: number}} cursorPos - posicion del cursor en pixeles (mismas coordenadas)
 * @param {number} maxRadius - radio maximo de movimiento de la pupila (default 4 px)
 * @returns {{x: number, y: number}} posicion de la pupila en pixeles
 */
function computePupilPosition(eyeCenter, cursorPos, maxRadius = 4) {
  const dx = cursorPos.x - eyeCenter.x;
  const dy = cursorPos.y - eyeCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= maxRadius || dist === 0) {
    // Cursor dentro del radio o encima del ojo: pupila quieta en el centro
    return { x: eyeCenter.x, y: eyeCenter.y };
  }

  // Limitar al borde del radio maxRadius en la direccion del cursor
  const scale = maxRadius / dist;
  return {
    x: eyeCenter.x + dx * scale,
    y: eyeCenter.y + dy * scale
  };
}

/**
 * Determina si la pupila debe estar dilatada (mas grande) segun la hora.
 * Modo "nocturno" entre las 20:00 y las 07:00 hora local.
 *
 * @param {Date} [date] - fecha a evaluar (default: ahora)
 * @returns {boolean} true si la pupila debe estar dilatada
 */
function shouldPupilDilate(date) {
  const d = date || new Date();
  const hour = d.getHours();
  return hour >= 20 || hour < 7;
}

/**
 * Calcula cuando deberia ser el proximo bostezo.
 * Si la mascota lleva X minutos en idle, bosteza. Default: cada 5 min.
 *
 * @param {Date} lastYawnAt - cuando bostezo por ultima vez
 * @param {number} idleMs - cuanto tiempo lleva en idle (ms)
 * @param {number} [intervalMs=300000] - intervalo entre bostezos (default 5 min)
 * @returns {boolean} true si debe bostezar ahora
 */
function shouldYawn(lastYawnAt, idleMs, intervalMs = 300000) {
  if (!lastYawnAt) return true;
  const elapsed = Date.now() - lastYawnAt.getTime();
  return elapsed >= intervalMs && idleMs >= intervalMs;
}

// M4 — mood-aware yawn: si la mascota está cansada (energy < 25) bosteza
// más seguido (cada 2 min en vez de cada 5).
const YAWN_INTERVAL_DEFAULT_MS = 5 * 60 * 1000;   // 5 min — estado normal
const YAWN_INTERVAL_TIRED_MS = 2 * 60 * 1000;     // 2 min — energy < 25
const YAWN_ENERGY_TIRED_THRESHOLD = 25;

/**
 * Determina el intervalo entre bostezos segun el mood.
 * Si mood es null/invalido o la energy está por encima del umbral, usa el default.
 *
 * @param {object|null} mood - { energy, happiness, curiosity, hunger, ... }
 * @returns {number} intervalo en ms
 */
function getYawnIntervalMs(mood) {
  if (mood && typeof mood.energy === 'number' && mood.energy < YAWN_ENERGY_TIRED_THRESHOLD) {
    return YAWN_INTERVAL_TIRED_MS;
  }
  return YAWN_INTERVAL_DEFAULT_MS;
}

/**
 * Retorna el nombre de la mascota. Si no hay nombre guardado, usa el default segun el tipo.
 *
 * @param {string|null} storedName - nombre guardado en disco (o null)
 * @param {string} petType - 'cat' o 'dog'
 * @returns {string} nombre a usar
 */
function getPetName(storedName, petType) {
  if (typeof storedName === 'string' && storedName.trim().length > 0) {
    const cleaned = storedName.trim().slice(0, 24); // max 24 chars
    if (cleaned.length > 0) return cleaned;
  }
  return petType === 'dog' ? 'Max' : 'Luna';
}

/**
 * Valida un nombre propuesto. Retorna el nombre limpio o null si invalido.
 *
 * @param {string} candidate
 * @returns {string|null} nombre limpio o null
 */
function validatePetName(candidate) {
  if (typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  if (trimmed.length === 0 || trimmed.length > 24) return null;
  // Caracteres permitidos: letras, numeros, espacios, guion, guion bajo, punto, apostrofe
  if (!/^[\p{L}\p{N} _\-'.]+$/u.test(trimmed)) return null;
  return trimmed;
}

module.exports = {
  computePupilPosition,
  shouldPupilDilate,
  shouldYawn,
  getYawnIntervalMs,
  getPetName,
  validatePetName,
  YAWN_INTERVAL_DEFAULT_MS,
  YAWN_INTERVAL_TIRED_MS,
  YAWN_ENERGY_TIRED_THRESHOLD
};

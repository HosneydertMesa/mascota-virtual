'use strict';

/**
 * Auto-updater — pure functions para T6 (electron-updater).
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Decidir si hay que chequear updates (interval gating)
 *   - Formatear mensajes user-facing cuando hay un update
 *   - Comparar versiones semver (incluyendo pre-release)
 *
 * Por que este modulo existe:
 *   electron-updater (la libreria de runtime) decide cuando bajar/instalar.
 *   Pero la logica de "cuando chequear" + "como mostrarlo al usuario" es
 *   nuestra. Aislarla aca permite testearla sin Electron ni red.
 *
 * Uso:
 *   - src/core/auto-updater.js (este archivo) — pure
 *   - main.js — wire electron-updater + llama formatUpdateMessage para el toast
 *   - src/renderer.js — recibe el mensaje y lo muestra como speech bubble
 *
 * Convencion de version (semver 2.0.0):
 *   - "2.0.0" → release estable
 *   - "2.0.0-beta.1", "2.0.0-rc.2" → pre-release
 *   - "v2.0.0" → con prefijo (lo strippeamos para comparar)
 *   - "2.0" o "2" → version incompleta, se rechaza (devuelve false)
 */

const DEFAULT_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas

/**
 * Decide si hay que chequear updates.
 *
 * @param {object} args
 * @param {number} args.lastCheckTimestamp - ms epoch del ultimo check (0 = nunca)
 * @param {number} args.now - ms epoch del momento actual
 * @param {number} [args.intervalMs=6h] - intervalo minimo entre checks
 * @returns {boolean} true si hay que chequear
 */
function shouldCheckForUpdate({ lastCheckTimestamp, now, intervalMs = DEFAULT_CHECK_INTERVAL_MS } = {}) {
  if (typeof now !== 'number' || !Number.isFinite(now)) return false;
  if (typeof intervalMs !== 'number' || intervalMs <= 0) return false;
  if (typeof lastCheckTimestamp !== 'number' || !Number.isFinite(lastCheckTimestamp)) return false;
  // Primer check: si lastCheck es 0 (o negativo), SI hay que chequear
  if (lastCheckTimestamp <= 0) return true;
  // Aun no pasaron `intervalMs` milisegundos desde el ultimo check
  if (now - lastCheckTimestamp < intervalMs) return false;
  return true;
}

/**
 * Compara dos versiones semver y devuelve true si `b` es estrictamente
 * mas nueva que `a`.
 *
 * Reglas:
 *   - Soporta "v" prefix: "v2.0.0" === "2.0.0"
 *   - Soporta pre-release: "2.0.0-beta.1" < "2.0.0"
 *   - Si alguno no es semver valido (>= 3 partes numericas separadas por .),
 *     devuelve false (no es newer, no es error)
 *   - "2" o "2.0" (solo 1-2 partes) NO se consideran semver valido
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function isNewerVersion(a, b) {
  const parsedA = parseSemver(a);
  const parsedB = parseSemver(b);
  if (!parsedA || !parsedB) return false;
  return compareSemver(parsedB, parsedA) > 0;
}

/**
 * Formatea un mensaje user-facing para el toast del update.
 *
 * @param {object} args
 * @param {string} args.currentVersion - version actual instalada
 * @param {string} args.newVersion - version nueva disponible
 * @param {string} args.kind - 'available' | 'downloaded'
 * @returns {string} mensaje listo para mostrar en speech bubble
 */
function formatUpdateMessage({ currentVersion, newVersion, kind } = {}) {
  const version = typeof newVersion === 'string' && newVersion.length > 0
    ? stripVPrefix(newVersion)
    : '';
  if (!version) return '';
  if (kind === 'downloaded') {
    return `Update v${version} listo. Se instala al cerrar la app.`;
  }
  // Default: 'available'
  return `Update v${version} downloading...`;
}

// --- helpers internos (no exportados) --------------------------------------

/**
 * Strippea el prefijo "v" si existe.
 * "v2.0.0" → "2.0.0"
 * "2.0.0"  → "2.0.0"
 */
function stripVPrefix(s) {
  if (typeof s !== 'string') return '';
  return s.startsWith('v') || s.startsWith('V') ? s.slice(1) : s;
}

/**
 * Parsea una version semver.
 * @param {string} input
 * @returns {null | { major: number, minor: number, patch: number, prerelease: string[] }}
 */
function parseSemver(input) {
  if (typeof input !== 'string') return null;
  const stripped = stripVPrefix(input).trim();
  if (stripped.length === 0) return null;
  // Match major.minor.patch (obligatorio) + -prerelease (opcional)
  const match = stripped.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?$/);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) return null;
  const prerelease = match[4] ? match[4].split('.') : [];
  return { major, minor, patch, prerelease };
}

/**
 * Compara dos semver parseados.
 * @returns {number} >0 si a>b, <0 si a<b, 0 si iguales
 */
function compareSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  // Pre-release: la que NO tiene prerelease es mayor (1.0.0 > 1.0.0-rc.1)
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;
  // Compara componente por componente
  const len = Math.min(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i++) {
    const av = a.prerelease[i];
    const bv = b.prerelease[i];
    const an = Number(av);
    const bn = Number(bv);
    const aIsNum = Number.isFinite(an) && /^\d+$/.test(av);
    const bIsNum = Number.isFinite(bn) && /^\d+$/.test(bv);
    if (aIsNum && bIsNum) {
      if (an !== bn) return an - bn;
    } else if (aIsNum) {
      // Numerico < alfanumerico
      return -1;
    } else if (bIsNum) {
      return 1;
    } else {
      const cmp = av.localeCompare(bv);
      if (cmp !== 0) return cmp;
    }
  }
  // Si son iguales hasta el min(len), gana el mas largo
  return a.prerelease.length - b.prerelease.length;
}

// UMD-lite: expone en module.exports (Node) o window.AutoUpdater (browser).
const AutoUpdater = {
  DEFAULT_CHECK_INTERVAL_MS,
  shouldCheckForUpdate,
  isNewerVersion,
  formatUpdateMessage,
  // Internals (exported solo para tests; no son API publica)
  _parseSemver: parseSemver,
  _stripVPrefix: stripVPrefix
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoUpdater;
} else if (typeof window !== 'undefined') {
  window.AutoUpdater = AutoUpdater;
}

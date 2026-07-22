'use strict';

/**
 * Calendar service — W2 auto-pause para reuniones (.ics local).
 *
 * Parsea un archivo .ics exportado de Outlook / Apple Calendar / Google
 * Calendar y expone funciones puras para consultar eventos. Si la dep
 * `node-ical` esta disponible, se usa (sync API). Si no, hay un parser
 * minimo propio (regex sobre VEVENT) que cubre los 3 formatos de fecha
 * standard de iCal.
 *
 * Por que parser propio como fallback:
 *   - Cero deps en el "happy path" de un usuario que solo quiere probar W2
 *   - Defensa si npm install de node-ical falla por vuln / network / OS
 *
 * Por que deps inyectadas via try/catch lazy:
 *   - Permite tests sin instalar node-ical (forzando parseIcsMinimal)
 *   - La eleccion se hace 1 vez al cargar el modulo
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_LOOKAHEAD_MIN = 5;

// Carga lazy de node-ical. Si no esta instalado o falla al require,
// usamos el parser minimo propio.
let ical = null;
try {
  // eslint-disable-next-line global-require
  ical = require('node-ical');
} catch (_error) {
  ical = null;
}

/**
 * Parsea un archivo .ics y devuelve lista de eventos normalizados.
 * Lanza Error si el archivo no existe o no es un string.
 * @param {string} filePath
 * @returns {Array<{start: Date, end: Date, summary: string}>}
 */
function parseIcsFile(filePath) {
  if (typeof filePath !== 'string' || !filePath) {
    throw new Error('parseIcsFile: filePath debe ser un string no vacio');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`ICS file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (ical && typeof ical.sync !== 'undefined' && typeof ical.sync.parseICS === 'function') {
    return parseIcsWithNodeIcal(content);
  }
  return parseIcsMinimal(content);
}

/**
 * Parser usando node-ical (sync API). Normaliza los eventos al schema comun.
 */
function parseIcsWithNodeIcal(content) {
  const parsed = ical.sync.parseICS(content);
  const events = [];
  for (const key of Object.keys(parsed)) {
    const ev = parsed[key];
    if (!ev || ev.type !== 'VEVENT') continue;
    if (!ev.start || !ev.end) continue;
    events.push({
      start: toDate(ev.start),
      end: toDate(ev.end),
      summary: typeof ev.summary === 'string' && ev.summary ? ev.summary : '(sin titulo)'
    });
  }
  return events;
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Parser minimo propio (regex sobre bloques VEVENT). Cubre los 3 formatos
 * standard de DTSTART/DTEND:
 *   - YYYYMMDD (all-day)
 *   - YYYYMMDDTHHMMSS (local time)
 *   - YYYYMMDDTHHMMSSZ (UTC)
 * Ignora silenciosamente eventos mal formados.
 *
 * @param {string} content - contenido completo del .ics
 * @returns {Array<{start: Date, end: Date, summary: string}>}
 */
function parseIcsMinimal(content) {
  if (typeof content !== 'string' || !content) return [];
  const events = [];
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match;
  while ((match = re.exec(content)) !== null) {
    const block = match[1];
    const startMatch = block.match(/DTSTART(?:;[^:\n]+)?:([^\r\n]+)/i);
    const endMatch = block.match(/DTEND(?:;[^:\n]+)?:([^\r\n]+)/i);
    const summaryMatch = block.match(/SUMMARY(?:;[^:\n]+)?:([^\r\n]+)/i);
    if (!startMatch || !endMatch) continue;
    try {
      const start = parseIcsDate(startMatch[1].trim());
      const end = parseIcsDate(endMatch[1].trim());
      // sanity check: end > start
      if (!(end instanceof Date) || end.getTime() <= start.getTime()) continue;
      let summary = summaryMatch ? summaryMatch[1].trim() : '(sin titulo)';
      // Outlook a veces wrappea lineas con \n + space (line folding por RFC 5545).
      // Para mantener el parser simple, solo manejamos el summary sin folding.
      // (node-ical si maneja folding nativamente, asi que el fallback es best-effort.)
      if (!summary) summary = '(sin titulo)';
      events.push({ start, end, summary });
    } catch (_error) {
      // skip malformed event
    }
  }
  return events;
}

/**
 * Parsea un string de fecha iCal en Date. Soporta:
 *   - "20260101" (all-day, UTC midnight)
 *   - "20260101T090000" (local time, naive — treated as UTC for consistency)
 *   - "20260101T090000Z" (UTC)
 *
 * @param {string} str
 * @returns {Date}
 */
function parseIcsDate(str) {
  if (typeof str !== 'string' || !str) {
    throw new Error('parseIcsDate: str vacio');
  }
  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(str)) {
    const y = +str.slice(0, 4);
    const mo = +str.slice(4, 6) - 1;
    const d = +str.slice(6, 8);
    return new Date(Date.UTC(y, mo, d));
  }
  // UTC o naive: YYYYMMDDTHHMMSS[Z]
  const m = str.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) {
    throw new Error(`Invalid date format: ${str}`);
  }
  const y = +m[1];
  const mo = +m[2] - 1;
  const d = +m[3];
  const h = +m[4];
  const mi = +m[5];
  const s = +m[6];
  // Si tiene Z, es UTC. Si no, lo tratamos como UTC tambien para
  // consistencia (los .ics suelen venir en TZ del usuario pero parsear
  // TZID requiere otra capa de complejidad que node-ical maneja; nuestro
  // fallback es best-effort).
  return new Date(Date.UTC(y, mo, d, h, mi, s));
}

/**
 * Devuelve el primer evento que empieza en [now, now + lookaheadMin] minutos.
 * @param {Array} events
 * @param {Date} now
 * @param {number} [lookaheadMin=5]
 * @returns {object|null}
 */
function getNextEvent(events, now, lookaheadMin = DEFAULT_LOOKAHEAD_MIN) {
  if (!Array.isArray(events) || !now) return null;
  if (typeof now.getTime !== 'function') return null;
  if (typeof lookaheadMin !== 'number' || lookaheadMin < 0) lookaheadMin = 0;
  const horizon = new Date(now.getTime() + lookaheadMin * 60 * 1000);
  const nowMs = now.getTime();
  const horizonMs = horizon.getTime();
  const upcoming = [];
  for (const ev of events) {
    if (!(ev.start instanceof Date)) continue;
    const startMs = ev.start.getTime();
    if (startMs >= nowMs && startMs <= horizonMs) {
      upcoming.push(ev);
    }
  }
  upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
  return upcoming[0] || null;
}

/**
 * Devuelve true si el evento esta activo en este momento
 * (now >= start AND now < end). Eventos que ya terminaron no cuentan.
 * @param {object} event
 * @param {Date} now
 * @returns {boolean}
 */
function isEventActive(event, now) {
  if (!event || !now) return false;
  if (!(event.start instanceof Date) || !(event.end instanceof Date)) return false;
  if (typeof now.getTime !== 'function') return false;
  const nowMs = now.getTime();
  return nowMs >= event.start.getTime() && nowMs < event.end.getTime();
}

/**
 * Devuelve el evento activo en `now` o null si no hay ninguno.
 * Helper sobre isEventActive.
 * @param {Array} events
 * @param {Date} now
 * @returns {object|null}
 */
function getActiveEvent(events, now) {
  if (!Array.isArray(events) || !now) return null;
  for (const ev of events) {
    if (isEventActive(ev, now)) return ev;
  }
  return null;
}

/**
 * Observa un archivo .ics y llama onChange cuando cambia.
 * Devuelve un handle con `close()` para limpiar.
 * Si el path no existe o su dir no existe, devuelve un handle no-op.
 * Si fs.watch no esta disponible (sandbox), devuelve un handle no-op.
 *
 * @param {string} filePath
 * @param {function} onChange
 * @returns {{close: function}}
 */
function watchIcsFile(filePath, onChange) {
  if (typeof filePath !== 'string' || !filePath) {
    return { close: () => {} };
  }
  if (typeof onChange !== 'function') {
    return { close: () => {} };
  }
  let dir;
  try {
    dir = path.dirname(filePath);
  } catch (_e) {
    return { close: () => {} };
  }
  if (!fs.existsSync(dir)) {
    return { close: () => {} };
  }
  let watcher = null;
  try {
    watcher = fs.watch(filePath, { persistent: false }, () => {
      try { onChange(); } catch (_e) { /* swallow */ }
    });
  } catch (_error) {
    return { close: () => {} };
  }
  return {
    close() {
      if (watcher) {
        try { watcher.close(); } catch (_e) { /* swallow */ }
        watcher = null;
      }
    }
  };
}

module.exports = {
  parseIcsFile,
  parseIcsMinimal,
  parseIcsWithNodeIcal,
  parseIcsDate,
  getNextEvent,
  isEventActive,
  getActiveEvent,
  watchIcsFile,
  DEFAULT_LOOKAHEAD_MIN
};

'use strict';

/**
 * Weekly report — pure functions para el reporte semanal de productividad (W3).
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Calcular el rango de la semana (lunes a domingo, o domingo a sabado)
 *   - Filtrar sesiones y capturas por rango
 *   - Construir el reporte agregado (pomodoro + capturas + racha + score)
 *   - Formatear como markdown
 *   - Calcular el score de productividad (heuristica documentada)
 *
 * Diseno:
 *   - weekStart parametro: 'monday' (default) o 'sunday'. Locale flexible.
 *   - Por dia usa la key corta (mon, tue, ...) para que el formato markdown
 *     sea estable independiente del locale del usuario.
 *   - Score es ORIENTATIVO. La formula esta documentada en
 *     computeProductivityScore. Cambiar la formula = cambiar la documentacion.
 *
 * Uso:
 *   - src/core/weekly-report.js (este archivo) — pure
 *   - main.js — IPC handler weekly-report:get llama buildWeeklyReport +
 *     formatReportAsMarkdown con datos reales de pomodoro-store y quick-captures
 *   - src/dashboard-renderer.js — muestra el markdown en el modal "Reporte semanal"
 */

const DAY_KEYS_MONDAY_FIRST = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_KEYS_SUNDAY_FIRST = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS_ES = {
  mon: 'lun', tue: 'mar', wed: 'mie', thu: 'jue', fri: 'vie', sat: 'sab', sun: 'dom'
};
const MONTH_LABELS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// --- Week range ---

/**
 * Calcula el rango de la semana que contiene `today`. Por default arranca
 * el lunes y termina el domingo 23:59:59.999 (inclusive).
 *
 * @param {Date} [today=new Date()]
 * @param {'monday'|'sunday'} [weekStart='monday']
 * @returns {{start: Date, end: Date}}
 */
function getWeekRange(today = new Date(), weekStart = 'monday') {
  const ref = today instanceof Date ? new Date(today.getTime()) : new Date();
  const startDayIndex = weekStart === 'sunday' ? 0 : 1; // 0=Sun, 1=Mon, ...

  // getDay() returns 0 (Sun) to 6 (Sat)
  const currentDay = ref.getDay();
  let diff;
  if (weekStart === 'sunday') {
    diff = currentDay; // days since Sunday
  } else {
    diff = (currentDay + 6) % 7; // days since Monday
  }

  const start = new Date(ref.getTime());
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);

  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Etiqueta legible del rango, ej "Semana del 14/07 al 20/07".
 * @param {Date} start
 * @param {Date} end
 * @returns {string}
 */
function formatPeriodLabel(start, end) {
  return `Semana del ${pad2(start.getDate())}/${pad2(start.getMonth() + 1)} al ${pad2(end.getDate())}/${pad2(end.getMonth() + 1)}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// --- Filters ---

/**
 * Filtra sesiones cuyo startedAt cae dentro de [start, end].
 * Acepta startedAt como number (ms) o string ISO.
 *
 * @param {Array<{startedAt: number|string, kind?: string}>} sessions
 * @param {Date} start
 * @param {Date} end
 * @returns {Array}
 */
function filterSessionsByRange(sessions, start, end) {
  if (!Array.isArray(sessions) || sessions.length === 0) return [];
  if (!(start instanceof Date) || !(end instanceof Date)) return [];
  const startMs = start.getTime();
  const endMs = end.getTime();
  return sessions.filter(s => {
    if (!s || typeof s.startedAt !== 'number' && typeof s.startedAt !== 'string') return false;
    const t = typeof s.startedAt === 'number' ? s.startedAt : new Date(s.startedAt).getTime();
    if (!Number.isFinite(t)) return false;
    return t >= startMs && t <= endMs;
  });
}

/**
 * Filtra capturas cuyo createdAt cae dentro de [start, end].
 *
 * @param {Array<{createdAt: number|string, text?: string}>} captures
 * @param {Date} start
 * @param {Date} end
 * @returns {Array}
 */
function filterCapturesByRange(captures, start, end) {
  if (!Array.isArray(captures) || captures.length === 0) return [];
  if (!(start instanceof Date) || !(end instanceof Date)) return [];
  const startMs = start.getTime();
  const endMs = end.getTime();
  return captures.filter(c => {
    if (!c || typeof c.createdAt !== 'number' && typeof c.createdAt !== 'string') return false;
    const t = typeof c.createdAt === 'number' ? c.createdAt : new Date(c.createdAt).getTime();
    if (!Number.isFinite(t)) return false;
    return t >= startMs && t <= endMs;
  });
}

// --- Aggregations ---

/**
 * Cuenta focus blocks y suma focus seconds por dia de la semana.
 * Considera solo sesiones de kind 'focus' (ignora breaks).
 *
 * @param {Array<{startedAt: number|string, kind?: string, durationSec?: number}>} sessions
 * @param {Date} start
 * @param {Date} end
 * @param {'monday'|'sunday'} [weekStart='monday']
 * @returns {{focusBlocks: number, totalFocusSeconds: number, byDay: Object}}
 */
function aggregateFocusByDay(sessions, start, end, weekStart = 'monday') {
  const dayKeys = weekStart === 'sunday' ? DAY_KEYS_SUNDAY_FIRST : DAY_KEYS_MONDAY_FIRST;
  const byDay = {};
  for (const k of dayKeys) byDay[k] = 0;

  const inRange = filterSessionsByRange(sessions, start, end);
  let focusBlocks = 0;
  let totalFocusSeconds = 0;
  for (const s of inRange) {
    const kind = typeof s.kind === 'string' ? s.kind : 'focus';
    if (kind !== 'focus') continue;
    focusBlocks++;
    const dur = typeof s.durationSec === 'number' && s.durationSec >= 0 ? s.durationSec : 0;
    totalFocusSeconds += dur;
    const t = typeof s.startedAt === 'number' ? s.startedAt : new Date(s.startedAt).getTime();
    const d = new Date(t);
    // Map local weekday to day key
    const dayIdx = d.getDay(); // 0=Sun ... 6=Sat
    let key;
    if (weekStart === 'sunday') {
      key = DAY_KEYS_SUNDAY_FIRST[dayIdx];
    } else {
      // Monday-first: shift so Monday=0
      const shifted = (dayIdx + 6) % 7;
      key = DAY_KEYS_MONDAY_FIRST[shifted];
    }
    byDay[key] = (byDay[key] || 0) + 1;
  }
  return { focusBlocks, totalFocusSeconds, byDay };
}

/**
 * Selecciona las N capturas mas largas de la semana (por length del texto).
 * Si hay menos de N, retorna todas.
 *
 * @param {Array<{text: string}>} captures
 * @param {number} [topN=5]
 * @returns {string[]}
 */
function topCapturesByLength(captures, topN = 5) {
  if (!Array.isArray(captures) || captures.length === 0) return [];
  const sorted = [...captures]
    .filter(c => c && typeof c.text === 'string')
    .sort((a, b) => b.text.length - a.text.length);
  return sorted.slice(0, topN).map(c => c.text);
}

// --- Score ---

/**
 * Calculo del score de productividad. Heuristica documentada:
 *
 *   score = min(100,
 *     focusBlocks * 5                         // cada focus block suma 5
 *     + min(20, streak * 2)                   // racha actual suma hasta 20
 *     + min(15, floor(totalFocusSeconds / 3600) * 3)  // horas focus suma hasta 15
 *   )
 *
 * Cap a 100. Esta formula es ORIENTATIVA — el plan dice explicitamente
 * "score fake, no se muestra como calificacion oficial". El texto en el
 * markdown lo aclara tambien ("orientativo").
 *
 * @param {{focusBlocks?: number, totalFocusSeconds?: number, streak?: number, longestStreak?: number}} input
 * @returns {number}
 */
function computeProductivityScore(input) {
  if (!input || typeof input !== 'object') return 0;
  const focusBlocks = typeof input.focusBlocks === 'number' && input.focusBlocks >= 0 ? input.focusBlocks : 0;
  const totalFocusSeconds = typeof input.totalFocusSeconds === 'number' && input.totalFocusSeconds >= 0 ? input.totalFocusSeconds : 0;
  const streak = typeof input.streak === 'number' && input.streak >= 0 ? input.streak : 0;

  const blocksScore = focusBlocks * 5;
  const streakScore = Math.min(20, streak * 2);
  const hoursScore = Math.min(15, Math.floor(totalFocusSeconds / 3600) * 3);
  return Math.min(100, blocksScore + streakScore + hoursScore);
}

/**
 * Etiqueta humana para un score 0-100.
 *
 * @param {number} score
 * @returns {string}
 */
function getScoreLabel(score) {
  const s = typeof score === 'number' && score >= 0 ? Math.floor(score) : 0;
  if (s <= 20) return 'empezando';
  if (s <= 40) return 'en ritmo';
  if (s <= 60) return 'bien encaminado';
  if (s <= 80) return 'muy bien';
  return 'crack';
}

// --- Build report ---

/**
 * Construye el reporte semanal agregado. Toma los datos crudos (sesiones,
 * capturas) y el contexto (racha, weekStart) y retorna un objeto listo
 * para serializar a JSON o pasar por formatReportAsMarkdown.
 *
 * @param {object} input
 * @param {Array} input.sessions
 * @param {Array} input.captures
 * @param {number} [input.streak=0]
 * @param {number} [input.longestStreak=0]
 * @param {'monday'|'sunday'} [input.weekStart='monday']
 * @param {Date} [input.today=new Date()]
 * @param {string} [input.petType='cat'] // unused por ahora, queda para tono
 * @returns {object}
 */
function buildWeeklyReport(input = {}) {
  const sessions = Array.isArray(input.sessions) ? input.sessions : [];
  const captures = Array.isArray(input.captures) ? input.captures : [];
  const streak = typeof input.streak === 'number' && input.streak >= 0 ? input.streak : 0;
  const longestStreak = typeof input.longestStreak === 'number' && input.longestStreak >= 0 ? input.longestStreak : 0;
  const weekStart = input.weekStart === 'sunday' ? 'sunday' : 'monday';
  const today = input.today instanceof Date ? input.today : new Date();

  const { start, end } = getWeekRange(today, weekStart);
  const { focusBlocks, totalFocusSeconds, byDay } = aggregateFocusByDay(sessions, start, end, weekStart);
  const inRangeCaptures = filterCapturesByRange(captures, start, end);
  const top = topCapturesByLength(inRangeCaptures, 5);

  const score = computeProductivityScore({ focusBlocks, totalFocusSeconds, streak });

  return {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatPeriodLabel(start, end)
    },
    pomodoro: {
      focusBlocks,
      totalFocusSeconds,
      byDay
    },
    captures: {
      count: inRangeCaptures.length,
      top
    },
    streak: {
      current: streak,
      longest: longestStreak
    },
    score
  };
}

// --- Format markdown ---

/**
 * Formatea el reporte como markdown legible.
 * @param {object} report
 * @returns {string}
 */
function formatReportAsMarkdown(report) {
  if (!report || typeof report !== 'object') return '';
  const lines = [];
  lines.push('# Reporte Semanal — Mascota Virtual');
  lines.push('');
  lines.push(`**Período**: ${report.period?.label || ''}`);
  lines.push('');

  // Pomodoro
  lines.push('## Pomodoro');
  const focusBlocks = report.pomodoro?.focusBlocks || 0;
  lines.push(`- Focus blocks completados: ${focusBlocks}`);
  const focusTime = formatHM(report.pomodoro?.totalFocusSeconds || 0);
  lines.push(`- Tiempo total en focus: ${focusTime}`);
  const byDay = report.pomodoro?.byDay || {};
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = dayOrder.map(k => `${DAY_LABELS_ES[k] || k} ${byDay[k] || 0}`).join(', ');
  lines.push(`- Por día: ${dayLabels}`);
  lines.push('');

  // Capturas
  lines.push('## Capturas');
  const capturesCount = report.captures?.count || 0;
  lines.push(`- Total: ${capturesCount} idea${capturesCount === 1 ? '' : 's'}`);
  const top = Array.isArray(report.captures?.top) ? report.captures.top : [];
  if (top.length > 0) {
    lines.push(`- Top ${top.length}:`);
    for (const t of top) {
      lines.push(`  - "${escapeMd(t)}"`);
    }
  }
  lines.push('');

  // Racha
  lines.push('## Racha');
  const cur = report.streak?.current || 0;
  const longest = report.streak?.longest || 0;
  lines.push(`- Actual: ${cur} día${cur === 1 ? '' : 's'}`);
  lines.push(`- Mejor: ${longest} día${longest === 1 ? '' : 's'}`);
  lines.push('');

  // Score
  const score = typeof report.score === 'number' ? report.score : 0;
  const label = getScoreLabel(score);
  lines.push('## Score de productividad');
  lines.push(`**${score}/100** — ${label} _(orientativo)_`);

  return lines.join('\n');
}

/**
 * Formatea segundos como "Xh Ym" o "Ym" si < 1h.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatHM(totalSeconds) {
  const s = typeof totalSeconds === 'number' && totalSeconds >= 0 ? Math.floor(totalSeconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * Escapa comillas dobles en markdown (basico, suficiente para Top X).
 * No escapa saltos de linea en captura porque ya vienen sanitizadas al
 * persistirse (validateCaptureText trimea y limita longitud).
 */
function escapeMd(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/"/g, '\\"');
}

// UMD-lite
const WeeklyReport = {
  DAY_KEYS_MONDAY_FIRST,
  DAY_KEYS_SUNDAY_FIRST,
  DAY_LABELS_ES,
  MONTH_LABELS_ES,
  getWeekRange,
  formatPeriodLabel,
  filterSessionsByRange,
  filterCapturesByRange,
  aggregateFocusByDay,
  topCapturesByLength,
  computeProductivityScore,
  getScoreLabel,
  buildWeeklyReport,
  formatReportAsMarkdown,
  formatHM
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeeklyReport;
} else if (typeof window !== 'undefined') {
  window.WeeklyReport = WeeklyReport;
}

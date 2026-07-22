'use strict';

const fs = require('fs');
const path = require('path');
const {
  getLocalDateKey,
  computeStreak
} = require('../core/pomodoro-streak');

/**
 * Pomodoro store — persistencia de config y sesiones del timer.
 *
 * 2 archivos JSON en `<userData>`:
 *   - `pomodoro-config.json`: plantilla seleccionada + custom values
 *     Schema: {version, templateId, customFocusMin, customBreakMin,
 *              customLongBreakMin, customLongBreakEvery}
 *   - `pomodoro-sessions.json`: sesiones completadas
 *     Schema: {version, sessions: [{kind, durationSec, startedAt, endedAt}]}
 *
 * Si el archivo no existe o esta corrupto, retorna estado inicial.
 *
 * Por que 2 archivos y no 1:
 *   - Config cambia cuando el usuario toca el dropdown (poco frecuente,
 *     baja cardinalidad)
 *   - Sessions se appenda cada vez que termina un pomodoro (muy
 *     frecuente, alta cardinalidad)
 *   - Separarlos permite atomicidad: un append corrupto no invalida
 *     la config, y viceversa.
 *
 * Por que prune a 90 dias:
 *   - 90 dias = 3 meses. Suficiente para "esta semana" + "este mes" +
 *     "rachas de 60-100 dias" + un poco de historia.
 *   - Mas alla, no nos sirve para stats y solo ocupa disco.
 */

const FILE_VERSION = 1;

const SESSION_RETENTION_DAYS = 90;
const SESSION_RETENTION_MS = SESSION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const VALID_KINDS = new Set(['focus', 'short_break', 'long_break']);

// --- Config store ---

function getConfigPath(userDataDir) {
  return path.join(userDataDir, 'pomodoro-config.json');
}

function createInitialConfig() {
  return {
    version: FILE_VERSION,
    templateId: 'classic',
    customFocusMin: 25,
    customBreakMin: 5,
    customLongBreakMin: 15,
    customLongBreakEvery: 4
  };
}

function isValidConfig(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (typeof obj.templateId !== 'string' || obj.templateId.length === 0) return false;
  const numericFields = ['customFocusMin', 'customBreakMin', 'customLongBreakMin', 'customLongBreakEvery'];
  for (const f of numericFields) {
    if (typeof obj[f] !== 'number' || !Number.isFinite(obj[f])) return false;
  }
  return true;
}

function loadConfig(deps) {
  const userDataDir = deps?.userDataDir;
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialConfig();
  }
  const filePath = getConfigPath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return createInitialConfig();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidConfig(parsed)) return createInitialConfig();
    return { ...parsed };
  } catch (_e) {
    return createInitialConfig();
  }
}

function saveConfig(deps, config) {
  const userDataDir = deps?.userDataDir;
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (!isValidConfig(config)) {
    throw new Error('config de pomodoro invalida');
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  const filePath = getConfigPath(userDataDir);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(
    tmpPath,
    JSON.stringify({ ...config, version: FILE_VERSION }, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
  fs.renameSync(tmpPath, filePath);
}

// --- Sessions store ---

function getSessionsPath(userDataDir) {
  return path.join(userDataDir, 'pomodoro-sessions.json');
}

function createInitialSessions() {
  return {
    version: FILE_VERSION,
    sessions: []
  };
}

function isValidSession(session) {
  if (!session || typeof session !== 'object') return false;
  if (!VALID_KINDS.has(session.kind)) return false;
  if (typeof session.durationSec !== 'number' || !Number.isFinite(session.durationSec)) return false;
  if (session.durationSec < 0 || session.durationSec > 24 * 60 * 60) return false;
  if (typeof session.startedAt !== 'number' || !Number.isFinite(session.startedAt)) return false;
  if (typeof session.endedAt !== 'number' || !Number.isFinite(session.endedAt)) return false;
  return true;
}

function isValidSessionsStore(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (!Array.isArray(obj.sessions)) return false;
  return true;
}

function pruneOldSessions(sessions, now = Date.now()) {
  if (!Array.isArray(sessions)) return [];
  const cutoff = now - SESSION_RETENTION_MS;
  return sessions.filter(s => s && typeof s.endedAt === 'number' && s.endedAt >= cutoff);
}

function loadSessions(deps) {
  const userDataDir = deps?.userDataDir;
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialSessions();
  }
  const filePath = getSessionsPath(userDataDir);
  try {
    if (!fs.existsSync(filePath)) return createInitialSessions();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidSessionsStore(parsed)) return createInitialSessions();
    // Filtrar invalidos + prune a 90 dias
    const valid = parsed.sessions.filter(isValidSession);
    const pruned = pruneOldSessions(valid);
    return { version: FILE_VERSION, sessions: pruned };
  } catch (_e) {
    return createInitialSessions();
  }
}

function saveSessions(deps, store) {
  const userDataDir = deps?.userDataDir;
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('userDataDir es requerido');
  }
  if (!isValidSessionsStore(store)) {
    throw new Error('store de sesiones invalido');
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  const filePath = getSessionsPath(userDataDir);
  const tmpPath = filePath + '.tmp';
  const valid = store.sessions.filter(isValidSession);
  const pruned = pruneOldSessions(valid);
  fs.writeFileSync(
    tmpPath,
    JSON.stringify({ version: FILE_VERSION, sessions: pruned }, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
  fs.renameSync(tmpPath, filePath);
}

function appendSession(deps, session) {
  if (!isValidSession(session)) {
    return { added: false, reason: 'invalid' };
  }
  const store = loadSessions(deps);
  store.sessions.push({ ...session });
  // Aplica prune antes de persistir
  store.sessions = pruneOldSessions(store.sessions, session.endedAt || Date.now());
  saveSessions(deps, store);
  return { added: true, session: { ...session } };
}

// --- Stats ---

function getStatsToday(deps, today = new Date()) {
  const store = loadSessions(deps);
  const todayKey = getLocalDateKey(today);
  let focusCount = 0;
  let totalFocusSeconds = 0;
  let breakCount = 0;
  for (const s of store.sessions) {
    if (!isValidSession(s)) continue;
    const key = getLocalDateKey(new Date(s.startedAt));
    if (key !== todayKey) continue;
    if (s.kind === 'focus') {
      focusCount++;
      totalFocusSeconds += s.durationSec;
    } else {
      breakCount++;
    }
  }
  return { focusCount, totalFocusSeconds, breakCount };
}

function getWeekStart(today) {
  // weekStart='monday'. Devuelve un Date con la fecha del lunes de la
  // semana de `today` a las 00:00:00 hora local.
  const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const dow = dt.getDay(); // 0=domingo, 1=lunes, ..., 6=sabado
  const daysSinceMonday = (dow + 6) % 7; // lunes=0, martes=1, ..., domingo=6
  dt.setDate(dt.getDate() - daysSinceMonday);
  return dt;
}

function getWeekEndExclusive(today) {
  const start = getWeekStart(today);
  const end = new Date(start);
  end.setDate(end.getDate() + 7); // lunes 00:00 de la proxima semana
  return end;
}

const WEEKDAY_KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

function getStatsThisWeek(deps, today = new Date()) {
  const store = loadSessions(deps);
  const weekStart = getWeekStart(today);
  const weekEndExclusive = getWeekEndExclusive(today);
  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekEndExclusive.getTime();
  let focusCount = 0;
  let totalFocusSeconds = 0;
  const byDay = { lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0 };
  for (const s of store.sessions) {
    if (!isValidSession(s)) continue;
    if (s.kind !== 'focus') continue;
    if (s.startedAt < weekStartMs || s.startedAt >= weekEndMs) continue;
    focusCount++;
    totalFocusSeconds += s.durationSec;
    // startedAt puede caer en cualquier momento del dia. Tomamos el
    // dia local de startedAt y mapeamos al weekday key.
    const localDate = new Date(s.startedAt);
    const dayIndex = (localDate.getDay() + 6) % 7; // lunes=0, ..., domingo=6
    byDay[WEEKDAY_KEYS[dayIndex]] += 1;
  }
  return { focusCount, totalFocusSeconds, byDay };
}

function getCompletedDays(deps, today = new Date(), daysBack = 30) {
  const store = loadSessions(deps);
  // Construimos mapa dateKey -> focusCount
  const counts = new Map();
  for (const s of store.sessions) {
    if (!isValidSession(s)) continue;
    if (s.kind !== 'focus') continue;
    const key = getLocalDateKey(new Date(s.startedAt));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  // Generamos los ultimos N dias
  const result = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
  for (let i = 0; i < daysBack; i++) {
    const key = getLocalDateKey(cursor);
    const focusCount = counts.get(key) || 0;
    if (focusCount > 0) {
      result.push({ date: key, focusCount });
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  // Ordenar por fecha ascendente (mas viejo primero, util para computeStreak)
  result.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

function getCurrentStreak(deps, today = new Date()) {
  const completed = getCompletedDays(deps, today, 100);
  return computeStreak(completed, today);
}

// --- Cleanup ---

function clearConfigFile(userDataDir) {
  const filePath = getConfigPath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* ok */ }
}

function clearSessionsFile(userDataDir) {
  const filePath = getSessionsPath(userDataDir);
  try { fs.unlinkSync(filePath); } catch (_e) { /* ok */ }
}

module.exports = {
  FILE_VERSION,
  SESSION_RETENTION_DAYS,

  // Config
  getConfigPath,
  createInitialConfig,
  isValidConfig,
  loadConfig,
  saveConfig,
  clearConfigFile,

  // Sessions
  getSessionsPath,
  createInitialSessions,
  isValidSession,
  isValidSessionsStore,
  pruneOldSessions,
  loadSessions,
  saveSessions,
  appendSession,

  // Stats
  getStatsToday,
  getStatsThisWeek,
  getCompletedDays,
  getCurrentStreak,

  // Cleanup
  clearSessionsFile
};

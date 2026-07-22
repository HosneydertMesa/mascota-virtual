'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  FILE_VERSION,
  SESSION_RETENTION_DAYS,
  getConfigPath,
  getSessionsPath,
  createInitialConfig,
  isValidConfig,
  loadConfig,
  saveConfig,
  clearConfigFile,
  createInitialSessions,
  isValidSession,
  isValidSessionsStore,
  pruneOldSessions,
  loadSessions,
  saveSessions,
  appendSession,
  getStatsToday,
  getStatsThisWeek,
  getCompletedDays,
  getCurrentStreak,
  clearSessionsFile
} = require('../src/services/pomodoro-store');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pet-pomodoro-test-'));
}

function cleanupTmpDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ok */ }
}

const depsFor = (dir) => ({ userDataDir: dir });

// --- Constantes y paths ---

test('FILE_VERSION es 1', () => {
  assert.equal(FILE_VERSION, 1);
});

test('SESSION_RETENTION_DAYS es 90', () => {
  assert.equal(SESSION_RETENTION_DAYS, 90);
});

test('getConfigPath retorna <userData>/pomodoro-config.json', () => {
  assert.equal(getConfigPath('C:/x'), path.join('C:/x', 'pomodoro-config.json'));
});

test('getSessionsPath retorna <userData>/pomodoro-sessions.json', () => {
  assert.equal(getSessionsPath('C:/x'), path.join('C:/x', 'pomodoro-sessions.json'));
});

// --- createInitialConfig / isValidConfig ---

test('createInitialConfig: defaults sane', () => {
  const c = createInitialConfig();
  assert.equal(c.version, FILE_VERSION);
  assert.equal(c.templateId, 'classic');
  assert.equal(c.customFocusMin, 25);
  assert.equal(c.customBreakMin, 5);
  assert.equal(c.customLongBreakMin, 15);
  assert.equal(c.customLongBreakEvery, 4);
  assert.equal(isValidConfig(c), true);
});

test('isValidConfig: rechaza invalidos', () => {
  assert.equal(isValidConfig(null), false);
  assert.equal(isValidConfig({}), false);
  assert.equal(isValidConfig({ version: FILE_VERSION, templateId: '', customFocusMin: 25 }), false);
  assert.equal(isValidConfig({ version: 99, templateId: 'x', customFocusMin: 25, customBreakMin: 5, customLongBreakMin: 15, customLongBreakEvery: 4 }), false);
  assert.equal(isValidConfig({ version: FILE_VERSION, templateId: 'x', customFocusMin: '25', customBreakMin: 5, customLongBreakMin: 15, customLongBreakEvery: 4 }), false);
});

// --- loadConfig / saveConfig ---

test('loadConfig: deps invalido → defaults', () => {
  assert.equal(loadConfig(null).templateId, 'classic');
  assert.equal(loadConfig({}).templateId, 'classic');
});

test('loadConfig: archivo no existe → defaults', () => {
  const dir = makeTmpDir();
  try {
    const c = loadConfig(depsFor(dir));
    assert.equal(c.templateId, 'classic');
  } finally { cleanupTmpDir(dir); }
});

test('loadConfig: archivo corrupto → defaults (no crashea)', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getConfigPath(dir), '{ esto no es json', 'utf8');
    const c = loadConfig(depsFor(dir));
    assert.equal(c.templateId, 'classic');
  } finally { cleanupTmpDir(dir); }
});

test('saveConfig + loadConfig: roundtrip', () => {
  const dir = makeTmpDir();
  try {
    const c = createInitialConfig();
    c.templateId = 'deep-work';
    c.customFocusMin = 45;
    c.customBreakMin = 12;
    saveConfig(depsFor(dir), c);
    const loaded = loadConfig(depsFor(dir));
    assert.equal(loaded.templateId, 'deep-work');
    assert.equal(loaded.customFocusMin, 45);
    assert.equal(loaded.customBreakMin, 12);
  } finally { cleanupTmpDir(dir); }
});

test('saveConfig: directorio se crea si no existe', () => {
  const dir = path.join(os.tmpdir(), 'pet-pomodoro-test-' + Date.now() + '-new');
  try {
    saveConfig(depsFor(dir), createInitialConfig());
    assert.ok(fs.existsSync(getConfigPath(dir)));
  } finally { cleanupTmpDir(dir); }
});

test('saveConfig: rechaza deps invalido', () => {
  assert.throws(() => saveConfig(null, createInitialConfig()), /requerido/);
  assert.throws(() => saveConfig({}, createInitialConfig()), /requerido/);
});

test('saveConfig: rechaza config invalida', () => {
  const dir = makeTmpDir();
  try {
    assert.throws(() => saveConfig(depsFor(dir), null), /invalida/);
    assert.throws(() => saveConfig(depsFor(dir), { version: 99 }), /invalida/);
  } finally { cleanupTmpDir(dir); }
});

test('clearConfigFile: elimina el archivo', () => {
  const dir = makeTmpDir();
  try {
    saveConfig(depsFor(dir), createInitialConfig());
    assert.ok(fs.existsSync(getConfigPath(dir)));
    clearConfigFile(dir);
    assert.ok(!fs.existsSync(getConfigPath(dir)));
  } finally { cleanupTmpDir(dir); }
});

// --- createInitialSessions / isValidSession ---

test('createInitialSessions: store vacio', () => {
  const s = createInitialSessions();
  assert.equal(s.version, FILE_VERSION);
  assert.deepEqual(s.sessions, []);
});

test('isValidSession: acepta focus, short_break, long_break', () => {
  assert.equal(isValidSession({ kind: 'focus', durationSec: 1500, startedAt: 1000, endedAt: 2500 }), true);
  assert.equal(isValidSession({ kind: 'short_break', durationSec: 300, startedAt: 1000, endedAt: 1300 }), true);
  assert.equal(isValidSession({ kind: 'long_break', durationSec: 900, startedAt: 1000, endedAt: 1900 }), true);
});

test('isValidSession: rechaza kind invalido', () => {
  assert.equal(isValidSession({ kind: 'invalid', durationSec: 100, startedAt: 1, endedAt: 2 }), false);
  assert.equal(isValidSession({ durationSec: 100, startedAt: 1, endedAt: 2 }), false);
});

test('isValidSession: rechaza durationSec fuera de rango', () => {
  assert.equal(isValidSession({ kind: 'focus', durationSec: -1, startedAt: 1, endedAt: 2 }), false);
  assert.equal(isValidSession({ kind: 'focus', durationSec: '100', startedAt: 1, endedAt: 2 }), false);
  assert.equal(isValidSession({ kind: 'focus', durationSec: 100, startedAt: 1, endedAt: 2 }), true);
});

test('isValidSession: rechaza startedAt/endedAt invalidos', () => {
  assert.equal(isValidSession({ kind: 'focus', durationSec: 100, startedAt: 'x', endedAt: 2 }), false);
  assert.equal(isValidSession({ kind: 'focus', durationSec: 100, startedAt: 1, endedAt: 'x' }), false);
});

test('isValidSessionsStore: rechaza estructura invalida', () => {
  assert.equal(isValidSessionsStore(null), false);
  assert.equal(isValidSessionsStore({}), false);
  assert.equal(isValidSessionsStore({ version: 99, sessions: [] }), false);
  assert.equal(isValidSessionsStore({ version: FILE_VERSION, sessions: 'no' }), false);
  assert.equal(isValidSessionsStore({ version: FILE_VERSION, sessions: [] }), true);
});

// --- pruneOldSessions ---

test('pruneOldSessions: descarta sesiones con endedAt < now - 90d', () => {
  const now = 1_000_000_000_000;
  const ninetyOneDaysAgo = now - 91 * 24 * 60 * 60 * 1000;
  const sessions = [
    { kind: 'focus', durationSec: 1500, startedAt: ninetyOneDaysAgo, endedAt: ninetyOneDaysAgo + 1500 },
    { kind: 'focus', durationSec: 1500, startedAt: now - 1000, endedAt: now }
  ];
  const pruned = pruneOldSessions(sessions, now);
  assert.equal(pruned.length, 1);
  assert.equal(pruned[0].endedAt, now);
});

// --- loadSessions / saveSessions ---

test('loadSessions: deps invalido → store inicial', () => {
  const s = loadSessions(null);
  assert.equal(s.sessions.length, 0);
});

test('loadSessions: archivo no existe → store inicial', () => {
  const dir = makeTmpDir();
  try {
    const s = loadSessions(depsFor(dir));
    assert.equal(s.sessions.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('loadSessions: archivo corrupto → store inicial (no crashea)', () => {
  const dir = makeTmpDir();
  try {
    fs.writeFileSync(getSessionsPath(dir), '{ invalid', 'utf8');
    const s = loadSessions(depsFor(dir));
    assert.equal(s.sessions.length, 0);
  } finally { cleanupTmpDir(dir); }
});

test('loadSessions: descarta sesiones invalidas y prunea a 90d', () => {
  const dir = makeTmpDir();
  try {
    const now = Date.now();
    const old = now - 100 * 24 * 60 * 60 * 1000; // 100 dias atras
    const fresh = now - 1000;
    const data = {
      version: FILE_VERSION,
      sessions: [
        { kind: 'focus', durationSec: 1500, startedAt: old, endedAt: old + 1500 }, // viejo, se prunea
        { kind: 'invalid', durationSec: 100, startedAt: fresh, endedAt: fresh + 100 }, // invalido
        { kind: 'focus', durationSec: 1500, startedAt: fresh, endedAt: fresh + 1500 } // fresco
      ]
    };
    fs.writeFileSync(getSessionsPath(dir), JSON.stringify(data), 'utf8');
    const loaded = loadSessions(depsFor(dir));
    assert.equal(loaded.sessions.length, 1);
    assert.equal(loaded.sessions[0].kind, 'focus');
  } finally { cleanupTmpDir(dir); }
});

// --- appendSession ---

test('appendSession: agrega sesion valida', () => {
  const dir = makeTmpDir();
  try {
    const now = Date.now();
    const result = appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: now - 1500, endedAt: now });
    assert.equal(result.added, true);
    const loaded = loadSessions(depsFor(dir));
    assert.equal(loaded.sessions.length, 1);
    assert.equal(loaded.sessions[0].kind, 'focus');
  } finally { cleanupTmpDir(dir); }
});

test('appendSession: rechaza sesion invalida', () => {
  const dir = makeTmpDir();
  try {
    const result = appendSession(depsFor(dir), { kind: 'invalid', durationSec: 100, startedAt: 1, endedAt: 2 });
    assert.equal(result.added, false);
    assert.equal(result.reason, 'invalid');
  } finally { cleanupTmpDir(dir); }
});

test('appendSession: prunea al insertar si la sesion es muy vieja (consistente con load)', () => {
  const dir = makeTmpDir();
  try {
    // Sesion de hace 100 dias
    const old = Date.now() - 100 * 24 * 60 * 60 * 1000;
    const result = appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: old, endedAt: old + 1500 });
    // Se acepta en memoria pero se prunea al persistir
    const loaded = loadSessions(depsFor(dir));
    assert.equal(loaded.sessions.length, 0);
  } finally { cleanupTmpDir(dir); }
});

// --- getStatsToday ---

test('getStatsToday: focus de hoy cuenta, focus de ayer no', () => {
  const dir = makeTmpDir();
  try {
    const today = new Date(2026, 6, 15, 14, 30, 0); // 15 jul 2026 14:30
    const todayTs = today.getTime();
    const yesterdayTs = todayTs - 24 * 60 * 60 * 1000;
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: todayTs - 1500, endedAt: todayTs });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: yesterdayTs - 1500, endedAt: yesterdayTs });
    appendSession(depsFor(dir), { kind: 'short_break', durationSec: 300, startedAt: todayTs - 2000, endedAt: todayTs - 1700 });
    const stats = getStatsToday(depsFor(dir), today);
    assert.equal(stats.focusCount, 1);
    assert.equal(stats.totalFocusSeconds, 1500);
    assert.equal(stats.breakCount, 1);
  } finally { cleanupTmpDir(dir); }
});

test('getStatsToday: sin sesiones hoy → todo 0', () => {
  const dir = makeTmpDir();
  try {
    const today = new Date(2026, 6, 15, 14, 30, 0);
    const stats = getStatsToday(depsFor(dir), today);
    assert.equal(stats.focusCount, 0);
    assert.equal(stats.totalFocusSeconds, 0);
    assert.equal(stats.breakCount, 0);
  } finally { cleanupTmpDir(dir); }
});

// --- getStatsThisWeek ---

test('getStatsThisWeek: cuenta focus del lunes a domingo actual', () => {
  const dir = makeTmpDir();
  try {
    // 15 jul 2026 es miercoles (verificado: 15/7/2026 cae miercoles)
    const wednesday = new Date(2026, 6, 15, 14, 30, 0);
    const monday = new Date(2026, 6, 13, 10, 0, 0); // lunes
    const tuesday = new Date(2026, 6, 14, 10, 0, 0);
    const lastSunday = new Date(2026, 6, 12, 10, 0, 0); // domingo anterior (fuera de esta semana)
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: monday.getTime(), endedAt: monday.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: tuesday.getTime(), endedAt: tuesday.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: wednesday.getTime(), endedAt: wednesday.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: lastSunday.getTime(), endedAt: lastSunday.getTime() + 1500 });
    const stats = getStatsThisWeek(depsFor(dir), wednesday);
    assert.equal(stats.focusCount, 3);
    assert.equal(stats.totalFocusSeconds, 4500);
    assert.equal(stats.byDay.lun, 1);
    assert.equal(stats.byDay.mar, 1);
    assert.equal(stats.byDay.mie, 1);
    assert.equal(stats.byDay.jue, 0);
  } finally { cleanupTmpDir(dir); }
});

test('getStatsThisWeek: semana cruza el mes', () => {
  const dir = makeTmpDir();
  try {
    // 2 julio 2026 es jueves. Lunes de esa semana: 29 junio.
    const thursday = new Date(2026, 6, 2, 14, 30, 0);
    const monday = new Date(2026, 5, 29, 10, 0, 0);
    const tuesday = new Date(2026, 5, 30, 10, 0, 0);
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: monday.getTime(), endedAt: monday.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: tuesday.getTime(), endedAt: tuesday.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: thursday.getTime(), endedAt: thursday.getTime() + 1500 });
    const stats = getStatsThisWeek(depsFor(dir), thursday);
    assert.equal(stats.focusCount, 3);
    assert.equal(stats.byDay.lun, 1);
    assert.equal(stats.byDay.mar, 1);
    assert.equal(stats.byDay.jue, 1);
  } finally { cleanupTmpDir(dir); }
});

// --- getCompletedDays ---

test('getCompletedDays: retorna solo dias con focusCount > 0', () => {
  const dir = makeTmpDir();
  try {
    const today = new Date(2026, 6, 15, 14, 30, 0);
    const yesterday = new Date(2026, 6, 14, 10, 0, 0);
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: today.getTime(), endedAt: today.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: yesterday.getTime(), endedAt: yesterday.getTime() + 1500 });
    const days = getCompletedDays(depsFor(dir), today, 5);
    assert.equal(days.length, 2);
    // Orden ascendente por fecha
    assert.equal(days[0].date, '2026-07-14');
    assert.equal(days[1].date, '2026-07-15');
    assert.equal(days[1].focusCount, 1);
  } finally { cleanupTmpDir(dir); }
});

test('getCompletedDays: multiples focus en el mismo dia se cuentan', () => {
  const dir = makeTmpDir();
  try {
    const today = new Date(2026, 6, 15, 14, 30, 0);
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: today.getTime() - 4000, endedAt: today.getTime() - 2500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: today.getTime() - 2000, endedAt: today.getTime() - 500 });
    const days = getCompletedDays(depsFor(dir), today, 3);
    assert.equal(days.length, 1);
    assert.equal(days[0].focusCount, 2);
  } finally { cleanupTmpDir(dir); }
});

// --- getCurrentStreak ---

test('getCurrentStreak: delega en computeStreak', () => {
  const dir = makeTmpDir();
  try {
    const today = new Date(2026, 6, 15, 14, 30, 0);
    const yesterday = new Date(2026, 6, 14, 10, 0, 0);
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: today.getTime(), endedAt: today.getTime() + 1500 });
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 1500, startedAt: yesterday.getTime(), endedAt: yesterday.getTime() + 1500 });
    assert.equal(getCurrentStreak(depsFor(dir), today), 2);
  } finally { cleanupTmpDir(dir); }
});

// --- Integration ---

test('integration: flujo completo', () => {
  const dir = makeTmpDir();
  try {
    // 1. Cargar config inicial
    const config1 = loadConfig(depsFor(dir));
    assert.equal(config1.templateId, 'classic');

    // 2. Cambiar config
    config1.templateId = 'long-focus';
    config1.customFocusMin = 50;
    saveConfig(depsFor(dir), config1);

    // 3. Registrar sesiones
    const today = new Date(2026, 6, 15, 14, 30, 0);
    const todayTs = today.getTime();
    appendSession(depsFor(dir), { kind: 'focus', durationSec: 50 * 60, startedAt: todayTs - 3000_000, endedAt: todayTs - 0 });
    appendSession(depsFor(dir), { kind: 'short_break', durationSec: 600, startedAt: todayTs, endedAt: todayTs + 600 });

    // 4. Stats
    const today_stats = getStatsToday(depsFor(dir), today);
    assert.equal(today_stats.focusCount, 1);
    assert.equal(today_stats.breakCount, 1);

    // 5. Recargar config
    const config2 = loadConfig(depsFor(dir));
    assert.equal(config2.templateId, 'long-focus');

    // 6. Limpiar sesiones
    clearSessionsFile(dir);
    const empty = getStatsToday(depsFor(dir), today);
    assert.equal(empty.focusCount, 0);
  } finally { cleanupTmpDir(dir); }
});

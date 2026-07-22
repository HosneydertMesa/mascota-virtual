'use strict';

// I7 + I8 — Persistencia del estado del daily briefing.
//
// Archivo: <userData>/daily-briefing.json
// Schema: { version: 1, lastShownDate: 'YYYY-MM-DD' | null, enabled: boolean }
//
// Por que archivo separado: separation of concerns. El briefing tiene su
// propio ciclo de vida (1/dia, opt-out global) y no contamina mood-store.

const fs = require('fs');
const path = require('path');

const FILE_VERSION = 1;
const FILE_NAME = 'daily-briefing.json';

function createInitialStore() {
  return { version: FILE_VERSION, lastShownDate: null, enabled: true };
}

function isValidStore(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== FILE_VERSION) return false;
  if (typeof obj.enabled !== 'boolean') return false;
  if (obj.lastShownDate !== null && typeof obj.lastShownDate !== 'string') return false;
  if (typeof obj.lastShownDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(obj.lastShownDate)) return false;
  return true;
}

function getStorePath(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('daily-briefing-store: userDataDir invalido');
  }
  return path.join(userDataDir, FILE_NAME);
}

function loadBriefingState(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    return createInitialStore();
  }
  const filePath = getStorePath(userDataDir);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidStore(parsed)) return createInitialStore();
    return parsed;
  } catch (_error) {
    return createInitialStore();
  }
}

function saveBriefingState(userDataDir, state) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('daily-briefing-store: userDataDir invalido');
  }
  if (!isValidStore(state)) {
    throw new Error('daily-briefing-store: state invalido');
  }
  const filePath = getStorePath(userDataDir);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function markShown(userDataDir, date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('daily-briefing-store: date invalido');
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const current = loadBriefingState(userDataDir);
  if (current.lastShownDate === dateKey) return current;
  const next = { ...current, lastShownDate: dateKey };
  saveBriefingState(userDataDir, next);
  return next;
}

function setEnabled(userDataDir, enabled) {
  if (typeof enabled !== 'boolean') {
    throw new Error('daily-briefing-store: enabled debe ser boolean');
  }
  const current = loadBriefingState(userDataDir);
  if (current.enabled === enabled) return current;
  const next = { ...current, enabled };
  saveBriefingState(userDataDir, next);
  return next;
}

function clearBriefingState(userDataDir) {
  if (typeof userDataDir !== 'string' || userDataDir.length === 0) {
    throw new Error('daily-briefing-store: userDataDir invalido');
  }
  const filePath = getStorePath(userDataDir);
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error && error.code !== 'ENOENT') throw error;
  }
}

module.exports = {
  FILE_VERSION,
  FILE_NAME,
  createInitialStore,
  isValidStore,
  getStorePath,
  loadBriefingState,
  saveBriefingState,
  markShown,
  setEnabled,
  clearBriefingState
};

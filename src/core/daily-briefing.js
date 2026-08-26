'use strict';

// I7 + I8 — Daily briefing + evening summary.
//
// Pure functions para construir el texto que la mascota dice al abrir la app
// (morning briefing) y al cerrarla (evening summary). Toda la logica de
// "que decir" vive aca; main.js solo orquesta cuando y a quien.
//
// Por que pure: para testear sin hora real ni IO, y para que la decision
// de "mostrar o no" sea deterministica y facil de razonar.

const DEFAULT_MORNING_START_HOUR = 7;
const DEFAULT_MORNING_END_HOUR = 12;
const DEFAULT_EVENING_START_HOUR = 18;
const DEFAULT_EVENING_END_HOUR = 22;
const MAX_BRIEFING_LENGTH = 200;

const BRIEFING_TONES = {
  cat: {
    morning: ['miau', 'ronroneo', 'maullido', 'garra', 'bigotes', 'caja', 'pez'],
    evening: ['miau', 'ronroneo', 'caja', 'siesta', 'camita', 'luna', 'estrellas']
  },
  dog: {
    morning: ['guau', 'cola', 'paseo', 'pelota', 'hueso', 'patita', 'sol'],
    evening: ['guau', 'cola', 'paseo', 'luna', 'estrellas', 'camita', 'sueño']
  }
};

function getGreetingByHour(hour, petType = 'cat') {
  if (typeof hour !== 'number' || hour < 0 || hour > 23) {
    return petType === 'dog' ? 'Buenas' : 'Hola';
  }
  if (hour < 6) return petType === 'dog' ? 'Buenas noches' : 'Buenas nochecitas';
  if (hour < 12) return petType === 'dog' ? 'Buenos días' : 'Buenos días';
  if (hour < 19) return petType === 'dog' ? 'Buenas tardes' : 'Buenas tardes';
  return petType === 'dog' ? 'Buenas noches' : 'Buenas noches';
}

function shouldShowBriefing({ hour, lastShownDate, kind, today, enabled = true, morningStart = DEFAULT_MORNING_START_HOUR, morningEnd = DEFAULT_MORNING_END_HOUR, eveningStart = DEFAULT_EVENING_START_HOUR } = {}) {
  if (enabled === false) return false;
  if (typeof hour !== 'number' || hour < 0 || hour > 23) return false;
  const todayKey = getLocalDateKey(today);
  if (lastShownDate === todayKey) return false;
  if (kind === 'morning') return hour >= morningStart && hour < morningEnd;
  if (kind === 'evening') return hour >= eveningStart;
  return false;
}

function getLocalDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function pickToneWord(petType, kind) {
  const pool = BRIEFING_TONES[petType]?.[kind] || BRIEFING_TONES.cat[kind];
  if (!pool || pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function buildMorningBriefing({
  today = new Date(),
  yesterdayStats = { focusCount: 0, totalFocusSeconds: 0 },
  weekStats = { focusCount: 0, totalFocusSeconds: 0 },
  streak = 0,
  pendingCaptures = 0,
  petType = 'cat',
  petName = null
} = {}) {
  const greeting = getGreetingByHour(today.getHours(), petType);
  const nameBit = petName ? `, ${petName}` : '';
  const parts = [`${greeting}${nameBit}.`];
  if (yesterdayStats.focusCount > 0) {
    const mins = Math.round(yesterdayStats.totalFocusSeconds / 60);
    parts.push(`Ayer completaste ${yesterdayStats.focusCount} focus (${mins} min).`);
  } else {
    parts.push('Ayer no hubo focus blocks. Hoy es un buen día para empezar.');
  }
  if (weekStats.focusCount > 0) {
    parts.push(`Esta semana llevas ${weekStats.focusCount}.`);
  }
  if (streak >= 1) {
    parts.push(`Racha: ${streak} ${streak === 1 ? 'día' : 'días'}.`);
  }
  if (pendingCaptures > 0) {
    parts.push(`Tienes ${pendingCaptures} captura${pendingCaptures === 1 ? '' : 's'} pendiente${pendingCaptures === 1 ? '' : 's'}.`);
  }
  const tone = pickToneWord(petType, 'morning');
  if (tone) parts.push(`¡${tone.charAt(0).toUpperCase() + tone.slice(1)}!`);
  return truncateBriefing(parts.join(' '));
}

function buildEveningSummary({
  today = new Date(),
  todayStats = { focusCount: 0, totalFocusSeconds: 0 },
  streak = 0,
  petType = 'cat',
  petName = null
} = {}) {
  const greeting = getGreetingByHour(today.getHours(), petType);
  const nameBit = petName ? `, ${petName}` : '';
  const parts = [`${greeting}${nameBit}.`];
  if (todayStats.focusCount > 0) {
    const mins = Math.round(todayStats.totalFocusSeconds / 60);
    parts.push(`Hoy ${todayStats.focusCount} focus (${mins} min).`);
  } else {
    parts.push('Hoy no hubo focus. Mañana será.');
  }
  if (streak >= 1) {
    parts.push(`Racha: ${streak} ${streak === 1 ? 'día' : 'días'}.`);
  }
  parts.push('Mañana seguimos.');
  const tone = pickToneWord(petType, 'evening');
  if (tone) parts.push(`¡${tone.charAt(0).toUpperCase() + tone.slice(1)}!`);
  return truncateBriefing(parts.join(' '));
}

function truncateBriefing(text) {
  if (typeof text !== 'string') return '';
  if (text.length <= MAX_BRIEFING_LENGTH) return text;
  return text.slice(0, MAX_BRIEFING_LENGTH - 1) + '…';
}

if (typeof module !== 'undefined') {
  module.exports = {
    getGreetingByHour,
    shouldShowBriefing,
    getLocalDateKey,
    buildMorningBriefing,
    buildEveningSummary,
    truncateBriefing,
    DEFAULT_MORNING_START_HOUR,
    DEFAULT_MORNING_END_HOUR,
    DEFAULT_EVENING_START_HOUR,
    DEFAULT_EVENING_END_HOUR,
    MAX_BRIEFING_LENGTH
  };
}
if (typeof window !== 'undefined') {
  window.DailyBriefing = {
    getGreetingByHour,
    shouldShowBriefing,
    getLocalDateKey,
    buildMorningBriefing,
    buildEveningSummary,
    truncateBriefing,
    DEFAULT_MORNING_START_HOUR,
    DEFAULT_MORNING_END_HOUR,
    DEFAULT_EVENING_START_HOUR,
    DEFAULT_EVENING_END_HOUR,
    MAX_BRIEFING_LENGTH
  };
}

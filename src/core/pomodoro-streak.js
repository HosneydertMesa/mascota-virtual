'use strict';

/**
 * Pomodoro streak — pure functions para rachas de focus blocks.
 *
 * Sin side effects, sin Electron. Logica testeable para:
 *   - Computar racha de dias consecutivos con ≥1 focus block
 *   - Detectar milestones (3, 7, 14, 30, 60, 100 dias)
 *   - Mensaje motivacional segun pet type
 *
 * Por que fecha local (no UTC):
 *   - El usuario vive en una zona horaria. Si completa un focus block
 *     a las 23:00 hora local del lunes, eso es "lunes" para el.
 *     Si usamos UTC, podria ser ya "martes" en UTC y romper la racha
 *     visualmente. Ademas, el dashboard es personal: usa la hora del
 *     sistema.
 *   - Usamos Date.getFullYear/getMonth/getDate, que ya son local time.
 *
 * Por que "racha activa pero hoy todavia no hiciste" retorna la racha
 * hasta ayer (no 0):
 *   - El usuario abrio la app a las 9am, no hizo focus todavia pero
 *     completo focus ayer. La racha sigue viva (se rompera a las 00:00
 *     del proximo dia si no hace focus). Mostrar 0 seria desmotivante
 *     y tecnicamente incorrecto: la racha de ayer no se rompio todavia.
 *
 * Uso:
 *   - src/core/pomodoro-streak.js (este archivo) — pure
 *   - main.js — IPC handler pomodoro:register-session emite evento
 *     'streak-milestone' al petWindow
 *   - src/dashboard-renderer.js — subscribe onStreakMilestone
 */

const STREAK_MILESTONES = Object.freeze([3, 7, 14, 30, 60, 100]);

/**
 * Retorna la fecha local como 'YYYY-MM-DD'. Usa los getters de Date
 * que son local-time, no UTC.
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
function getLocalDateKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return getLocalDateKey(new Date());
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Construye un Set de fechas (YYYY-MM-DD) que tienen focusCount > 0.
 * Helper interno.
 *
 * @param {Array<{date: string, focusCount: number}>} completedDays
 * @returns {Set<string>}
 */
function buildCompletedSet(completedDays) {
  const set = new Set();
  if (!Array.isArray(completedDays)) return set;
  for (const entry of completedDays) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.date !== 'string') continue;
    if (typeof entry.focusCount !== 'number' || entry.focusCount <= 0) continue;
    set.add(entry.date);
  }
  return set;
}

/**
 * Resta 1 dia a una fecha YYYY-MM-DD. Helper interno para iterar
 * hacia atras en computeStreak.
 *
 * @param {string} dateKey
 * @returns {string}
 */
function prevDateKey(dateKey) {
  // Construimos a las 12:00 local para evitar DST issues (un dia antes o
  // despues de midnight shift no salta a otro mes por 1 hora).
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateKey(dt);
}

/**
 * Calcula la racha de dias consecutivos con al menos 1 focus block.
 * Cuenta hacia atras desde `today` (o ayer si hoy no tiene focus).
 *
 * Caso 1: hoy tiene focus → cuenta hoy + dias anteriores consecutivos.
 * Caso 2: hoy NO tiene focus pero ayer si → cuenta desde ayer (la racha
 *   sigue "viva" pero el usuario no hizo focus hoy; se rompe a las
 *   00:00 del manana si no hace focus).
 * Caso 3: hoy y ayer sin focus → 0 (racha rota).
 *
 * @param {Array<{date: string, focusCount: number}>} completedDays
 * @param {Date} [today=new Date()]
 * @returns {number}
 */
function computeStreak(completedDays, today = new Date()) {
  if (!(today instanceof Date) || Number.isNaN(today.getTime())) {
    return 0;
  }
  const completedSet = buildCompletedSet(completedDays);
  if (completedSet.size === 0) return 0;

  const todayKey = getLocalDateKey(today);

  // Empezamos desde hoy. Si hoy no tiene focus, vamos a ayer.
  let cursorKey = todayKey;
  if (!completedSet.has(cursorKey)) {
    cursorKey = prevDateKey(cursorKey);
    // ahora cursorKey es "ayer" en formato YYYY-MM-DD
    // Si tampoco ayer tiene focus, racha rota
    if (!completedSet.has(cursorKey)) return 0;
  }

  // Contar hacia atras
  let streak = 0;
  while (completedSet.has(cursorKey)) {
    streak++;
    cursorKey = prevDateKey(cursorKey);
    // Loop de seguridad: no infinitos
    if (streak > 10000) break;
  }
  return streak;
}

/**
 * Detecta si el numero de dias es un milestone.
 * Milestones: 3, 7, 14, 30, 60, 100.
 *
 * @param {number} days
 * @returns {boolean}
 */
function isStreakMilestone(days) {
  if (typeof days !== 'number' || !Number.isFinite(days)) return false;
  if (days < STREAK_MILESTONES[0]) return false;
  return STREAK_MILESTONES.includes(Math.floor(days));
}

/**
 * Calcula la racha MAS LARGA historica en un set de completedDays.
 * Util para reportes semanales ("mejor racha de la semana").
 *
 * Recorre los dias ordenados y cuenta la secuencia mas larga de dias
 * consecutivos con focusCount > 0. No depende de "hoy" — devuelve la
 * racha maxima que existio en el rango dado.
 *
 * @param {Array<{date: string, focusCount: number}>} completedDays
 * @returns {number}
 */
function computeLongestStreak(completedDays) {
  if (!Array.isArray(completedDays) || completedDays.length === 0) return 0;
  const dates = completedDays
    .filter(d => d && typeof d === 'object' && typeof d.date === 'string' && typeof d.focusCount === 'number' && d.focusCount > 0)
    .map(d => d.date)
    .sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];
    // prev + 1 dia deberia ser curr. Reusamos prevDateKey invertida:
    // prevDateKey('2026-07-15') devuelve '2026-07-14' (resta 1). Para sumar
    // 1, llamamos prevDateKey dos veces y luego comparamos con prev.
    // Forma equivalente: curr === (prev - 2 + 1) === (prev - 1 + 1) === ...
    // La forma simple: armar un Date desde prev y sumarle 1 dia.
    const [py, pm, pd] = prev.split('-').map(Number);
    const expectedNext = new Date(py, pm - 1, pd + 1, 12, 0, 0, 0);
    const expectedKey = getLocalDateKey(expectedNext);
    if (curr === expectedKey) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

/**
 * Mensaje motivacional segun petType y dias de racha.
 * Tono:
 *   - cat: elegante, observador, autonomo (usa "miau")
 *   - dog: entusiasta, companiero, leal (usa "guau")
 *
 * @param {number} days
 * @param {string} petType ('cat'|'dog')
 * @returns {string}
 */
function getStreakMilestoneMessage(days, petType) {
  if (typeof days !== 'number' || !Number.isFinite(days)) return '';
  const n = Math.floor(days);
  if (isCat(petType)) {
    if (n >= 100) return `¡${n} días seguidos! Miau... sos de los míos. Sigamos así.`;
    if (n >= 60) return `¡${n} días de racha! Esto ya es un hábito, miau.`;
    if (n >= 30) return `¡${n} días! Un mes entero con focus. Miau, qué orgullosa estoy.`;
    if (n >= 14) return `¡${n} días! Miau, ya es parte de tu rutina.`;
    if (n >= 7) return `¡${n} días seguidos con focus! Miau, qué orgullosa estoy.`;
    if (n >= 3) return `¡${n} días! Buena racha, miau. A por más.`;
    return `${n} días. Miau, vamos por más.`;
  }
  // dog
  if (n >= 100) return `¡${n} días seguidos! Guau, sos una leyenda. Vamos por más.`;
  if (n >= 60) return `¡${n} días de racha! Guau, qué compañero más constante.`;
  if (n >= 30) return `¡${n} días! Un mes entero. Guau, qué orgulloso estoy.`;
  if (n >= 14) return `¡${n} días! Guau, esto ya es un hábito.`;
  if (n >= 7) return `¡${n} días seguidos! Guau, qué compañero sos.`;
  if (n >= 3) return `¡${n} días! Guau, buena racha. A por más.`;
  return `${n} días. Guau, vamos por más.`;
}

function isCat(petType) {
  return petType !== 'dog'; // default cat si no es dog explicito
}

// UMD-lite: expone en module.exports (Node) o window.PomodoroStreak (browser).
const PomodoroStreak = {
  STREAK_MILESTONES,
  getLocalDateKey,
  computeStreak,
  computeLongestStreak,
  isStreakMilestone,
  getStreakMilestoneMessage
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PomodoroStreak;
} else if (typeof window !== 'undefined') {
  window.PomodoroStreak = PomodoroStreak;
}

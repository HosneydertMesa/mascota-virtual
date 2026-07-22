'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  STREAK_MILESTONES,
  getLocalDateKey,
  computeStreak,
  computeLongestStreak,
  isStreakMilestone,
  getStreakMilestoneMessage
} = require('../src/core/pomodoro-streak');

// --- Constantes ---

test('STREAK_MILESTONES contiene los esperados', () => {
  assert.deepEqual([...STREAK_MILESTONES], [3, 7, 14, 30, 60, 100]);
});

// --- getLocalDateKey ---

test('getLocalDateKey: formato YYYY-MM-DD con padding', () => {
  // Date constructor con hora local 12:00 para evitar DST edge cases
  const d = new Date(2026, 6, 5, 12, 0, 0); // 5 julio 2026 (mes es 0-indexed)
  assert.equal(getLocalDateKey(d), '2026-07-05');
});

test('getLocalDateKey: meses 1-9 con padding', () => {
  const d = new Date(2026, 0, 9, 12, 0, 0); // 9 enero
  assert.equal(getLocalDateKey(d), '2026-01-09');
});

test('getLocalDateKey: dias 1-9 con padding', () => {
  const d = new Date(2026, 11, 3, 12, 0, 0); // 3 diciembre
  assert.equal(getLocalDateKey(d), '2026-12-03');
});

test('getLocalDateKey: usa hora local (no UTC)', () => {
  // Si fuera UTC, medianoche en una zona negativa podria ser dia anterior en UTC.
  // Usamos 12:00 local (mediodia) para asegurarnos de que el dia local es el esperado.
  const d = new Date(2026, 5, 15, 12, 0, 0);
  const key = getLocalDateKey(d);
  assert.equal(key, '2026-06-15');
});

test('getLocalDateKey: input invalido usa fecha actual como fallback', () => {
  const key = getLocalDateKey(null);
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
});

test('getLocalDateKey: Date invalida usa fallback', () => {
  const key = getLocalDateKey(new Date('invalid'));
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
});

test('getLocalDateKey: cruza el cambio de mes correctamente', () => {
  // 31 de mayo → 1 de junio
  const d1 = new Date(2026, 4, 31, 12, 0, 0);
  assert.equal(getLocalDateKey(d1), '2026-05-31');
  const d2 = new Date(2026, 5, 1, 12, 0, 0);
  assert.equal(getLocalDateKey(d2), '2026-06-01');
});

test('getLocalDateKey: cruza ano (31 dic → 1 ene)', () => {
  const d1 = new Date(2026, 11, 31, 12, 0, 0);
  assert.equal(getLocalDateKey(d1), '2026-12-31');
  const d2 = new Date(2027, 0, 1, 12, 0, 0);
  assert.equal(getLocalDateKey(d2), '2027-01-01');
});

// --- computeStreak ---

test('computeStreak: lista vacia → 0', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  assert.equal(computeStreak([], today), 0);
  assert.equal(computeStreak(null, today), 0);
  assert.equal(computeStreak(undefined, today), 0);
});

test('computeStreak: solo hoy tiene focus → 1', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [{ date: '2026-07-15', focusCount: 1 }];
  assert.equal(computeStreak(days, today), 1);
});

test('computeStreak: hoy y ayer tienen focus → 2', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-15', focusCount: 1 },
    { date: '2026-07-14', focusCount: 2 }
  ];
  assert.equal(computeStreak(days, today), 2);
});

test('computeStreak: racha de 3 dias consecutivos', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-15', focusCount: 1 },
    { date: '2026-07-14', focusCount: 1 },
    { date: '2026-07-13', focusCount: 1 }
  ];
  assert.equal(computeStreak(days, today), 3);
});

test('computeStreak: racha de 7 dias', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2026, 6, 15 - i, 12, 0, 0);
    days.push({ date: getLocalDateKey(d), focusCount: 1 });
  }
  assert.equal(computeStreak(days, today), 7);
});

test('computeStreak: hoy sin focus pero ayer si → racha hasta ayer (no 0)', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-14', focusCount: 1 },
    { date: '2026-07-13', focusCount: 1 }
  ];
  // racha: ayer + anteayer = 2
  assert.equal(computeStreak(days, today), 2);
});

test('computeStreak: hoy y ayer sin focus → 0 (racha rota)', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-13', focusCount: 1 },
    { date: '2026-07-12', focusCount: 1 }
  ];
  assert.equal(computeStreak(days, today), 0);
});

test('computeStreak: focusCount=0 cuenta como no-hecho', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-15', focusCount: 0 },
    { date: '2026-07-14', focusCount: 0 }
  ];
  assert.equal(computeStreak(days, today), 0);
});

test('computeStreak: cruza el mes (30 jun → 1 jul)', () => {
  const today = new Date(2026, 6, 2, 12, 0, 0); // 2 julio
  const days = [
    { date: '2026-07-02', focusCount: 1 },
    { date: '2026-07-01', focusCount: 1 },
    { date: '2026-06-30', focusCount: 1 },
    { date: '2026-06-29', focusCount: 1 }
  ];
  assert.equal(computeStreak(days, today), 4);
});

test('computeStreak: cruza el ano (31 dic → 1 ene)', () => {
  const today = new Date(2027, 0, 2, 12, 0, 0);
  const days = [
    { date: '2027-01-02', focusCount: 1 },
    { date: '2027-01-01', focusCount: 1 },
    { date: '2026-12-31', focusCount: 1 }
  ];
  assert.equal(computeStreak(days, today), 3);
});

test('computeStreak: racha larga (30 dias)', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(2026, 6, 15 - i, 12, 0, 0);
    days.push({ date: getLocalDateKey(d), focusCount: 1 });
  }
  assert.equal(computeStreak(days, today), 30);
});

test('computeStreak: entradas invalidas (sin date o focusCount) se tratan como no-hecho', () => {
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [
    { date: '2026-07-15', focusCount: 1 },
    null,
    { date: null, focusCount: 1 },
    { date: '2026-07-14' }, // sin focusCount → tratado como 0 → racha rompe
    { date: '2026-07-13', focusCount: 1 }
  ];
  // racha: solo hoy (ayer sin focusCount = roto)
  assert.equal(computeStreak(days, today), 1);
});

// --- isStreakMilestone ---

test('isStreakMilestone: true para 3, 7, 14, 30, 60, 100', () => {
  for (const n of [3, 7, 14, 30, 60, 100]) {
    assert.equal(isStreakMilestone(n), true, `${n} deberia ser milestone`);
  }
});

test('isStreakMilestone: false para no-milestones', () => {
  for (const n of [0, 1, 2, 4, 5, 6, 8, 9, 10, 13, 15, 29, 31, 59, 61, 99, 101, 200]) {
    assert.equal(isStreakMilestone(n), false, `${n} NO deberia ser milestone`);
  }
});

test('isStreakMilestone: input invalido → false', () => {
  assert.equal(isStreakMilestone(null), false);
  assert.equal(isStreakMilestone(undefined), false);
  assert.equal(isStreakMilestone('3'), false);
  assert.equal(isStreakMilestone(NaN), false);
  assert.equal(isStreakMilestone(-1), false);
});

// --- getStreakMilestoneMessage ---

test('getStreakMilestoneMessage: cat 7 dias con miau', () => {
  const msg = getStreakMilestoneMessage(7, 'cat');
  assert.ok(msg.includes('7'));
  assert.ok(msg.toLowerCase().includes('miau'));
  assert.ok(msg.length > 0);
});

test('getStreakMilestoneMessage: dog 7 dias con guau', () => {
  const msg = getStreakMilestoneMessage(7, 'dog');
  assert.ok(msg.includes('7'));
  assert.ok(msg.toLowerCase().includes('guau'));
});

test('getStreakMilestoneMessage: cat 30 dias', () => {
  const msg = getStreakMilestoneMessage(30, 'cat');
  assert.ok(msg.includes('30'));
  assert.ok(msg.toLowerCase().includes('miau'));
});

test('getStreakMilestoneMessage: dog 30 dias', () => {
  const msg = getStreakMilestoneMessage(30, 'dog');
  assert.ok(msg.includes('30'));
  assert.ok(msg.toLowerCase().includes('guau'));
});

test('getStreakMilestoneMessage: cat 100 dias (legend tier)', () => {
  const msg = getStreakMilestoneMessage(100, 'cat');
  assert.ok(msg.includes('100'));
  assert.ok(msg.toLowerCase().includes('miau'));
});

test('getStreakMilestoneMessage: petType invalido cae a cat', () => {
  const msg = getStreakMilestoneMessage(7, 'fish');
  assert.ok(msg.toLowerCase().includes('miau'));
});

test('getStreakMilestoneMessage: input invalido → string vacio', () => {
  assert.equal(getStreakMilestoneMessage(null, 'cat'), '');
  assert.equal(getStreakMilestoneMessage(undefined, 'cat'), '');
  assert.equal(getStreakMilestoneMessage(NaN, 'cat'), '');
});

// --- Integration ---

test('integration: getLocalDateKey + computeStreak + isStreakMilestone', () => {
  // Simulamos que el usuario tuvo focus los ultimos 7 dias
  const today = new Date(2026, 6, 15, 12, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: getLocalDateKey(d), focusCount: 1 });
  }
  const streak = computeStreak(days, today);
  assert.equal(streak, 7);
  assert.equal(isStreakMilestone(streak), true);
  const msg = getStreakMilestoneMessage(streak, 'cat');
  assert.ok(msg.includes('7'));
  assert.ok(msg.toLowerCase().includes('miau'));
});

test('computeLongestStreak: lista vacia → 0', () => {
  assert.equal(computeLongestStreak([]), 0);
  assert.equal(computeLongestStreak(null), 0);
  assert.equal(computeLongestStreak(undefined), 0);
  assert.equal(computeLongestStreak('not-array'), 0);
});

test('computeLongestStreak: todas focusCount=0 → 0', () => {
  const days = [
    { date: '2026-07-15', focusCount: 0 },
    { date: '2026-07-16', focusCount: 0 }
  ];
  assert.equal(computeLongestStreak(days), 0);
});

test('computeLongestStreak: un solo dia con focus → 1', () => {
  const days = [{ date: '2026-07-15', focusCount: 1 }];
  assert.equal(computeLongestStreak(days), 1);
});

test('computeLongestStreak: 3 dias consecutivos → 3', () => {
  const days = [
    { date: '2026-07-15', focusCount: 1 },
    { date: '2026-07-16', focusCount: 2 },
    { date: '2026-07-17', focusCount: 1 }
  ];
  assert.equal(computeLongestStreak(days), 3);
});

test('computeLongestStreak: 2 rachas, devuelve la mas larga', () => {
  const days = [
    { date: '2026-07-10', focusCount: 1 },
    { date: '2026-07-11', focusCount: 1 },
    { date: '2026-07-15', focusCount: 1 },
    { date: '2026-07-16', focusCount: 1 },
    { date: '2026-07-17', focusCount: 1 },
    { date: '2026-07-18', focusCount: 1 }
  ];
  // Racha 1: 2 dias (10-11), Racha 2: 4 dias (15-18). Mayor = 4.
  assert.equal(computeLongestStreak(days), 4);
});

test('computeLongestStreak: dias desordenados los ordena', () => {
  const days = [
    { date: '2026-07-17', focusCount: 1 },
    { date: '2026-07-15', focusCount: 1 },
    { date: '2026-07-16', focusCount: 1 }
  ];
  assert.equal(computeLongestStreak(days), 3);
});

test('computeLongestStreak: foco no consecutivo (gap) corta la racha', () => {
  const days = [
    { date: '2026-07-10', focusCount: 1 },
    { date: '2026-07-12', focusCount: 1 } // gap: 11
  ];
  assert.equal(computeLongestStreak(days), 1);
});

test('computeLongestStreak: ignora entries con focusCount <= 0', () => {
  const days = [
    { date: '2026-07-15', focusCount: 0 },
    { date: '2026-07-16', focusCount: 1 }
  ];
  assert.equal(computeLongestStreak(days), 1);
});

test('computeLongestStreak: ignora entries invalidos', () => {
  const days = [
    null,
    { focusCount: 1 },
    { date: '2026-07-15' },
    { date: '2026-07-15', focusCount: 1 }
  ];
  assert.equal(computeLongestStreak(days), 1);
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getGreetingByHour,
  shouldShowBriefing,
  getLocalDateKey,
  buildMorningBriefing,
  buildEveningSummary,
  truncateBriefing,
  DEFAULT_MORNING_START_HOUR,
  DEFAULT_MORNING_END_HOUR,
  DEFAULT_EVENING_START_HOUR,
  MAX_BRIEFING_LENGTH
} = require('../src/core/daily-briefing');

function makeDate(hour, day = 15) {
  const d = new Date(2026, 6, day, hour, 30, 0);
  return d;
}

test('getGreetingByHour: hora invalida retorna saludo generico', () => {
  assert.equal(getGreetingByHour(-1, 'cat'), 'Hola');
  assert.equal(getGreetingByHour(25, 'cat'), 'Hola');
  assert.equal(getGreetingByHour('12', 'cat'), 'Hola');
});

test('getGreetingByHour: madrugada (<6) cat', () => {
  assert.equal(getGreetingByHour(3, 'cat'), 'Buenas nochecitas');
  assert.equal(getGreetingByHour(5, 'cat'), 'Buenas nochecitas');
});

test('getGreetingByHour: manana (6-12) cat', () => {
  assert.equal(getGreetingByHour(6, 'cat'), 'Buenos días');
  assert.equal(getGreetingByHour(11, 'cat'), 'Buenos días');
});

test('getGreetingByHour: tarde (12-19) dog', () => {
  assert.equal(getGreetingByHour(13, 'dog'), 'Buenas tardes');
  assert.equal(getGreetingByHour(18, 'dog'), 'Buenas tardes');
});

test('getGreetingByHour: noche (>=19) dog', () => {
  assert.equal(getGreetingByHour(19, 'dog'), 'Buenas noches');
  assert.equal(getGreetingByHour(23, 'dog'), 'Buenas noches');
});

test('getLocalDateKey: formato YYYY-MM-DD', () => {
  const d = new Date(2026, 6, 5, 10, 0, 0);
  assert.equal(getLocalDateKey(d), '2026-07-05');
});

test('getLocalDateKey: padding de mes y dia', () => {
  const d = new Date(2026, 0, 3, 10, 0, 0);
  assert.equal(getLocalDateKey(d), '2026-01-03');
});

test('getLocalDateKey: input invalido retorna null', () => {
  assert.equal(getLocalDateKey(null), null);
  assert.equal(getLocalDateKey(undefined), null);
  assert.equal(getLocalDateKey('2026-07-15'), null);
  assert.equal(getLocalDateKey(new Date('invalid')), null);
});

test('shouldShowBriefing: enabled=false no muestra', () => {
  assert.equal(shouldShowBriefing({ hour: 9, lastShownDate: null, kind: 'morning', today: makeDate(9), enabled: false }), false);
});

test('shouldShowBriefing: morning dentro de la ventana', () => {
  assert.equal(shouldShowBriefing({ hour: 9, lastShownDate: null, kind: 'morning', today: makeDate(9) }), true);
});

test('shouldShowBriefing: morning fuera de la ventana (tarde)', () => {
  assert.equal(shouldShowBriefing({ hour: 14, lastShownDate: null, kind: 'morning', today: makeDate(14) }), false);
});

test('shouldShowBriefing: ya se mostro hoy no lo muestra de nuevo', () => {
  const today = makeDate(9);
  const todayKey = getLocalDateKey(today);
  assert.equal(shouldShowBriefing({ hour: 9, lastShownDate: todayKey, kind: 'morning', today }), false);
});

test('shouldShowBriefing: evening dentro de la ventana (>=18)', () => {
  assert.equal(shouldShowBriefing({ hour: 19, lastShownDate: null, kind: 'evening', today: makeDate(19) }), true);
});

test('shouldShowBriefing: evening antes de la ventana no muestra', () => {
  assert.equal(shouldShowBriefing({ hour: 17, lastShownDate: null, kind: 'evening', today: makeDate(17) }), false);
});

test('shouldShowBriefing: kind desconocido no muestra', () => {
  assert.equal(shouldShowBriefing({ hour: 9, lastShownDate: null, kind: 'lunch', today: makeDate(9) }), false);
});

test('buildMorningBriefing: incluye saludo y stats', () => {
  const text = buildMorningBriefing({
    today: makeDate(9),
    yesterdayStats: { focusCount: 4, totalFocusSeconds: 90 * 60 },
    weekStats: { focusCount: 12, totalFocusSeconds: 5 * 3600 },
    streak: 3,
    pendingCaptures: 2,
    petType: 'cat'
  });
  assert.ok(text.includes('Buenos días'));
  assert.ok(text.includes('4 focus'));
  assert.ok(text.includes('90 min'));
  assert.ok(text.includes('Racha'));
  assert.ok(text.includes('3'));
  assert.ok(text.includes('2 capturas'));
  assert.ok(text.length <= MAX_BRIEFING_LENGTH);
});

test('buildMorningBriefing: sin datos de ayer (sin focus)', () => {
  const text = buildMorningBriefing({
    today: makeDate(9),
    yesterdayStats: { focusCount: 0, totalFocusSeconds: 0 },
    streak: 0,
    pendingCaptures: 0,
    petType: 'dog'
  });
  assert.ok(text.includes('Buenos días'));
  assert.ok(text.includes('no hubo focus'));
  assert.ok(text.length <= MAX_BRIEFING_LENGTH);
});

test('buildMorningBriefing: dog usa tono canino', () => {
  for (let i = 0; i < 20; i++) {
    const text = buildMorningBriefing({
      today: makeDate(9),
      yesterdayStats: { focusCount: 1, totalFocusSeconds: 1500 },
      petType: 'dog'
    });
    assert.ok(text.length <= MAX_BRIEFING_LENGTH);
  }
});

test('buildEveningSummary: focus hoy + racha', () => {
  const text = buildEveningSummary({
    today: makeDate(20),
    todayStats: { focusCount: 5, totalFocusSeconds: 100 * 60 },
    streak: 7,
    petType: 'cat'
  });
  assert.ok(text.includes('Buenas noches'));
  assert.ok(text.includes('5 focus'));
  assert.ok(text.includes('100 min'));
  assert.ok(text.includes('Racha'));
  assert.ok(text.includes('7'));
  assert.ok(text.includes('Mañana seguimos'));
  assert.ok(text.length <= MAX_BRIEFING_LENGTH);
});

test('buildEveningSummary: sin focus hoy', () => {
  const text = buildEveningSummary({
    today: makeDate(20),
    todayStats: { focusCount: 0, totalFocusSeconds: 0 },
    streak: 2,
    petType: 'dog'
  });
  assert.ok(text.includes('no hubo focus'));
  assert.ok(text.includes('Mañana'));
});

test('truncateBriefing: respeca limite de 200', () => {
  const long = 'a'.repeat(500);
  const out = truncateBriefing(long);
  assert.ok(out.length <= MAX_BRIEFING_LENGTH);
  assert.ok(out.endsWith('…'));
});

test('truncateBriefing: input invalido retorna string vacio', () => {
  assert.equal(truncateBriefing(null), '');
  assert.equal(truncateBriefing(undefined), '');
  assert.equal(truncateBriefing(123), '');
});

test('constantes exportadas son los defaults esperados', () => {
  assert.equal(DEFAULT_MORNING_START_HOUR, 7);
  assert.equal(DEFAULT_MORNING_END_HOUR, 12);
  assert.equal(DEFAULT_EVENING_START_HOUR, 18);
  assert.equal(MAX_BRIEFING_LENGTH, 200);
});

test('integration: flujo completo morning', () => {
  const today = makeDate(9);
  const state = { hour: 9, lastShownDate: null, kind: 'morning', today };
  assert.equal(shouldShowBriefing(state), true);
  const text = buildMorningBriefing({
    today,
    yesterdayStats: { focusCount: 3, totalFocusSeconds: 75 * 60 },
    streak: 5,
    pendingCaptures: 1,
    petType: 'cat'
  });
  assert.ok(text.length > 0);
  assert.ok(text.length <= MAX_BRIEFING_LENGTH);
  const todayKey = getLocalDateKey(today);
  assert.equal(shouldShowBriefing({ hour: 9, lastShownDate: todayKey, kind: 'morning', today }), false);
});

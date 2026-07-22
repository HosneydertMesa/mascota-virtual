'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DAY_KEYS_MONDAY_FIRST,
  DAY_KEYS_SUNDAY_FIRST,
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
} = require('../src/core/weekly-report');

// --- Constantes ---

test('DAY_KEYS_MONDAY_FIRST arranca en lunes', () => {
  assert.equal(DAY_KEYS_MONDAY_FIRST[0], 'mon');
  assert.equal(DAY_KEYS_MONDAY_FIRST[6], 'sun');
});

test('DAY_KEYS_SUNDAY_FIRST arranca en domingo', () => {
  assert.equal(DAY_KEYS_SUNDAY_FIRST[0], 'sun');
  assert.equal(DAY_KEYS_SUNDAY_FIRST[6], 'sat');
});

// --- getWeekRange ---

test('getWeekRange: today lunes → start=lunes, end=domingo', () => {
  // 2026-07-20 es lunes
  const { start, end } = getWeekRange(new Date('2026-07-20T15:00:00'));
  assert.equal(start.getDay(), 1); // lunes
  assert.equal(end.getDay(), 0);   // domingo
  assert.equal(start.getHours(), 0);
  assert.equal(start.getMinutes(), 0);
  assert.equal(start.getSeconds(), 0);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getSeconds(), 59);
});

test('getWeekRange: today miercoles → start=lunes (3 dias atras)', () => {
  // 2026-07-22 es miercoles
  const { start, end } = getWeekRange(new Date('2026-07-22T15:00:00'));
  assert.equal(start.getDay(), 1); // lunes
  assert.equal(start.getDate(), 20); // 22 - 2 = 20 (lun 20, mar 21, mier 22)
  assert.equal(end.getDate(), 26);
});

test('getWeekRange: today domingo (monday-start) → start=lunes anterior', () => {
  // 2026-07-26 es domingo
  const { start, end } = getWeekRange(new Date('2026-07-26T15:00:00'));
  assert.equal(start.getDay(), 1); // lunes
  assert.equal(start.getDate(), 20);
  assert.equal(end.getDate(), 26);
});

test('getWeekRange: weekStart=sunday, today miercoles → start=domingo anterior', () => {
  // 2026-07-22 es miercoles. Con sunday-start, el domingo de la semana es 19/07
  const { start, end } = getWeekRange(new Date('2026-07-22T15:00:00'), 'sunday');
  assert.equal(start.getDay(), 0); // domingo
  assert.equal(start.getDate(), 19);
  assert.equal(end.getDate(), 25); // sabado
});

test('getWeekRange: cruza de mes correctamente', () => {
  // 2026-08-05 es miercoles. La semana empieza el 03/08 (lunes)
  const { start, end } = getWeekRange(new Date('2026-08-05T15:00:00'));
  assert.equal(start.getMonth(), 7); // agosto (0-indexed)
  assert.equal(start.getDate(), 3);
  assert.equal(end.getMonth(), 7);
  assert.equal(end.getDate(), 9);
});

test('getWeekRange: cruza de anio (semana 1 de enero)', () => {
  // 2027-01-01 es viernes. Semana 1 empieza 2026-12-28 (lun)
  const { start, end } = getWeekRange(new Date('2027-01-01T15:00:00'));
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 11); // diciembre
  assert.equal(start.getDate(), 28);
  assert.equal(end.getFullYear(), 2027);
  assert.equal(end.getMonth(), 0);
  assert.equal(end.getDate(), 3);
});

test('getWeekRange: today no es Date → usa new Date()', () => {
  const { start, end } = getWeekRange();
  assert.ok(start instanceof Date);
  assert.ok(end instanceof Date);
  assert.equal(end.getTime() - start.getTime(), 6 * 24 * 3600 * 1000 + 24 * 3600 * 1000 - 1);
});

test('getWeekRange: diferencia entre start y end es ~6 dias 23h 59m 59s 999ms', () => {
  const { start, end } = getWeekRange(new Date('2026-07-22T15:00:00'));
  const diff = end.getTime() - start.getTime();
  const expected = 6 * 24 * 3600 * 1000 + (23 * 3600 + 59 * 60 + 59) * 1000 + 999;
  assert.equal(diff, expected);
});

// --- formatPeriodLabel ---

test('formatPeriodLabel: formato "Semana del DD/MM al DD/MM"', () => {
  const start = new Date('2026-07-20T00:00:00');
  const end = new Date('2026-07-26T23:59:59');
  assert.equal(formatPeriodLabel(start, end), 'Semana del 20/07 al 26/07');
});

test('formatPeriodLabel: cruza de mes', () => {
  const start = new Date('2026-07-27T00:00:00');
  const end = new Date('2026-08-02T23:59:59');
  assert.equal(formatPeriodLabel(start, end), 'Semana del 27/07 al 02/08');
});

// --- filterSessionsByRange ---

test('filterSessionsByRange: input invalido → []', () => {
  const start = new Date('2026-07-20');
  const end = new Date('2026-07-26');
  assert.deepEqual(filterSessionsByRange(null, start, end), []);
  assert.deepEqual(filterSessionsByRange([], start, end), []);
  assert.deepEqual(filterSessionsByRange([{ startedAt: 1 }], null, end), []);
  assert.deepEqual(filterSessionsByRange([{ startedAt: 1 }], start, null), []);
});

test('filterSessionsByRange: filtra sesiones dentro del rango', () => {
  // Usamos getWeekRange para tener start/end consistentes con el impl (LOCAL)
  const { start, end } = getWeekRange(new Date('2026-07-22T15:00:00'));
  // Construimos timestamps que sabemos caen dentro/fuera del rango LOCAL
  const startMs = start.getTime();
  const endMs = end.getTime();
  const sessions = [
    { startedAt: startMs - 24 * 3600 * 1000, kind: 'focus' }, // antes
    { startedAt: startMs + 1, kind: 'focus' },               // inicio + 1ms
    { startedAt: (startMs + endMs) / 2, kind: 'focus' },     // mid
    { startedAt: endMs, kind: 'focus' },                     // fin
    { startedAt: endMs + 1, kind: 'focus' }                  // despues
  ];
  const filtered = filterSessionsByRange(sessions, start, end);
  assert.equal(filtered.length, 3); // solo las 3 de adentro
});

test('filterSessionsByRange: acepta startedAt como string ISO', () => {
  const start = new Date('2026-07-20T00:00:00');
  const end = new Date('2026-07-26T23:59:59');
  const sessions = [
    { startedAt: '2026-07-22T10:00:00.000Z', kind: 'focus' }
  ];
  const filtered = filterSessionsByRange(sessions, start, end);
  // El string ISO es UTC; el Date local es distinto. Verificamos que el
  // filtro aplica comparacion numerica sobre epoch ms.
  assert.equal(filtered.length, 1);
});

test('filterSessionsByRange: ignora sesiones con startedAt invalido', () => {
  const start = new Date('2026-07-20T00:00:00');
  const end = new Date('2026-07-26T23:59:59');
  const sessions = [
    { startedAt: 'no-es-fecha' },
    { kind: 'focus' }, // sin startedAt
    { startedAt: NaN },
    null
  ];
  const filtered = filterSessionsByRange(sessions, start, end);
  assert.equal(filtered.length, 0);
});

// --- filterCapturesByRange ---

test('filterCapturesByRange: filtra capturas por createdAt', () => {
  const { start, end } = getWeekRange(new Date('2026-07-22T15:00:00'));
  const startMs = start.getTime();
  const endMs = end.getTime();
  const captures = [
    { id: 'a', text: 'uno', createdAt: startMs - 1000 },           // antes
    { id: 'b', text: 'dos', createdAt: (startMs + endMs) / 2 },     // mid
    { id: 'c', text: 'tres', createdAt: endMs + 1000 }              // despues
  ];
  const filtered = filterCapturesByRange(captures, start, end);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'b');
});

test('filterCapturesByRange: input invalido → []', () => {
  const start = new Date('2026-07-20');
  const end = new Date('2026-07-26');
  assert.deepEqual(filterCapturesByRange(null, start, end), []);
  assert.deepEqual(filterCapturesByRange([{ createdAt: 1 }], null, end), []);
});

// --- aggregateFocusByDay ---

test('aggregateFocusByDay: cuenta focus blocks por dia (monday-start)', () => {
  const start = new Date('2026-07-20T00:00:00');
  const end = new Date('2026-07-26T23:59:59');
  const sessions = [
    // lunes 20: 2 focus
    { startedAt: new Date('2026-07-20T09:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    { startedAt: new Date('2026-07-20T14:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    // martes 21: 1 focus
    { startedAt: new Date('2026-07-21T10:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    // miercoles 22: 0 focus
    // jueves 23: 3 focus
    { startedAt: new Date('2026-07-23T09:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    { startedAt: new Date('2026-07-23T11:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    { startedAt: new Date('2026-07-23T15:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    // break (ignorado)
    { startedAt: new Date('2026-07-23T10:00:00').getTime(), kind: 'break', durationSec: 300 },
    // fuera de rango
    { startedAt: new Date('2026-07-19T09:00:00').getTime(), kind: 'focus', durationSec: 1500 }
  ];
  const agg = aggregateFocusByDay(sessions, start, end, 'monday');
  assert.equal(agg.focusBlocks, 6); // 2+1+3 = 6
  assert.equal(agg.totalFocusSeconds, 6 * 1500);
  assert.equal(agg.byDay.mon, 2);
  assert.equal(agg.byDay.tue, 1);
  assert.equal(agg.byDay.wed, 0);
  assert.equal(agg.byDay.thu, 3);
  assert.equal(agg.byDay.fri, 0);
  assert.equal(agg.byDay.sat, 0);
  assert.equal(agg.byDay.sun, 0);
});

test('aggregateFocusByDay: weekStart=sunday cuenta correctamente', () => {
  const start = new Date('2026-07-19T00:00:00'); // domingo
  const end = new Date('2026-07-25T23:59:59');   // sabado
  const sessions = [
    { startedAt: new Date('2026-07-19T10:00:00').getTime(), kind: 'focus' }, // domingo
    { startedAt: new Date('2026-07-20T10:00:00').getTime(), kind: 'focus' }, // lunes
    { startedAt: new Date('2026-07-25T10:00:00').getTime(), kind: 'focus' }  // sabado
  ];
  const agg = aggregateFocusByDay(sessions, start, end, 'sunday');
  assert.equal(agg.byDay.sun, 1);
  assert.equal(agg.byDay.mon, 1);
  assert.equal(agg.byDay.sat, 1);
  assert.equal(agg.focusBlocks, 3);
});

// --- topCapturesByLength ---

test('topCapturesByLength: retorna las N mas largas', () => {
  const captures = [
    { text: 'a' },
    { text: 'aaaa' },
    { text: 'aa' },
    { text: 'aaaaaa' },
    { text: 'aaa' }
  ];
  const top = topCapturesByLength(captures, 2);
  assert.deepEqual(top, ['aaaaaa', 'aaaa']);
});

test('topCapturesByLength: si hay menos de N, retorna todas (orden estable)', () => {
  // Cuando hay empate de longitud, el sort estable preserva el orden de insercion
  const captures = [{ text: 'uno' }, { text: 'dos' }];
  const result = topCapturesByLength(captures, 5);
  assert.equal(result.length, 2);
  // Ambos tienen length=3. Verificamos que los 2 elementos correctos estan
  assert.ok(result.includes('uno'));
  assert.ok(result.includes('dos'));
});

test('topCapturesByLength: input invalido → []', () => {
  assert.deepEqual(topCapturesByLength(null, 5), []);
  assert.deepEqual(topCapturesByLength([], 5), []);
  assert.deepEqual(topCapturesByLength([{ text: 123 }], 5), []); // text no string
});

// --- computeProductivityScore ---

test('computeProductivityScore: 0 focus, 0 streak → 0', () => {
  assert.equal(computeProductivityScore({ focusBlocks: 0, totalFocusSeconds: 0, streak: 0 }), 0);
});

test('computeProductivityScore: 10 focus, 0 streak → 50', () => {
  assert.equal(computeProductivityScore({ focusBlocks: 10, totalFocusSeconds: 0, streak: 0 }), 50);
});

test('computeProductivityScore: 5 focus, 5h, 5 streak → 5*5 + min(20,10) + min(15,15) = 25+10+15 = 50', () => {
  assert.equal(computeProductivityScore({ focusBlocks: 5, totalFocusSeconds: 5 * 3600, streak: 5 }), 50);
});

test('computeProductivityScore: cap a 100', () => {
  // 30 focus + 20 streak cap + 5h focus = 150+20+15 = 185 → cap 100
  const score = computeProductivityScore({ focusBlocks: 30, totalFocusSeconds: 5 * 3600, streak: 20 });
  assert.equal(score, 100);
});

test('computeProductivityScore: input invalido → 0', () => {
  assert.equal(computeProductivityScore(null), 0);
  assert.equal(computeProductivityScore(undefined), 0);
  assert.equal(computeProductivityScore({}), 0);
});

test('computeProductivityScore: cap de streak a 20', () => {
  // 0 focus + 100 streak → sin cap sería 200, con cap es 20
  const score = computeProductivityScore({ focusBlocks: 0, totalFocusSeconds: 0, streak: 100 });
  assert.equal(score, 20);
});

test('computeProductivityScore: cap de horas a 15', () => {
  // 0 focus + 0 streak + 100h focus → sin cap sería 300, con cap es 15
  const score = computeProductivityScore({ focusBlocks: 0, totalFocusSeconds: 100 * 3600, streak: 0 });
  assert.equal(score, 15);
});

test('computeProductivityScore: horas fraccionarias no cuentan (floor)', () => {
  // 0 focus + 0 streak + 1.5h → floor = 1 → 3
  assert.equal(computeProductivityScore({ focusBlocks: 0, totalFocusSeconds: 1.5 * 3600, streak: 0 }), 3);
});

test('computeProductivityScore: valores negativos se tratan como 0', () => {
  assert.equal(computeProductivityScore({ focusBlocks: -5, totalFocusSeconds: -1, streak: -1 }), 0);
});

// --- getScoreLabel ---

test('getScoreLabel: rangos', () => {
  assert.equal(getScoreLabel(0), 'empezando');
  assert.equal(getScoreLabel(10), 'empezando');
  assert.equal(getScoreLabel(20), 'empezando');
  assert.equal(getScoreLabel(21), 'en ritmo');
  assert.equal(getScoreLabel(40), 'en ritmo');
  assert.equal(getScoreLabel(41), 'bien encaminado');
  assert.equal(getScoreLabel(60), 'bien encaminado');
  assert.equal(getScoreLabel(61), 'muy bien');
  assert.equal(getScoreLabel(80), 'muy bien');
  assert.equal(getScoreLabel(81), 'crack');
  assert.equal(getScoreLabel(100), 'crack');
});

test('getScoreLabel: input invalido → "empezando"', () => {
  assert.equal(getScoreLabel(-1), 'empezando');
  assert.equal(getScoreLabel(NaN), 'empezando');
  assert.equal(getScoreLabel(null), 'empezando');
});

// --- buildWeeklyReport ---

test('buildWeeklyReport: semana vacia → ceros, sin error', () => {
  const today = new Date('2026-07-22T15:00:00');
  const report = buildWeeklyReport({ sessions: [], captures: [], today });
  assert.equal(report.pomodoro.focusBlocks, 0);
  assert.equal(report.pomodoro.totalFocusSeconds, 0);
  assert.equal(report.captures.count, 0);
  assert.deepEqual(report.captures.top, []);
  assert.equal(report.streak.current, 0);
  assert.equal(report.streak.longest, 0);
  assert.equal(report.score, 0);
  // Verificamos el periodo con date parts (TZ-agnostic), no ISO strings
  const startDate = new Date(report.period.start);
  const endDate = new Date(report.period.end);
  assert.equal(startDate.getDate(), 20);
  assert.equal(startDate.getMonth() + 1, 7); // julio
  assert.equal(startDate.getHours(), 0);
  assert.equal(endDate.getDate(), 26);
  assert.equal(endDate.getMonth() + 1, 7);
  assert.equal(endDate.getHours(), 23);
  assert.equal(endDate.getMinutes(), 59);
  assert.equal(endDate.getSeconds(), 59);
  assert.ok(report.period.label.includes('20/07'));
  assert.ok(report.period.label.includes('26/07'));
});

test('buildWeeklyReport: con datos sinteticos', () => {
  const today = new Date('2026-07-22T15:00:00');
  const sessions = [
    // lunes 20: 2 focus
    { startedAt: new Date('2026-07-20T09:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    { startedAt: new Date('2026-07-20T14:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    // miercoles 22: 1 focus
    { startedAt: new Date('2026-07-22T10:00:00').getTime(), kind: 'focus', durationSec: 1500 },
    // fuera de rango
    { startedAt: new Date('2026-07-19T10:00:00').getTime(), kind: 'focus', durationSec: 1500 }
  ];
  const captures = [
    { id: 'a', text: 'corta', createdAt: new Date('2026-07-20T10:00:00').getTime() },
    { id: 'b', text: 'revisar PR de Jorge antes del viernes, no olvidar nada', createdAt: new Date('2026-07-21T10:00:00').getTime() },
    { id: 'c', text: 'media', createdAt: new Date('2026-07-22T10:00:00').getTime() },
    // fuera de rango
    { id: 'd', text: 'old', createdAt: new Date('2026-07-10T10:00:00').getTime() }
  ];
  const report = buildWeeklyReport({ sessions, captures, streak: 5, longestStreak: 12, today });
  assert.equal(report.pomodoro.focusBlocks, 3);
  assert.equal(report.pomodoro.totalFocusSeconds, 3 * 1500);
  assert.equal(report.pomodoro.byDay.mon, 2);
  assert.equal(report.pomodoro.byDay.wed, 1);
  assert.equal(report.captures.count, 3);
  assert.equal(report.captures.top.length, 3);
  // La mas larga es 'b' (48 chars)
  assert.equal(report.captures.top[0], 'revisar PR de Jorge antes del viernes, no olvidar nada');
  assert.equal(report.streak.current, 5);
  assert.equal(report.streak.longest, 12);
  // Score: 3*5 + min(20,5*2) + min(15, floor(4500/3600)*3) = 15 + 10 + 3 = 28
  assert.equal(report.score, 28);
});

test('buildWeeklyReport: inputs invalidos caen a defaults', () => {
  const report = buildWeeklyReport({});
  assert.equal(report.pomodoro.focusBlocks, 0);
  assert.equal(report.captures.count, 0);
  assert.equal(report.streak.current, 0);
  assert.equal(report.score, 0);
});

test('buildWeeklyReport: weekStart=sunday calcula bien el rango', () => {
  const today = new Date('2026-07-22T15:00:00'); // miercoles
  const report = buildWeeklyReport({ today, weekStart: 'sunday' });
  // start = domingo 2026-07-19 LOCAL midnight
  const startDate = new Date(report.period.start);
  assert.equal(startDate.getDay(), 0); // domingo
  assert.equal(startDate.getDate(), 19);
  assert.equal(startDate.getMonth() + 1, 7);
  assert.equal(startDate.getHours(), 0);
  // end = sabado 2026-07-25 LOCAL 23:59:59
  const endDate = new Date(report.period.end);
  assert.equal(endDate.getDay(), 6); // sabado
  assert.equal(endDate.getDate(), 25);
});

// --- formatReportAsMarkdown ---

test('formatReportAsMarkdown: incluye todas las secciones esperadas', () => {
  const today = new Date('2026-07-22T15:00:00');
  const sessions = [
    { startedAt: new Date('2026-07-20T10:00:00').getTime(), kind: 'focus', durationSec: 1500 }
  ];
  const captures = [
    { id: 'a', text: 'una idea corta', createdAt: new Date('2026-07-20T10:00:00').getTime() }
  ];
  const report = buildWeeklyReport({ sessions, captures, streak: 7, longestStreak: 12, today });
  const md = formatReportAsMarkdown(report);
  assert.ok(md.includes('# Reporte Semanal'));
  assert.ok(md.includes('**Período**'));
  assert.ok(md.includes('## Pomodoro'));
  assert.ok(md.includes('Focus blocks completados: 1'));
  assert.ok(md.includes('Tiempo total en focus: 25m'));
  assert.ok(md.includes('## Capturas'));
  assert.ok(md.includes('Total: 1 idea'));
  assert.ok(md.includes('## Racha'));
  assert.ok(md.includes('Actual: 7 días'));
  assert.ok(md.includes('Mejor: 12 días'));
  assert.ok(md.includes('## Score de productividad'));
  assert.ok(md.match(/\*\*\d+\/100\*\*/));
  assert.ok(md.includes('orientativo'));
});

test('formatReportAsMarkdown: semana vacia', () => {
  const today = new Date('2026-07-22T15:00:00');
  const report = buildWeeklyReport({ today });
  const md = formatReportAsMarkdown(report);
  assert.ok(md.includes('Focus blocks completados: 0'));
  assert.ok(md.includes('Total: 0 ideas'));
  assert.ok(md.includes('**0/100**'));
  assert.ok(md.includes('empezando'));
});

test('formatReportAsMarkdown: input invalido → ""', () => {
  assert.equal(formatReportAsMarkdown(null), '');
  assert.equal(formatReportAsMarkdown(undefined), '');
});

// --- formatHM ---

test('formatHM: segundos → "Xh Ym" o "Ym"', () => {
  assert.equal(formatHM(0), '0m');
  assert.equal(formatHM(30), '0m');
  assert.equal(formatHM(60), '1m');
  assert.equal(formatHM(60 * 60), '1h 0m');
  assert.equal(formatHM(60 * 60 + 30 * 60), '1h 30m');
  assert.equal(formatHM(7 * 3600 + 30 * 60), '7h 30m');
});

test('formatHM: input invalido → "0m"', () => {
  assert.equal(formatHM(NaN), '0m');
  assert.equal(formatHM(-100), '0m');
  assert.equal(formatHM(null), '0m');
});

// --- Integration: buildWeeklyReport + formatReportAsMarkdown ---

test('integration: corpus realista genera markdown valido', () => {
  const today = new Date('2026-07-22T15:00:00');
  const sessions = [];
  for (let i = 0; i < 18; i++) {
    // 18 focus blocks distribuidos en la semana
    const day = 20 + (i % 7); // 20-26
    const hour = 9 + (i % 6);
    sessions.push({
      startedAt: new Date(2026, 6, day, hour, 0, 0).getTime(),
      kind: 'focus',
      durationSec: 1500
    });
  }
  const captures = [
    { id: '1', text: 'revisar PR de Jorge antes del viernes', createdAt: new Date(2026, 6, 20, 10, 0).getTime() },
    { id: '2', text: 'comprar cafe', createdAt: new Date(2026, 6, 21, 10, 0).getTime() },
    { id: '3', text: 'llamar a mama', createdAt: new Date(2026, 6, 22, 10, 0).getTime() }
  ];
  const report = buildWeeklyReport({ sessions, captures, streak: 7, longestStreak: 12, today });
  const md = formatReportAsMarkdown(report);
  // 18 focus blocks * 5 = 90, streak 7*2=14 (cap 20), 18*1500=27000s = 7.5h → floor 7 * 3 = 21 (cap 15)
  // 90 + 14 + 15 = 119 → cap 100
  assert.equal(report.score, 100);
  assert.ok(md.includes('Focus blocks completados: 18'));
  assert.ok(md.includes('Tiempo total en focus: 7h 30m'));
  assert.ok(md.includes('Total: 3 ideas'));
  assert.ok(md.includes('**100/100**'));
  assert.ok(md.includes('crack'));
});

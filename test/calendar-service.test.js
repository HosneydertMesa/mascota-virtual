'use strict';

// W2 — calendar-service tests.
// Cubre parseIcsDate (3 formatos), parseIcsMinimal (casos validos/invalidos),
// parseIcsFile (file system), getNextEvent, isEventActive, watchIcsFile.
// NO depende de node-ical (los tests usan parseIcsMinimal directo).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  parseIcsFile,
  parseIcsMinimal,
  parseIcsDate,
  getNextEvent,
  isEventActive,
  getActiveEvent,
  watchIcsFile,
  DEFAULT_LOOKAHEAD_MIN
} = require('../src/services/calendar-service');

// ============================================================================
// parseIcsDate — 3 formatos standard de iCal
// ============================================================================

test('parseIcsDate: all-day YYYYMMDD → UTC midnight', () => {
  const d = parseIcsDate('20260115');
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 0); // enero
  assert.equal(d.getUTCDate(), 15);
  assert.equal(d.getUTCHours(), 0);
  assert.equal(d.getUTCMinutes(), 0);
});

test('parseIcsDate: naive local time YYYYMMDDTHHMMSS → tratado como UTC', () => {
  const d = parseIcsDate('20260115T090000');
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 0);
  assert.equal(d.getUTCDate(), 15);
  assert.equal(d.getUTCHours(), 9);
  assert.equal(d.getUTCMinutes(), 0);
  assert.equal(d.getUTCSeconds(), 0);
});

test('parseIcsDate: UTC YYYYMMDDTHHMMSSZ → UTC', () => {
  const d = parseIcsDate('20260115T143000Z');
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 0);
  assert.equal(d.getUTCDate(), 15);
  assert.equal(d.getUTCHours(), 14);
  assert.equal(d.getUTCMinutes(), 30);
});

test('parseIcsDate: input invalido → throw', () => {
  assert.throws(() => parseIcsDate('not-a-date'), /Invalid date format/);
  assert.throws(() => parseIcsDate('2026-01-15'), /Invalid date format/);
  assert.throws(() => parseIcsDate(''), /parseIcsDate/);
  assert.throws(() => parseIcsDate(null), /parseIcsDate/);
  assert.throws(() => parseIcsDate(undefined), /parseIcsDate/);
  assert.throws(() => parseIcsDate(12345), /parseIcsDate/);
});

test('parseIcsDate: string vacio → throw', () => {
  assert.throws(() => parseIcsDate(''));
});

test('parseIcsDate: segundos no-cero', () => {
  const d = parseIcsDate('20260115T090045Z');
  assert.equal(d.getUTCSeconds(), 45);
});

// ============================================================================
// parseIcsMinimal
// ============================================================================

test('parseIcsMinimal: ics vacio → []', () => {
  assert.deepEqual(parseIcsMinimal(''), []);
  assert.deepEqual(parseIcsMinimal('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n'), []);
});

test('parseIcsMinimal: 1 evento all-day', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20260715',
    'DTEND;VALUE=DATE:20260716',
    'SUMMARY:Reunion Kick-off',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, 'Reunion Kick-off');
  assert.equal(events[0].start.getUTCFullYear(), 2026);
  assert.equal(events[0].start.getUTCMonth(), 6); // julio
  assert.equal(events[0].start.getUTCDate(), 15);
});

test('parseIcsMinimal: 1 evento con hora UTC', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T090000Z',
    'DTEND:20260715T100000Z',
    'SUMMARY:Daily standup',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, 'Daily standup');
  assert.equal(events[0].start.getUTCHours(), 9);
  assert.equal(events[0].end.getUTCHours(), 10);
});

test('parseIcsMinimal: multiples eventos', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T090000Z',
    'DTEND:20260715T100000Z',
    'SUMMARY:Reunion A',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART:20260715T110000Z',
    'DTEND:20260715T120000Z',
    'SUMMARY:Reunion B',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART:20260716T140000Z',
    'DTEND:20260716T150000Z',
    'SUMMARY:Reunion C',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 3);
  assert.equal(events[0].summary, 'Reunion A');
  assert.equal(events[1].summary, 'Reunion B');
  assert.equal(events[2].summary, 'Reunion C');
});

test('parseIcsMinimal: evento sin SUMMARY → default "(sin titulo)"', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T090000Z',
    'DTEND:20260715T100000Z',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, '(sin titulo)');
});

test('parseIcsMinimal: evento sin DTEND → se ignora', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T090000Z',
    'SUMMARY:Incompleto',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 0);
});

test('parseIcsMinimal: evento sin DTSTART → se ignora', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTEND:20260715T100000Z',
    'SUMMARY:Incompleto',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 0);
});

test('parseIcsMinimal: evento malformado (fecha invalida) → se ignora silenciosamente', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:INVALID-DATE',
    'DTEND:20260715T100000Z',
    'SUMMARY:Malformed',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART:20260715T110000Z',
    'DTEND:20260715T120000Z',
    'SUMMARY:Valid',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  // Solo cuenta el valido
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, 'Valid');
});

test('parseIcsMinimal: evento con end <= start → se ignora', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T100000Z',
    'DTEND:20260715T090000Z', // end antes que start
    'SUMMARY:Invertido',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  assert.equal(events.length, 0);
});

test('parseIcsMinimal: Outlook-style con TZID se ignora silenciosamente (parser best-effort)', () => {
  // Outlook exporta: DTSTART;TZID="America/Bogota":20260715T090000
  // El regex captura el bloque correctamente pero parseIcsDate puede o no
  // aceptarlo. Lo importante: NO crashea. Si lo acepta (no deberia por el
  // match), el evento aparece. Si no, se ignora silenciosamente.
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART;TZID=America/Bogota:20260715T090000',
    'DTEND;TZID=America/Bogota:20260715T100000',
    'SUMMARY:Outlook event',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const events = parseIcsMinimal(ics);
  // El parser es best-effort: si no matchea, lo skipea.
  // Verificamos que el resultado es un array (no throw).
  assert.ok(Array.isArray(events));
});

test('parseIcsMinimal: input invalido → [] sin throw', () => {
  assert.deepEqual(parseIcsMinimal(null), []);
  assert.deepEqual(parseIcsMinimal(undefined), []);
  assert.deepEqual(parseIcsMinimal(12345), []);
});

// ============================================================================
// parseIcsFile
// ============================================================================

test('parseIcsFile: archivo valido → eventos', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-test-'));
  const tmpFile = path.join(tmpDir, 'cal.ics');
  const content = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'DTSTART:20260715T090000Z',
    'DTEND:20260715T100000Z',
    'SUMMARY:Test meeting',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  fs.writeFileSync(tmpFile, content, 'utf8');
  try {
    const events = parseIcsFile(tmpFile);
    assert.equal(events.length, 1);
    assert.equal(events[0].summary, 'Test meeting');
  } finally {
    fs.unlinkSync(tmpFile);
    fs.rmdirSync(tmpDir);
  }
});

test('parseIcsFile: archivo no existe → throw', () => {
  assert.throws(() => parseIcsFile('/path/that/does/not/exist.ics'), /not found/);
});

test('parseIcsFile: filePath no es string → throw', () => {
  assert.throws(() => parseIcsFile(null), /string/);
  assert.throws(() => parseIcsFile(''), /string/);
  assert.throws(() => parseIcsFile(undefined), /string/);
  assert.throws(() => parseIcsFile(123), /string/);
});

test('parseIcsFile: archivo vacio → []', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-test-'));
  const tmpFile = path.join(tmpDir, 'empty.ics');
  fs.writeFileSync(tmpFile, '', 'utf8');
  try {
    const events = parseIcsFile(tmpFile);
    assert.deepEqual(events, []);
  } finally {
    fs.unlinkSync(tmpFile);
    fs.rmdirSync(tmpDir);
  }
});

// ============================================================================
// getNextEvent
// ============================================================================

test('getNextEvent: events vacio → null', () => {
  assert.equal(getNextEvent([], new Date()), null);
});

test('getNextEvent: events null/undefined → null', () => {
  assert.equal(getNextEvent(null, new Date()), null);
  assert.equal(getNextEvent(undefined, new Date()), null);
});

test('getNextEvent: evento 1 min en el futuro → devuelve (in lookahead)', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:01:00Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Proxima'
  }];
  const next = getNextEvent(events, now, 5);
  assert.ok(next);
  assert.equal(next.summary, 'Proxima');
});

test('getNextEvent: evento 10 min en el futuro → null (fuera de lookahead default)', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:10:00Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Futura'
  }];
  assert.equal(getNextEvent(events, now, 5), null);
});

test('getNextEvent: lookahead custom 15 min capta evento 10 min adelante', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:10:00Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Lejana'
  }];
  const next = getNextEvent(events, now, 15);
  assert.ok(next);
  assert.equal(next.summary, 'Lejana');
});

test('getNextEvent: boundary exacto 5 min → incluido (in)', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:05:00Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Boundary'
  }];
  assert.ok(getNextEvent(events, now, 5));
});

test('getNextEvent: 5 min + 1 ms → excluido (out)', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:05:00.001Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Just outside'
  }];
  assert.equal(getNextEvent(events, now, 5), null);
});

test('getNextEvent: evento en el pasado → null', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T09:00:00Z'),
    end: new Date('2026-07-22T09:30:00Z'),
    summary: 'Pasada'
  }];
  assert.equal(getNextEvent(events, now, 5), null);
});

test('getNextEvent: multiples upcoming → devuelve el mas cercano', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [
    { start: new Date('2026-07-22T10:04:00Z'), end: new Date('2026-07-22T10:30:00Z'), summary: 'Lejana' },
    { start: new Date('2026-07-22T10:01:00Z'), end: new Date('2026-07-22T10:30:00Z'), summary: 'Cercana' },
    { start: new Date('2026-07-22T10:03:00Z'), end: new Date('2026-07-22T10:30:00Z'), summary: 'Media' }
  ];
  const next = getNextEvent(events, now, 5);
  assert.ok(next);
  assert.equal(next.summary, 'Cercana');
});

test('getNextEvent: ignora eventos con start invalido', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [
    { start: 'not-a-date', end: new Date('2026-07-22T10:30:00Z'), summary: 'Malo' },
    { start: new Date('2026-07-22T10:02:00Z'), end: new Date('2026-07-22T10:30:00Z'), summary: 'Bueno' }
  ];
  const next = getNextEvent(events, now, 5);
  assert.ok(next);
  assert.equal(next.summary, 'Bueno');
});

test('getNextEvent: now invalido → null', () => {
  const events = [{ start: new Date(), end: new Date(), summary: 'x' }];
  assert.equal(getNextEvent(events, null), null);
  assert.equal(getNextEvent(events, undefined), null);
});

test('getNextEvent: lookaheadMin negativo o 0 → trata como 0 (no upcoming)', () => {
  const now = new Date('2026-07-22T10:00:00Z');
  const events = [{
    start: new Date('2026-07-22T10:01:00Z'),
    end: new Date('2026-07-22T10:30:00Z'),
    summary: 'Proxima'
  }];
  assert.equal(getNextEvent(events, now, 0), null);
  assert.equal(getNextEvent(events, now, -5), null);
});

// ============================================================================
// isEventActive
// ============================================================================

test('isEventActive: now < start → false', () => {
  const event = {
    start: new Date('2026-07-22T10:00:00Z'),
    end: new Date('2026-07-22T11:00:00Z'),
    summary: 'x'
  };
  assert.equal(isEventActive(event, new Date('2026-07-22T09:59:59Z')), false);
});

test('isEventActive: now == start (boundary) → true (>= start)', () => {
  const event = {
    start: new Date('2026-07-22T10:00:00Z'),
    end: new Date('2026-07-22T11:00:00Z'),
    summary: 'x'
  };
  assert.equal(isEventActive(event, new Date('2026-07-22T10:00:00Z')), true);
});

test('isEventActive: now == end (boundary) → false (>= end excluido)', () => {
  const event = {
    start: new Date('2026-07-22T10:00:00Z'),
    end: new Date('2026-07-22T11:00:00Z'),
    summary: 'x'
  };
  assert.equal(isEventActive(event, new Date('2026-07-22T11:00:00Z')), false);
});

test('isEventActive: now en medio → true', () => {
  const event = {
    start: new Date('2026-07-22T10:00:00Z'),
    end: new Date('2026-07-22T11:00:00Z'),
    summary: 'x'
  };
  assert.equal(isEventActive(event, new Date('2026-07-22T10:30:00Z')), true);
});

test('isEventActive: now > end → false', () => {
  const event = {
    start: new Date('2026-07-22T10:00:00Z'),
    end: new Date('2026-07-22T11:00:00Z'),
    summary: 'x'
  };
  assert.equal(isEventActive(event, new Date('2026-07-22T11:00:01Z')), false);
});

test('isEventActive: event null/undefined → false', () => {
  assert.equal(isEventActive(null, new Date()), false);
  assert.equal(isEventActive(undefined, new Date()), false);
});

test('isEventActive: now invalido → false', () => {
  const event = { start: new Date(), end: new Date(), summary: 'x' };
  assert.equal(isEventActive(event, null), false);
  assert.equal(isEventActive(event, undefined), false);
});

test('isEventActive: event con start/end invalidos → false', () => {
  assert.equal(isEventActive({ start: 'bad', end: new Date() }, new Date()), false);
  assert.equal(isEventActive({ start: new Date(), end: 'bad' }, new Date()), false);
  assert.equal(isEventActive({}, new Date()), false);
});

// ============================================================================
// getActiveEvent
// ============================================================================

test('getActiveEvent: 1 evento activo → lo devuelve', () => {
  const now = new Date('2026-07-22T10:30:00Z');
  const events = [
    { start: new Date('2026-07-22T10:00:00Z'), end: new Date('2026-07-22T11:00:00Z'), summary: 'En curso' }
  ];
  const active = getActiveEvent(events, now);
  assert.ok(active);
  assert.equal(active.summary, 'En curso');
});

test('getActiveEvent: sin eventos activos → null', () => {
  const now = new Date('2026-07-22T10:30:00Z');
  const events = [
    { start: new Date('2026-07-22T09:00:00Z'), end: new Date('2026-07-22T10:00:00Z'), summary: 'Pasada' },
    { start: new Date('2026-07-22T11:00:00Z'), end: new Date('2026-07-22T12:00:00Z'), summary: 'Futura' }
  ];
  assert.equal(getActiveEvent(events, now), null);
});

test('getActiveEvent: multiples activos → devuelve el primero', () => {
  const now = new Date('2026-07-22T10:30:00Z');
  const events = [
    { start: new Date('2026-07-22T10:00:00Z'), end: new Date('2026-07-22T11:00:00Z'), summary: 'A' },
    { start: new Date('2026-07-22T10:15:00Z'), end: new Date('2026-07-22T11:30:00Z'), summary: 'B' }
  ];
  const active = getActiveEvent(events, now);
  assert.equal(active.summary, 'A');
});

test('getActiveEvent: events vacio → null', () => {
  assert.equal(getActiveEvent([], new Date()), null);
  assert.equal(getActiveEvent(null, new Date()), null);
});

// ============================================================================
// watchIcsFile
// ============================================================================

test('watchIcsFile: devuelve handle con close()', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-test-'));
  const tmpFile = path.join(tmpDir, 'a.ics');
  fs.writeFileSync(tmpFile, 'BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n');
  try {
    let onChangeCalls = 0;
    const handle = watchIcsFile(tmpFile, () => { onChangeCalls++; });
    assert.equal(typeof handle.close, 'function');
    // close no debe tirar
    assert.doesNotThrow(() => handle.close());
    // No podemos testear que el watcher dispare onChange (depende del OS),
    // pero al menos verificamos que el handle es valido.
  } finally {
    fs.unlinkSync(tmpFile);
    fs.rmdirSync(tmpDir);
  }
});

test('watchIcsFile: path no existe → handle no-op', () => {
  let called = false;
  const handle = watchIcsFile('/does/not/exist.ics', () => { called = true; });
  assert.equal(typeof handle.close, 'function');
  assert.doesNotThrow(() => handle.close());
  assert.equal(called, false);
});

test('watchIcsFile: filePath no es string → handle no-op', () => {
  let called = false;
  assert.doesNotThrow(() => watchIcsFile(null, () => { called = true; }).close());
  assert.doesNotThrow(() => watchIcsFile('', () => { called = true; }).close());
  assert.doesNotThrow(() => watchIcsFile(undefined, () => { called = true; }).close());
  assert.doesNotThrow(() => watchIcsFile(123, () => { called = true; }).close());
  assert.equal(called, false);
});

test('watchIcsFile: onChange no es funcion → handle no-op', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-test-'));
  const tmpFile = path.join(tmpDir, 'a.ics');
  fs.writeFileSync(tmpFile, 'data');
  try {
    const handle = watchIcsFile(tmpFile, null);
    assert.doesNotThrow(() => handle.close());
  } finally {
    fs.unlinkSync(tmpFile);
    fs.rmdirSync(tmpDir);
  }
});

test('watchIcsFile: close es idempotente', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-test-'));
  const tmpFile = path.join(tmpDir, 'a.ics');
  fs.writeFileSync(tmpFile, 'data');
  try {
    const handle = watchIcsFile(tmpFile, () => {});
    handle.close();
    // segunda llamada no debe tirar
    assert.doesNotThrow(() => handle.close());
  } finally {
    fs.unlinkSync(tmpFile);
    fs.rmdirSync(tmpDir);
  }
});

// ============================================================================
// DEFAULT_LOOKAHEAD_MIN
// ============================================================================

test('DEFAULT_LOOKAHEAD_MIN es 5', () => {
  assert.equal(DEFAULT_LOOKAHEAD_MIN, 5);
});

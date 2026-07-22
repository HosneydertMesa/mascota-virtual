'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_CHECK_INTERVAL_MS,
  shouldCheckForUpdate,
  isNewerVersion,
  formatUpdateMessage,
  _parseSemver,
  _stripVPrefix
} = require('../src/core/auto-updater');

// --- Constantes ------------------------------------------------------------

test('DEFAULT_CHECK_INTERVAL_MS es 6 horas (en ms)', () => {
  assert.equal(DEFAULT_CHECK_INTERVAL_MS, 6 * 60 * 60 * 1000);
});

// --- shouldCheckForUpdate --------------------------------------------------

test('shouldCheckForUpdate: primer check (lastCheck=0) → true', () => {
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: 0, now: 1_700_000_000_000 }), true);
});

test('shouldCheckForUpdate: lastCheck negativo → true (fallback defensivo)', () => {
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: -1, now: 1_700_000_000_000 }), true);
});

test('shouldCheckForUpdate: dentro del intervalo → false', () => {
  const now = 1_700_000_000_000;
  const interval = DEFAULT_CHECK_INTERVAL_MS;
  // lastCheck fue hace 1 hora
  assert.equal(
    shouldCheckForUpdate({ lastCheckTimestamp: now - (60 * 60 * 1000), now, intervalMs: interval }),
    false
  );
});

test('shouldCheckForUpdate: exactamente en el boundary → true', () => {
  const now = 1_700_000_000_000;
  const interval = DEFAULT_CHECK_INTERVAL_MS;
  // lastCheck fue hace EXACTAMENTE `interval` ms
  //  now - lastCheck === interval  →  diff < interval es FALSE  →  retorna true
  assert.equal(
    shouldCheckForUpdate({ lastCheckTimestamp: now - interval, now, intervalMs: interval }),
    true
  );
});

test('shouldCheckForUpdate: pasado el intervalo → true', () => {
  const now = 1_700_000_000_000;
  // lastCheck fue hace 7 horas
  assert.equal(
    shouldCheckForUpdate({ lastCheckTimestamp: now - (7 * 60 * 60 * 1000), now }),
    true
  );
});

test('shouldCheckForUpdate: intervalo custom', () => {
  const now = 1_700_000_000_000;
  // intervalo de 30 minutos, lastCheck fue hace 31 min
  assert.equal(
    shouldCheckForUpdate({ lastCheckTimestamp: now - (31 * 60 * 1000), now, intervalMs: 30 * 60 * 1000 }),
    true
  );
  // intervalo de 30 minutos, lastCheck fue hace 29 min
  assert.equal(
    shouldCheckForUpdate({ lastCheckTimestamp: now - (29 * 60 * 1000), now, intervalMs: 30 * 60 * 1000 }),
    false
  );
});

test('shouldCheckForUpdate: now invalido (NaN) → false', () => {
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: 0, now: NaN }), false);
});

test('shouldCheckForUpdate: lastCheck invalido (NaN) → false', () => {
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: NaN, now: 1000 }), false);
});

test('shouldCheckForUpdate: intervalMs <= 0 → false (defensivo)', () => {
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: 0, now: 1000, intervalMs: 0 }), false);
  assert.equal(shouldCheckForUpdate({ lastCheckTimestamp: 0, now: 1000, intervalMs: -1 }), false);
});

test('shouldCheckForUpdate: argumentos vacios → false (no crashea)', () => {
  assert.equal(shouldCheckForUpdate(), false);
  assert.equal(shouldCheckForUpdate({}), false);
});

// --- isNewerVersion --------------------------------------------------------

test('isNewerVersion: 2.0.0 vs 2.0.1 → true (patch)', () => {
  assert.equal(isNewerVersion('2.0.0', '2.0.1'), true);
});

test('isNewerVersion: 2.0.1 vs 2.0.0 → false (downgrade)', () => {
  assert.equal(isNewerVersion('2.0.1', '2.0.0'), false);
});

test('isNewerVersion: 2.0.0 vs 2.1.0 → true (minor)', () => {
  assert.equal(isNewerVersion('2.0.0', '2.1.0'), true);
});

test('isNewerVersion: 2.0.0 vs 3.0.0 → true (major)', () => {
  assert.equal(isNewerVersion('2.0.0', '3.0.0'), true);
});

test('isNewerVersion: 2.0.0 vs 2.0.0 → false (equal)', () => {
  assert.equal(isNewerVersion('2.0.0', '2.0.0'), false);
});

test('isNewerVersion: con prefijo "v" → funciona', () => {
  assert.equal(isNewerVersion('v2.0.0', 'v2.0.1'), true);
  assert.equal(isNewerVersion('v2.0.0', '2.0.1'), true);
  assert.equal(isNewerVersion('2.0.0', 'v2.0.1'), true);
});

test('isNewerVersion: pre-release 2.0.0-beta.1 < 2.0.0', () => {
  assert.equal(isNewerVersion('2.0.0-beta.1', '2.0.0'), true);
  assert.equal(isNewerVersion('2.0.0', '2.0.0-beta.1'), false);
});

test('isNewerVersion: pre-release 2.0.0-beta.1 vs 2.0.0-beta.2 → true', () => {
  assert.equal(isNewerVersion('2.0.0-beta.1', '2.0.0-beta.2'), true);
});

test('isNewerVersion: pre-release 2.0.0-rc.1 < 2.0.0', () => {
  assert.equal(isNewerVersion('2.0.0-rc.1', '2.0.0'), true);
});

test('isNewerVersion: input invalido devuelve false (no error)', () => {
  assert.equal(isNewerVersion('not-a-version', '2.0.0'), false);
  assert.equal(isNewerVersion('2.0.0', 'not-a-version'), false);
  assert.equal(isNewerVersion('2.0.0', null), false);
  assert.equal(isNewerVersion(undefined, '2.0.0'), false);
});

test('isNewerVersion: version incompleta (1-2 partes) → false', () => {
  assert.equal(isNewerVersion('2', '2.0.0'), false);
  assert.equal(isNewerVersion('2.0', '2.0.0'), false);
  assert.equal(isNewerVersion('2.0.0', '2'), false);
});

test('isNewerVersion: input vacio / whitespace → false', () => {
  assert.equal(isNewerVersion('', '2.0.0'), false);
  assert.equal(isNewerVersion('2.0.0', ''), false);
  assert.equal(isNewerVersion('   ', '2.0.0'), false);
});

// --- formatUpdateMessage ---------------------------------------------------

test('formatUpdateMessage: kind=available → "v{X} downloading..."', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: '2.0.1', kind: 'available' }),
    'Update v2.0.1 downloading...'
  );
});

test('formatUpdateMessage: kind=downloaded → "v{X} listo"', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: '2.0.1', kind: 'downloaded' }),
    'Update v2.0.1 listo. Se instala al cerrar la app.'
  );
});

test('formatUpdateMessage: con prefijo "v" en newVersion → strippea', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: 'v2.0.1', kind: 'available' }),
    'Update v2.0.1 downloading...'
  );
});

test('formatUpdateMessage: kind desconocido cae a available', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: '2.0.1', kind: 'weird-kind' }),
    'Update v2.0.1 downloading...'
  );
});

test('formatUpdateMessage: kind undefined → "downloading..."', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: '2.0.1' }),
    'Update v2.0.1 downloading...'
  );
});

test('formatUpdateMessage: newVersion vacio → "" (no muestra nada)', () => {
  assert.equal(
    formatUpdateMessage({ currentVersion: '2.0.0', newVersion: '', kind: 'available' }),
    ''
  );
});

test('formatUpdateMessage: argumentos vacios → ""', () => {
  assert.equal(formatUpdateMessage(), '');
  assert.equal(formatUpdateMessage({}), '');
});

// --- _parseSemver (internals, pero testeados para confianza) ---------------

test('_parseSemver: "2.0.0" → { major: 2, minor: 0, patch: 0, prerelease: [] }', () => {
  assert.deepEqual(_parseSemver('2.0.0'), { major: 2, minor: 0, patch: 0, prerelease: [] });
});

test('_parseSemver: "v1.2.3" → strip v', () => {
  assert.deepEqual(_parseSemver('v1.2.3'), { major: 1, minor: 2, patch: 3, prerelease: [] });
});

test('_parseSemver: "2.0.0-beta.1" → prerelease=["beta","1"]', () => {
  assert.deepEqual(_parseSemver('2.0.0-beta.1'), { major: 2, minor: 0, patch: 0, prerelease: ['beta', '1'] });
});

test('_parseSemver: input invalido → null', () => {
  assert.equal(_parseSemver('2'), null);
  assert.equal(_parseSemver('2.0'), null);
  assert.equal(_parseSemver('not-a-version'), null);
  assert.equal(_parseSemver(''), null);
  assert.equal(_parseSemver(null), null);
  assert.equal(_parseSemver(undefined), null);
  assert.equal(_parseSemver(123), null);
});

// --- _stripVPrefix ---------------------------------------------------------

test('_stripVPrefix: lowercase v', () => {
  assert.equal(_stripVPrefix('v2.0.0'), '2.0.0');
});

test('_stripVPrefix: uppercase V', () => {
  assert.equal(_stripVPrefix('V2.0.0'), '2.0.0');
});

test('_stripVPrefix: no prefix', () => {
  assert.equal(_stripVPrefix('2.0.0'), '2.0.0');
});

test('_stripVPrefix: empty / invalid', () => {
  assert.equal(_stripVPrefix(''), '');
  assert.equal(_stripVPrefix(null), '');
  assert.equal(_stripVPrefix(undefined), '');
  assert.equal(_stripVPrefix(123), '');
});

// --- Export shape ----------------------------------------------------------

test('module.exports tiene todas las funciones esperadas', () => {
  const exports = require('../src/core/auto-updater');
  assert.equal(typeof exports.shouldCheckForUpdate, 'function');
  assert.equal(typeof exports.isNewerVersion, 'function');
  assert.equal(typeof exports.formatUpdateMessage, 'function');
  assert.equal(typeof exports.DEFAULT_CHECK_INTERVAL_MS, 'number');
});

test('module.exports funciona en Node (CommonJS)', () => {
  // Esto se valida implicitamente con el require() arriba; ademas verificamos
  // que NO estamos en un browser context (window undefined en Node).
  assert.equal(typeof window, 'undefined');
  const exports = require('../src/core/auto-updater');
  assert.ok(exports);
});

test('commented example: module shape tambien sirve para browser (window.AutoUpdater)', () => {
  // No ejecutamos un browser real aca (no tenemos DOM), pero validamos que
  // el modulo es assignable a window sin romperse. Esto es lo que pasaria
  // si el modulo se cargara via <script> en el dashboard:
  //
  //   <script src="core/auto-updater.js"></script>
  //   <script>
  //     window.AutoUpdater.shouldCheckForUpdate({...});
  //   </script>
  //
  // Verificamos que las funciones no dependen de Node-only APIs (require, fs, etc).
  const src = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'src', 'core', 'auto-updater.js'),
    'utf8'
  );
  // No debe haber require() (excepto el de 'node:fs' en este test)
  // ni process.* ni globalThis.* raros
  assert.ok(!src.includes("require('electron')"), 'no debe requerir electron');
  assert.ok(!src.includes("require('fs')"), 'no debe requerir fs');
  assert.ok(!src.includes("require('path')"), 'no debe requerir path');
  assert.ok(src.includes('window.AutoUpdater'), 'debe exponer en window.AutoUpdater para browser');
});

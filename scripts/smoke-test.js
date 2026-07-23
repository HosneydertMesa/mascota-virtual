#!/usr/bin/env node
'use strict';

/**
 * Smoke test pre-release.
 *
 * Cierra el loophole del v2.0.0 (QA "deferred to user") corriendo la app
 * Electron por 10 segundos, capturando stderr/stdout, y fallando si hay
 * errores criticos (Uncaught, TypeError, ReferenceError, fs errors, etc).
 *
 * Uso:
 *   node scripts/smoke-test.js
 *   node scripts/smoke-test.js --timeout 15
 *
 * Que detecta:
 * - main.js crashes on startup
 * - petWindow (renderer.js) crashes on init
 * - errores de asar/missing files
 * - IPC handler errors
 * - electron-updater errors
 *
 * Que NO detecta (todavia):
 * - dashboard init flow (eso se cubre con test/dashboard-init.test.js)
 *   porque el dashboard se abre por user action, no en startup
 * - errores de UI que solo se ven en pantalla
 *
 * Exit codes:
 *   0 = OK
 *   1 = error critico encontrado
 *   2 = timeout o spawn error
 */

const { spawn } = require('node:child_process');
const path = require('node:path');

const TIMEOUT_SEC = parseInt(process.argv.find((a, i) => process.argv[i - 1] === '--timeout') || '10', 10);
const ROOT = process.cwd();

console.log(`[smoke-test] Iniciando Electron por ${TIMEOUT_SEC}s...`);

const proc = spawn('cmd.exe', ['/c', 'npm.cmd', 'start'], {
  cwd: ROOT,
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
proc.stdout.on('data', d => { stdout += d.toString(); });
proc.stderr.on('data', d => { stderr += d.toString(); });

// Patterns de errores criticos
const CRITICAL_PATTERNS = [
  /Uncaught (Exception|Error)/,
  /TypeError:/,
  /ReferenceError:/,
  /SyntaxError:/,
  /Cannot find module/,
  /MODULE_NOT_FOUND/,
  /EBADF/,
  /EACCES/,
  /EPERM/,
  /Error: ENOENT/,
  /Error: EISDIR/,
  /throw new Error/,
  /\bPromise rejection\b/i
];

// Patterns que son warnings/benignos (no bloquean)
const BENIGN_PATTERNS = [
  /DevTools/,
  /Autofill\.enable/,
  /Autofill\.setAddresses/,
  /Autofill\.setCreditCards/,
  /Electron Security Warning/,
  /deprecat/i
];

const findings = [];
function checkOutput() {
  const combined = stdout + stderr;
  for (const pattern of CRITICAL_PATTERNS) {
    const matches = combined.match(new RegExp(pattern.source, pattern.flags + 'g'));
    if (!matches) continue;
    for (const match of matches) {
      // Skip si esta cerca de un benign pattern
      const context = combined.substring(
        Math.max(0, combined.indexOf(match) - 200),
        Math.min(combined.length, combined.indexOf(match) + 200)
      );
      const isBenign = BENIGN_PATTERNS.some(bp => bp.test(context));
      if (isBenign) continue;
      findings.push(match);
    }
  }
}

// Check cada segundo
const checkInterval = setInterval(() => {
  checkOutput();
  if (findings.length > 0) {
    console.log(`\n[smoke-test] ERROR CRITICO detectado:`);
    findings.forEach(f => console.log(`  - ${f}`));
  }
}, 1000);

// Kill despues de TIMEOUT_SEC
const killTimer = setTimeout(() => {
  console.log(`[smoke-test] Timeout alcanzado (${TIMEOUT_SEC}s). Cerrando Electron...`);
  try {
    proc.kill('SIGTERM');
  } catch (_e) { /* ignore */ }
  setTimeout(() => {
    try { proc.kill('SIGKILL'); } catch (_e) { /* ignore */ }
  }, 3000);
}, TIMEOUT_SEC * 1000);

proc.on('exit', (code) => {
  clearInterval(checkInterval);
  clearTimeout(killTimer);
  checkOutput();

  console.log(`\n[smoke-test] Electron salio con codigo ${code}`);

  if (findings.length === 0) {
    console.log('[smoke-test] OK — no se detectaron errores criticos en ' + TIMEOUT_SEC + 's');
    console.log('[smoke-test] NOTA: dashboard init NO se prueba aca (requiere user action).');
    console.log('             Para eso: node --test test/dashboard-init.test.js');
    process.exit(0);
  } else {
    console.log(`\n[smoke-test] FAILED — ${findings.length} error(es) critico(s):`);
    findings.forEach(f => console.log(`  - ${f}`));
    console.log('\n[smoke-test] Ultimas 30 lineas de stderr:');
    console.log(stderr.split('\n').slice(-30).join('\n'));
    process.exit(1);
  }
});

proc.on('error', (err) => {
  clearInterval(checkInterval);
  clearTimeout(killTimer);
  console.error(`[smoke-test] Spawn error: ${err.message}`);
  process.exit(2);
});

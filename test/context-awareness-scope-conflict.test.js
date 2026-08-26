'use strict';

/**
 * Regression test — strict-mode scope conflict entre context-awareness.js
 * y dashboard-renderer.js (HOTFIX v2.0.2)
 *
 * Bug v2.0.0/v2.0.1 (reportado 2026-07-22):
 *   context-awareness.js declaraba `function shouldEnterDoNotDisturb(...)`
 *   a top-level (global scope).
 *   dashboard-renderer.js hacia `const { shouldEnterDoNotDisturb, ... } =
 *   window.ContextAwareness;` tambien a top-level.
 *   En strict mode, tener `function` + `const` con el mismo nombre en el
 *   mismo scope es SyntaxError. App completa no respondia, ni el X cerrar.
 *
 *   DevTools: "Uncaught SyntaxError: Identifier 'shouldEnterDoNotDisturb'
 *   has already been declared (at dashboard-renderer.js:1)"
 *
 * Fix: wrappear context-awareness.js en IIFE para que las funciones queden
 * privadas y NO contaminen el scope global. La API se sigue exponiendo via
 * `window.ContextAwareness` para que dashboard-renderer.js pueda destructurar.
 *
 * Test BIDIRECCIONAL: con IIFE verde, sin IIFE falla (cubre regresion real).
 *
 * El test simula el escenario del browser cargando ambos scripts en el
 * mismo Function() body (mismo scope global).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const CONTEXT_AWARENESS = fs.readFileSync(
  path.join(ROOT, 'src', 'core', 'context-awareness.js'),
  'utf8'
);
const DASHBOARD_RENDERER_FRAGMENT = `
  // Fragmento del destructure problematico (lineas 799-803 del original).
  // Lo evaluamos con un window mock que expone ContextAwareness.
  const { shouldEnterDoNotDisturb, shouldExitDoNotDisturb, computeTypingRate } = window.ContextAwareness;
  if (typeof shouldEnterDoNotDisturb !== 'function') throw new Error('shouldEnterDoNotDisturb no es funcion');
  if (typeof shouldExitDoNotDisturb !== 'function') throw new Error('shouldExitDoNotDisturb no es funcion');
  if (typeof computeTypingRate !== 'function') throw new Error('computeTypingRate no es funcion');
`;

function simulateDashboardLoad() {
  // Simula el orden de carga: context-awareness.js PRIMERO, luego dashboard-renderer.js
  // En el browser real, ambos corren en el mismo global scope del dashboard window.
  // Pasamos `window` como parametro para que el IIFE wrapper lo pueda usar.
  const window = {};
  const code = CONTEXT_AWARENESS + '\n' + DASHBOARD_RENDERER_FRAGMENT;
  const fn = new Function('window', code);
  fn(window);
  return window;
}

test('context-awareness.js: API publica intacta (module.exports + window.ContextAwareness)', () => {
  // Modo Node (como usan los tests)
  const mod = { exports: {} };
  const fn = new Function('module', 'window', CONTEXT_AWARENESS);
  fn(mod, undefined);
  assert.strictEqual(typeof mod.exports.shouldEnterDoNotDisturb, 'function');
  assert.strictEqual(typeof mod.exports.shouldExitDoNotDisturb, 'function');
  assert.strictEqual(typeof mod.exports.computeTypingRate, 'function');
  assert.strictEqual(typeof mod.exports.isSystemIdle, 'function');
  assert.strictEqual(typeof mod.exports.formatIdleTime, 'function');
});

test('context-awareness.js: en browser expone window.ContextAwareness', () => {
  const window = simulateDashboardLoad();
  assert.ok(window.ContextAwareness, 'window.ContextAwareness no se seteo');
  assert.strictEqual(typeof window.ContextAwareness.shouldEnterDoNotDisturb, 'function');
  assert.strictEqual(typeof window.ContextAwareness.shouldExitDoNotDisturb, 'function');
  assert.strictEqual(typeof window.ContextAwareness.computeTypingRate, 'function');
});

test('REGRESION: dashboard-renderer.js + context-awareness.js NO colisionan (fix v2.0.2)', () => {
  // Antes del fix, esto tiraba:
  //   "SyntaxError: Identifier 'shouldEnterDoNotDisturb' has already been declared"
  // porque context-awareness.js tenia `function shouldEnterDoNotDisturb`
  // y dashboard-renderer.js hacia `const { shouldEnterDoNotDisturb } = ...`
  // en el mismo scope global.
  const window = simulateDashboardLoad();
  // El destructure del dashboard-renderer.js no debe haber tirado
  // (si llegamos aca, no tiro). Verificamos que la funcion destructurada
  // es la MISMA referencia que window.ContextAwareness.shouldEnterDoNotDisturb.
  const caRef = window.ContextAwareness.shouldEnterDoNotDisturb;
  assert.strictEqual(typeof caRef, 'function');
  // Smoke test: que funcione con input basico
  assert.strictEqual(caRef([]), false, 'shouldEnterDoNotDisturb([]) deberia ser false');
});

test('BIDIRECCIONAL: sin IIFE, el conflict SE REPRODUCE (sentinel)', () => {
  // Para verificar que el test no es placebo, simulamos el archivo
  // SIN el IIFE wrapper (como era antes del fix) y confirmamos que falla.
  const buggy = `'use strict';
function shouldEnterDoNotDisturb() { return false; }
const ContextAwareness = { shouldEnterDoNotDisturb };
if (typeof module !== 'undefined' && module.exports) { module.exports = ContextAwareness; }
`;
  const dashboardFragment = `
const { shouldEnterDoNotDisturb } = window.ContextAwareness;
`;
  const window = {};
  const code = buggy + '\nglobalThis.window = window;\n' + dashboardFragment;
  assert.throws(
    () => new Function(code)(),
    /shouldEnterDoNotDisturb/,
    'sin IIFE el conflict DEBE reproducirse — si no, el test es placebo'
  );
});

test('No quedan top-level function declarations en context-awareness.js', () => {
  // Despues del fix, no debe haber `function NAME` a top-level (fuera del IIFE)
  // porque estarian en el global scope y podrian colisionar.
  // Esto es un guard estructural para futuros refactors.
  const stripped = CONTEXT_AWARENESS
    .replace(/\/\*[\s\S]*?\*\//g, '')    // block comments
    .replace(/\/\/.*$/gm, '');            // line comments
  // El unico `function` permitido a top-level es la IIFE wrapper
  // `function (root) {`. Cualquier OTRO `function NAME` debe estar adentro.
  const lines = stripped.split('\n');
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Track brace depth
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    if (depth === 0 && /^function\s+[A-Za-z_$]/.test(line)) {
      // A top-level `function NAME` is only OK if it's the IIFE wrapper.
      // The IIFE wrapper is `(function (root) {` not `function NAME`.
      assert.fail(`Top-level function declaration en linea ${i + 1}: ${line}. Wrappear en IIFE para evitar colision strict mode.`);
    }
  }
});

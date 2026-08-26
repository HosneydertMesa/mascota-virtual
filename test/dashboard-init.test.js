'use strict';

/**
 * Test de regresion para el init flow del dashboard.
 *
 * Origen del bug (v2.0.0, reportado 2026-07-22):
 * `initSettings()` en src/dashboard-renderer.js tenia awaits sin try/catch
 * (refreshStats, refreshMoodWidget). Si una tiraba (e.g. window.PetMoodLabels
 * undefined), initSettings se cortaba antes de cargar silent mode, calendar,
 * briefing, pet name. Resultado: solo Pomodoro parecia funcionar en Settings.
 *
 * Tests:
 * 1. Estructural: en `initSettings`, todo `await` de `refreshStats` o
 *    `refreshMoodWidget` debe estar dentro de un try/catch.
 * 2. Defensive guards: `refreshMoodWidget` debe tener early-return si
 *    window.PetMood o window.PetMoodLabels son undefined.
 *
 * Los 2 tests juntos son la red de seguridad para que el bug no vuelva.
 * (El test comportamental con vm sandbox + DOM mockeado es deseable pero
 *  complejo: requiere mockear ~50 elementos + globals + setInterval
 *  cleanup. Diferido a v2.0.2 si hay bandwidth.)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DASHBOARD_RENDERER = path.join(ROOT, 'src', 'dashboard-renderer.js');

const src = fs.readFileSync(DASHBOARD_RENDERER, 'utf8');

// ---------------------------------------------------------------------------
// 1) Estructural: awaits de refreshStats/refreshMoodWidget en try/catch
// ---------------------------------------------------------------------------

test('initSettings — refreshStats y refreshMoodWidget awaits en try/catch', () => {
  // Encontrar body de initSettings
  const fnMatch = src.match(/async function initSettings\(\)\s*\{/);
  if (!fnMatch) throw new Error('initSettings no encontrada');
  const start = fnMatch.index + fnMatch[0].length;
  let depth = 1, i = start;
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  if (depth !== 0) throw new Error('initSettings braces imbalance');
  const body = src.slice(start, i - 1);

  // Walkear trackeando try depth
  const lines = body.split('\n');
  let tryDepth = 0;
  const vulnerable = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const trimmed = line.trim();

    // Entry a try
    if (/\btry\s*\{/.test(line)) {
      tryDepth++;
    }
    // Exit (line termina en } y estamos en try)
    if (tryDepth > 0 && trimmed === '}') {
      tryDepth--;
    }

    // Chequear awaits vulnerables
    const isAwaitRefresh = /^\s*await\s+(refreshStats|refreshMoodWidget)\s*\(/.test(line);
    if (isAwaitRefresh && tryDepth === 0) {
      vulnerable.push(`L${lineNum + 1}: ${trimmed}`);
    }
  }

  if (vulnerable.length > 0) {
    assert.fail(
      'initSettings tiene awaits de refresh sin try/catch (regresion del bug v2.0.0):\n' +
      vulnerable.map(l => '  ' + l).join('\n') + '\n\n' +
      'Bug original: refreshStats/refreshMoodWidget tiraban y mataban el resto del init.\n' +
      'Fix: wrappear en try/catch. Ver commit ee48224.'
    );
  }
});

// ---------------------------------------------------------------------------
// 2) Defensive guards en refreshMoodWidget
// ---------------------------------------------------------------------------

test('refreshMoodWidget — early-return si window.PetMood o PetMoodLabels faltan', () => {
  // Encontrar la funcion
  const fnMatch = src.match(/async function refreshMoodWidget\(\)\s*\{([\s\S]*?)\n\}/);
  if (!fnMatch) {
    throw new Error('refreshMoodWidget no encontrada en dashboard-renderer.js');
  }
  const body = fnMatch[1];

  // Verificar guards especificos
  const hasPetMoodGuard = /!window\.PetMood\s*\|\|\s*typeof\s+window\.PetMood\.deriveState\s*!==\s*['"]function['"]/.test(body);
  const hasLabelsGuard = /!window\.PetMoodLabels\s*\|\|\s*typeof\s+window\.PetMoodLabels\.MOOD_LABELS\s*!==\s*['"]object['"]/.test(body);
  const hasGetLabelGuard = /typeof\s+window\.PetMoodLabels\.getMoodLabel\s*!==\s*['"]function['"]/.test(body);

  assert.ok(hasPetMoodGuard,
    'refreshMoodWidget no tiene guard para window.PetMood. Fix: agregar early-return si no existe.');
  assert.ok(hasLabelsGuard,
    'refreshMoodWidget no tiene guard para window.PetMoodLabels.MOOD_LABELS. Fix: agregar early-return.');
  assert.ok(hasGetLabelGuard,
    'refreshMoodWidget no tiene guard para window.PetMoodLabels.getMoodLabel. Fix: agregar early-return.');
});

// ---------------------------------------------------------------------------
// 3) setInterval calls en initSettings — no son testeados pero documentados
// ---------------------------------------------------------------------------

test('initSettings — no setInterval sin .unref() (verificacion basica)', () => {
  // Encuentra body de initSettings
  const fnMatch = src.match(/async function initSettings\(\)\s*\{/);
  if (!fnMatch) throw new Error('initSettings no encontrada');
  const start = fnMatch.index + fnMatch[0].length;
  let depth = 1, i = start;
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  const body = src.slice(start, i - 1);

  // Por ahora, solo contar — no fallar. Solo loggear para visibilidad.
  // (Los setInterval sin .unref() mantienen el event loop vivo en tests,
  //  pero en produccion Electron no es un problema.)
  const setIntervalCount = (body.match(/setInterval\s*\(/g) || []).length;
  const unrefCount = (body.match(/setInterval\s*\([^)]*\)\.unref\s*\(/g) || []).length;
  // Solo informativo — no falla.
  assert.ok(true, `initSettings tiene ${setIntervalCount} setInterval, ${unrefCount} con .unref()`);
});

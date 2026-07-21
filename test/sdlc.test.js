'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const sdlc = require('../scripts/sdlc');

// --- pure helpers ----------------------------------------------------------

test('bumpVersion: patch incrementa solo el tercer segmento', () => {
  assert.equal(sdlc.bumpVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(sdlc.bumpVersion('0.0.0', 'patch'), '0.0.1');
});

test('bumpVersion: minor resetea patch a 0', () => {
  assert.equal(sdlc.bumpVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(sdlc.bumpVersion('0.9.9', 'minor'), '0.10.0');
});

test('bumpVersion: major resetea minor y patch a 0', () => {
  assert.equal(sdlc.bumpVersion('1.2.3', 'major'), '2.0.0');
  assert.equal(sdlc.bumpVersion('0.0.5', 'major'), '1.0.0');
});

test('bumpVersion: acepta versiones incompletas', () => {
  assert.equal(sdlc.bumpVersion('1.2', 'patch'), '1.2.1');
  assert.equal(sdlc.bumpVersion('1', 'minor'), '1.1.0');
});

test('slugify: kebab-case sin caracteres raros', () => {
  assert.equal(sdlc.slugify('Agregar Auto-Walk'), 'agregar-auto-walk');
  assert.equal(sdlc.slugify('Fix: Pantalla Rota!!!'), 'fix-pantalla-rota');
  assert.equal(sdlc.slugify('   espacios   al   rededor  '), 'espacios-al-rededor');
  assert.equal(sdlc.slugify(''), '');
});

test('PHASES tiene los 6 gates en orden', () => {
  assert.deepEqual(sdlc.PHASES, ['plan', 'dev', 'review', 'qa', 'release', 'doc']);
});

test('GATES tiene una entrada por cada phase', () => {
  for (const phase of sdlc.PHASES) {
    assert.ok(sdlc.GATES[phase], `falta GATES.${phase}`);
    assert.equal(typeof sdlc.GATES[phase].fn, 'function');
    assert.equal(typeof sdlc.GATES[phase].name, 'string');
  }
});

// --- gate state detection (con fs real, en un tmpdir) ----------------------

function withTmpDir(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdlc-test-'));
  const origCwd = process.cwd();
  process.chdir(dir);
  // Necesitamos un .git para que las funciones git no fallen
  spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
  return Promise.resolve(body(dir)).finally(() => {
    process.chdir(origCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

test('gatePlan: retorna pending si no existe docs/plans/', () => {
  return withTmpDir(() => {
    const r = sdlc.gatePlan();
    assert.equal(r.passed, false);
    assert.match(r.evidence, /no existe docs\/plans/);
  });
});

test('gatePlan: retorna passed si hay un .md en docs/plans/', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'plans'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'plans', 'feature.md'), '# plan');
    const r = sdlc.gatePlan();
    assert.equal(r.passed, true);
    assert.match(r.evidence, /1 plan/);
  });
});

test('gateDoc: no crashea si docs/deliverables esta vacio (regresion)', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'deliverables'), { recursive: true });
    const r = sdlc.gateDoc();
    assert.equal(r.passed, false);
    assert.match(r.evidence, /vacio|existe/);
  });
});

test('gateDoc: retorna passed si hay un .docx', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'deliverables'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'deliverables', 'x.docx'), 'fake');
    const r = sdlc.gateDoc();
    assert.equal(r.passed, true);
    assert.match(r.evidence, /1 DOCX/);
  });
});

test('gateReview: lee APPROVED de docs/reviews/*.md', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'docs', 'reviews', 'r1.md'),
      '# Review\n\n## Verdict\nAPPROVED\n'
    );
    const r = sdlc.gateReview();
    assert.equal(r.passed, true);
  });
});

test('gateReview: CHANGES_REQUESTED bloquea el pass', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'docs', 'reviews', 'r1.md'),
      '# Review\n\n## Verdict\nCHANGES_REQUESTED\n'
    );
    const r = sdlc.gateReview();
    assert.equal(r.passed, false);
  });
});

// --- CLI smoke (subprocess real) -------------------------------------------

const SCRIPT = path.join(__dirname, '..', 'scripts', 'sdlc.js');

test('CLI: --help sale con codigo 0', () => {
  const r = spawnSync('node', [SCRIPT, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /SDLC Orchestrator/);
});

test('CLI: status corre sin error en el repo', () => {
  const r = spawnSync('node', [SCRIPT, 'status'], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /SDLC Status/);
});

test('CLI: next corre sin error en el repo', () => {
  const r = spawnSync('node', [SCRIPT, 'next'], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Next gate|All gates passed/);
});

test('CLI: sub-comando desconocido sale con codigo 2', () => {
  const r = spawnSync('node', [SCRIPT, 'invent'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Sub-comando desconocido/);
});

test('CLI: plan sin feature sale con codigo 2', () => {
  const r = spawnSync('node', [SCRIPT, 'plan'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /falta la descripci/);
});

test('CLI: doc sin feature sale con codigo 2', () => {
  const r = spawnSync('node', [SCRIPT, 'doc'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});

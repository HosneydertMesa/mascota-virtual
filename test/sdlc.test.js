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

// --- strict mode ------------------------------------------------------------

test('strict: sin planes/reviews/qa y con commits no-triviales → falla', () => {
  return withTmpDir((dir) => {
    // Crea un commit no-trivial (feat:) sin plan
    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'feat: add x'], { cwd: dir });

    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /STRICT MODE FAILED/);
  });
});

test('strict: con plan + review APPROVED + qa sign-off + tag → pasa', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'plans'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'plans', 'x.md'), '# plan');
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'reviews', 'x.md'), '## Verdict\nAPPROVED\n');
    fs.mkdirSync(path.join(dir, 'docs', 'qa'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'qa', 'x.md'), '# QA sign-off\n');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 't', version: '1.0.0' }));

    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', '.'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'feat: add x'], { cwd: dir });
    spawnSync('git', ['tag', 'v1.0.0'], { cwd: dir });

    // Agregar un commit trivial después del tag → no debe requerir plan
    fs.writeFileSync(path.join(dir, 'x.js'), '// x2');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'chore: typo'], { cwd: dir });

    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, `strict fallo: ${r.stdout}\n${r.stderr}`);
    assert.match(r.stdout, /STRICT MODE OK/);
  });
});

test('strict: solo commits triviales desde el tag → no exige plan', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'plans'), { recursive: true }); // dir existe pero vacio
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'reviews', 'x.md'), '## Verdict\nAPPROVED\n');
    fs.mkdirSync(path.join(dir, 'docs', 'qa'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'qa', 'x.md'), '# QA\n');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 't', version: '1.0.0' }));

    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', '.'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'initial'], { cwd: dir });
    spawnSync('git', ['tag', 'v1.0.0'], { cwd: dir });

    // Solo commit trivial
    fs.writeFileSync(path.join(dir, 'x.js'), '// x2');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'docs: typo'], { cwd: dir });

    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, `strict fallo: ${r.stdout}\n${r.stderr}`);
  });
});

test('strict: working tree dirty → falla', () => {
  return withTmpDir((dir) => {
    fs.writeFileSync(path.join(dir, 'uncommitted.js'), '// x');
    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /dirty|sin commitear/);
  });
});

test('cmdStrict está exportado en module.exports', () => {
  assert.equal(typeof sdlc.cmdStrict, 'function');
});

// --- date filter en gates (MINOR-4 del review retroactivo) ------------------

test('gateReview: con opts.since, filtra reviews con mtime < cutoff', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    const reviewPath = path.join(dir, 'docs', 'reviews', 'old.md');
    fs.writeFileSync(reviewPath, '## Verdict\nAPPROVED\n');
    // Forzar mtime viejo (ayer)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    fs.utimesSync(reviewPath, yesterday, yesterday);

    const cutoff = Date.now(); // ahora
    const r = sdlc.gateReview({ since: cutoff });
    assert.equal(r.passed, false);
    assert.match(r.evidence, /0 review\(s\) con APPROVED desde/);
  });
});

test('gateReview: con opts.since, acepta reviews con mtime >= cutoff', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    const reviewPath = path.join(dir, 'docs', 'reviews', 'fresh.md');
    fs.writeFileSync(reviewPath, '## Verdict\nAPPROVED\n');
    // Forzar mtime futuro (5s adelante) para evitar race con el cutoff
    const future = new Date(Date.now() + 5000);
    fs.utimesSync(reviewPath, future, future);

    const cutoff = Date.now();
    const r = sdlc.gateReview({ since: cutoff });
    assert.equal(r.passed, true);
    assert.match(r.evidence, /1 review\(s\) con APPROVED/);
  });
});

test('gateReview: sin opts.since, comportamiento legacy (no filtra)', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    const reviewPath = path.join(dir, 'docs', 'reviews', 'old.md');
    fs.writeFileSync(reviewPath, '## Verdict\nAPPROVED\n');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    fs.utimesSync(reviewPath, yesterday, yesterday);

    const r = sdlc.gateReview();
    assert.equal(r.passed, true);
    assert.match(r.evidence, /1 review\(s\) con APPROVED/);
    assert.doesNotMatch(r.evidence, /desde/);
  });
});

test('gateQa: con opts.since, filtra sign-offs con mtime < cutoff', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'qa'), { recursive: true });
    const qaPath = path.join(dir, 'docs', 'qa', 'old.md');
    fs.writeFileSync(qaPath, '# QA\n');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    fs.utimesSync(qaPath, yesterday, yesterday);

    const cutoff = Date.now();
    const r = sdlc.gateQa({ since: cutoff });
    assert.equal(r.passed, false);
    assert.match(r.evidence, /0 sign-off\(s\) desde/);
  });
});

test('tagDate: retorna timestamp en ms para tag existente', () => {
  return withTmpDir((dir) => {
    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'initial'], { cwd: dir });
    spawnSync('git', ['tag', 'v1.0.0'], { cwd: dir });

    const ts = sdlc.tagDate('v1.0.0');
    assert.ok(typeof ts === 'number');
    assert.ok(ts > 0);
    // Tiene que ser cercano a ahora (dentro de 1 hora)
    const diff = Math.abs(Date.now() - ts);
    assert.ok(diff < 60 * 60 * 1000, `tagDate muy lejos de ahora: ${diff}ms`);
  });
});

test('tagDate: retorna null para tag inexistente', () => {
  return withTmpDir(() => {
    assert.equal(sdlc.tagDate('v99.0.0'), null);
  });
});

test('tagDate: retorna null si no se pasa tag', () => {
  return withTmpDir(() => {
    assert.equal(sdlc.tagDate(null), null);
    assert.equal(sdlc.tagDate(undefined), null);
    assert.equal(sdlc.tagDate(''), null);
  });
});

// --- skip review/qa cuando todos los commits son triviales -----------------

test('strict: solo commits docs/chore desde el tag → skipea review/qa', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'plans'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'reviews', 'old.md'), '## Verdict\nAPPROVED\n');
    fs.mkdirSync(path.join(dir, 'docs', 'qa'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'qa', 'old.md'), '# QA\n');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 't', version: '1.0.0' }));

    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', '.'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'initial'], { cwd: dir });
    spawnSync('git', ['tag', 'v1.0.0'], { cwd: dir });

    // Varios commits triviales
    fs.writeFileSync(path.join(dir, 'x.js'), '// x2');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'docs: typo'], { cwd: dir });
    fs.writeFileSync(path.join(dir, 'x.js'), '// x3');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'chore: bump'], { cwd: dir });

    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, `strict fallo: ${r.stdout}\n${r.stderr}`);
    assert.match(r.stdout, /saltado \(todos los commits/);
  });
});

test('strict: mix de feat + docs → sigue exigiendo review/qa', () => {
  return withTmpDir((dir) => {
    fs.mkdirSync(path.join(dir, 'docs', 'plans'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'plans', 'x.md'), '# plan');
    fs.mkdirSync(path.join(dir, 'docs', 'reviews'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'docs', 'qa'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 't', version: '1.0.0' }));

    fs.writeFileSync(path.join(dir, 'x.js'), '// x');
    spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
    spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
    spawnSync('git', ['add', '.'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'initial'], { cwd: dir });
    spawnSync('git', ['tag', 'v1.0.0'], { cwd: dir });

    // feat: no-trivial
    fs.writeFileSync(path.join(dir, 'x.js'), '// x2');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'feat: add x2'], { cwd: dir });
    // docs: trivial después
    fs.writeFileSync(path.join(dir, 'x.js'), '// x3');
    spawnSync('git', ['add', 'x.js'], { cwd: dir });
    spawnSync('git', ['commit', '-m', 'docs: typo'], { cwd: dir });

    const r = spawnSync('node', [SCRIPT, 'strict'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 1, `strict debería haber fallado: ${r.stdout}`);
    assert.match(r.stdout, /REVIEW/);
  });
});

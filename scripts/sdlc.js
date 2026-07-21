#!/usr/bin/env node
'use strict';

// SDLC orchestrator for mascotaVirtual.
// Wraps the 6 phase gates (plan, dev, review, qa, release, doc) defined in
// docs/sdlc/PHASES.md, using the sdlc-* skills installed in .mavis/skills/.
//
// Usage:
//   node scripts/sdlc.js status
//   node scripts/sdlc.js next
//   node scripts/sdlc.js plan  "<feature description>"
//   node scripts/sdlc.js dev
//   node scripts/sdlc.js review
//   node scripts/sdlc.js qa
//   node scripts/sdlc.js release
//   node scripts/sdlc.js doc   "<feature>"
//   node scripts/sdlc.js help

const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// ROOT se evalúa cada vez (no al cargar) para que siga process.cwd() en tests.
// Usar getRoot() en vez de la constante.
const getRoot = () => process.cwd();
const PHASES = ['plan', 'dev', 'review', 'qa', 'release', 'doc'];

// --- color helpers (no chalk, keep it dep-free) ------------------------------
const isTTY = process.stdout.isTTY;
const c = (color, s) => (isTTY ? `\x1b[${color}m${s}\x1b[0m` : s);
const dim = s => c('2', s);
const green = s => c('32', s);
const yellow = s => c('33', s);
const red = s => c('31', s);
const cyan = s => c('36', s);
const bold = s => c('1', s);

// --- shell helpers ----------------------------------------------------------
function sh(cmd, args = [], opts = {}) {
  const { silent = false, allowFail = false } = opts;
  try {
    return execFileSync(cmd, args, {
      cwd: getRoot(),
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      ...opts
    });
  } catch (e) {
    if (allowFail) return e.stdout || '';
    throw e;
  }
}

function shOut(cmd, args = [], opts = {}) {
  return sh(cmd, args, { ...opts, silent: true }).toString().trim();
}

function runNpm(script) {
  // En Windows, npm es un .cmd que Node no puede spawnear directo (EINVAL).
  // Solución: spawnear cmd.exe /c npm.cmd, que no necesita shell:true.
  // En unix, npm es un binario y se puede spawnear directo.
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'cmd.exe' : 'npm';
  const args = isWin ? ['/c', 'npm.cmd', 'run', script] : ['run', script];
  const result = spawnSync(cmd, args, {
    cwd: getRoot(),
    stdio: 'inherit'
  });
  if (process.env.SDLC_DEBUG) {
    process.stderr.write(`[SDLC_DEBUG] runNpm(${script}): status=${result.status} signal=${result.signal} error=${result.error?.message}\n`);
    if (result.stdout) process.stderr.write(`STDOUT: ${result.stdout}`);
    if (result.stderr) process.stderr.write(`STDERR: ${result.stderr}`);
  }
  return result.status === 0;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// --- gate state detection ---------------------------------------------------
function branch() {
  return shOut('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
}

function isClean() {
  return shOut('git', ['status', '--porcelain']) === '';
}

function lastCommit() {
  return shOut('git', ['log', '-1', '--oneline']);
}

function hasDir(...parts) {
  return fs.existsSync(path.join(getRoot(), ...parts));
}

function hasFile(...parts) {
  const p = path.join(getRoot(), ...parts);
  return fs.existsSync(p);
}

function listDir(...parts) {
  const p = path.join(getRoot(), ...parts);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p);
}

function readJson(...parts) {
  return JSON.parse(fs.readFileSync(path.join(getRoot(), ...parts), 'utf8'));
}

// Cada gate reporta: { passed: bool, evidence: string }
function gatePlan() {
  if (!hasDir('docs', 'plans')) {
    return { passed: false, evidence: 'no existe docs/plans/' };
  }
  const plans = listDir('docs', 'plans').filter(f => f.endsWith('.md'));
  return {
    passed: plans.length > 0,
    evidence: plans.length > 0
      ? `${plans.length} plan(es): ${plans.slice(0, 3).join(', ')}${plans.length > 3 ? '…' : ''}`
      : 'docs/plans/ existe pero vacío'
  };
}

function gateDev() {
  // Detección: o el último commit es de código (no de docs), o no hay cambios sin commitear.
  const clean = isClean();
  const last = lastCommit();
  return {
    passed: clean && last.length > 0,
    evidence: clean ? `clean · ${last}` : 'working tree dirty (cambios sin commitear)'
  };
}

function gateReview() {
  if (!hasDir('docs', 'reviews')) {
    return { passed: false, evidence: 'no existe docs/reviews/' };
  }
  const reviews = listDir('docs', 'reviews').filter(f => f.endsWith('.md'));
  if (reviews.length === 0) {
    return { passed: false, evidence: 'docs/reviews/ existe pero vacío' };
  }
  // Busca reviews con verdict APPROVED
  const approved = reviews.filter(f => {
    try {
      const content = fs.readFileSync(path.join(getRoot(), 'docs', 'reviews', f), 'utf8');
      return /APPROVED/i.test(content) && !/CHANGES_REQUESTED/i.test(content);
    } catch { return false; }
  });
  return {
    passed: approved.length > 0,
    evidence: approved.length > 0
      ? `${approved.length} review(s) con APPROVED`
      : `${reviews.length} review(s), ninguno con APPROVED todavía`
  };
}

function gateQa() {
  if (!hasDir('docs', 'qa')) {
    return { passed: false, evidence: 'no existe docs/qa/' };
  }
  const signoffs = listDir('docs', 'qa').filter(f => f.endsWith('.md'));
  return {
    passed: signoffs.length > 0,
    evidence: signoffs.length > 0
      ? `${signoffs.length} sign-off(s): ${signoffs.slice(0, 3).join(', ')}`
      : 'docs/qa/ existe pero sin sign-offs'
  };
}

function gateRelease() {
  // Detección: hay un tag vX.Y.Z
  const tags = shOut('git', ['tag', '-l', 'v*'], { allowFail: true });
  const semverTags = tags.split('\n').filter(t => /^v\d+\.\d+\.\d+/.test(t));
  if (semverTags.length === 0) {
    return { passed: false, evidence: 'no hay tags vX.Y.Z' };
  }
  // Compara con la version del package.json
  let pkgVersion = '?';
  try { pkgVersion = readJson('package.json').version; } catch {}
  const latestTag = semverTags[semverTags.length - 1];
  const matches = latestTag === `v${pkgVersion}`;
  return {
    passed: matches,
    evidence: matches
      ? `tag ${latestTag} coincide con package.json (${pkgVersion})`
      : `último tag ${latestTag}, package.json dice ${pkgVersion}`
  };
}

function gateDoc() {
  if (!hasDir('docs', 'deliverables')) {
    return { passed: false, evidence: 'no existe docs/deliverables/' };
  }
  // Acepta DOCX (formal) y MD (liviano, para proyectos personales)
  const docx = listDir('docs', 'deliverables').filter(f => f.endsWith('.docx'));
  const md = listDir('docs', 'deliverables').filter(f => f.endsWith('.md'));
  const total = docx.length + md.length;
  if (total === 0) {
    return { passed: false, evidence: 'docs/deliverables/ existe pero vacío' };
  }
  const examples = [...docx, ...md].slice(0, 3).join(', ');
  return {
    passed: true,
    evidence: `${total} deliverable(s) (${docx.length} DOCX, ${md.length} MD): ${examples}`
  };
}

const GATES = {
  plan: { name: 'PLAN', fn: gatePlan },
  dev: { name: 'DEV', fn: gateDev },
  review: { name: 'REVIEW', fn: gateReview },
  qa: { name: 'QA', fn: gateQa },
  release: { name: 'RELEASE', fn: gateRelease },
  doc: { name: 'DOC', fn: gateDoc }
};

// --- sub-commands -----------------------------------------------------------

function cmdStatus() {
  console.log(bold(cyan('\n=== SDLC Status ===\n')));
  console.log(`Branch:          ${bold(branch())}`);
  console.log(`Last commit:     ${dim(lastCommit())}`);
  console.log(`Working tree:    ${isClean() ? green('clean') : yellow('dirty')}`);
  console.log('');

  console.log(bold('Gates:'));
  for (const phase of PHASES) {
    const { passed, evidence } = GATES[phase].fn();
    const mark = passed ? green('✓') : dim('·');
    const label = GATES[phase].name.padEnd(8);
    const status = passed ? green('passed') : dim('pending');
    console.log(`  ${mark} ${label} ${status}  ${dim(evidence)}`);
  }
  console.log('');
  console.log(`Run ${bold('node scripts/sdlc.js next')} para saber qué gate atacar.`);
}

function cmdNext() {
  for (const phase of PHASES) {
    const { passed } = GATES[phase].fn();
    if (!passed) {
      console.log(bold(`\nNext gate: ${cyan(GATES[phase].name)}`));
      console.log(dim(`(evidence: ${GATES[phase].fn().evidence})`));
      console.log('');
      console.log(`Para correrlo:`);
      console.log(`  ${bold(`node scripts/sdlc.js ${phase}`)}`);
      return;
    }
  }
  console.log(green(bold('\nAll gates passed. Listo para el siguiente feature.')));
}

function cmdPlan(feature) {
  if (!feature) {
    console.error(red('Error: falta la descripción de la feature.'));
    console.error('Uso: node scripts/sdlc.js plan "<descripción>"');
    process.exit(2);
  }
  console.log(bold(cyan('\n=== GATE 0: PLAN ===\n')));
  console.log(`Feature: ${bold(feature)}`);
  console.log('');

  // Pre-crear el directorio
  const plansDir = path.join(getRoot(), 'docs', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
    console.log(`✓ Creado ${dim('docs/plans/')}`);
  }

  console.log(bold('Siguiente paso (en Mavis):'));
  console.log('');
  console.log(`  ${cyan(`/sdlc-plan "${feature}"`)}`);
  console.log('');
  console.log('Mavis va a:');
  console.log('  1. Leer AGENTS.md y explorar el codebase');
  console.log('  2. Generar docs/plans/<slug>.md con criterios de aceptación');
  console.log('  3. Listar archivos a tocar y riesgos');
  console.log('');
  console.log('Cuando el plan esté listo, commitealo con:');
  console.log(`  ${dim('git add docs/plans/ && git commit -m "docs(plans): add plan for <feature>"')}`);
}

function cmdDev() {
  console.log(bold(cyan('\n=== GATE 1: DEV ===\n')));

  if (!isClean()) {
    console.log(yellow('! Working tree dirty. Esto no bloquea, pero commitear después.'));
    console.log(`  ${dim('git status')}`);
  }

  console.log(bold('\n[1/3] Sintaxis (npm run check)...'));
  const checkOk = runNpm('check');
  if (!checkOk) {
    console.error(red('\nX Sintaxis rota. Arreglá antes de seguir.'));
    process.exit(1);
  }
  console.log(green('  ✓ OK'));

  console.log(bold('\n[2/3] Tests (npm test)...'));
  const testOk = runNpm('test');
  if (!testOk) {
    console.error(red('\nX Tests rojos. Arreglá antes de seguir.'));
    process.exit(1);
  }
  console.log(green('  ✓ OK'));

  console.log(bold('\n[3/3] Pre-commit hook:'));
  console.log(dim('  Se ejecuta automáticamente en cada commit.'));
  console.log(dim('  Verificá: secrets, debug statements, archivos grandes.'));

  console.log(green(bold('\n✓ DEV gate ready. Podés commitear.')));
  console.log(dim('\nTip: convención de commits → feat:/fix:/refactor:/chore:/docs:/test:'));
}

function cmdReview() {
  console.log(bold(cyan('\n=== GATE 2: REVIEW ===\n')));

  if (!isClean()) {
    console.error(red('X Working tree dirty. Commiteá los cambios antes de pedir review.'));
    console.error(dim('  git status'));
    process.exit(1);
  }

  const br = branch();
  if (br === 'main' || br === 'master') {
    console.error(red(`X Estás en ${br}. Hacé el review desde una branch de feature.`));
    process.exit(1);
  }

  // Capturar diff vs main
  const reviewsPendingDir = path.join(getRoot(), 'docs', 'reviews', '_pending');
  fs.mkdirSync(reviewsPendingDir, { recursive: true });
  const diffPath = path.join(reviewsPendingDir, `${br}.diff`);

  const diff = shOut('git', ['diff', `main..${br}`], { allowFail: true });
  if (!diff) {
    console.error(yellow(`! No hay diff entre main y ${br}. ¿Ya mergeaste?`));
    process.exit(1);
  }
  fs.writeFileSync(diffPath, diff, 'utf8');
  console.log(`✓ Diff capturado: ${dim(`docs/reviews/_pending/${br}.diff`)}`);
  console.log(`  ${dim(`(${diff.split('\n').length} lineas)`)}`);

  // Crear dir de reviews
  const reviewsDir = path.join(getRoot(), 'docs', 'reviews');
  fs.mkdirSync(reviewsDir, { recursive: true });

  console.log(bold('\nSiguiente paso (en Mavis):'));
  console.log('');
  console.log(`  ${cyan('/sdlc-review')}`);
  console.log('');
  console.log('Pasale al chat:');
  console.log(`  1. El contenido de ${bold(`docs/reviews/_pending/${br}.diff`)}`);
  console.log('  2. La lista de archivos modificados (los lee completos)');
  console.log('  3. El plan de la feature (si existe en docs/plans/)');
  console.log('');
  console.log('Mavis va a generar el review con severidades (CRITICAL/MAJOR/MINOR/INFO).');
  console.log('Guardá el output en:');
  console.log(`  ${dim(`docs/reviews/${br}-${today()}.md`)}`);
  console.log('');
  console.log(dim('Recordá: si hay CRITICAL o MAJOR, NO se puede pasar a QA.'));
}

function cmdQa() {
  console.log(bold(cyan('\n=== GATE 3: QA ===\n')));

  // Re-validar tests
  console.log(bold('[1/3] Re-validando tests...'));
  const testOk = runNpm('test');
  if (!testOk) {
    console.error(red('\nX Tests rojos. No se puede pasar a QA con tests caídos.'));
    process.exit(1);
  }
  console.log(green('  ✓ Tests verdes'));

  // Crear dir de QA
  const qaDir = path.join(getRoot(), 'docs', 'qa');
  fs.mkdirSync(qaDir, { recursive: true });
  console.log(`\n[2/3] Directorio ${dim('docs/qa/')} listo.`);

  // Mostrar checklist
  console.log(bold('\n[3/3] Checklist manual:'));
  const checklist = [
    'La app arranca (npm start)',
    'La mascota aparece, no rompe layout',
    'Drag funciona, se asienta al soltar (gravedad)',
    'Cursor tracking / wandering funciona',
    'Pomodoro: start / pause / reset / break / focus',
    'Chat con IA: enviar, recibir, parseo de tags OK',
    'Settings: elegir mascota, sonido, guardar API key',
    'Cambios persisten tras cerrar/reabrir',
    'SafeStorage encripta la key (si hubo cambios)',
    'Sin errores en consola ni en debug.log'
  ];
  checklist.forEach((item, i) => {
    console.log(`  [ ] ${item}`);
  });

  console.log('');
  console.log('Cuando termines el checklist, generá el sign-off:');
  const slug = branch().replace(/^feat\//, '').replace(/^fix\//, '');
  const suggested = path.join('docs', 'qa', `${slug || 'release'}-${today()}.md`);
  console.log(`  ${dim(suggested)}`);
  console.log('');
  console.log('Formato sugerido:');
  console.log(dim(`
  # QA Sign-off: <feature>
  Fecha: ${today()}
  Branch: ${branch()}
  
  ## Checklist
  - [x] ...
  
  ## Bugs encontrados
  - (ninguno) o lista con severidad
  
  ## Decisión
  APROBADO / RECHAZADO
  `));
}

function cmdRelease() {
  console.log(bold(cyan('\n=== GATE 4: RELEASE ===\n')));

  if (!isClean()) {
    console.error(red('X Working tree dirty. Commiteá antes de releasear.'));
    process.exit(1);
  }

  let currentVersion = '0.0.0';
  try { currentVersion = readJson('package.json').version; } catch {}

  console.log(`Version actual: ${bold(currentVersion)}`);
  console.log('');
  console.log(bold('Elegí el bump:'));
  console.log(`  ${cyan('patch')}  → bugfix (${currentVersion} → ${bumpVersion(currentVersion, 'patch')})`);
  console.log(`  ${cyan('minor')}  → feature nueva (${currentVersion} → ${bumpVersion(currentVersion, 'minor')})`);
  console.log(`  ${cyan('major')}  → breaking change (${currentVersion} → ${bumpVersion(currentVersion, 'major')})`);
  console.log('');
  console.log(bold('Comandos sugeridos:'));
  console.log('');
  console.log(dim('# 1. Bump version (crea tag automáticamente)'));
  console.log(`  ${cyan(`npm version patch -m "chore(release): v%${'s'}"`)}`);
  console.log('');
  console.log(dim('# 2. Push del tag'));
  console.log(`  ${cyan('git push origin main --follow-tags')}`);
  console.log('');
  console.log(dim('# 3. (Cuando electron-builder esté listo) build'));
  console.log(`  ${cyan('npm run dist')}`);
  console.log('');
  console.log(dim('# 4. Smoke test del installer en una máquina limpia'));
  console.log('');
  console.log(yellow('Recordá: NO hacer release sin QA firmado.'));
}

function bumpVersion(v, type) {
  const parts = v.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  if (type === 'major') return `${parts[0] + 1}.0.0`;
  if (type === 'minor') return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function cmdDoc(feature) {
  if (!feature) {
    console.error(red('Error: falta el nombre de la feature.'));
    console.error('Uso: node scripts/sdlc.js doc "<feature>"');
    process.exit(2);
  }

  console.log(bold(cyan('\n=== GATE 5: DOC ===\n')));
  console.log(`Feature: ${bold(feature)}`);
  console.log('');

  // Sugerir el path
  const docxPath = path.join('docs', 'deliverables', `${slugify(feature)}-finalize-${today()}.docx`);
  fs.mkdirSync(path.join(getRoot(), 'docs', 'deliverables'), { recursive: true });
  console.log(`Output esperado: ${dim(docxPath)}`);
  console.log('');

  console.log(bold('Siguiente paso (en Mavis):'));
  console.log('');
  console.log(`  ${cyan(`/sdlc-doc finalize "${feature}"`)}`);
  console.log('');
  console.log('Mavis va a generar un DOCX con:');
  console.log('  - Resumen ejecutivo (1 párrafo)');
  console.log('  - Qué se hizo (high level)');
  console.log('  - Decisiones técnicas clave');
  console.log('  - Métricas (latencia, coverage, perf)');
  console.log('  - Lecciones aprendidas');
  console.log('  - Trabajo futuro');
  console.log('');
  console.log(dim('Tip: si el DOCX es para stakeholders no-técnicos, evitá jerga.'));
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function cmdHelp() {
  console.log(bold(cyan('\nSDLC Orchestrator — mascotaVirtual\n')));
  console.log('Sub-comandos:');
  console.log(`  ${bold('status')}              Muestra el estado actual del pipeline`);
  console.log(`  ${bold('next')}                 Imprime el siguiente gate a atacar`);
  console.log(`  ${bold('plan  "<feature>"')}    Prepara el directorio y dispara /sdlc-plan`);
  console.log(`  ${bold('dev')}                  Corre sintaxis + tests (GATE 1)`);
  console.log(`  ${bold('review')}               Captura diff y dispara /sdlc-review (GATE 2)`);
  console.log(`  ${bold('qa')}                   Re-valida tests + muestra checklist (GATE 3)`);
  console.log(`  ${bold('release')}              Plan de bump + tag + push (GATE 4)`);
  console.log(`  ${bold('doc   "<feature>"')}   Dispara /sdlc-doc finalize (GATE 5)`);
  console.log(`  ${bold('help')}                 Muestra esta ayuda`);
  console.log('');
  console.log('Más info: docs/sdlc/PHASES.md');
  console.log('Skills:   /sdlc-plan, /sdlc-team, /sdlc-review, /sdlc-doc');
}

// --- entry point ------------------------------------------------------------
function main() {
  const subcommand = process.argv[2];
  const arg = process.argv[3];

  const handlers = {
    status: cmdStatus,
    next: cmdNext,
    plan: cmdPlan,
    dev: cmdDev,
    review: cmdReview,
    qa: cmdQa,
    release: cmdRelease,
    doc: cmdDoc,
    help: cmdHelp,
    '--help': cmdHelp,
    '-h': cmdHelp
  };

  const handler = handlers[subcommand];
  if (!handler) {
    console.error(red(`Sub-comando desconocido: ${subcommand || '(ninguno)'}`));
    cmdHelp();
    process.exit(2);
  }

  try {
    handler(arg);
  } catch (e) {
    console.error(red(`\nError: ${e.message}`));
    if (process.env.SDLC_DEBUG) {
      console.error(e.stack);
    }
    process.exit(1);
  }
}

module.exports = {
  PHASES,
  GATES,
  bumpVersion,
  slugify,
  gatePlan,
  gateDev,
  gateReview,
  gateQa,
  gateRelease,
  gateDoc
};

if (require.main === module) {
  main();
}

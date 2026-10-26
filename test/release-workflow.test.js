'use strict';
/**
 * Workflow de release (.github/workflows/release.yml).
 *
 * Regresion: el build corria `npm run build` sin `--publish never`.
 * Como package.json tiene `build.publish`, electron-builder detecta el tag
 * de git y dispara "Implicit publishing triggered by git tag" — ese publish
 * corre sin GH_TOKEN y falla:
 *
 *   Error: GitHub Personal Access Token is not set, neither programmatically,
 *   nor using env "GH_TOKEN"
 *       at artifactCreatedWithoutExplicitPublishConfig
 *
 * El build fallaba en su step y los steps de upload quedaban skipped: el tag
 * se publicaba pero la release NO. Pasaron los 4 releases historicos
 * (v2.0.0, v2.0.1, v2.0.2, v2.1.0).
 *
 * Ademas el upload solo subia el .exe. Falta latest.yml, que es el archivo
 * que electron-updater consulta para detectar updates.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'release.yml');

function readWorkflow() {
  return fs.readFileSync(WORKFLOW_PATH, 'utf8');
}

/** Devuelve el bloque de un step del workflow, buscando por su `name:`. */
function getStep(source, name) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes(`- name: ${name}`));
  if (start === -1) return null;

  // El step termina en la proxima linea con la misma indentacion que "- name:".
  const indent = lines[start].match(/^\s*/)[0].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const lineIndent = line.match(/^\s*/)[0].length;
    if (lineIndent <= indent && /^\s*-\s/.test(line)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

/** Quito comentarios del YAML para no matchear texto que solo los documenta. */
function stripYamlComments(source) {
  return source
    .split(/\r?\n/)
    .map((line) => {
      const hash = line.indexOf('#');
      if (hash === -1) return line;
      // Un # dentro de comillas no es comentario.
      const before = line.slice(0, hash);
      const quotes = (before.match(/"/g) || []).length;
      if (quotes % 2 === 1) return line;
      return before;
    })
    .join('\n');
}

test('el workflow de release existe', () => {
  assert.ok(fs.existsSync(WORKFLOW_PATH), 'debe existir .github/workflows/release.yml');
});

// --- Bug 2a: publish implicito ---------------------------------------------

test('REGRESION: el build usa --publish never (no dispara publish implicito)', () => {
  const build = getStep(readWorkflow(), 'Build Windows installer');

  assert.ok(build, 'debe existir el step "Build Windows installer"');
  assert.ok(
    /run:\s*npm run build -- --publish never/.test(build),
    'el build debe pasar --publish never a electron-builder. Sin ese flag, ' +
      'electron-builder publica implicitamente por el tag y falla sin GH_TOKEN.'
  );
});

test('REGRESION: ningun run del build electron-builder sin --publish never', () => {
  const source = readWorkflow();
  const buildRuns = source.match(/run:\s*npm run build[^\n]*/g) || [];

  assert.ok(buildRuns.length > 0, 'debe haber al menos un run de build');
  for (const run of buildRuns) {
    assert.ok(
      /--publish never/.test(run),
      `este run de build no tiene --publish never: "${run.trim()}"`
    );
  }
});

test('el step de build NO depende de GH_TOKEN (la publicacion va en otro step)', () => {
  const build = getStep(readWorkflow(), 'Build Windows installer');
  assert.ok(build, 'debe existir el step de build');
  assert.ok(
    !/GH_TOKEN/.test(stripYamlComments(build)),
    'el build no necesita token: con --publish never no publica nada.'
  );
});

// --- Bug 2b: faltaba latest.yml --------------------------------------------

test('REGRESION: el upload sube latest.yml (electron-updater lo necesita)', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');

  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(
    /latest\.yml/.test(upload),
    'el upload debe subir dist/latest.yml — sin el, electron-updater no detecta updates.'
  );
});

test('REGRESION: el upload falla si falta latest.yml', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');
  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(
    /No se encontro dist\/latest\.yml/.test(upload),
    'el upload debe fallar explicitamente si falta latest.yml (fallar tarde es peor).'
  );
});

test('el upload sube tambien el .blockmap (integridad del update diferencial)', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');
  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(/blockmap/.test(upload), 'el upload debe incluir el .blockmap');
});

// --- Bug 2c: --target apuntando a 'latest' ---------------------------------

test('REGRESION: el upload no usa --target latest (no es ni rama ni commit)', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');
  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(
    !/--target/.test(upload),
    "el upload no debe usar --target: 'latest' es un nombre de release, no una rama. " +
      'Sin --verify-tag, gh creaba un tag fantasma apuntando a un target inexistente.'
  );
});

test('el upload usa --verify-tag (no crea tags fantasma)', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');
  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(
    /--verify-tag/.test(upload),
    'el upload debe usar --verify-tag: si el tag no existe, es un error del orquestador.'
  );
});

// --- El token vive en el step correcto --------------------------------------

test('el step de upload tiene GH_TOKEN con secrets.GITHUB_TOKEN', () => {
  const upload = getStep(readWorkflow(), 'Upload artifacts to GitHub Release');
  assert.ok(upload, 'debe existir el step de upload');
  assert.ok(
    /GH_TOKEN:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/.test(upload),
    'el upload debe tener GH_TOKEN con secrets.GITHUB_TOKEN'
  );
});

test('el workflow tiene permisos de escritura de contents', () => {
  const source = readWorkflow();
  assert.ok(
    /permissions:\s*\n\s*contents:\s*write/.test(source),
    'el workflow necesita contents: write para publicar la release'
  );
});

// --- main.js: el orden de los canales de Pomodoro ---------------------------

test('main.js emite pomodoro:tick ANTES que pomodoro:completed (mismo payload)', () => {
  const mainSource = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  const fn = mainSource.slice(mainSource.indexOf('function broadcastPomodoroState'));

  const tickIdx = fn.indexOf("broadcastToAllWindows('pomodoro:tick'");
  const completedIdx = fn.indexOf("broadcastToAllWindows('pomodoro:completed'");

  assert.ok(tickIdx !== -1, 'main.js debe emitir pomodoro:tick');
  assert.ok(completedIdx !== -1, 'main.js debe emitir pomodoro:completed');
  assert.ok(
    tickIdx < completedIdx,
    'pomodoro:tick debe emitirse antes: el renderer actualiza el badge con el ' +
      'estado nuevo (break) y un handler de completed que lo reescriba lo pisaria.'
  );
});

test('el renderer NO se suscribe a pomodoro:completed para el badge', () => {
  const rendererSource = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');
  const start = rendererSource.indexOf('function setupIPCListeners()');
  const body = rendererSource.slice(start, rendererSource.indexOf('\n}', start) + 2);

  assert.ok(
    !/subscribeIpc\(\s*'onPomodoroCompleted'/.test(body),
    'el renderer no debe suscribirse a onPomodoroCompleted para actualizar el badge: ' +
      'main.js emite pomodoro:tick con el estado nuevo y despues pomodoro:completed ' +
      'con el mismo payload.'
  );
});

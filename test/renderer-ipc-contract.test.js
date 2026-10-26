'use strict';
/**
 * Contrato IPC renderer <-> preload.
 *
 * Regresion del commit e4c8fcf (2026-08-25): el revert silencioso bajo
 * src/renderer.js de 944 a 199 lineas, anadio llamadas a APIs que nunca
 * existieron en preload.js (onPomodoroState, onPetSpeech) y elimino 7
 * suscripciones que si funcionaban.
 *
 * El TypeError de `window.api.onPomodoroState` abortaba setupIPCListeners()
 * en cadena: las suscripciones siguientes (onSettingsUpdated) nunca se
 * registraban, y cambiar de mascota en el dashboard no actualizaba el SVG.
 *
 * Estos tests parsean el codigo fuente: no dependen de Electron, asi que
 * corren en el `node --test` normal (Windows, macOS, Linux).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PRELOAD_PATH = path.join(ROOT, 'preload.js');
const RENDERER_PATH = path.join(ROOT, 'src', 'renderer.js');

// Suscripciones que el revert e4c8fcf elimino de src/renderer.js.
// Cada una existe en preload.js y main.js sigue emitiendo su canal.
const LOST_SUBSCRIPTIONS = [
  'onPetAction',
  'onTriggerAutonomousTip',
  'onSystemEvent',
  'onMorningBriefing',
  'onEveningSummary',
  'onUpdateStatus',
  'onAppChanged'
];

function readSource(file) {
  return fs.readFileSync(file, 'utf8');
}

/**
 * Extrae las claves `on*` que preload.js expone en contextBridge.
 * Formato esperado: `  onAlgo: (callback) => subscribe('canal', callback),`
 */
function extractPreloadSubscriptions(source) {
  const keys = new Set();
  const apiBlock = source.slice(source.indexOf("exposeInMainWorld('api'"));
  const re = /^\s{2}(on[A-Za-z0-9_]+)\s*:/gm;
  let match;
  while ((match = re.exec(apiBlock)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/** Extrae los metodos `on*` que preload.js expone (para comparar contra el renderer). */
function extractPreloadApiKeys(source) {
  const keys = new Set();
  const start = source.indexOf("exposeInMainWorld('api'");
  const apiBlock = source.slice(start);
  const re = /^\s{2}([A-Za-z0-9_]+)\s*:\s*\(/gm;
  let match;
  while ((match = re.exec(apiBlock)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/**
 * Elimina comentarios (linea y bloque) respetando strings.
 * Necesario porque el codigo documenta los bugs que corrige: un comentario
 * que menciona `window.api.onPomodoroState()` no es una llamada real.
 */
function stripComments(source) {
  let out = '';
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    // Comentario de linea
    if (ch === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++;
      continue;
    }

    // Comentario de bloque
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // String simple o doble: se copia literal
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      while (i < n) {
        if (source[i] === '\\') {
          out += source[i] + (source[i + 1] || '');
          i += 2;
          continue;
        }
        out += source[i];
        if (source[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/**
 * Extrae todas las suscripciones IPC que el renderer declara.
 *
 * Dos patrones validos:
 *   - `window.api.onX(handler)`   (llamada directa)
 *   - `subscribeIpc('onX', handler)` (llamada defensiva, la que usa el fix)
 */
function extractRendererSubscriptions(source) {
  const code = stripComments(source);
  const calls = [];
  const direct = /window\.api\.(on[A-Za-z0-9_]+)\s*\(/g;
  const guarded = /subscribeIpc\(\s*'(on[A-Za-z0-9_]+)'/g;
  let match;
  while ((match = direct.exec(code)) !== null) {
    calls.push(match[1]);
  }
  while ((match = guarded.exec(code)) !== null) {
    calls.push(match[1]);
  }
  return calls;
}

// ---------------------------------------------------------------------------

test('preload.js expone onPomodoroTick y onPomodoroCompleted (canales reales de main.js)', () => {
  const subs = extractPreloadSubscriptions(readSource(PRELOAD_PATH));
  assert.ok(subs.has('onPomodoroTick'), 'preload debe exponer onPomodoroTick');
  assert.ok(subs.has('onPomodoroCompleted'), 'preload debe exponer onPomodoroCompleted');
});

test('REGRESION: renderer no llama window.api.onX que preload.js no exponga', () => {
  const preloadKeys = extractPreloadApiKeys(readSource(PRELOAD_PATH));
  const used = extractRendererSubscriptions(readSource(RENDERER_PATH));

  const inexistentes = [...new Set(used)].filter((name) => !preloadKeys.has(name));

  assert.deepStrictEqual(
    inexistentes,
    [],
    `src/renderer.js llama APIs que preload.js no expone: ${inexistentes.join(', ')}. ` +
      'Cada llamada a una API inexistente lanza TypeError y aborta setupIPCListeners().'
  );
});

test('REGRESION: renderer no llama onPomodoroState ni onPetSpeech (canales inexistentes)', () => {
  const used = extractRendererSubscriptions(readSource(RENDERER_PATH));

  assert.ok(
    !used.includes('onPomodoroState'),
    'onPomodoroState no existe: no hay canal pomodoro:state en main.js. Usar onPomodoroTick.'
  );
  assert.ok(
    !used.includes('onPetSpeech'),
    'onPetSpeech no existe: no hay canal pet-speech en main.js. El speech llega por ' +
      'onSystemEvent / onMorningBriefing / onEveningSummary / onStreakMilestone.'
  );
});

test('REGRESION: las 7 suscripciones perdidas por e4c8fcf vuelven a estar cableadas', () => {
  const used = extractRendererSubscriptions(readSource(RENDERER_PATH));
  const faltantes = LOST_SUBSCRIPTIONS.filter((name) => !used.includes(name));

  assert.deepStrictEqual(
    faltantes,
    [],
    `src/renderer.js no se suscribe a: ${faltantes.join(', ')}. ` +
      'El revert e4c8fcf las elimino; preload.js las expone y main.js sigue emitiendo sus canales.'
  );
});

test('REGRESION: setupIPCListeners() no puede abortar en cadena', () => {
  const source = readSource(RENDERER_PATH);

  const start = source.indexOf('function setupIPCListeners()');
  assert.ok(start !== -1, 'debe existir setupIPCListeners()');

  // Aislar el cuerpo de la funcion (hasta el cierre de la llave de apertura).
  const body = source.slice(start, source.indexOf('\n}', start) + 2);

  const calls = extractRendererSubscriptions(body);
  assert.ok(calls.length >= LOST_SUBSCRIPTIONS.length,
    `setupIPCListeners() deberia cablear al menos ${LOST_SUBSCRIPTIONS.length} suscripciones, tiene ${calls.length}`);

  // Ninguna llamada debe estar desnuda: cada handler va protegido para que un
  // fallo en uno no impida registrar los siguientes.
  const desnudas = [];
  for (const name of new Set(calls)) {
    const re = new RegExp(`window\\.api\\.${name}\\s*\\(`);
    const idx = body.search(re);
    if (idx === -1) continue; // ya esta protegido con subscribeIpc()
    const line = body.slice(body.lastIndexOf('\n', idx) + 1, body.indexOf('\n', idx));
    if (!/\?\.|\|\| typeof|typeof window\.api/.test(line)) {
      desnudas.push(name);
    }
  }

  assert.deepStrictEqual(
    desnudas,
    [],
    `estas llamadas no estan protegidas (un TypeError aborta las siguientes): ${desnudas.join(', ')}`
  );
});

test('REGRESION: cada suscripcion del renderer pasa por el guard subscribeIpc()', () => {
  const source = readSource(RENDERER_PATH);
  const start = source.indexOf('function setupIPCListeners()');
  const body = source.slice(start, source.indexOf('\n}', start) + 2);

  const calls = [...new Set(extractRendererSubscriptions(body))];

  const desprotegidas = calls.filter((name) => {
    const direct = new RegExp(`window\\.api\\.${name}\\s*\\(`);
    if (!direct.test(body)) return false; // usa subscribeIpc(): ok
    return true; // llamada directa sin proteger
  });

  assert.deepStrictEqual(
    desprotegidas,
    [],
    `estas suscripciones se llaman directo y un TypeError aborta las siguientes: ${desprotegidas.join(', ')}`
  );
});

test('el preload expone onSettingsUpdated (cambio de mascota en el dashboard)', () => {
  const subs = extractPreloadSubscriptions(readSource(PRELOAD_PATH));
  assert.ok(subs.has('onSettingsUpdated'), 'preload debe exponer onSettingsUpdated');
});

test('main.js emite los canales de las 7 suscripciones restauradas', () => {
  const mainSource = readSource(path.join(ROOT, 'main.js'));
  const canales = [
    'pet-action',
    'trigger-autonomous-tip',
    'pet-system-event',
    'morning-briefing',
    'evening-summary',
    'app:update-status',
    'app-changed'
  ];
  const faltantes = canales.filter((canal) => !mainSource.includes(`'${canal}'`));

  assert.deepStrictEqual(
    faltantes,
    [],
    `main.js deberia emitir estos canales: ${faltantes.join(', ')}`
  );
});

test('preload.js subscribe() mapea cada suscripcion restaurada a su canal real', () => {
  const source = readSource(PRELOAD_PATH);
  const esperados = {
    onPetAction: 'pet-action',
    onTriggerAutonomousTip: 'trigger-autonomous-tip',
    onSystemEvent: 'pet-system-event',
    onMorningBriefing: 'morning-briefing',
    onEveningSummary: 'evening-summary',
    onUpdateStatus: 'app:update-status',
    onAppChanged: 'app-changed'
  };

  for (const [metodo, canal] of Object.entries(esperados)) {
    const re = new RegExp(`${metodo}\\s*:\\s*\\(callback\\)\\s*=>\\s*subscribe\\('${canal}'`);
    assert.ok(re.test(source), `preload.js deberia mapear ${metodo} al canal '${canal}'`);
  }
});

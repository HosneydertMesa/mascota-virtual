'use strict';

/**
 * Tests de estructura de los SVGs de cat/dog.
 * Garantizan que los elementos que el renderer espera (pet-pupil, anchors, etc)
 * existen y tienen los atributos correctos. Si se rompe el SVG, el JS falla
 * silenciosamente (no encuentra pupils) — estos tests lo previenen.
 *
 * NO parsea XML real (mantenemos simple con regex) — el SVG es generado como
 * template string desde cat.js / dog.js, así que validamos el string.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  catIdleSVG, catWalkSVG, catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG, catSleepSVG,
  catSitSVG, catSitBlinkSVG, catLaySVG, catLayBreatheSVG, catStretchSVG
} = require('../src/assets/cat');
const {
  dogIdleSVG, dogWalkSVG, dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG, dogSleepSVG,
  dogSitSVG, dogSitBlinkSVG, dogLaySVG, dogLayBreatheSVG, dogStretchSVG
} = require('../src/assets/dog');

/** Cuenta ocurrencias de `class="pet-pupil"` en un SVG string. */
function countPetPupils(svg) {
  const matches = svg.match(/class="pet-pupil"/g);
  return matches ? matches.length : 0;
}

/** Extrae los pares data-anchor-x="X" data-anchor-y="Y" en orden. */
function extractPupilAnchors(svg) {
  const re = /class="pet-pupil"\s+data-anchor-x="([^"]+)"\s+data-anchor-y="([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(svg)) !== null) {
    out.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
  }
  return out;
}

// --- Cat idle ---

test('cat idle SVG: 2 pupilas (una por ojo)', () => {
  assert.equal(countPetPupils(catIdleSVG), 2);
});

test('cat idle SVG: anchors de pupila en el centro de cada ojo (82,72) y (118,72)', () => {
  const anchors = extractPupilAnchors(catIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 82, y: 72 });
  assert.deepEqual(anchors[1], { x: 118, y: 72 });
});

test('cat idle SVG: viewBox 0 0 200 200', () => {
  assert.match(catIdleSVG, /viewBox="0 0 200 200"/);
});

// --- Cat walk ---

test('cat walk SVG: 1 pupila (un ojo visible en perfil)', () => {
  assert.equal(countPetPupils(catWalkSVG), 1);
});

test('cat walk SVG: anchor en (42, 78) (centro del ojo de perfil)', () => {
  const anchors = extractPupilAnchors(catWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 42, y: 78 });
});

// --- Cat sleep (sin pupilas, ojos cerrados) ---

test('cat sleep SVG: 0 pupilas (ojos cerrados, no tracking)', () => {
  assert.equal(countPetPupils(catSleepSVG), 0);
});

// --- Dog idle ---

test('dog idle SVG: 2 pupilas (una por ojo)', () => {
  assert.equal(countPetPupils(dogIdleSVG), 2);
});

test('dog idle SVG: anchors en (80, 74) y (120, 74)', () => {
  const anchors = extractPupilAnchors(dogIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 80, y: 74 });
  assert.deepEqual(anchors[1], { x: 120, y: 74 });
});

// --- Dog walk ---

test('dog walk SVG: 1 pupila (perfil)', () => {
  assert.equal(countPetPupils(dogWalkSVG), 1);
});

test('dog walk SVG: anchor en (42, 76)', () => {
  const anchors = extractPupilAnchors(dogWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 42, y: 76 });
});

// --- Dog sleep (sin pupilas) ---

test('dog sleep SVG: 0 pupilas (ojos cerrados)', () => {
  assert.equal(countPetPupils(dogSleepSVG), 0);
});

// --- Compatibilidad con el renderer ---

test('todas las pupilas tienen data-anchor-x e data-anchor-y numericos', () => {
  const allSvgs = [catIdleSVG, catWalkSVG, dogIdleSVG, dogWalkSVG];
  for (const svg of allSvgs) {
    const anchors = extractPupilAnchors(svg);
    for (const a of anchors) {
      assert.ok(Number.isFinite(a.x), `anchor x invalido: ${a.x}`);
      assert.ok(Number.isFinite(a.y), `anchor y invalido: ${a.y}`);
    }
  }
});

test('ninguna pupila queda fuera del viewBox (0..200)', () => {
  const allSvgs = [catIdleSVG, catWalkSVG, dogIdleSVG, dogWalkSVG];
  for (const svg of allSvgs) {
    const anchors = extractPupilAnchors(svg);
    for (const a of anchors) {
      assert.ok(a.x >= 0 && a.x <= 200, `anchor x fuera de rango: ${a.x}`);
      assert.ok(a.y >= 0 && a.y <= 200, `anchor y fuera de rango: ${a.y}`);
    }
  }
});

// --- Walk cycle: patas individuales con clase para CSS swing ---
// v2.x bug fix: el refactor consolido las patas en <g class="pet-front-paws"> /
// <g class="pet-hind-legs"> y se perdieron los grupos individuales
// (back-foot-left/right, left-paw, right-paw) que el CSS apunta con las
// animaciones sideWalkSwingLeft/Right. Resultado: al caminar, las patas NO
// se mueven y la mascota parece deslizar. Cada frame de caminar debe tener
// las 4 patas en grupos con la clase correcta para que la animacion CSS las
// encuentre.

const LEG_CLASSES = ['back-foot-left', 'back-foot-right', 'left-paw', 'right-paw'];

function countLegGroups(svg) {
  const out = {};
  for (const cls of LEG_CLASSES) {
    const re = new RegExp(`class="${cls}"`, 'g');
    const matches = svg.match(re);
    out[cls] = matches ? matches.length : 0;
  }
  return out;
}

test('cat walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)', () => {
  const frames = [catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG];
  for (const svg of frames) {
    const counts = countLegGroups(svg);
    for (const cls of LEG_CLASSES) {
      assert.equal(counts[cls], 1, `cat frame missing class="${cls}" (counts=${JSON.stringify(counts)})`);
    }
  }
});

test('dog walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)', () => {
  const frames = [dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG];
  for (const svg of frames) {
    const counts = countLegGroups(svg);
    for (const cls of LEG_CLASSES) {
      assert.equal(counts[cls], 1, `dog frame missing class="${cls}" (counts=${JSON.stringify(counts)})`);
    }
  }
});

// --- sit / lay / stretch: exports distintos (no aliases de idle/sleep/walk) ---
// Slice 1 MOTION: Designer entregará arte después. Hasta entonces el markup
// se reusa, pero cada export DEBE ser un string distinto (data-pose) para
// que PetViewport no pinte el mismo binding que idle/sleep/walk.

test('cat sit/lay/stretch no son aliases de idle/sleep/walk', () => {
  assert.notEqual(catSitSVG, catIdleSVG);
  assert.notEqual(catSitBlinkSVG, catIdleSVG);
  assert.notEqual(catLaySVG, catSleepSVG);
  assert.notEqual(catLayBreatheSVG, catSleepSVG);
  assert.notEqual(catStretchSVG, catWalk1SVG);
  assert.match(catSitSVG, /data-pose="sit"/);
  assert.match(catLaySVG, /data-pose="lay"/);
  assert.match(catStretchSVG, /data-pose="stretch"/);
});

test('dog sit/lay/stretch no son aliases de idle/sleep/walk', () => {
  assert.notEqual(dogSitSVG, dogIdleSVG);
  assert.notEqual(dogSitBlinkSVG, dogIdleSVG);
  assert.notEqual(dogLaySVG, dogSleepSVG);
  assert.notEqual(dogLayBreatheSVG, dogSleepSVG);
  assert.notEqual(dogStretchSVG, dogWalk1SVG);
  assert.match(dogSitSVG, /data-pose="sit"/);
  assert.match(dogLaySVG, /data-pose="lay"/);
  assert.match(dogStretchSVG, /data-pose="stretch"/);
});

// --- Walk cycle CSS: canonical file is animations.css (not dashboard.css) ---
// Slice 1 MOTION: dashboard.css y animations.css duplicaban catBodyWalk /
// dogBodyWalk (dashboard ganaba por import order). Gait vive en UN archivo.
// Luna y Max NO comparten sideWalkSwing*: cada uno tiene catWalkSwing* /
// dogWalkSwing* con periodo, swing y bob distintos.

const fs = require('fs');
const path = require('path');
const ANIM_CSS_PATH = path.join(__dirname, '..', 'src', 'styles', 'animations.css');
const DASH_CSS_PATH = path.join(__dirname, '..', 'src', 'styles', 'dashboard.css');

function readCss(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Extract the @keyframes block for a given name, handling nested braces.
 * Returns the body between the opening { and the matching closing }.
 */
function extractKeyframeBody(css, name) {
  const idx = css.indexOf('@keyframes ' + name);
  if (idx === -1) return null;
  const braceStart = css.indexOf('{', idx);
  if (braceStart === -1) return null;
  let depth = 1;
  let i = braceStart + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return css.slice(braceStart + 1, i - 1);
}

/**
 * Find the rotate(deg) value in the rule for a given keyframe stop.
 * `stop` is e.g. "0%, 100%" or "50%".
 */
function findRotateAtStop(body, stop) {
  const re = new RegExp(stop.replace('%', '%') + '\\s*\\{([^}]*)\\}');
  const m = body.match(re);
  if (!m) return null;
  const rot = m[1].match(/rotate\(([-\d.]+)deg\)/);
  return rot ? parseFloat(rot[1]) : null;
}

function swingRange(css, name) {
  const body = extractKeyframeBody(css, name);
  assert.ok(body !== null, `${name} keyframe block not found in animations.css`);
  const start = findRotateAtStop(body, '0%, 100%');
  const mid = findRotateAtStop(body, '50%');
  assert.ok(start !== null, `${name} 0%/100% stop not found`);
  assert.ok(mid !== null, `${name} 50% stop not found`);
  return Math.abs(start - mid);
}

function maxTranslateY(css, name) {
  const body = extractKeyframeBody(css, name);
  assert.ok(body !== null, `${name} keyframe block not found in animations.css`);
  const tyValues = [];
  const tyRe = /translateY\(([-\d.]+)(?:px)?\)/g;
  let mm;
  while ((mm = tyRe.exec(body)) !== null) {
    tyValues.push(Math.abs(parseFloat(mm[1])));
  }
  assert.ok(tyValues.length > 0, `${name} has no translateY in any keyframe`);
  return Math.max(...tyValues);
}

function animationPeriod(css, selector, keyframeName) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[^}]*animation:\\s*' + keyframeName + '\\s+([0-9.]+)s',
    'm'
  );
  const m = css.match(re);
  return m ? parseFloat(m[1]) : null;
}

test('animations.css: reglas .cat-walk + .dog-walk para las 4 patas (animation + transform-origin)', () => {
  const css = readCss(ANIM_CSS_PATH);
  const expected = [
    '.cat-walk .back-foot-left',
    '.cat-walk .left-paw',
    '.cat-walk .back-foot-right',
    '.cat-walk .right-paw',
    '.dog-walk .back-foot-left',
    '.dog-walk .left-paw',
    '.dog-walk .back-foot-right',
    '.dog-walk .right-paw'
  ];
  for (const sel of expected) {
    assert.ok(css.includes(sel), `animations.css missing selector: ${sel}`);
  }
});

test('animations.css: Luna usa catWalkSwing* 0.65s; Max usa dogWalkSwing* 0.48s', () => {
  const css = readCss(ANIM_CSS_PATH);
  const catLeft = animationPeriod(css, '.cat-walk .back-foot-left', 'catWalkSwingLeft');
  const catRight = animationPeriod(css, '.cat-walk .left-paw', 'catWalkSwingRight');
  const dogLeft = animationPeriod(css, '.dog-walk .back-foot-left', 'dogWalkSwingLeft');
  const dogRight = animationPeriod(css, '.dog-walk .left-paw', 'dogWalkSwingRight');
  assert.equal(catLeft, 0.65, `cat back-foot-left period=${catLeft}`);
  assert.equal(catRight, 0.65, `cat left-paw period=${catRight}`);
  assert.equal(dogLeft, 0.48, `dog back-foot-left period=${dogLeft}`);
  assert.equal(dogRight, 0.48, `dog left-paw period=${dogRight}`);
  assert.equal(animationPeriod(css, '.walking-bob.cat-walk', 'catBodyWalk'), 0.65);
  assert.equal(animationPeriod(css, '.walking-bob.dog-walk', 'dogBodyWalk'), 0.48);
});

test('animations.css: pairing contralateral diagonal (back-left+right-paw vs left-paw+back-right)', () => {
  const css = readCss(ANIM_CSS_PATH);
  assert.equal(animationPeriod(css, '.cat-walk .back-foot-left', 'catWalkSwingLeft'), 0.65);
  assert.equal(animationPeriod(css, '.cat-walk .right-paw', 'catWalkSwingLeft'), 0.65);
  assert.equal(animationPeriod(css, '.cat-walk .left-paw', 'catWalkSwingRight'), 0.65);
  assert.equal(animationPeriod(css, '.cat-walk .back-foot-right', 'catWalkSwingRight'), 0.65);
  assert.equal(animationPeriod(css, '.dog-walk .back-foot-left', 'dogWalkSwingLeft'), 0.48);
  assert.equal(animationPeriod(css, '.dog-walk .right-paw', 'dogWalkSwingLeft'), 0.48);
  assert.equal(animationPeriod(css, '.dog-walk .left-paw', 'dogWalkSwingRight'), 0.48);
  assert.equal(animationPeriod(css, '.dog-walk .back-foot-right', 'dogWalkSwingRight'), 0.48);
});

test('animations.css: gait Luna ≠ Max (swing y bob de Luna mas contenidos)', () => {
  const css = readCss(ANIM_CSS_PATH);
  const catSwing = swingRange(css, 'catWalkSwingLeft');
  const dogSwing = swingRange(css, 'dogWalkSwingLeft');
  const catBob = maxTranslateY(css, 'catBodyWalk');
  const dogBob = maxTranslateY(css, 'dogBodyWalk');
  assert.ok(catSwing >= 30, `cat swing too small: ${catSwing}deg`);
  assert.ok(dogSwing >= 50, `dog swing too small: ${dogSwing}deg`);
  assert.ok(catSwing < dogSwing, `cat swing ${catSwing}deg should be < dog ${dogSwing}deg`);
  assert.ok(catBob >= 4, `cat bob too small: ${catBob}px`);
  assert.ok(dogBob >= 8, `dog bob too small: ${dogBob}px`);
  assert.ok(catBob < dogBob, `cat bob ${catBob}px should be < dog ${dogBob}px`);
});

test('animations.css: transform-origin de las patas apunta a la cadera real del SVG', () => {
  const css = readCss(ANIM_CSS_PATH);
  const badOrigins = [
    'transform-origin: 121px 115px',
    'transform-origin: 131px 115px',
    'transform-origin: 76px 115px',
    'transform-origin: 86px 115px'
  ];
  for (const bad of badOrigins) {
    assert.ok(!css.includes(bad), `animations.css still has OLD transform-origin: ${bad}`);
  }
  assert.match(css, /transform-origin:\s*58px\s+132px/);
  assert.match(css, /transform-origin:\s*56px\s+134px/);
});

test('animations.css: tail sway amplitude es >= 30deg', () => {
  const css = readCss(ANIM_CSS_PATH);
  const range = swingRange(css, 'catTailWalk');
  assert.ok(range >= 30, `cat tail sway range too small: ${range}deg`);
});

test('dashboard.css no redefine walk gait (un solo canonical: animations.css)', () => {
  const dash = readCss(DASH_CSS_PATH);
  const forbidden = [
    '@keyframes catBodyWalk',
    '@keyframes dogBodyWalk',
    '@keyframes catWalkSwingLeft',
    '@keyframes dogWalkSwingLeft',
    '@keyframes sideWalkSwingLeft',
    '@keyframes catTailWalk',
    '@keyframes dogTailWalk'
  ];
  for (const token of forbidden) {
    assert.ok(!dash.includes(token), `dashboard.css still defines ${token} (cascade fight)`);
  }
  assert.ok(!/\.cat-walk\s+\.back-foot-left/.test(dash),
    'dashboard.css still has .cat-walk .back-foot-left (move gait to animations.css)');
});

test('animations.css: mood-* mueve cola, orejas y pet-body', () => {
  const css = readCss(ANIM_CSS_PATH);
  for (const mood of ['happy', 'calm', 'sleepy', 'sad', 'bored']) {
    assert.ok(css.includes('#pet-container.mood-' + mood),
      `animations.css missing #pet-container.mood-${mood}`);
  }
  assert.match(css, /mood-happy[\s\S]*anim-wag/);
  assert.match(css, /mood-sleepy[\s\S]*pet-ear|mood-sad[\s\S]*pet-ear/);
  assert.match(css, /mood-(sleepy|sad)[\s\S]*pet-body[\s\S]*translateY/);
});

test('pet-viewport.js: walking no reactiva el swap de 167ms', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'renderer', 'pet-viewport.js'), 'utf8');
  assert.match(src, /if \(this\.currentState === 'walking'\) return;/);
  assert.doesNotMatch(src, /if \(this\.currentState === 'walking'\) \{\s*this\.currentFrameIndex/);
});

test('renderer.js dispara sitting, laying, stretching y sleeping (no desde chat)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'renderer.js'), 'utf8');
  assert.match(src, /setState\(\s*['"]sitting['"]/);
  assert.match(src, /setState\(\s*['"]laying['"]/);
  assert.match(src, /setState\(\s*['"]stretching['"]/);
  assert.match(src, /setState\(\s*['"]sleeping['"]/);
  assert.match(src, /getMood\s*\(/);
  const chatIdx = src.indexOf('function initQuickChat');
  const sitIdx = src.indexOf("setState('sitting'");
  const sitIdx2 = src.indexOf('setState("sitting"');
  const sitAt = sitIdx >= 0 ? sitIdx : sitIdx2;
  assert.ok(sitAt >= 0, 'setState sitting not found');
  assert.ok(chatIdx < 0 || sitAt < chatIdx || sitAt > src.indexOf('function initSettingsButton'),
    'sitting should not be fired from initQuickChat');
});

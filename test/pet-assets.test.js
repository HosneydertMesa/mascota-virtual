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
const fs = require('fs');
const path = require('path');

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

test('cat idle SVG: anchors de pupila en el centro de cada ojo (66,76) y (118,76)', () => {
  const anchors = extractPupilAnchors(catIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 66, y: 76 });
  assert.deepEqual(anchors[1], { x: 118, y: 76 });
});

test('cat idle SVG: viewBox 0 0 200 200', () => {
  assert.match(catIdleSVG, /viewBox="0 0 200 200"/);
});

// --- Cat walk ---

test('cat walk SVG: 1 pupila (un ojo visible en perfil)', () => {
  assert.equal(countPetPupils(catWalkSVG), 1);
});

test('cat walk SVG: anchor en (52, 96) (centro del ojo de perfil)', () => {
  const anchors = extractPupilAnchors(catWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 52, y: 96 });
});

// --- Cat sleep (sin pupilas, ojos cerrados) ---

test('cat sleep SVG: 0 pupilas (ojos cerrados, no tracking)', () => {
  assert.equal(countPetPupils(catSleepSVG), 0);
});

// --- Dog idle ---

test('dog idle SVG: 2 pupilas (una por ojo)', () => {
  assert.equal(countPetPupils(dogIdleSVG), 2);
});

test('dog idle SVG: anchors en (64, 76) y (120, 76)', () => {
  const anchors = extractPupilAnchors(dogIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 64, y: 76 });
  assert.deepEqual(anchors[1], { x: 120, y: 76 });
});

// --- Dog walk ---

test('dog walk SVG: 1 pupila (perfil)', () => {
  assert.equal(countPetPupils(dogWalkSVG), 1);
});

test('dog walk SVG: anchor en (42, 70)', () => {
  const anchors = extractPupilAnchors(dogWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 42, y: 70 });
});

// --- Dog sleep (sin pupilas) ---

test('dog sleep SVG: 0 pupilas (ojos cerrados)', () => {
  assert.equal(countPetPupils(dogSleepSVG), 0);
});

// --- Compatibilidad con el renderer ---

test('todas las pupilas tienen data-anchor-x e data-anchor-y numericos', () => {
  const allSvgs = [
    catIdleSVG, catWalkSVG, catSitSVG, catLaySVG, catStretchSVG,
    dogIdleSVG, dogWalkSVG, dogSitSVG, dogLaySVG, dogStretchSVG
  ];
  for (const svg of allSvgs) {
    const anchors = extractPupilAnchors(svg);
    for (const a of anchors) {
      assert.ok(Number.isFinite(a.x), `anchor x invalido: ${a.x}`);
      assert.ok(Number.isFinite(a.y), `anchor y invalido: ${a.y}`);
    }
  }
});

test('ninguna pupila queda fuera del viewBox (0..200)', () => {
  const allSvgs = [
    catIdleSVG, catWalkSVG, catSitSVG, catLaySVG, catStretchSVG,
    dogIdleSVG, dogWalkSVG, dogSitSVG, dogLaySVG, dogStretchSVG
  ];
  for (const svg of allSvgs) {
    const anchors = extractPupilAnchors(svg);
    for (const a of anchors) {
      assert.ok(a.x >= 0 && a.x <= 200, `anchor x fuera de rango: ${a.x}`);
      assert.ok(a.y >= 0 && a.y <= 200, `anchor y fuera de rango: ${a.y}`);
    }
  }
});

test('cat sit/lay/stretch: pupilas y anchors de produccion', () => {
  assert.equal(countPetPupils(catSitSVG), 2);
  assert.deepEqual(extractPupilAnchors(catSitSVG), [{ x: 82, y: 72 }, { x: 118, y: 72 }]);
  assert.equal(countPetPupils(catLaySVG), 2);
  assert.deepEqual(extractPupilAnchors(catLaySVG), [{ x: 82, y: 90 }, { x: 118, y: 90 }]);
  assert.equal(countPetPupils(catStretchSVG), 2);
  assert.deepEqual(extractPupilAnchors(catStretchSVG), [{ x: 62, y: 106 }, { x: 98, y: 106 }]);
});

test('dog sit/lay/stretch: pupilas y anchors de produccion', () => {
  assert.equal(countPetPupils(dogSitSVG), 2);
  assert.deepEqual(extractPupilAnchors(dogSitSVG), [{ x: 80, y: 74 }, { x: 120, y: 74 }]);
  assert.equal(countPetPupils(dogLaySVG), 2);
  assert.deepEqual(extractPupilAnchors(dogLaySVG), [{ x: 64, y: 88 }, { x: 92, y: 88 }]);
  assert.equal(countPetPupils(dogStretchSVG), 2);
  assert.deepEqual(extractPupilAnchors(dogStretchSVG), [{ x: 46, y: 92 }, { x: 72, y: 90 }]);
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

/** Inner HTML of the first <g class="...pet-body..."> (depth-matched). */
function petBodyInner(svg) {
  const openRe = /<g([^>]*class="[^"]*\bpet-body\b[^"]*"[^>]*)>/;
  const m = openRe.exec(svg);
  if (!m) return null;
  let pos = m.index + m[0].length;
  let depth = 1;
  while (pos < svg.length && depth > 0) {
    const nxtOpen = svg.indexOf('<g', pos);
    const nxtClose = svg.indexOf('</g>', pos);
    if (nxtClose === -1) return svg.slice(m.index + m[0].length);
    if (nxtOpen !== -1 && nxtOpen < nxtClose) {
      depth += 1;
      pos = nxtOpen + 2;
    } else {
      depth -= 1;
      if (depth === 0) return svg.slice(m.index + m[0].length, nxtClose);
      pos = nxtClose + 4;
    }
  }
  return svg.slice(m.index + m[0].length);
}

test('cat walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)', () => {
  const frames = [catWalkSVG, catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG];
  for (const svg of frames) {
    const counts = countLegGroups(svg);
    for (const cls of LEG_CLASSES) {
      assert.equal(counts[cls], 1, `cat frame missing class="${cls}" (counts=${JSON.stringify(counts)})`);
    }
  }
});

test('dog walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)', () => {
  const frames = [dogWalkSVG, dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG];
  for (const svg of frames) {
    const counts = countLegGroups(svg);
    for (const cls of LEG_CLASSES) {
      assert.equal(counts[cls], 1, `dog frame missing class="${cls}" (counts=${JSON.stringify(counts)})`);
    }
  }
});

test('4 patas son sibling <g>s, nunca anidadas en .pet-body', () => {
  const all = [
    catIdleSVG, catWalkSVG, catSleepSVG, catSitSVG, catLaySVG, catStretchSVG,
    dogIdleSVG, dogWalkSVG, dogSleepSVG, dogSitSVG, dogLaySVG, dogStretchSVG
  ];
  for (const svg of all) {
    const inner = petBodyInner(svg);
    assert.ok(inner !== null, 'missing .pet-body group');
    for (const cls of LEG_CLASSES) {
      assert.equal(inner.includes(`class="${cls}"`), false,
        `leg class="${cls}" nested inside .pet-body`);
      assert.equal(countLegGroups(svg)[cls], 1, `missing sibling class="${cls}"`);
    }
  }
});

// --- Paint order / cascade: front paws must sit in front of the torso ---
// Production idle Luna: cream left-paw is a straight-sided slab (L commands)
// to the left of the body. SVG later siblings paint on top, so if .pet-body
// comes AFTER the paws it covers the attachment and the paw reads as a
// disconnected white rectangle. Contract: shadow, tail, back feet, body,
// FRONT PAWS (left-paw then right-paw), head.

const PRODUCTION_POSES = [
  ['cat idle', catIdleSVG],
  ['cat walk', catWalkSVG],
  ['cat sleep', catSleepSVG],
  ['cat sit', catSitSVG],
  ['cat lay', catLaySVG],
  ['cat stretch', catStretchSVG],
  ['dog idle', dogIdleSVG],
  ['dog walk', dogWalkSVG],
  ['dog sleep', dogSleepSVG],
  ['dog sit', dogSitSVG],
  ['dog lay', dogLaySVG],
  ['dog stretch', dogStretchSVG]
];

/** Index of the first class="..." that contains `className` as a whole token. */
function firstClassIndex(svg, className) {
  const re = new RegExp(`class="[^"]*\\b${className}\\b`);
  const m = re.exec(svg);
  return m ? m.index : -1;
}

test('12 production poses: front paws paint after .pet-body and before .pet-head', () => {
  assert.equal(PRODUCTION_POSES.length, 12, 'expected idle/walk/sleep/sit/lay/stretch × cat+dog');
  for (const [name, svg] of PRODUCTION_POSES) {
    const body = firstClassIndex(svg, 'pet-body');
    const left = firstClassIndex(svg, 'left-paw');
    const right = firstClassIndex(svg, 'right-paw');
    const head = firstClassIndex(svg, 'pet-head');
    assert.ok(body >= 0, `${name}: missing pet-body`);
    assert.ok(left >= 0, `${name}: missing left-paw`);
    assert.ok(right >= 0, `${name}: missing right-paw`);
    assert.ok(head >= 0, `${name}: missing pet-head`);
    assert.ok(left > body,
      `${name}: left-paw (i=${left}) must come after pet-body (i=${body})`);
    assert.ok(right > body,
      `${name}: right-paw (i=${right}) must come after pet-body (i=${body})`);
    assert.ok(left < right,
      `${name}: left-paw must precede right-paw (left=${left} right=${right})`);
    assert.ok(head > right,
      `${name}: pet-head (i=${head}) must come after right-paw (i=${right})`);
  }
});

test('12 production poses: cascade is shadow → tail → back feet → body → front paws → head', () => {
  for (const [name, svg] of PRODUCTION_POSES) {
    const shadow = firstClassIndex(svg, 'pet-shadow');
    const tail = firstClassIndex(svg, 'anim-wag');
    const backL = firstClassIndex(svg, 'back-foot-left');
    const backR = firstClassIndex(svg, 'back-foot-right');
    const body = firstClassIndex(svg, 'pet-body');
    const left = firstClassIndex(svg, 'left-paw');
    const right = firstClassIndex(svg, 'right-paw');
    const head = firstClassIndex(svg, 'pet-head');
    assert.ok(
      shadow >= 0 && shadow < tail && tail < backL && backL < backR && backR < body && body < left && left < right && right < head,
      `${name}: bad cascade shadow=${shadow} tail=${tail} backL=${backL} backR=${backR} body=${body} left=${left} right=${right} head=${head}`
    );
  }
});

test('CSS no z-index/isolation on paw/body/head groups (SVG document order wins)', () => {
  const cssDir = path.join(__dirname, '..', 'src', 'styles');
  const files = ['animations.css', 'pet.css', 'dashboard.css', 'variables.css'];
  const css = files.map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const fighter = /(#pet-svg[^{]*\{[^}]*(?:z-index|isolation)\s*:|\.(?:left-paw|right-paw|pet-body|pet-head)[^{]*\{[^}]*(?:z-index|isolation)\s*:)/;
  assert.doesNotMatch(css, fighter,
    'z-index/isolation on #pet-svg groups would override sibling paint order');
});

// --- sit / lay / stretch: poses reales distintas (no aliases, no data-pose copies) ---

test('cat sit/lay/stretch no son aliases de idle/sleep/walk', () => {
  assert.notEqual(catSitSVG, catIdleSVG);
  assert.notEqual(catLaySVG, catSleepSVG);
  assert.notEqual(catLaySVG, catSitSVG);
  assert.notEqual(catStretchSVG, catIdleSVG);
  assert.notEqual(catStretchSVG, catWalkSVG);
  assert.notEqual(catStretchSVG, catWalk1SVG);
  assert.notEqual(catSitSVG, catWalkSVG);
  assert.doesNotMatch(catSitSVG, /data-pose=/);
  assert.doesNotMatch(catLaySVG, /data-pose=/);
  assert.doesNotMatch(catStretchSVG, /data-pose=/);
});

test('dog sit/lay/stretch no son aliases de idle/sleep/walk', () => {
  assert.notEqual(dogSitSVG, dogIdleSVG);
  assert.notEqual(dogLaySVG, dogSleepSVG);
  assert.notEqual(dogLaySVG, dogSitSVG);
  assert.notEqual(dogStretchSVG, dogIdleSVG);
  assert.notEqual(dogStretchSVG, dogWalkSVG);
  assert.notEqual(dogStretchSVG, dogWalk1SVG);
  assert.notEqual(dogSitSVG, dogWalkSVG);
  assert.doesNotMatch(dogSitSVG, /data-pose=/);
  assert.doesNotMatch(dogLaySVG, /data-pose=/);
  assert.doesNotMatch(dogStretchSVG, /data-pose=/);
});

// --- Walk cycle CSS: canonical file is animations.css (not dashboard.css) ---
// Slice 1 MOTION: dashboard.css y animations.css duplicaban catBodyWalk /
// dogBodyWalk (dashboard ganaba por import order). Gait vive en UN archivo.
// Luna y Max NO comparten sideWalkSwing*: cada uno tiene catWalkSwing* /
// dogWalkSwing* con periodo, swing y bob distintos.
const ANIM_CSS_PATH = path.join(__dirname, '..', 'src', 'styles', 'animations.css');
const DASH_CSS_PATH = path.join(__dirname, '..', 'src', 'styles', 'dashboard.css');
const STYLES_ENTRY_PATH = path.join(__dirname, '..', 'src', 'styles.css');

function readCss(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Extract the @keyframes block for a given name, handling nested braces.
 * Returns the body between the opening { and the matching closing }.
 */
function extractKeyframeBody(css, name) {
  const bodies = extractKeyframeBodies(css, name);
  return bodies.length ? bodies[0] : null;
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * All @keyframes <name> bodies in document order. Later ones win the CSS
 * cascade when stylesheets are concatenated in @import order.
 * Comments are stripped so a mention of "@keyframes breathing" in a
 * comment cannot masquerade as the winning definition.
 */
function extractKeyframeBodies(css, name) {
  css = stripCssComments(css);
  const bodies = [];
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('@keyframes\\s+' + escaped + '(?![A-Za-z0-9_-])', 'g');
  let m;
  while ((m = re.exec(css)) !== null) {
    const braceStart = css.indexOf('{', m.index);
    if (braceStart === -1) break;
    let depth = 1;
    let i = braceStart + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    if (depth !== 0) break;
    bodies.push(css.slice(braceStart + 1, i - 1));
    re.lastIndex = i;
  }
  return bodies;
}

function lastKeyframeBody(css, name) {
  const bodies = extractKeyframeBodies(css, name);
  return bodies.length ? bodies[bodies.length - 1] : null;
}

/**
 * Resolve @import in order, same cascade Electron sees from styles.css.
 * A test that only greps animations.css misses later redefinitions.
 */
function flattenCss(entryPath, seen = new Set()) {
  const abs = path.resolve(entryPath);
  if (seen.has(abs)) return '';
  seen.add(abs);
  const css = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(abs);
  return css.replace(
    /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]\s*\)?\s*;/g,
    (_, rel) => flattenCss(path.join(dir, rel), seen) + '\n'
  );
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

function extractRule(css, selector) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'
  );
  const m = css.match(re);
  return m ? m[1] : null;
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

test('animations.css: walk origins son perfil (no frontal 58,132); sit conserva frontal', () => {
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

  const catBfl = extractRule(css, '.cat-walk .back-foot-left');
  const catBfr = extractRule(css, '.cat-walk .back-foot-right');
  const catLp = extractRule(css, '.cat-walk .left-paw');
  const catRp = extractRule(css, '.cat-walk .right-paw');
  assert.ok(catBfl, 'missing .cat-walk .back-foot-left rule');
  assert.match(catBfl, /transform-origin:\s*128px\s+130px/);
  assert.doesNotMatch(catBfl, /58px\s+132px/);
  assert.match(catBfr, /transform-origin:\s*144px\s+132px/);
  assert.match(catLp, /transform-origin:\s*64px\s+134px/);
  assert.match(catRp, /transform-origin:\s*84px\s+132px/);

  const dogBfl = extractRule(css, '.dog-walk .back-foot-left');
  const dogBfr = extractRule(css, '.dog-walk .back-foot-right');
  const dogLp = extractRule(css, '.dog-walk .left-paw');
  const dogRp = extractRule(css, '.dog-walk .right-paw');
  assert.ok(dogBfl, 'missing .dog-walk .back-foot-left rule');
  assert.match(dogBfl, /transform-origin:\s*154px\s+124px/);
  assert.doesNotMatch(dogBfl, /56px\s+134px/);
  assert.match(dogBfr, /transform-origin:\s*116px\s+122px/);
  assert.match(dogLp, /transform-origin:\s*78px\s+116px/);
  assert.match(dogRp, /transform-origin:\s*58px\s+114px/);

  const catSitBfl = extractRule(css, 'body[data-pet="cat"] #pet-container.sitting .back-foot-left');
  assert.ok(catSitBfl, 'missing Luna sit back-foot-left origin');
  assert.match(catSitBfl, /transform-origin:\s*58px\s+132px/);

  const catWalkTail = extractRule(css, '.walking-bob.cat-walk .anim-wag');
  assert.ok(catWalkTail, 'missing Luna walk tail origin rule');
  assert.match(catWalkTail, /transform-origin:\s*148px\s+124px/);
  assert.doesNotMatch(catWalkTail, /130px\s+145px/);

  const dogWalkTail = extractRule(css, '.walking-bob.dog-walk .anim-wag-fast');
  assert.ok(dogWalkTail, 'missing Max walk tail origin rule');
  assert.match(dogWalkTail, /transform-origin:\s*158px\s+112px/);
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

test('animations.css: mood-* mueve cola y orejas sin pisar breathing de .pet-body', () => {
  const css = readCss(ANIM_CSS_PATH);
  for (const mood of ['happy', 'calm', 'sleepy', 'sad', 'bored']) {
    assert.ok(css.includes('#pet-container.mood-' + mood),
      `animations.css missing #pet-container.mood-${mood}`);
  }
  assert.match(css, /mood-happy[\s\S]*anim-wag/);
  assert.match(css, /mood-sleepy[\s\S]*pet-ear|mood-sad[\s\S]*pet-ear/);
  const breath = extractKeyframeBody(css, 'breathing');
  assert.ok(breath, 'missing @keyframes breathing');
  assert.match(breath, /var\(--mood-dy/);
  assert.match(breath, /var\(--mood-rot/);
  assert.doesNotMatch(css, /#pet-container\.mood-\w+\s+\.pet-body\s*\{[^}]*transform:/);
  assert.doesNotMatch(css, /mood-calm[\s\S]{0,180}translateY\(\s*0\s*\)\s*!important/);
  assert.match(css, /#pet-container\.mood-bored[\s\S]{0,220}animation:\s*none/);
});

// --- Mood keyframes must WIN the cascade, not only exist in animations.css ---
// Slice 1 composed --mood-dy/--mood-rot into breathing and --mood-tail into wag.
// dashboard.css was still redefining both without those vars. styles.css
// imports dashboard AFTER animations, so the later @keyframes won and calm
// looked like the default. Grepping animations.css alone cannot catch this.

test('CSS cascade: winning @keyframes breathing y wag componen mood vars', () => {
  const bundled = flattenCss(STYLES_ENTRY_PATH);
  const breath = lastKeyframeBody(bundled, 'breathing');
  assert.ok(breath, 'no winning @keyframes breathing after flattening styles.css');
  assert.match(breath, /var\(--mood-dy/,
    'winning @keyframes breathing dropped --mood-dy (later stylesheet won the cascade)');
  assert.match(breath, /var\(--mood-rot/,
    'winning @keyframes breathing dropped --mood-rot (later stylesheet won the cascade)');

  const wag = lastKeyframeBody(bundled, 'wag');
  assert.ok(wag, 'no winning @keyframes wag after flattening styles.css');
  assert.match(wag, /var\(--mood-tail/,
    'winning @keyframes wag dropped --mood-tail (later stylesheet won the cascade)');
});

test('dashboard.css: si redefine breathing/wag, debe incluir mood vars', () => {
  const dash = readCss(DASH_CSS_PATH);
  const breaths = extractKeyframeBodies(dash, 'breathing');
  for (const body of breaths) {
    assert.match(body, /var\(--mood-dy/,
      'dashboard.css @keyframes breathing reintroduced without --mood-dy');
    assert.match(body, /var\(--mood-rot/,
      'dashboard.css @keyframes breathing reintroduced without --mood-rot');
  }
  const wags = extractKeyframeBodies(dash, 'wag');
  for (const body of wags) {
    assert.match(body, /var\(--mood-tail/,
      'dashboard.css @keyframes wag reintroduced without --mood-tail');
  }
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

// =============================================================
// SUPERFICIE DE EXPORTS — src/assets/cat.js y src/assets/dog.js
// Plan: docs/plans/2026-10-27-cel-shading-mascot-redesign.md (paso 1)
// El dashboard y el renderer Pixi consumen estos nombres: si cambian,
// la app se rompe en silencio.
// =============================================================

const catAssets = require('../src/assets/cat');
const dogAssets = require('../src/assets/dog');

const CAT_EXPORT_SURFACE = {
  catIdleSVG: 'string',
  catWalkSVG: 'string',
  catWalk1SVG: 'string',
  catWalk2SVG: 'string',
  catWalk3SVG: 'string',
  catWalk4SVG: 'string',
  catWalkFrames: 'array',
  catSleepSVG: 'string',
  catSitSVG: 'string',
  catSitBlinkSVG: 'string',
  catLaySVG: 'string',
  catLayBreatheSVG: 'string',
  catStretchSVG: 'string',
  catSVG: 'string',
  getCatPartsForState: 'function'
};

const DOG_EXPORT_SURFACE = {
  dogIdleSVG: 'string',
  dogWalkSVG: 'string',
  dogWalk1SVG: 'string',
  dogWalk2SVG: 'string',
  dogWalk3SVG: 'string',
  dogWalk4SVG: 'string',
  dogWalkFrames: 'array',
  dogSleepSVG: 'string',
  dogSitSVG: 'string',
  dogSitBlinkSVG: 'string',
  dogLaySVG: 'string',
  dogLayBreatheSVG: 'string',
  dogStretchSVG: 'string',
  dogSVG: 'string',
  getDogPartsForState: 'function'
};

test('assets: la superficie de exports de cat.js y dog.js no cambia (mismos nombres y tipos)', () => {
  const modules = [
    ['cat', catAssets, CAT_EXPORT_SURFACE],
    ['dog', dogAssets, DOG_EXPORT_SURFACE]
  ];
  for (const [species, mod, surface] of modules) {
    assert.deepEqual(
      Object.keys(mod).sort(),
      Object.keys(surface).sort(),
      `${species}: la superficie de exports cambio`
    );
    for (const [name, type] of Object.entries(surface)) {
      const value = mod[name];
      if (type === 'array') {
        assert.ok(Array.isArray(value), `${species}.${name} deberia ser array`);
      } else {
        assert.equal(typeof value, type, `${species}.${name} deberia ser ${type}`);
      }
    }
  }
});

test('assets: alias de produccion (walk1-4 = walk, sitBlink = sit, layBreathe = lay, walkFrames = [walk])', () => {
  assert.equal(catAssets.catWalk1SVG, catAssets.catWalkSVG);
  assert.equal(catAssets.catWalk2SVG, catAssets.catWalkSVG);
  assert.equal(catAssets.catWalk3SVG, catAssets.catWalkSVG);
  assert.equal(catAssets.catWalk4SVG, catAssets.catWalkSVG);
  assert.equal(catAssets.catSitBlinkSVG, catAssets.catSitSVG);
  assert.equal(catAssets.catLayBreatheSVG, catAssets.catLaySVG);
  assert.equal(catAssets.catSVG, catAssets.catIdleSVG);
  assert.deepEqual(catAssets.catWalkFrames, [catAssets.catWalkSVG]);

  assert.equal(dogAssets.dogWalk1SVG, dogAssets.dogWalkSVG);
  assert.equal(dogAssets.dogWalk2SVG, dogAssets.dogWalkSVG);
  assert.equal(dogAssets.dogWalk3SVG, dogAssets.dogWalkSVG);
  assert.equal(dogAssets.dogWalk4SVG, dogAssets.dogWalkSVG);
  assert.equal(dogAssets.dogSitBlinkSVG, dogAssets.dogSitSVG);
  assert.equal(dogAssets.dogLayBreatheSVG, dogAssets.dogLaySVG);
  assert.equal(dogAssets.dogSVG, dogAssets.dogIdleSVG);
  assert.deepEqual(dogAssets.dogWalkFrames, [dogAssets.dogWalkSVG]);
});

// =============================================================
// CONTRATO DE PARTES (PixiJS) — getXPartsForState
// Las 7 ranuras son el contrato que consume src/pet-renderer-pixi.js.
// =============================================================

const PART_SLOTS = ['head', 'body', 'tail', 'backLegLeft', 'backLegRight', 'frontLegLeft', 'frontLegRight'];
const PET_STATES = ['idle', 'walking', 'sleeping', 'sitting', 'laying', 'stretching'];

test('assets: getXPartsForState devuelve las 7 ranuras de partes en los 6 estados', () => {
  const getters = [
    ['cat', catAssets.getCatPartsForState],
    ['dog', dogAssets.getDogPartsForState]
  ];
  for (const [species, getParts] of getters) {
    for (const state of PET_STATES) {
      const parts = getParts(state);
      assert.ok(Array.isArray(parts) && parts.length > 0,
        `${species}.${state}: getPartsForState devolvio ${JSON.stringify(parts)}`);
      for (const part of parts) {
        assert.deepEqual(
          Object.keys(part).sort(),
          PART_SLOTS.slice().sort(),
          `${species}.${state}: las ranuras de partes cambiaron`
        );
        for (const slot of PART_SLOTS) {
          const value = part[slot];
          if (value === null || value === undefined) continue;
          assert.equal(typeof value, 'string',
            `${species}.${state}.${slot} deberia ser string o null`);
          assert.match(value, /viewBox="0 0 200 200"/,
            `${species}.${state}.${slot} sin viewBox="0 0 200 200"`);
        }
      }
    }
  }
});

// =============================================================
// CONTRATO CEL — vocabulario cel-shading (plan §4)
// Se activa pose por pose: en el paso 1 solo las 2 poses idle de
// referencia (Luna y Max). Los pasos 2 y 3 extienden la lista.
// =============================================================

/** Paleta fija de Luna (gato tabby naranja) — plan §4.1. */
const CAT_PALETTE = {
  'fur-light': '#F2A85E',
  'fur-shadow': '#C4783A',
  'fur-deep': '#8A4A1E',
  'cream-light': '#FFF4E4',
  'cream-shadow': '#E4C4A0',
  'ear-inner': '#F09A96',
  nose: '#E2707A',
  blush: '#F08C8C',
  'eye-iris': '#8C5A2B',
  'eye-pupil': '#1E0F08',
  highlight: '#FFFFFF',
  ink: '#3A1E12',
  ground: '#28140B'
};

/** Paleta fija de Max (perro shiba) — plan §4.1. */
const DOG_PALETTE = {
  'fur-light': '#F7B851',
  'fur-shadow': '#C97E22',
  'fur-deep': '#8A4A12',
  'cream-light': '#FFF8EC',
  'cream-shadow': '#E9CFA8',
  'ear-inner': '#F09A96',
  nose: '#3A2A22',
  blush: '#F0927F',
  'eye-iris': '#6B3A12',
  'eye-pupil': '#160C06',
  highlight: '#FFFFFF',
  ink: '#3B2416',
  ground: '#28140B'
};

/** Las 7 masas de cada pose (cola, patas traseras, cuerpo, patas delanteras, cabeza). */
const MASS_CLASSES = [
  'anim-wag',
  'back-foot-left',
  'back-foot-right',
  'pet-body',
  'left-paw',
  'right-paw',
  'pet-head'
];

/** Poses con contrato cel activo en este paso. */
const CEL_POSES = [
  ['cat idle', catIdleSVG, CAT_PALETTE],
  ['dog idle', dogIdleSVG, DOG_PALETTE]
];

/** Tags de dibujo de un SVG (sin el <svg> raiz, sus cierres ni los <g> contenedor). */
function svgTags(svg) {
  return (svg.match(/<[^>]+>/g) || [])
    .filter((tag) => !/^<\/?(svg|g)\b/.test(tag));
}

/** Valor de un atributo de un tag (null si no existe). */
function tagAttr(tag, name) {
  const m = new RegExp('\\b' + name + '\\s*=\\s*"([^"]*)"').exec(tag);
  return m ? m[1] : null;
}

/** Inner HTML del primer <g class="...cls..."> (depth-matched). */
function groupInner(svg, cls) {
  const openRe = new RegExp(`<g([^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*)>`);
  const m = openRe.exec(svg);
  if (!m) return null;
  let pos = m.index + m[0].length;
  let depth = 1;
  while (pos < svg.length && depth > 0) {
    const nxtOpen = svg.indexOf('<g', pos);
    const nxtClose = svg.indexOf('</g>', pos);
    if (nxtClose === -1) return svg.slice(m.index + m[0].length);
    if (nxtOpen !== -1 && nxtOpen < nxtClose) {
      depth += 1;
      pos = nxtOpen + 2;
    } else {
      depth -= 1;
      if (depth === 0) return svg.slice(m.index + m[0].length, nxtClose);
      pos = nxtClose + 4;
    }
  }
  return svg.slice(m.index + m[0].length);
}

/** Tags con una clase concreta dentro de un fragmento. */
function tagsWithClass(fragment, cls) {
  return fragment.match(new RegExp(`<[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, 'g')) || [];
}

test('cel (idle): sin degradados ni url(#...) — el sombreado es plano', () => {
  for (const [name, svg] of CEL_POSES) {
    assert.doesNotMatch(svg, /linearGradient/i, `${name}: usa linearGradient`);
    assert.doesNotMatch(svg, /radialGradient/i, `${name}: usa radialGradient`);
    assert.doesNotMatch(svg, /<stop\b/i, `${name}: usa <stop>`);
    assert.doesNotMatch(svg, /url\(#/i, `${name}: usa url(#...)`);
  }
});

test('cel (idle): todo fill pertenece a la paleta fija de la especie', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    const allowed = new Set(Object.values(palette).map((c) => c.toUpperCase()));
    for (const tag of svgTags(svg)) {
      const fill = tagAttr(tag, 'fill');
      assert.ok(fill !== null, `${name}: elemento sin fill: ${tag}`);
      if (fill === 'none') {
        // Solo se admite en lineas de detalle (con trazo y sin cel-outline/cel-shadow).
        assert.ok(tagAttr(tag, 'stroke'), `${name}: fill="none" sin trazo: ${tag}`);
        assert.doesNotMatch(tag, /class="cel-(outline|shadow)"/,
          `${name}: cel-outline/cel-shadow con fill="none"`);
        continue;
      }
      assert.match(fill, /^#[0-9A-Fa-f]{6}$/, `${name}: fill no hex "${fill}"`);
      assert.ok(allowed.has(fill.toUpperCase()),
        `${name}: fill ${fill} fuera de la paleta de la especie`);
    }
  }
});

test('cel (idle): un solo color de tinta (ink de la especie) en todos los trazos', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    const inks = new Set();
    for (const tag of svgTags(svg)) {
      const stroke = tagAttr(tag, 'stroke');
      if (!stroke) continue;
      assert.match(stroke, /^#[0-9A-Fa-f]{6}$/, `${name}: stroke no hex "${stroke}"`);
      inks.add(stroke.toUpperCase());
    }
    assert.deepEqual([...inks], [palette.ink],
      `${name}: mas de una tinta de contorno (${[...inks].join(', ')})`);
  }
});

test('cel (idle): cada masa tiene su cel-outline (1 por masa, >= 3 en la cabeza) y >= 1 cel-shadow plano', () => {
  for (const [name, svg] of CEL_POSES) {
    for (const cls of MASS_CLASSES) {
      const inner = groupInner(svg, cls);
      assert.ok(inner !== null, `${name}: falta el grupo .${cls}`);
      const outlines = tagsWithClass(inner, 'cel-outline');
      const shadows = tagsWithClass(inner, 'cel-shadow');
      if (cls === 'pet-head') {
        assert.ok(outlines.length >= 3,
          `${name}: .pet-head necesita >= 3 cel-outline (cabeza + 2 orejas), tiene ${outlines.length}`);
      } else {
        assert.equal(outlines.length, 1,
          `${name}: .${cls} debe tener exactamente 1 cel-outline (tiene ${outlines.length})`);
      }
      assert.ok(shadows.length >= 1, `${name}: .${cls} sin cel-shadow`);
      for (const tag of shadows) {
        assert.equal(tagAttr(tag, 'stroke'), null, `${name}: cel-shadow con trazo: ${tag}`);
        assert.equal(tagAttr(tag, 'opacity'), null, `${name}: cel-shadow con opacity: ${tag}`);
      }
    }
  }
});

test('cel (idle): pesos de linea — contorno 3.2-3.6, detalle interior 1.5-2.1', () => {
  for (const [name, svg] of CEL_POSES) {
    for (const tag of svgTags(svg)) {
      const raw = tagAttr(tag, 'stroke-width');
      if (!raw) continue;
      const width = parseFloat(raw);
      assert.ok(Number.isFinite(width), `${name}: stroke-width invalido "${raw}"`);
      if (/class="[^"]*\bcel-outline\b/.test(tag)) {
        assert.ok(width >= 3.2 && width <= 3.6,
          `${name}: cel-outline con stroke-width ${width} (fuera de 3.2-3.6)`);
      } else {
        assert.ok(width >= 1.5 && width <= 2.1,
          `${name}: detalle con stroke-width ${width} (fuera de 1.5-2.1)`);
      }
    }
  }
});

test('cel (idle): la sombra de piso es el primer elemento y usa el color ground', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    const tags = svgTags(svg);
    const shadow = tags.find((tag) => /class="[^"]*\bpet-shadow\b/.test(tag));
    assert.ok(shadow, `${name}: falta la sombra de piso (.pet-shadow)`);
    assert.equal(tags.indexOf(shadow), 0,
      `${name}: la sombra de piso debe ser el primer elemento (pintado)`);
    assert.equal(tagAttr(shadow, 'fill').toUpperCase(), palette.ground);
  }
});

test('cel (idle): el color ground solo aparece en la sombra de piso', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    for (const tag of svgTags(svg)) {
      const fill = (tagAttr(tag, 'fill') || '').toUpperCase();
      if (fill !== palette.ground) continue;
      assert.match(tag, /class="[^"]*\bpet-shadow\b/,
        `${name}: el color ground aparece fuera de .pet-shadow`);
    }
  }
});

test('cel (idle): cada pupila conserva su ancla y cae dentro de su iris', () => {
  for (const [name, svg] of CEL_POSES) {
    const pupils = svg.match(/<circle[^>]*class="[^"]*\bpet-pupil\b[^"]*"[^>]*>/g) || [];
    assert.ok(pupils.length > 0, `${name}: sin pupilas`);
    const irises = svg.match(/<ellipse[^>]*>/g) || [];
    for (const pupil of pupils) {
      const cx = parseFloat(tagAttr(pupil, 'cx'));
      const cy = parseFloat(tagAttr(pupil, 'cy'));
      const r = parseFloat(tagAttr(pupil, 'r'));
      assert.equal(parseFloat(tagAttr(pupil, 'data-anchor-x')), cx,
        `${name}: data-anchor-x no coincide con cx`);
      assert.equal(parseFloat(tagAttr(pupil, 'data-anchor-y')), cy,
        `${name}: data-anchor-y no coincide con cy`);
      const inside = irises.some((iris) => {
        const irx = parseFloat(tagAttr(iris, 'rx'));
        const iry = parseFloat(tagAttr(iris, 'ry'));
        return parseFloat(tagAttr(iris, 'cx')) === cx
          && parseFloat(tagAttr(iris, 'cy')) === cy
          && irx >= r && iry >= r;
      });
      assert.ok(inside, `${name}: la pupila (${cx},${cy}) no cae dentro de un iris`);
    }
  }
});

// =============================================================
// PIVOTES idle — el transform-origin del CSS debe coincidir con el
// transform-origin inline del grupo SVG equivalente (plan §5).
// El guard derivado de las 12 poses llega en el paso 4.
// =============================================================

/** transform-origin inline del primer <g class="...cls...">. */
function inlineTransformOrigin(svg, cls) {
  const re = new RegExp(
    `<g[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*style="[^"]*transform-origin:\\s*([-\\d.]+)px\\s+([-\\d.]+)px`
  );
  const m = re.exec(svg);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
}

test('animations.css: los pivotes idle (Luna y Max) coinciden con el transform-origin inline del SVG', () => {
  const css = readCss(ANIM_CSS_PATH);
  const cases = [
    ['cat', catIdleSVG, 'body[data-pet="cat"] #pet-container:not(.cat-walk):not(.sitting)'],
    ['dog', dogIdleSVG, 'body[data-pet="dog"] #pet-container:not(.dog-walk):not(.sitting)']
  ];
  const groups = [
    ['.anim-wag', 'anim-wag'],
    ['.back-foot-left', 'back-foot-left'],
    ['.back-foot-right', 'back-foot-right'],
    ['.left-paw', 'left-paw'],
    ['.right-paw', 'right-paw'],
    ['.pet-body', 'pet-body'],
    ['.pet-head', 'pet-head']
  ];
  for (const [species, svg, prefix] of cases) {
    for (const [selector, cls] of groups) {
      const rule = extractRule(css, `${prefix} ${selector}`);
      assert.ok(rule, `animations.css: falta la regla idle de ${species} "${prefix} ${selector}"`);
      const cssOrigin = /transform-origin:\s*([-\d.]+)px\s+([-\d.]+)px/.exec(rule);
      assert.ok(cssOrigin, `animations.css: "${prefix} ${selector}" sin transform-origin`);
      const inline = inlineTransformOrigin(svg, cls);
      assert.ok(inline, `${species} idle: el grupo .${cls} no tiene transform-origin inline`);
      assert.equal(parseFloat(cssOrigin[1]), inline.x,
        `${species} idle: ${selector} CSS != SVG (x)`);
      assert.equal(parseFloat(cssOrigin[2]), inline.y,
        `${species} idle: ${selector} CSS != SVG (y)`);
    }
  }
});

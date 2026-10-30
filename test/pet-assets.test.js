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

test('cat walk SVG: anchor en (52, 70) (centro del ojo de perfil)', () => {
  const anchors = extractPupilAnchors(catWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 52, y: 70 });
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

test('dog walk SVG: anchor en (48, 66) (ojo de perfil de Max)', () => {
  const anchors = extractPupilAnchors(dogWalkSVG);
  assert.equal(anchors.length, 1);
  assert.deepEqual(anchors[0], { x: 48, y: 66 });
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
  assert.deepEqual(extractPupilAnchors(catSitSVG), [{ x: 76, y: 76 }, { x: 124, y: 76 }]);
  assert.equal(countPetPupils(catLaySVG), 2);
  assert.deepEqual(extractPupilAnchors(catLaySVG), [{ x: 48, y: 116 }, { x: 76, y: 116 }]);
  assert.equal(countPetPupils(catStretchSVG), 2);
  assert.deepEqual(extractPupilAnchors(catStretchSVG), [{ x: 40, y: 126 }, { x: 66, y: 126 }]);
});

test('dog sit/lay/stretch: pupilas y anchors de produccion', () => {
  assert.equal(countPetPupils(dogSitSVG), 2);
  assert.deepEqual(extractPupilAnchors(dogSitSVG), [{ x: 76, y: 74 }, { x: 124, y: 74 }]);
  assert.equal(countPetPupils(dogLaySVG), 2);
  assert.deepEqual(extractPupilAnchors(dogLaySVG), [{ x: 50, y: 116 }, { x: 78, y: 116 }]);
  assert.equal(countPetPupils(dogStretchSVG), 2);
  assert.deepEqual(extractPupilAnchors(dogStretchSVG), [{ x: 42, y: 124 }, { x: 68, y: 124 }]);
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

  // El VALOR EXACTO de cada pivote no se comprueba aca con literales: lo
  // hace el guard derivado (CSS <-> SVG) del final de este archivo, que
  // compara la regla que gana la cascada contra el transform-origin
  // inline del <g> de la pose. Aca solo queda el guard negativo: el walk
  // es perfil, no puede volver a los pivotes frontales viejos.
  const catBfl = extractRule(css, '.cat-walk .back-foot-left');
  assert.ok(catBfl, 'missing .cat-walk .back-foot-left rule');
  assert.doesNotMatch(catBfl, /58px\s+132px/);

  const dogBfl = extractRule(css, '.dog-walk .back-foot-left');
  assert.ok(dogBfl, 'missing .dog-walk .back-foot-left rule');
  assert.doesNotMatch(dogBfl, /56px\s+134px/);

  const catWalkTail = extractRule(css, '.walking-bob.cat-walk .anim-wag');
  assert.ok(catWalkTail, 'missing Luna walk tail origin rule');
  assert.doesNotMatch(catWalkTail, /130px\s+145px/);

  const dogWalkTail = extractRule(css, '.walking-bob.dog-walk .anim-wag-fast');
  assert.ok(dogWalkTail, 'missing Max walk tail origin rule');
  assert.doesNotMatch(dogWalkTail, /158px\s+112px/);
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

/**
 * Poses con contrato cel activo.
 * Paso 1 activo las 2 idle de referencia; el paso 2 extiende el contrato a
 * las 6 poses de Luna; el paso 3 lo extiende a las 6 poses de Max.
 * El ultimo campo es el conteo de pupilas esperado
 * (2 de frente, 1 de perfil, 0 dormida).
 */
const CEL_POSES = [
  ['cat idle', catIdleSVG, CAT_PALETTE, 2],
  ['cat walk', catWalkSVG, CAT_PALETTE, 1],
  ['cat sleep', catSleepSVG, CAT_PALETTE, 0],
  ['cat sit', catSitSVG, CAT_PALETTE, 2],
  ['cat lay', catLaySVG, CAT_PALETTE, 2],
  ['cat stretch', catStretchSVG, CAT_PALETTE, 2],
  ['dog idle', dogIdleSVG, DOG_PALETTE, 2],
  ['dog walk', dogWalkSVG, DOG_PALETTE, 1],
  ['dog sleep', dogSleepSVG, DOG_PALETTE, 0],
  ['dog sit', dogSitSVG, DOG_PALETTE, 2],
  ['dog lay', dogLaySVG, DOG_PALETTE, 2],
  ['dog stretch', dogStretchSVG, DOG_PALETTE, 2]
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

test('cel: sin degradados ni url(#...) — el sombreado es plano', () => {
  for (const [name, svg] of CEL_POSES) {
    assert.doesNotMatch(svg, /linearGradient/i, `${name}: usa linearGradient`);
    assert.doesNotMatch(svg, /radialGradient/i, `${name}: usa radialGradient`);
    assert.doesNotMatch(svg, /<stop\b/i, `${name}: usa <stop>`);
    assert.doesNotMatch(svg, /url\(#/i, `${name}: usa url(#...)`);
  }
});

test('cel: todo fill pertenece a la paleta fija de la especie', () => {
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

test('cel: un solo color de tinta (ink de la especie) en todos los trazos', () => {
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

test('cel: cada masa tiene su cel-outline (1 por masa, >= 3 en la cabeza) y >= 1 cel-shadow plano', () => {
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

test('cel: pesos de linea — contorno 3.2-3.6, detalle interior 1.5-2.1', () => {
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

test('cel: la sombra de piso es el primer elemento y usa el color ground', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    const tags = svgTags(svg);
    const shadow = tags.find((tag) => /class="[^"]*\bpet-shadow\b/.test(tag));
    assert.ok(shadow, `${name}: falta la sombra de piso (.pet-shadow)`);
    assert.equal(tags.indexOf(shadow), 0,
      `${name}: la sombra de piso debe ser el primer elemento (pintado)`);
    assert.equal(tagAttr(shadow, 'fill').toUpperCase(), palette.ground);
  }
});

test('cel: el color ground solo aparece en la sombra de piso', () => {
  for (const [name, svg, palette] of CEL_POSES) {
    for (const tag of svgTags(svg)) {
      const fill = (tagAttr(tag, 'fill') || '').toUpperCase();
      if (fill !== palette.ground) continue;
      assert.match(tag, /class="[^"]*\bpet-shadow\b/,
        `${name}: el color ground aparece fuera de .pet-shadow`);
    }
  }
});

test('cel: cada pupila conserva su ancla y cae dentro de su iris', () => {
  for (const [name, svg, , expectedPupils] of CEL_POSES) {
    const pupils = svg.match(/<circle[^>]*class="[^"]*\bpet-pupil\b[^"]*"[^>]*>/g) || [];
    assert.equal(pupils.length, expectedPupils,
      `${name}: espera ${expectedPupils} pupilas, hay ${pupils.length}`);
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
// PIVOTES POR ESTADO (Luna) — cola, cuerpo y cabeza en sleep/lay/stretch.
// Las reglas nuevas usan !important (la regla idle tiene especificidad
// mayor), asi que el pivote idle no debe pisar la geometria de la pose.
// =============================================================

test('animations.css: Luna tiene regla de pivote por estado (sleeping/laying/stretching)', () => {
  const css = readCss(ANIM_CSS_PATH);
  const states = ['sleeping', 'laying', 'stretching'];
  const groups = ['.anim-wag', '.pet-body', '.pet-head'];
  for (const state of states) {
    for (const selector of groups) {
      const full = `body[data-pet="cat"] #pet-container.${state} ${selector}`;
      const rule = extractRule(css, full);
      assert.ok(rule, `animations.css: falta la regla de estado "${full}"`);
      assert.match(rule, /transform-origin:\s*([-\d.]+)px\s+([-\d.]+)px/,
        `animations.css: "${full}" sin transform-origin`);
      assert.match(rule, /!important/,
        `animations.css: "${full}" necesita !important (la regla idle gana en especificidad)`);
    }
  }
});

// =============================================================
// PIVOTES POR ESTADO (Max) — cola, cuerpo y cabeza en sleep/lay/stretch.
// Mismo contrato que Luna: la regla idle tiene especificidad mayor, asi que
// las reglas por estado necesitan !important.
// =============================================================

test('animations.css: Max tiene regla de pivote por estado (sleeping/laying/stretching)', () => {
  const css = readCss(ANIM_CSS_PATH);
  const states = ['sleeping', 'laying', 'stretching'];
  const groups = ['.anim-wag', '.pet-body', '.pet-head'];
  for (const state of states) {
    for (const selector of groups) {
      const full = `body[data-pet="dog"] #pet-container.${state} ${selector}`;
      const rule = extractRule(css, full);
      assert.ok(rule, `animations.css: falta la regla de estado "${full}"`);
      assert.match(rule, /transform-origin:\s*([-\d.]+)px\s+([-\d.]+)px/,
        `animations.css: "${full}" sin transform-origin`);
      assert.match(rule, /!important/,
        `animations.css: "${full}" necesita !important (la regla idle gana en especificidad)`);
    }
  }
});

// =============================================================
// GUARD DE DERIVA CSS <-> SVG (12 poses) — plan §5, paso 4
//
// El transform-origin del CSS y el transform-origin inline del <g> del
// SVG describen el MISMO pivote. Si el arte se redibuja y el CSS no se
// actualiza, la animacion rota en pantalla y ningun test falla.
//
// Este guard es DERIVADO: no repite literales. Para cada (especie,
// estado, grupo) calcula que regla CSS gana la cascada y la compara con
// el transform-origin inline del <g> equivalente de esa pose.
// =============================================================

/** Las 12 poses de produccion con su estado de animacion. */
const PIVOT_POSES = [
  ['cat', 'idle', catIdleSVG],
  ['cat', 'walk', catWalkSVG],
  ['cat', 'sleep', catSleepSVG],
  ['cat', 'sit', catSitSVG],
  ['cat', 'lay', catLaySVG],
  ['cat', 'stretch', catStretchSVG],
  ['dog', 'idle', dogIdleSVG],
  ['dog', 'walk', dogWalkSVG],
  ['dog', 'sleep', dogSleepSVG],
  ['dog', 'sit', dogSitSVG],
  ['dog', 'lay', dogLaySVG],
  ['dog', 'stretch', dogStretchSVG]
];

/**
 * Groups con pivote verificado por estado (plan §5).
 * Cola, cuerpo y cabeza rotan en los 6 estados; las patas solo rotan
 * en walk y sit (en sleep/lay/stretch su pivote es inerte).
 */
const PIVOT_GROUPS_BY_STATE = {
  idle: ['anim-wag', 'pet-body', 'pet-head'],
  walk: ['anim-wag', 'pet-body', 'pet-head',
    'back-foot-left', 'back-foot-right', 'left-paw', 'right-paw'],
  sleep: ['anim-wag', 'pet-body', 'pet-head'],
  sit: ['anim-wag', 'pet-body', 'pet-head',
    'back-foot-left', 'back-foot-right', 'left-paw', 'right-paw'],
  lay: ['anim-wag', 'pet-body', 'pet-head'],
  stretch: ['anim-wag', 'pet-body', 'pet-head']
};

/* ---------- Lado CSS: reglas, especificidad y cascada ---------- */

/** Indice de la llave que cierra el bloque abierto en `openIndex`. */
function matchBraceIndex(css, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return css.length;
}

/** Divide una lista de selectores por comas (respetando parentesis). */
function splitSelectorList(prelude) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of prelude) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

/**
 * transform-origin declarado en un bloque de declaraciones.
 * Devuelve null si la regla no declara la propiedad.
 */
function extractTransformOrigin(body) {
  const m = /(?:^|[;{]|\s)transform-origin\s*:\s*([^;]+)/i.exec(body);
  if (!m) return null;
  let raw = m[1].trim();
  const important = /!\s*important$/i.test(raw);
  raw = raw.replace(/!\s*important$/i, '').trim();
  const px = /^([-\d.]+)px\s+([-\d.]+)px$/.exec(raw);
  return {
    raw,
    important,
    x: px ? parseFloat(px[1]) : null,
    y: px ? parseFloat(px[2]) : null
  };
}

/** Todas las reglas de estilo del CSS, en orden de documento. */
function parseStyleRules(css) {
  const source = stripCssComments(css);
  const rules = [];
  let i = 0;
  let preludeStart = 0;
  while (i < source.length) {
    if (source[i] === '}') {
      i++;
      preludeStart = i;
      continue;
    }
    if (source[i] !== '{') {
      i++;
      continue;
    }
    const prelude = source.slice(preludeStart, i).trim();
    const end = matchBraceIndex(source, i);
    const body = source.slice(i + 1, end);
    // Los at-rules (@keyframes, @media...) no fijan pivotes: se saltan.
    if (prelude && !prelude.startsWith('@')) {
      for (const selector of splitSelectorList(prelude)) {
        rules.push({
          selector,
          transformOrigin: extractTransformOrigin(body),
          specificity: cssSpecificity(selector),
          order: rules.length
        });
      }
    }
    i = end + 1;
    preludeStart = i;
  }
  return rules;
}

/** Suma la especificidad de un selector simple (sin combinadores). */
function addCompoundSpecificity(compound, counts) {
  let rest = compound;
  const notRe = /:not\(([^()]*)\)/g;
  let m;
  // :not(X) tiene la especificidad de X.
  while ((m = notRe.exec(rest)) !== null) {
    addCompoundSpecificity(m[1], counts);
  }
  rest = rest.replace(notRe, ' ');
  counts.ids += (rest.match(/#[A-Za-z0-9_-]+/g) || []).length;
  counts.classes += (rest.match(/\.[A-Za-z0-9_-]+/g) || []).length;
  counts.classes += (rest.match(/\[[^\]]*\]/g) || []).length;
  counts.classes += (rest.match(/:[A-Za-z-]+/g) || []).length;
  if (/^[a-zA-Z][A-Za-z0-9-]*/.test(rest)) counts.types += 1;
}

/** Especificidad CSS de un selector: { ids, classes, types }. */
function cssSpecificity(selector) {
  const counts = { ids: 0, classes: 0, types: 0 };
  for (const compound of selector.split(/\s+/).filter(Boolean)) {
    addCompoundSpecificity(compound, counts);
  }
  return counts;
}

/** Compara dos especificidades (positivo = la primera gana). */
function compareSpecificity(a, b) {
  if (a.ids !== b.ids) return a.ids - b.ids;
  if (a.classes !== b.classes) return a.classes - b.classes;
  return a.types - b.types;
}

/* ---------- Lado DOM: matcher de selectores ---------- */

/** Un selector simple coincide con un elemento? (soporta #id, .clase, [attr], :not()) */
function compoundMatches(compound, el) {
  let rest = compound;
  const notRe = /:not\(([^()]*)\)/g;
  const nots = [];
  let m;
  while ((m = notRe.exec(rest)) !== null) nots.push(m[1]);
  rest = rest.replace(notRe, ' ');

  const idRe = /#([A-Za-z0-9_-]+)/g;
  while ((m = idRe.exec(rest)) !== null) {
    if (el.id !== m[1]) return false;
  }
  const clsRe = /\.([A-Za-z0-9_-]+)/g;
  while ((m = clsRe.exec(rest)) !== null) {
    if (!el.classes.includes(m[1])) return false;
  }
  const attrRe = /\[([A-Za-z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/g;
  while ((m = attrRe.exec(rest)) !== null) {
    const name = m[1];
    if (!(name in el.attrs)) return false;
    const value = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
    if (value !== undefined && el.attrs[name] !== value) return false;
  }
  for (const not of nots) {
    const inner = /^\.([A-Za-z0-9_-]+)$/.exec(not);
    if (!inner) return false;
    if (el.classes.includes(inner[1])) return false;
  }
  const typeMatch = /^([a-zA-Z][A-Za-z0-9-]*)/.exec(rest);
  if (typeMatch && el.tag !== typeMatch[1]) return false;
  return true;
}

/** El ultimo selector simple debe caer sobre el elemento destino. */
function matchCompounds(compounds, ci, chain, ei) {
  if (!compoundMatches(compounds[ci], chain[ei])) return false;
  if (ci === 0) return true;
  for (let k = ei - 1; k >= 0; k--) {
    if (matchCompounds(compounds, ci - 1, chain, k)) return true;
  }
  return false;
}

/** Un selector (solo combinador descendente) coincide con la cadena? */
function selectorMatches(selector, chain) {
  const compounds = selector.split(/\s+/).filter(Boolean);
  if (compounds.length === 0) return false;
  return matchCompounds(compounds, compounds.length - 1, chain, chain.length - 1);
}

/** Clases que #pet-container lleva en cada estado (ver src/renderer/pet-viewport.js). */
function containerClassesFor(species, state) {
  switch (state) {
    case 'walk': return ['walking-bob', `${species}-walk`];
    case 'sleep': return ['sleeping'];
    case 'sit': return ['sitting'];
    case 'lay': return ['laying'];
    case 'stretch': return ['stretching'];
    case 'idle': return [];
    default: throw new Error(`estado desconocido: ${state}`);
  }
}

/** Cadena de elementos que envuelve al <g> de la mascota en el DOM. */
function petElementChain(species, state, groupClasses) {
  return [
    { tag: 'body', id: null, classes: [], attrs: { 'data-pet': species } },
    { tag: null, id: 'pet-container', classes: containerClassesFor(species, state), attrs: {} },
    { tag: null, id: 'pet-svg-wrapper', classes: [], attrs: {} },
    { tag: 'svg', id: 'pet-svg', classes: [], attrs: {} },
    { tag: 'g', id: null, classes: groupClasses, attrs: {} }
  ];
}

/**
 * Regla que gana la cascada para un <g> en un estado dado:
 * primero !important, luego especificidad, luego orden del documento.
 */
function winningPivotRule(rules, chain) {
  const candidates = rules.filter((rule) =>
    rule.transformOrigin && selectorMatches(rule.selector, chain));
  if (candidates.length === 0) return null;
  let winner = candidates[0];
  for (const rule of candidates.slice(1)) {
    if (rule.transformOrigin.important !== winner.transformOrigin.important) {
      if (rule.transformOrigin.important) winner = rule;
      continue;
    }
    const diff = compareSpecificity(rule.specificity, winner.specificity);
    if (diff > 0) winner = rule;
    else if (diff === 0 && rule.order > winner.order) winner = rule;
  }
  return winner;
}

/* ---------- Lado SVG ---------- */

/** Tag de apertura del <g> que lleva la clase `cls`. */
function groupOpenTag(svg, cls) {
  const re = new RegExp(`<g[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`);
  const m = re.exec(svg);
  return m ? m[0] : null;
}

/** Tokens de clase de un tag. */
function classTokens(tag) {
  const m = /class="([^"]*)"/.exec(tag);
  return m ? m[1].split(/\s+/).filter(Boolean) : [];
}

/** transform-origin inline (en px) del <g> de la clase `cls`. */
function inlineTransformOrigin(svg, cls) {
  const tag = groupOpenTag(svg, cls);
  if (!tag) return null;
  const m = /transform-origin:\s*([-\d.]+)px\s+([-\d.]+)px/.exec(tag);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
}

/** Tags de los hijos directos del <svg> raiz (los elementos de pintado). */
function rootChildTags(svg) {
  const open = /<svg\b[^>]*>/.exec(svg);
  assert.ok(open, 'la pose no tiene <svg> raiz');
  const inner = svg.slice(open.index + open[0].length);
  const close = inner.lastIndexOf('</svg>');
  const body = close === -1 ? inner : inner.slice(0, close);
  const out = [];
  const tagRe = /<(\/)?([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/)?>/g;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(body)) !== null) {
    const closing = Boolean(m[1]);
    const name = m[2];
    const selfClosing = Boolean(m[4]);
    if (closing) {
      depth--;
      continue;
    }
    if (depth === 0) out.push(m[0]);
    if (!selfClosing && (name === 'g' || name === 'svg')) depth++;
  }
  return out;
}

/** Orden de pintado de las 12 poses (criterio de aceptacion del plan). */
const PAINT_ORDER = [
  'pet-shadow',
  'anim-wag',
  'back-foot-left',
  'back-foot-right',
  'pet-body',
  'left-paw',
  'right-paw',
  'pet-head'
];

test('guard de deriva: el pivote que gana el CSS coincide con el transform-origin inline del SVG (12 poses)', () => {
  // Se parsea el bundle completo (styles.css) y no solo animations.css:
  // la cascada real es la que ve el navegador, y un stylesheet posterior
  // podria robar el pivote en silencio.
  const rules = parseStyleRules(flattenCss(STYLES_ENTRY_PATH));
  assert.ok(rules.length > 0, 'no se parsearon reglas de estilo del bundle');

  let checked = 0;
  for (const [species, state, svg] of PIVOT_POSES) {
    for (const cls of PIVOT_GROUPS_BY_STATE[state]) {
      const tag = groupOpenTag(svg, cls);
      assert.ok(tag, `${species} ${state}: falta el grupo .${cls} en el SVG`);
      const inline = inlineTransformOrigin(svg, cls);
      assert.ok(inline,
        `${species} ${state}: el grupo .${cls} no declara transform-origin inline`);

      const chain = petElementChain(species, state, classTokens(tag));
      const winner = winningPivotRule(rules, chain);
      assert.ok(winner,
        `${species} ${state} .${cls}: ninguna regla del CSS fija el transform-origin`);
      const cssOrigin = winner.transformOrigin;
      assert.notEqual(cssOrigin.x, null,
        `${species} ${state} .${cls}: la regla "${winner.selector}" no fija un pivote en px ("${cssOrigin.raw}")`);
      assert.equal(cssOrigin.x, inline.x,
        `${species} ${state} .${cls}: CSS "${winner.selector}" (${cssOrigin.x}px) != inline del SVG (${inline.x}px)`);
      assert.equal(cssOrigin.y, inline.y,
        `${species} ${state} .${cls}: CSS "${winner.selector}" (${cssOrigin.y}px) != inline del SVG (${inline.y}px)`);
      checked++;
    }
  }
  assert.equal(checked, 52, 'cobertura del guard de pivotes incompleta');
});

test('guard de deriva: la sombra de piso sigue siendo el primer elemento y el orden de pintado no se movio', () => {
  assert.equal(PRODUCTION_POSES.length, 12, 'expected idle/walk/sleep/sit/lay/stretch × cat+dog');
  for (const [name, svg] of PRODUCTION_POSES) {
    const children = rootChildTags(svg);
    assert.equal(children.length, PAINT_ORDER.length,
      `${name}: el <svg> deberia tener ${PAINT_ORDER.length} elementos de pintado, tiene ${children.length}`);
    for (let i = 0; i < PAINT_ORDER.length; i++) {
      const tokens = classTokens(children[i]);
      assert.ok(tokens.includes(PAINT_ORDER[i]),
        `${name}: el elemento ${i} deberia ser .${PAINT_ORDER[i]} (es "${tokens.join(' ')}")`);
      if (i === 0) continue;
      assert.ok(children[i].startsWith('<g'),
        `${name}: el elemento ${i} (.${PAINT_ORDER[i]}) deberia ser un <g> hermano`);
    }
    assert.ok(classTokens(children[0]).includes('pet-shadow'),
      `${name}: la sombra de piso debe ser el primer elemento (pintado)`);
  }
});

// =============================================================
// PASO 4 (bis) — Guards de arte: sombra contenida, silueta unica
// y cola encajada (plan §4.4.4, §4.4.5 y §4.4.6)
//
// La QA del 2026-10-27 encontró que el criterio "la sombra no cruza el
// contorno de la masa" y el criterio "la base de la cola se esconde bajo
// el cuerpo" no tenian ningun test que los fijara, y el arte no los
// cumplia. Estos guards los derivan de la geometria real del SVG, asi que
// un redibujo que rompa el encaje falla en verde.
// =============================================================

const celGeo = require('./helpers/cel-geometry');

/** Las 12 poses de produccion con su SVG (mismo origen que CEL_POSES). */
const ART_POSES = CEL_POSES.map(([name, svg]) => ({ name, svg }));

/** Poligonos de la silueta de una masa (cola, cuerpo, ...). */
function massOutlinePolys(svg, cls) {
  const out = [];
  for (const mass of celGeo.collectMasses(svg)) {
    if (!mass.classes.includes(cls)) continue;
    for (const outline of mass.outlines) {
      out.push(...celGeo.transformPolys(celGeo.shapePolygons(outline), mass.matrix));
    }
  }
  return out;
}

/**
 * Poligonos rellenos de una masa: su silueta (cel-outline) mas el cel-base
 * y los parches. Es la forma que se ve en pantalla (la tinta y el relleno).
 */
function massFilledPolys(svg, cls) {
  const out = [];
  for (const shape of celGeo.collectFilledShapes(svg)) {
    const inMass = shape.chain.some((el) => celGeo.classTokensOf(el).includes(cls));
    if (!inMass) continue;
    out.push(...celGeo.transformPolys(shape.polys, shape.matrix));
  }
  return out;
}

test('cel: ningun plano de sombra cruza el contorno de la masa que sombrea', () => {
  // tolerancia: la mitad del trazo de tinta (1.6-1.7 px) tapa el desborde,
  // asi que lo que no se ve sobre el fondo sigue siendo aceptable.
  const TOLERANCE = 0.7;
  for (const { name, svg } of ART_POSES) {
    const measures = celGeo.measureShadows(svg);
    assert.ok(measures.length > 0, `${name}: no se encontro ningun plano de sombra`);
    for (const m of measures) {
      assert.ok(m.maxOutside <= TOLERANCE,
        `${name}: el plano de sombra de .${m.mass} se sale ${m.maxOutside.toFixed(2)} px ` +
        `del contorno de su masa (tolerancia ${TOLERANCE} px)`);
      // luz desde arriba-izquierda: la sombra no puede caer arriba-izquierda
      assert.ok(!(m.dx < 0 && m.dy < 0 && Math.abs(m.dx) + Math.abs(m.dy) > 6),
        `${name}: el plano de sombra de .${m.mass} cae arriba-izquierda ` +
        `(dx ${m.dx.toFixed(2)}, dy ${m.dy.toFixed(2)}): la luz viene de arriba-izquierda`);
    }
  }
});

test('cel: cada pose se lee como una sola silueta (no hay masas flotando)', () => {
  // Invariante de forma: la silueta union de la pose (rellenos + media tinta)
  // tiene que ser una sola pieza. La "cola que se une por un solo punto" no se
  // ve aqui (dos masas que se tocan siguen siendo un componente): esa la
  // caza el guard de la raiz de la cola, que mide la envergadura del enlace.
  for (const { name, svg } of ART_POSES) {
    const res = celGeo.silhouetteComponents(svg, { scale: 4, dilate: 1.7 });
    assert.equal(res.components, 1,
      `${name}: la silueta union de la pose tiene ${res.components} componentes ` +
      `(deberia ser 1): hay una masa que flota`);
  }
});

test('cel: las patas delanteras no repiten el contorno del cuerpo (sin doble linea)', () => {
  // QA 2026-10-27: la pata delantera se cerraba sobre el vientre y su
  // contorno se cruzaba con el del cuerpo -> doble linea y lectura de
  // "pieza pegada".  El contorno de la pata solo puede apoyarse en el
  // cuerpo en el punto de union: si comparte un tramo con el contorno
  // del cuerpo, la costura se ve como una linea interior.
  const MAX_SHARED = 10;
  for (const { name, svg } of ART_POSES) {
    const bodyPolys = massOutlinePolys(svg, 'pet-body');
    assert.ok(bodyPolys.length > 0, `${name}: no se encontro la masa del cuerpo`);
    for (const cls of ['left-paw', 'right-paw']) {
      const pawPolys = massOutlinePolys(svg, cls);
      assert.ok(pawPolys.length > 0, `${name}: no se encontro la masa .${cls}`);
      // si la pata esta entera dentro de la silueta del cuerpo (patas
      // recogidas) no hay costura exterior que revisar.
      let outside = 0;
      let total = 0;
      for (const poly of pawPolys) {
        for (const p of poly) {
          total++;
          if (!bodyPolys.some((b) => celGeo.pointInPolygon(b, p[0], p[1]))) outside++;
        }
      }
      if (total > 0 && outside / total < 0.2) continue;
      let shared = 0;
      for (const poly of pawPolys) {
        for (const p of poly) {
          let d = Infinity;
          for (const b of bodyPolys) {
            d = Math.min(d, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
          }
          if (d <= 1.2) shared++;
        }
      }
      assert.ok(shared <= MAX_SHARED,
        `${name}: .${cls} comparte ${shared} puntos con el contorno del cuerpo ` +
        `(maximo ${MAX_SHARED}): la costura se ve como una linea interior (pieza pegada)`);
    }
  }
});

test('cel: los parches crema (hocico, pecho) no llevan contorno propio', () => {
  // Un parche de color con su propio trazo se lee como una pegatina encima
  // de la cabeza o del pecho.  El plano de sombra plano ya le da volumen.
  for (const { name, svg } of ART_POSES) {
    for (const tag of svgTags(svg)) {
      const fill = (tagAttr(tag, 'fill') || '').toUpperCase();
      if (fill !== '#FFF4E4' && fill !== '#FFF8EC') continue;
      if (/class="[^"]*\bcel-(outline|shadow)\b/.test(tag)) continue;
      assert.equal(tagAttr(tag, 'stroke'), null,
        `${name}: un parche crema lleva contorno propio y se lee como una pegatina: ${tag}`);
    }
  }
});

test('cel: la base de la cola se esconde bajo la grupa (>= 6 px y con envergadura)', () => {
  // La raiz de la cola no puede ser una punta: tiene que meterse en el
  // cuerpo con profundidad (>= 6 px, plan §4.4.4) y con envergadura (un
  // trozo de cola de verdad bajo la grupa, no una astilla de 2 px).
  //
  // Sin la envergadura el criterio no muerde: una hoja flotante puede
  // tener 8 px de profundidad y solo rozar la grupa con una punta.
  const MIN_DEPTH = 6; // px de cola escondida bajo el cuerpo
  const MIN_WIDTH = 5; // px de ancho de la raiz escondida
  for (const { name, svg } of ART_POSES) {
    const tail = massOutlinePolys(svg, 'anim-wag');
    const body = massOutlinePolys(svg, 'pet-body');
    assert.ok(tail.length > 0, `${name}: no se encontro la masa de la cola`);
    assert.ok(body.length > 0, `${name}: no se encontro la masa del cuerpo`);

    let depth = 0;
    for (const poly of tail) {
      for (const p of poly) {
        if (!body.some((b) => celGeo.pointInPolygon(b, p[0], p[1]))) continue;
        let d = Infinity;
        for (const b of body) d = Math.min(d, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
        depth = Math.max(depth, d);
      }
    }
    assert.ok(depth >= MIN_DEPTH,
      `${name}: la base de la cola solo se esconde ${depth.toFixed(1)} px bajo el cuerpo ` +
      `(minimo ${MIN_DEPTH} px): la cola se lee como un accesorio pegado`);

    const width = celGeo.overlapWidth(tail, body, 0.1);
    assert.ok(width >= MIN_WIDTH,
      `${name}: la raiz de la cola metida en la grupa es de ${width.toFixed(1)} px de ancho ` +
      `(minimo ${MIN_WIDTH} px): la cola se lee como una hoja flotante`);
  }
});

test('cel: la cabeza se superpone al cuerpo (>= 8 px) y su tinta llega al contorno del cuerpo', () => {
  // Plan §4.4.3: la cabeza se superpone al cuerpo >= 8 px y el encuentro
  // cuello/cabeza no se marca con una linea recta (se resuelve con el plano
  // de sombra del cuello y las lineas de quiebre de pelo).
  //
  // QA 2026-10-28: en Max (walk y sleep) la cabeza NO estaba unida al
  // cuerpo: el borde trasero de la silueta de la cabeza terminaba por
  // encima de la linea del lomo, dejando una franja de fondo entre la nuca
  // y el lomo (el "corte de contorno" de la base del cuello). El guard de
  // silueta unica no lo cazaba: cuenta componentes de la silueta union y
  // un hueco interior (o una muesca) no lo cambia.
  //
  // Por eso se miden DOS cosas:
  //  1. la profundidad del encaje (la cabeza entra >= 8 px en el cuerpo);
  //  2. la distancia entre la tinta de la cabeza y el contorno del cuerpo
  //     (<= 2 px): la tinta del cuello tiene que tocar la linea del lomo,
  //     si no queda un corte visible en la silueta.
  const MIN_DEPTH = 8;
  const MAX_GAP = 2;
  for (const { name, svg } of ART_POSES) {
    const head = massFilledPolys(svg, 'pet-head');
    const headInk = massOutlinePolys(svg, 'pet-head');
    const body = massOutlinePolys(svg, 'pet-body');
    assert.ok(head.length > 0, `${name}: no se encontro la silueta de la cabeza`);
    assert.ok(body.length > 0, `${name}: no se encontro la silueta del cuerpo`);

    let depth = 0;
    for (const poly of head) {
      for (const p of poly) {
        if (!body.some((b) => celGeo.pointInPolygon(b, p[0], p[1]))) continue;
        let d = Infinity;
        for (const b of body) d = Math.min(d, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
        depth = Math.max(depth, d);
      }
    }
    assert.ok(depth >= MIN_DEPTH,
      `${name}: la cabeza solo se superpone ${depth.toFixed(1)} px al cuerpo ` +
      `(minimo ${MIN_DEPTH} px): la cabeza flota sobre el cuerpo`);

    let gap = Infinity;
    for (const poly of headInk) {
      for (const p of poly) {
        for (const b of body) {
          gap = Math.min(gap, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
        }
      }
    }
    assert.ok(gap <= MAX_GAP,
      `${name}: la tinta de la cabeza queda a ${gap.toFixed(1)} px del contorno del cuerpo ` +
      `(maximo ${MAX_GAP} px): se ve un corte de contorno en el cuello`);
  }
});

// =============================================================
// PASO 5 — Preview de las 12 poses + capturas para la revision visual
//
// El preview (test/preview/pet-poses-preview.html) es la pagina donde el
// revisor visual mira las 12 poses de produccion sobre fondo claro y
// oscuro, y pet-poses-capture.py deja un PNG por pose en
// docs/pet-screenshots/.
//
// Estos tests fijan el contrato de los 3 artefactos:
//   1. la pagina declara una tarjeta por cada una de las 12 poses;
//   2. cada tarjeta se ve sobre fondo claro Y fondo oscuro, con etiqueta;
//   3. la pagina renderiza el SVG de PRODUCCION (no una copia del arte),
//      asi que no puede quedar vieja respecto de src/assets/*.js;
//   4. el script de captura lista las 12 poses y escribe en
//      docs/pet-screenshots/;
//   5. existe un PNG por pose y el README los indexa con el comando de
//      regeneracion.
// =============================================================

const PREVIEW_DIR = path.join(__dirname, 'preview');
const PREVIEW_HTML_PATH = path.join(PREVIEW_DIR, 'pet-poses-preview.html');
const CAPTURE_PY_PATH = path.join(PREVIEW_DIR, 'pet-poses-capture.py');
const SHOTS_DIR = path.join(__dirname, '..', 'docs', 'pet-screenshots');
const SHOTS_README_PATH = path.join(SHOTS_DIR, 'README.md');

/**
 * Las 12 poses de produccion que el preview debe mostrar.
 * `global` es el export real de src/assets/{cat,dog}.js que dibuja la pose:
 * si ese export cambia de nombre, el preview deja de pintar la pose real.
 */
const PREVIEW_POSES = [
  { id: 'cat-idle', species: 'cat', state: 'idle', label: 'Luna', stateLabel: 'Idle', global: 'catIdleSVG' },
  { id: 'cat-walk', species: 'cat', state: 'walk', label: 'Luna', stateLabel: 'Walk', global: 'catWalkSVG' },
  { id: 'cat-sleep', species: 'cat', state: 'sleep', label: 'Luna', stateLabel: 'Sleep', global: 'catSleepSVG' },
  { id: 'cat-sit', species: 'cat', state: 'sit', label: 'Luna', stateLabel: 'Sit', global: 'catSitSVG' },
  { id: 'cat-lay', species: 'cat', state: 'lay', label: 'Luna', stateLabel: 'Lay', global: 'catLaySVG' },
  { id: 'cat-stretch', species: 'cat', state: 'stretch', label: 'Luna', stateLabel: 'Stretch', global: 'catStretchSVG' },
  { id: 'dog-idle', species: 'dog', state: 'idle', label: 'Max', stateLabel: 'Idle', global: 'dogIdleSVG' },
  { id: 'dog-walk', species: 'dog', state: 'walk', label: 'Max', stateLabel: 'Walk', global: 'dogWalkSVG' },
  { id: 'dog-sleep', species: 'dog', state: 'sleep', label: 'Max', stateLabel: 'Sleep', global: 'dogSleepSVG' },
  { id: 'dog-sit', species: 'dog', state: 'sit', label: 'Max', stateLabel: 'Sit', global: 'dogSitSVG' },
  { id: 'dog-lay', species: 'dog', state: 'lay', label: 'Max', stateLabel: 'Lay', global: 'dogLaySVG' },
  { id: 'dog-stretch', species: 'dog', state: 'stretch', label: 'Max', stateLabel: 'Stretch', global: 'dogStretchSVG' }
];

const ASSET_MODULES = {
  cat: require('../src/assets/cat'),
  dog: require('../src/assets/dog')
};

/** Tarjetas `<article data-pose="...">` del preview, con su bloque HTML. */
function extractPoseCards(html) {
  const out = [];
  const re = /<article[^>]*data-pose="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ id: m[1], block: m[2] });
  }
  return out;
}

/** Color de fondo (hex) de una regla CSS del preview. */
function cssBackgroundOf(html, selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
  const m = re.exec(html);
  assert.ok(m, `el preview no define la regla CSS "${selector}"`);
  const hex = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/.exec(m[1]);
  assert.ok(hex, `la regla "${selector}" no declara un fondo hexadecimal`);
  return hex[1];
}

/** Luminancia relativa (WCAG) de un color hex. */
function relativeLuminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const channels = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

test('preview de las 12 poses: la pagina declara una tarjeta por pose de produccion', () => {
  assert.ok(fs.existsSync(PREVIEW_HTML_PATH),
    'falta test/preview/pet-poses-preview.html (pagina de preview de las 12 poses)');
  const html = fs.readFileSync(PREVIEW_HTML_PATH, 'utf8');

  const cards = extractPoseCards(html);
  assert.equal(cards.length, 12,
    `el preview deberia tener 12 tarjetas, tiene ${cards.length}`);
  assert.deepEqual(cards.map(c => c.id), PREVIEW_POSES.map(p => p.id),
    'las tarjetas del preview no son las 12 poses de produccion en orden');

  for (const pose of PREVIEW_POSES) {
    const card = cards.find(c => c.id === pose.id);
    assert.ok(card, `falta la tarjeta ${pose.id}`);
    assert.match(html, new RegExp(`data-species="${pose.species}"`),
      `${pose.id}: falta el atributo data-species`);
    assert.match(html, new RegExp(`data-state="${pose.state}"`),
      `${pose.id}: falta el atributo data-state`);
    assert.match(card.block, new RegExp(`${pose.label}\\s*(?:·|&middot;)\\s*${pose.stateLabel}`),
      `${pose.id}: falta la etiqueta visible "${pose.label} · ${pose.stateLabel}"`);
  }
});

test('preview de las 12 poses: cada pose se muestra sobre fondo claro y fondo oscuro', () => {
  const html = fs.readFileSync(PREVIEW_HTML_PATH, 'utf8');
  const cards = extractPoseCards(html);
  assert.equal(cards.length, 12, 'el preview deberia tener 12 tarjetas');

  for (const card of cards) {
    assert.match(card.block, /data-bg="light"/, `${card.id}: falta el tile de fondo claro`);
    assert.match(card.block, /data-bg="dark"/, `${card.id}: falta el tile de fondo oscuro`);
    assert.match(card.block, /Fondo claro/, `${card.id}: falta el texto "Fondo claro"`);
    assert.match(card.block, /Fondo oscuro/, `${card.id}: falta el texto "Fondo oscuro"`);
  }

  const light = relativeLuminance(cssBackgroundOf(html, '.pose-tile-light'));
  const dark = relativeLuminance(cssBackgroundOf(html, '.pose-tile-dark'));
  assert.ok(light > 0.5, `el fondo claro es demasiado oscuro (luminancia ${light.toFixed(3)})`);
  assert.ok(dark < 0.2, `el fondo oscuro es demasiado claro (luminancia ${dark.toFixed(3)})`);
});

test('preview de las 12 poses: la pagina dibuja el SVG de produccion (no copia el arte)', () => {
  const html = fs.readFileSync(PREVIEW_HTML_PATH, 'utf8');

  assert.match(html, /src="\.\.\/\.\.\/src\/assets\/cat\.js"/,
    'el preview debe cargar src/assets/cat.js');
  assert.match(html, /src="\.\.\/\.\.\/src\/assets\/dog\.js"/,
    'el preview debe cargar src/assets/dog.js');
  assert.doesNotMatch(html, /<svg/i,
    'el preview no debe llevar SVG embebido: se dibuja desde los assets de produccion');

  for (const pose of PREVIEW_POSES) {
    assert.match(html, new RegExp(`['"]${pose.global}['"]`),
      `el preview no referencia el export ${pose.global}`);
    const mod = ASSET_MODULES[pose.species];
    assert.equal(typeof mod[pose.global], 'string',
      `src/assets/${pose.species}.js ya no exporta ${pose.global}`);
  }
});

test('capture de las 12 poses: el script python lista las 12 poses y escribe en docs/pet-screenshots', () => {
  assert.ok(fs.existsSync(CAPTURE_PY_PATH),
    'falta test/preview/pet-poses-capture.py (capturas PNG por pose)');
  const py = fs.readFileSync(CAPTURE_PY_PATH, 'utf8');

  assert.match(py, /pet-screenshots/,
    'el script debe guardar las capturas en docs/pet-screenshots/');
  assert.match(py, /pet-poses-preview\.html/,
    'el script debe capturar desde test/preview/pet-poses-preview.html');
  for (const pose of PREVIEW_POSES) {
    assert.match(py, new RegExp(`['"]${pose.id}['"]`),
      `el script no menciona la pose ${pose.id}`);
  }
});

test('capturas: existe un PNG por pose en docs/pet-screenshots', () => {
  assert.ok(fs.existsSync(SHOTS_DIR),
    'falta el directorio docs/pet-screenshots/');
  for (const pose of PREVIEW_POSES) {
    const file = path.join(SHOTS_DIR, `${pose.id}.png`);
    assert.ok(fs.existsSync(file), `falta la captura docs/pet-screenshots/${pose.id}.png`);
    const buf = fs.readFileSync(file);
    assert.ok(buf.length > 1000, `${pose.id}.png esta vacia (${buf.length} bytes)`);
    assert.equal(buf.subarray(1, 4).toString('ascii'), 'PNG',
      `${pose.id}.png no es un PNG valido`);
  }
});

test('README de capturas: indexa las 12 capturas y documenta el comando para regenerarlas', () => {
  assert.ok(fs.existsSync(SHOTS_README_PATH),
    'falta docs/pet-screenshots/README.md (indice de capturas)');
  const md = fs.readFileSync(SHOTS_README_PATH, 'utf8');

  for (const pose of PREVIEW_POSES) {
    assert.ok(md.includes(`${pose.id}.png`),
      `el README no indexa la captura ${pose.id}.png`);
  }
  assert.match(md, /python\s+test\/preview\/pet-poses-capture\.py/,
    'el README debe documentar el comando para regenerar las capturas');
});

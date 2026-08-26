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

test('cat idle SVG: anchors de pupila en el centro de cada ojo (74,74) y (110,74)', () => {
  const anchors = extractPupilAnchors(catIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 74, y: 74 });
  assert.deepEqual(anchors[1], { x: 110, y: 74 });
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

test('dog idle SVG: anchors en (80, 70) y (120, 70)', () => {
  const anchors = extractPupilAnchors(dogIdleSVG);
  assert.equal(anchors.length, 2);
  assert.deepEqual(anchors[0], { x: 80, y: 70 });
  assert.deepEqual(anchors[1], { x: 120, y: 70 });
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

const fs = require('fs');
const path = require('path');
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

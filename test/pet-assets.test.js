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
  catIdleSVG, catWalkSVG, catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG, catSleepSVG
} = require('../src/assets/cat');
const {
  dogIdleSVG, dogWalkSVG, dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG, dogSleepSVG
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

// --- Walk cycle: el CSS debe tener animaciones que apunten a las 4 patas ---
// Guard contra cambios accidentales en dashboard.css que desconecten la
// animacion sideWalkSwingLeft/Right de las patas del SVG. Sin este CSS, las
// patas tienen las clases correctas pero no se mueven.

const fs = require('fs');
const path = require('path');
const CSS_PATH = path.join(__dirname, '..', 'src', 'styles', 'dashboard.css');

test('dashboard.css: reglas .cat-walk + .dog-walk para las 4 patas (animation + transform-origin)', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
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
    assert.ok(css.includes(sel), `dashboard.css missing selector: ${sel}`);
  }
  // Sanity: las 8 reglas deben apuntar a una animacion sideWalkSwing*
  const matches = css.match(/animation:\s*sideWalkSwing(Left|Right)\s+0\.\d+s/g) || [];
  assert.ok(matches.length >= 8, `expected >=8 sideWalkSwing animation refs, got ${matches.length}`);
});

test('dashboard.css: transform-origin de las patas apunta a la cadera real del nuevo SVG', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  // Cat: cadera (top of leg) y=132 para back, y=132 para front (nuevo SVG)
  // Dog: cadera y=134 (nuevo SVG)
  // Si alguien restaura los origins viejos (121/131/76/86 px, y=115), las patas
  // rotan alrededor del cuerpo y se ven "despegadas".
  const badOrigins = [
    'transform-origin: 121px 115px',
    'transform-origin: 131px 115px',
    'transform-origin: 76px 115px',
    'transform-origin: 86px 115px'
  ];
  for (const bad of badOrigins) {
    assert.ok(!css.includes(bad), `dashboard.css still has OLD transform-origin: ${bad}`);
  }
});

// --- Walk v2: amplitud del leg swing mas pronunciada para look "natural" ---
// v2.3.0 walk enhancement: HOSNE pidio walk mas natural. La amplitud original
// (-22deg a +18deg) era muy sutil. La nueva amplitud (-28deg a +24deg, 52deg
// total) es visible sin ser caricaturesca. Si alguien reduce la amplitud de
// vuelta, el test falla.

/**
 * Extract the @keyframes block for a given name, handling nested braces.
 * Returns the body between the opening { and the matching closing }.
 */
function extractKeyframeBody(css, name) {
  const idx = css.indexOf('@keyframes ' + name);
  if (idx === -1) return null;
  const braceStart = css.indexOf('{', idx);
  if (braceStart === -1) return null;
  // Walk forward counting braces to find the matching close
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

test('dashboard.css: leg swing amplitude es >= 50deg (walk v2 enhancement)', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  for (const name of ['sideWalkSwingLeft', 'sideWalkSwingRight']) {
    const body = extractKeyframeBody(css, name);
    assert.ok(body !== null, `${name} keyframe block not found`);
    const start = findRotateAtStop(body, '0%, 100%');
    const mid = findRotateAtStop(body, '50%');
    assert.ok(start !== null, `${name} 0%/100% stop not found`);
    assert.ok(mid !== null, `${name} 50% stop not found`);
    const range = Math.abs(start - mid);
    assert.ok(range >= 50,
      `${name} swing range too small: ${range}deg (expected >= 50deg)`);
  }
});

// --- Walk v2: body bob mas pronunciado ---
test('dashboard.css: body bob translateY es >= 5px (walk v2 enhancement)', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  for (const name of ['catBodyWalk', 'dogBodyWalk']) {
    const body = extractKeyframeBody(css, name);
    assert.ok(body !== null, `${name} keyframe block not found`);
    // Find ALL translateY values across all stops
    const tyValues = [];
    const tyRe = /translateY\(([-\d.]+)(?:px)?\)/g;
    let mm;
    while ((mm = tyRe.exec(body)) !== null) {
      tyValues.push(Math.abs(parseFloat(mm[1])));
    }
    assert.ok(tyValues.length > 0, `${name} has no translateY in any keyframe`);
    const maxTy = Math.max(...tyValues);
    assert.ok(maxTy >= 5,
      `${name} body bob translateY too small: max=${maxTy}px (expected >= 5px)`);
  }
});

// --- Walk v2: tail sway amplitud visible ---
test('dashboard.css: tail sway amplitude es >= 30deg (walk v2 enhancement)', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const body = extractKeyframeBody(css, 'catTailWalk');
  assert.ok(body !== null, 'catTailWalk keyframe block not found');
  const start = findRotateAtStop(body, '0%, 100%');
  const mid = findRotateAtStop(body, '50%');
  assert.ok(start !== null, 'catTailWalk 0%/100% stop not found');
  assert.ok(mid !== null, 'catTailWalk 50% stop not found');
  const range = Math.abs(start - mid);
  assert.ok(range >= 30,
    `cat tail sway range too small: ${range}deg (expected >= 30deg)`);
});

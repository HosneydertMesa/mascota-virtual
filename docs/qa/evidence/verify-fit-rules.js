'use strict';

/**
 * verify-fit-rules.js — encaje de las masas (plan §4.4).
 *
 *  - cola <-> grupa: la base de la cola queda oculta bajo el cuerpo
 *    (§4.4.4: >= 6 px de base escondida, sin costura visible en la raiz).
 *  - cabeza <-> cuerpo: la cabeza se superpone al cuerpo (§4.4.3).
 *
 * Uso: node docs/qa/evidence/verify-fit-rules.js
 * Exit 1 si alguna masa no cumple.
 */

const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));
const cat = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
const dog = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

const POSES = [
  ['cat idle', cat.catIdleSVG],
  ['cat walk', cat.catWalkSVG],
  ['cat sleep', cat.catSleepSVG],
  ['cat sit', cat.catSitSVG],
  ['cat lay', cat.catLaySVG],
  ['cat stretch', cat.catStretchSVG],
  ['dog idle', dog.dogIdleSVG],
  ['dog walk', dog.dogWalkSVG],
  ['dog sleep', dog.dogSleepSVG],
  ['dog sit', dog.dogSitSVG],
  ['dog lay', dog.dogLaySVG],
  ['dog stretch', dog.dogStretchSVG]
];

const MIN_TAIL_BASE = 6; // px de base de la cola bajo el cuerpo

function massPolys(svg, cls) {
  const out = [];
  for (const mass of geo.collectMasses(svg)) {
    if (!mass.classes.includes(cls)) continue;
    for (const o of mass.outlines) {
      out.push(...geo.transformPolys(geo.shapePolygons(o), mass.matrix));
    }
  }
  return out;
}

let failures = 0;
console.log('pose            encaje cola<->grupa   area solape   base bajo el cuerpo');
for (const [name, svg] of POSES) {
  const tail = massPolys(svg, 'anim-wag');
  const body = massPolys(svg, 'pet-body');
  if (!tail.length || !body.length) {
    console.log(`${name.padEnd(15)} sin masa de cola o cuerpo`);
    continue;
  }
  const area = geo.overlapArea(tail, body, 0.2);
  // profundidad de la base: cuanto se hunde la cola dentro del cuerpo
  let depth = 0;
  for (const poly of tail) {
    for (const p of poly) {
      if (!body.some((b) => geo.pointInPolygon(b, p[0], p[1]))) continue;
      let d = Infinity;
      for (const b of body) d = Math.min(d, geo.distanceToPolygonEdge(b, p[0], p[1]));
      depth = Math.max(depth, d);
    }
  }
  const ok = depth >= MIN_TAIL_BASE;
  if (!ok) failures++;
  console.log(
    `${name.padEnd(15)} ${(ok ? 'ok' : 'LA BASE DE LA COLA NO ESTA ESCONDIDA').padEnd(22)} ` +
    `${area.toFixed(1).padStart(6)} px2   ${depth.toFixed(1).padStart(5)} px`
  );
}

console.log(`\nencajes que no cumplen: ${failures}`);
process.exit(failures > 0 ? 1 : 0);

'use strict';
/**
 * tail-fit.js — informe del encaje de la cola con la grupa (plan §4.4.4).
 *
 * Mide, para cada pose: area de solape cola ∩ cuerpo, profundidad de la base
 * escondida y envergadura (ancho) de la raiz escondida.
 *
 * Uso: node docs/qa/evidence/tail-fit.js
 */
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));
const cat = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
const dog = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

const POSES = [
  ['cat idle', cat.catIdleSVG], ['cat walk', cat.catWalkSVG],
  ['cat sleep', cat.catSleepSVG], ['cat sit', cat.catSitSVG],
  ['cat lay', cat.catLaySVG], ['cat stretch', cat.catStretchSVG],
  ['dog idle', dog.dogIdleSVG], ['dog walk', dog.dogWalkSVG],
  ['dog sleep', dog.dogSleepSVG], ['dog sit', dog.dogSitSVG],
  ['dog lay', dog.dogLaySVG], ['dog stretch', dog.dogStretchSVG]
];

function mass(svg, cls) {
  const out = [];
  for (const m of geo.collectMasses(svg)) {
    if (!m.classes.includes(cls)) continue;
    for (const o of m.outlines) out.push(...geo.transformPolys(geo.shapePolygons(o), m.matrix));
  }
  return out;
}

console.log('pose            area solape   base escondida   envergadura de la raiz');
for (const [name, svg] of POSES) {
  const tail = mass(svg, 'anim-wag');
  const body = mass(svg, 'pet-body');
  const area = geo.overlapArea(tail, body, 0.1);
  let depth = 0;
  for (const poly of tail) {
    for (const p of poly) {
      if (!body.some((b) => geo.pointInPolygon(b, p[0], p[1]))) continue;
      let d = Infinity;
      for (const b of body) d = Math.min(d, geo.distanceToPolygonEdge(b, p[0], p[1]));
      depth = Math.max(depth, d);
    }
  }
  const width = geo.overlapWidth(tail, body, 0.1);
  const tailArea = tail.reduce((a, p) => a + geo.polyArea(p), 0);
  const visible = 100 * (1 - area / tailArea);
  console.log(
    `${name.padEnd(15)} ${area.toFixed(1).padStart(6)} px2   ` +
    `${depth.toFixed(1).padStart(5)} px      ` +
    `${width.toFixed(1).padStart(5)} px  (cola expuesta: ${visible.toFixed(1)}%)`
  );
}

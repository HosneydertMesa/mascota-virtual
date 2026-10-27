'use strict';
/** root-thickness.js — envergadura de la raiz de la cola (cola ∩ cuerpo). */
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

for (const [name, svg] of POSES) {
  const t = mass(svg, 'anim-wag');
  const b = mass(svg, 'pet-body');
  let depth = 0;
  for (const poly of t) {
    for (const p of poly) {
      if (!b.some((x) => geo.pointInPolygon(x, p[0], p[1]))) continue;
      let d = Infinity;
      for (const x of b) d = Math.min(d, geo.distanceToPolygonEdge(x, p[0], p[1]));
      depth = Math.max(depth, d);
    }
  }
  const th = geo.overlapWidth(t, b, 0.1);
  console.log(`${name.padEnd(14)} depth=${depth.toFixed(1).padStart(5)}  envergadura=${th.toFixed(1).padStart(5)} px`);
}

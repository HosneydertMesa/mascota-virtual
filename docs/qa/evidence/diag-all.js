'use strict';
// Diagnostico: reporta TODOS los fallos (no solo el primero) de los
// guards de contencion de sombra, silueta unica y encaje de cola.
const path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const celGeo = require(path.join(ROOT, 'test', 'helpers', 'cel-geometry'));
const cat = require(path.join(ROOT, 'src', 'assets', 'cat.js'));
const dog = require(path.join(ROOT, 'src', 'assets', 'dog.js'));

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

let failures = 0;
console.log('== contencion de sombra (tolerancia 0.7 px) ==');
for (const [name, svg] of POSES) {
  for (const m of celGeo.measureShadows(svg)) {
    const bad = m.maxOutside > 0.7;
    const dirBad = m.dx < 0 && m.dy < 0 && Math.abs(m.dx) + Math.abs(m.dy) > 6;
    if (bad || dirBad) {
      failures++;
      console.log(
        `  ${name.padEnd(12)} ${m.mass.padEnd(22)} outside=${m.maxOutside.toFixed(2)} ` +
        `dx=${m.dx.toFixed(2)} dy=${m.dy.toFixed(2)} ${bad ? 'FUERA' : ''} ${dirBad ? 'ARRIBA-IZQ' : ''}`
      );
    }
  }
}

console.log('== silueta unica ==');
for (const [name, svg] of POSES) {
  const res = celGeo.silhouetteComponents(svg, { scale: 4, dilate: 1.7 });
  if (res.components !== 1) {
    failures++;
    console.log(`  ${name.padEnd(12)} componentes=${res.components}`);
  }
}

console.log('== base de cola escondida (>= 6 px, >= 20 px2 y >= 3%) ==');
for (const [name, svg] of POSES) {
  const tail = massOutlinePolys(svg, 'anim-wag');
  const body = massOutlinePolys(svg, 'pet-body');
  let depth = 0;
  for (const poly of tail) {
    for (const p of poly) {
      if (!body.some((b) => celGeo.pointInPolygon(b, p[0], p[1]))) continue;
      let d = Infinity;
      for (const b of body) d = Math.min(d, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
      depth = Math.max(depth, d);
    }
  }
  const tailArea = tail.reduce((a, p) => a + celGeo.polyArea(p), 0);
  const overlap = celGeo.overlapArea(tail, body, 0.2);
  const minOverlap = Math.max(20, tailArea * 0.03);
  if (depth < 6 || overlap < minOverlap) {
    failures++;
    console.log(
      `  ${name.padEnd(12)} depth=${depth.toFixed(2)} overlap=${overlap.toFixed(1)} ` +
      `minOverlap=${minOverlap.toFixed(1)} tailArea=${tailArea.toFixed(0)}`
    );
  }
}

console.log(failures === 0 ? 'TODO EN VERDE' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);

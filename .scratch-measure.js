// Medida de la profundidad del encaje cabeza <-> cuerpo (plan 4.4.3).
const path = require('path');
const celGeo = require(path.join(__dirname, 'test/helpers/cel-geometry.js'));
const cat = require(path.join(__dirname, 'src/assets/cat.js'));
const dog = require(path.join(__dirname, 'src/assets/dog.js'));

const POSES = [
  ['cat-idle', cat.catIdleSVG], ['cat-walk', cat.catWalkSVG], ['cat-sleep', cat.catSleepSVG],
  ['cat-sit', cat.catSitSVG], ['cat-lay', cat.catLaySVG], ['cat-stretch', cat.catStretchSVG],
  ['dog-idle', dog.dogIdleSVG], ['dog-walk', dog.dogWalkSVG], ['dog-sleep', dog.dogSleepSVG],
  ['dog-sit', dog.dogSitSVG], ['dog-lay', dog.dogLaySVG], ['dog-stretch', dog.dogStretchSVG]
];

function polys(svg, cls) {
  const out = [];
  for (const mass of celGeo.collectMasses(svg)) {
    if (!mass.classes.includes(cls)) continue;
    for (const outline of mass.outlines) {
      out.push(...celGeo.transformPolys(celGeo.shapePolygons(outline), mass.matrix));
    }
  }
  return out;
}

for (const [name, svg] of POSES) {
  const head = polys(svg, 'pet-head');
  const body = polys(svg, 'pet-body');
  let depth = 0;
  for (const poly of head) {
    for (const p of poly) {
      if (!body.some((b) => celGeo.pointInPolygon(b, p[0], p[1]))) continue;
      let d = Infinity;
      for (const b of body) d = Math.min(d, celGeo.distanceToPolygonEdge(b, p[0], p[1]));
      depth = Math.max(depth, d);
    }
  }
  const width = celGeo.overlapWidth(head, body, 0.1);
  console.log(`${name.padEnd(13)} depth=${depth.toFixed(2).padStart(6)}  width=${width.toFixed(2).padStart(6)}`);
}

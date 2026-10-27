'use strict';

/**
 * check-path.js — utilidades de diagnostico para una forma del arte:
 * area, bbox, intersecciones consigo misma y solape con otra forma.
 *
 * Uso: node docs/qa/evidence/check-path.js <pose> <indice-de-forma>
 *   pose: cat-idle | cat-walk | ... | dog-stretch
 */

const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));
const cat = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
const dog = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

const POSES = {
  'cat-idle': cat.catIdleSVG,
  'cat-walk': cat.catWalkSVG,
  'cat-sleep': cat.catSleepSVG,
  'cat-sit': cat.catSitSVG,
  'cat-lay': cat.catLaySVG,
  'cat-stretch': cat.catStretchSVG,
  'dog-idle': dog.dogIdleSVG,
  'dog-walk': dog.dogWalkSVG,
  'dog-sleep': dog.dogSleepSVG,
  'dog-sit': dog.dogSitSVG,
  'dog-lay': dog.dogLaySVG,
  'dog-stretch': dog.dogStretchSVG
};

/** intersecciones entre aristas no adyacentes de un poligono */
function selfIntersections(poly) {
  const hits = [];
  const n = poly.length;
  const seg = (i) => [poly[i], poly[(i + 1) % n]];
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const inter = (p1, p2, p3, p4) => {
    const d1 = cross(p3, p4, p1);
    const d2 = cross(p3, p4, p2);
    const d3 = cross(p1, p2, p3);
    const d4 = cross(p1, p2, p4);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const [a1, a2] = seg(i);
      const [b1, b2] = seg(j);
      if (inter(a1, a2, b1, b2)) hits.push([a1, b1]);
    }
  }
  return hits;
}

const pose = process.argv[2];
const index = Number(process.argv[3] || 0);
const svg = POSES[pose];
if (!svg) {
  console.error('pose desconocida');
  process.exit(2);
}
const shapes = geo.collectFilledShapes(svg);
for (let i = 0; i < shapes.length; i++) {
  const s = shapes[i];
  const polys = geo.transformPolys(s.polys, s.matrix);
  const area = polys.reduce((a, p) => a + geo.polyArea(p), 0);
  const self = polys.flatMap((p) => selfIntersections(p));
  console.log(
    `#${i} ${s.classes.join(',') || '-'} fill=${s.el.attrs.fill || '-'} area=${area.toFixed(1)} ` +
    `bbox=${JSON.stringify(geo.polygonBBox(polys[0]))} auto=${self.length}`
  );
  if (self.length) console.log('   intersecciones en', JSON.stringify(self.slice(0, 4)));
  if (i === index) {
    console.log('   d =', s.el.attrs.d);
  }
}

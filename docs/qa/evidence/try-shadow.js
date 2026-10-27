'use strict';
/**
 * try-shadow.js — prueba un path candidato de `cel-shadow` contra la silueta
 * de su masa: cuanto se sale, en que direccion cae y si se autointersecta.
 *
 * Uso:
 *   node docs/qa/evidence/try-shadow.js <pose> <clase-masa> "<d candidato>"
 *   node docs/qa/evidence/try-shadow.js <pose> <clase-masa>            (sin candidato: informa del actual)
 *
 * pose: cat-idle | cat-walk | cat-sleep | cat-sit | cat-lay | cat-stretch
 *       dog-idle | dog-walk | dog-sleep | dog-sit | dog-lay | dog-stretch
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
    return (d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0);
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
const massClass = process.argv[3];
const candidate = process.argv[4];
if (!POSES[pose] || !massClass) {
  console.error('uso: try-shadow.js <pose> <clase-masa> ["<d>"]');
  process.exit(2);
}
const svg = POSES[pose];

// silueta de la masa (todas sus formas rellenas, no solo el cel-outline)
const masses = geo.collectMasses(svg);
const host = masses.filter((m) => m.classes.includes(massClass));
if (!host.length) {
  console.error(`no se encontro la masa .${massClass} en ${pose}`);
  process.exit(2);
}
const hostPolys = host.flatMap((m) =>
  m.outlines.flatMap((o) => geo.transformPolys(geo.shapePolygons(o), m.matrix))
);
const hostCentroid = geo.polygonCentroid(hostPolys[0]);
// matriz del grupo: el path candidato esta en el espacio local
const matrix = host[0].matrix;

function report(label, d) {
  const polys = geo.transformPolys(geo.parsePathData(d), matrix);
  if (!polys.length) {
    console.log(`${label}: path vacio`);
    return;
  }
  let maxOutside = 0;
  let worst = null;
  for (const poly of polys) {
    for (const pt of geo.sampleBoundary(poly, 0.25)) {
      const dd = geo.outsideDistance(hostPolys, pt[0], pt[1]);
      if (dd > maxOutside) {
        maxOutside = dd;
        worst = pt;
      }
    }
    for (const pt of geo.sampleInterior(poly, 0.5)) {
      const dd = geo.outsideDistance(hostPolys, pt[0], pt[1]);
      if (dd > maxOutside) {
        maxOutside = dd;
        worst = pt;
      }
    }
  }
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (const poly of polys) {
    const a = geo.polyArea(poly);
    const c = geo.polygonCentroid(poly);
    area += a;
    cx += c[0] * a;
    cy += c[1] * a;
  }
  const centroid = [cx / area, cy / area];
  const self = polys.flatMap((p) => selfIntersections(p));
  console.log(
    `${label}\n` +
    `   fuera de la silueta : ${maxOutside.toFixed(2)} px` +
    (worst ? ` (peor en ${worst[0].toFixed(1)},${worst[1].toFixed(1)})` : '') + '\n' +
    `   dx,dy del centroide : ${(centroid[0] - hostCentroid[0]).toFixed(2)}, ` +
    `${(centroid[1] - hostCentroid[1]).toFixed(2)}` + '\n' +
    `   area               : ${area.toFixed(1)} px2` + '\n' +
    `   autointersecciones : ${self.length}`
  );
}

if (candidate) {
  report('CANDIDATO', candidate);
} else {
  for (const m of host) {
    for (const s of m.shadows) {
      report(`SOMBRA ACTUAL (${m.classes.join(' ')})`, s.attrs.d);
    }
  }
}

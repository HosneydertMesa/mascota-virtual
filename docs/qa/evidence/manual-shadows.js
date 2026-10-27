'use strict';
/**
 * manual-shadows.js — rehace a mano los planos de sombra que la correccion
 * automatica no puede resolver (orejas, patas, iris, colas).
 *
 * Cada entrada es [bloque de pose, path actual, path nuevo]. El path nuevo se
 * verifica contra la silueta de su masa antes de escribirlo: si no cabe, la
 * herramienta avisa y no toca el arte.
 *
 * Uso: node docs/qa/evidence/manual-shadows.js [--write]
 */

const fs = require('fs');
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const WRITE = process.argv.includes('--write');
const ROOT = path.join(__dirname, '..', '..', '..');

// --- planos de sombra rehechos a mano -------------------------------------

const FIXES = {
  catSleepSVG: [
    [
      'M 36,88 C 44,91 54,88 62,80 C 58,87 46,93 38,91 Z',
      'M 36,88 C 44,91 54,88 62,80 C 56,84 46,87 36,88 Z'
    ],
    [
      'M 62,80 C 69.6,82.4 75,75.3 81.6,81.1 C 79.8,85.5 68.2,75.9 63.2,83.7 Z',
      'M 62,80 C 70,88 82,91 90,88 C 84,87 73,85 62,80 Z'
    ]
  ],
  catSitSVG: [
    [
      'M 78,160 C 79,165 83,168 88,168 C 92,168 95,167 97,164 C 96,167 93,169 88,169 C 83,169 79,166 78,160 Z',
      'M 78,160 C 79,165 83,168 88,168 C 92,168 95,167 97,164 C 94,165 91,165 87,165 C 83,165 80,163 78,160 Z'
    ],
    [
      'M 146,58 C 138,63 124,60 114,52 C 119,60 134,65 143,61 Z',
      'M 146,58 C 138,63 124,60 114,52 C 120,56 132,59 146,58 Z'
    ]
  ],
  catLaySVG: [
    [
      'M 30,100 C 38,104 50,102 60,94 C 55,101 40,106 32,103 Z',
      'M 30,100 C 38,104 50,102 60,94 C 52,98 40,100 30,100 Z'
    ],
    [
      'M 64,94 C 70,102 84,104 94,100 C 88,106 72,106 65,98 Z',
      'M 64,94 C 70,102 84,104 94,100 C 86,101 75,99 64,94 Z'
    ]
  ],
  catStretchSVG: [
    [
      'M 28,116 C 36,120 48,118 58,110 C 53,117 38,122 30,119 Z',
      'M 28,116 C 36,120 48,118 58,110 C 50,114 38,116 28,116 Z'
    ],
    [
      'M 58,110 C 63.3,109.3 69.6,102 79.4,107.5 C 76.3,112.8 62.7,103.1 58.9,113.4 Z',
      'M 58,110 C 64,118 78,120 88,116 C 80,117 69,115 58,110 Z'
    ]
  ],
  dogSleepSVG: [
    [
      'M 85,88 C 81,98 81,110 84,118 C 81,109 82,96 86,87 Z',
      'M 83,119 C 87,127 97,124 100,114 C 97,120 91,123 83,119 Z'
    ],
    [
      'M 30,142 C 34,147 43,146 47,141 C 49,138 49,134 48,131 C 49,137 45,143 38,144 C 34,145 31,144 31.9,143.3 Z',
      'M 30,142 C 34,147 43,146 47,141 C 50,137 48,131 46,130 C 45,135 41,140 34,142 C 32,142 31,142 30,142 Z'
    ]
  ],
  dogSitSVG: [
    [
      'M 143,50 C 140,60 144,77 147,87 C 144,77 141,58 144,49 Z',
      'M 149,92 C 155,99 164,93 165,82 C 163,90 156,95 149,92 Z'
    ]
  ],
  dogLaySVG: [
    [
      'M 42,95 C 46,105 47,116 45,125 C 48,115 47,102 42,94 Z',
      'M 23,120 C 24,131 34,136 40,130 C 36,132 28,128 23,120 Z'
    ],
    [
      'M 76,90 C 72,100 72,112 76,120 C 72,111 72,98 77,89 Z',
      'M 79,125 C 85,132 95,127 97,116 C 94,122 87,127 79,125 Z'
    ],
    // D6: la sombra de la cola cae abajo-derecha (luz desde arriba-izquierda)
    [
      'M 162,112 C 157,99 142,90 145,78 C 147,72 152,67 158,66 C 152,72 151,79 155,86 C 158,92 161,99 162,105 Z',
      'M 162,130 C 182,120 193,98 182,76 C 181,88 179,99 176,110 C 173,117 168,124 162,130 Z'
    ]
  ],
  dogStretchSVG: [
    [
      'M 38,109 C 42,119 43,130 41,139 C 44,129 43,116 38,108 Z',
      'M 19,134 C 20,145 30,150 36,144 C 32,146 25,141 19,134 Z'
    ],
    [
      'M 72,104 C 68,114 68,126 70,135 C 67,125 68,112 73,103 Z',
      'M 75,139 C 81,146 91,141 93,130 C 90,136 83,139 75,139 Z'
    ]
  ]
};

// --- siluetas rehechas a mano (colas) -------------------------------------

const OUTLINES = {
  // D7/D8: la base de la cola se esconde bajo la grupa
  dogSitSVG: [
    [
      'M 138,144 C 156,146 170,136 175,120 C 178,109 174,100 166,99 C 160,98 156,104 160,109 C 164,114 164,120 160,126 C 154,135 146,140 139,140 Z',
      'M 124,158 C 146,153 168,138 175,120 C 178,109 174,100 166,99 C 160,98 156,104 160,109 C 164,114 164,120 160,126 C 154,135 146,140 139,140 C 135,146 130,152 124,158 Z'
    ]
  ],
  dogLaySVG: [
    [
      'M 162,130 C 182,120 193,98 182,76 C 173,58 150,60 145,78 C 142,90 157,99 162,112 C 165,122 165,127 162,130 Z',
      'M 140,145 C 152,138 170,130 182,120 C 193,98 182,76 173,58 150,60 145,78 C 142,90 157,99 162,112 C 165,122 165,127 162,130 C 155,133 147,139 140,145 Z'
    ]
  ]
};

// --- utilidades ------------------------------------------------------------

function hostFor(shapes, shape) {
  const pts = [];
  for (const poly of geo.transformPolys(shape.polys, shape.matrix)) {
    for (const p of geo.sampleBoundary(poly, 0.5)) pts.push(p);
  }
  if (!pts.length) return null;
  let best = null;
  let bestArea = Infinity;
  let fallback = null;
  let fallbackCoverage = 0;
  for (const cand of shapes) {
    if (cand.isShadow || cand === shape) continue;
    if (cand.order >= shape.order) continue;
    if (!geo.chainPrefix(cand.chain, shape.chain)) continue;
    const candPolys = geo.transformPolys(cand.polys, cand.matrix);
    if (!candPolys.length) continue;
    let inside = 0;
    for (const p of pts) {
      if (candPolys.some((q) => geo.pointInPolygon(q, p[0], p[1]))) inside++;
    }
    const coverage = inside / pts.length;
    const a = candPolys.reduce((acc, p) => acc + Math.abs(geo.polygonArea(p)), 0);
    if (coverage > fallbackCoverage) {
      fallbackCoverage = coverage;
      fallback = candPolys;
    }
    if (coverage >= 0.98 && a < bestArea) {
      bestArea = a;
      best = candPolys;
    }
  }
  return best || fallback;
}

/**
 * Resuelve la forma que sombrea un `cel-shadow` en el espacio local del
 * grupo (la sombra y su anfitrion comparten la misma matriz).
 */
function hostLocal(shapes, shape) {
  let samplePts = [];
  for (const poly of shape.polys) {
    for (const p of geo.sampleInterior(poly, 0.4)) samplePts.push(p);
  }
  if (!samplePts.length) {
    for (const poly of shape.polys) {
      for (const p of geo.sampleBoundary(poly, 0.5)) samplePts.push(p);
    }
  }
  if (!samplePts.length) return null;
  let best = null;
  let bestArea = Infinity;
  let fallback = null;
  let fallbackCoverage = 0;
  for (const cand of shapes) {
    if (cand.isShadow || cand === shape) continue;
    if (cand.order >= shape.order) continue;
    if (!geo.chainPrefix(cand.chain, shape.chain)) continue;
    if (!cand.polys.length) continue;
    let inside = 0;
    for (const p of samplePts) {
      if (cand.polys.some((q) => geo.pointInPolygon(q, p[0], p[1]))) inside++;
    }
    const coverage = inside / samplePts.length;
    const area = cand.polys.reduce((acc, p) => acc + Math.abs(geo.polygonArea(p)), 0);
    if (coverage > fallbackCoverage) {
      fallbackCoverage = coverage;
      fallback = cand.polys;
    }
    if (coverage >= 0.98 && area < bestArea) {
      bestArea = area;
      best = cand.polys;
    }
  }
  return best || fallback;
}

function arcPath(cx, cy, rx, ry, inset, a1, a2) {
  const rx2 = rx - inset;
  const ry2 = ry - inset;
  const P = (deg) => {
    const t = (deg * Math.PI) / 180;
    return [cx + rx2 * Math.cos(t), cy + ry2 * Math.sin(t)];
  };
  const T = (deg, delta) => {
    const t = (deg * Math.PI) / 180;
    return [(-rx2 * Math.sin(t)) * delta, ry2 * Math.cos(t) * delta];
  };
  const steps = Math.max(1, Math.round(Math.abs(a2 - a1) / 30));
  const segs = [];
  const step = (a2 - a1) / steps;
  for (let i = 0; i < steps; i++) {
    const s1 = a1 + step * i;
    const s2 = a1 + step * (i + 1);
    const p0 = P(s1);
    const p3 = P(s2);
    const delta = (step * Math.PI) / 180;
    const k = (4 / 3) * Math.tan(delta / 4);
    const t0 = T(s1, delta);
    const t1 = T(s2, delta);
    segs.push({
      c1: [p0[0] + k * t0[0], p0[1] + k * t0[1]],
      c2: [p3[0] - k * t1[0], p3[1] - k * t1[1]],
      p: p3
    });
  }
  const r = (n) => Math.round(n * 10) / 10;
  let d = `M ${r(P(a1)[0])},${r(P(a1)[1])}`;
  for (const s of segs) {
    d += ` C ${r(s.c1[0])},${r(s.c1[1])} ${r(s.c2[0])},${r(s.c2[1])} ${r(s.p[0])},${r(s.p[1])}`;
  }
  d += ' Z';
  return d;
}

// --- aplicacion ------------------------------------------------------------

let problems = 0;
for (const file of ['cat.js', 'dog.js']) {
  const filePath = path.join(ROOT, 'src', 'assets', file);
  let src = fs.readFileSync(filePath, 'utf8');
  const blockRe = /const (\w+SVG) = `([\s\S]*?)`;(\r?\n)/g;
  const blocks = [];
  let m;
  while ((m = blockRe.exec(src))) blocks.push({ name: m[1], body: m[2] });

  for (const block of blocks) {
    // 1. iris: el plano de sombra pasa a ser un arco inferior del iris
    const irisRe =
      /(<ellipse class="cel-outline" cx="(\d+)" cy="(\d+)" rx="(\d+)" ry="(\d+)" fill="#[0-9A-F]{6}"[^>]*\/>\s*<path class="cel-shadow" d=")[^"]+(" fill=")/g;
    block.body = block.body.replace(irisRe, (all, pre, cx, cy, rx, ry, post) => {
      const d = arcPath(Number(cx), Number(cy), Number(rx), Number(ry), 1.4, 158, 22);
      return `${pre}${d}${post}`;
    });

    // 2. planos de sombra rehechos a mano
    for (const [oldD, newD] of FIXES[block.name] || []) {
      if (!block.body.includes(oldD)) {
        console.log(`  ! ${block.name}: no se encuentra\n     ${oldD}`);
        problems++;
        continue;
      }
      // verificacion: el plano nuevo tiene que caber en su silueta.
      // La comparacion se hace en el espacio local del grupo (la sombra y la
      // silueta comparten la misma matriz).
      const shapes = geo.collectFilledShapes(block.body);
      const shape = shapes.find((s) => s.isShadow && s.el.attrs.d === oldD);
      if (!shape) {
        console.log(`  ! ${block.name}: no se encuentra la sombra\n     ${oldD}`);
        problems++;
        continue;
      }
      const host = hostLocal(shapes, shape);
      const out = host ? geo.maxOutsideFor(geo.parsePathData(newD), host) : 0;
      if (out > 0.7) {
        console.log(
          `  ! ${block.name}: el plano nuevo se sale ${out.toFixed(2)} px\n     ${newD}`
        );
        problems++;
        continue;
      }
      block.body = block.body.replace(oldD, newD);
    }

    // 3. siluetas rehechas a mano (colas)
    for (const [oldD, newD] of OUTLINES[block.name] || []) {
      if (!block.body.includes(oldD)) {
        console.log(`  ! ${block.name}: no se encuentra la silueta\n     ${oldD}`);
        problems++;
        continue;
      }
      block.body = block.body.replace(oldD, newD);
    }
  }

  for (const block of blocks) {
    const re = new RegExp(`const ${block.name} = \`([\\s\\S]*?)\`;(\\r?\\n)`);
    const mm = re.exec(src);
    if (!mm) continue;
    src = src.replace(re, `const ${block.name} = \`${block.body}\`;${mm[2]}`);
  }
  if (WRITE) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`${file}: reescrito`);
  }
}
console.log(problems === 0 ? 'todo aplicado' : `problemas: ${problems}`);

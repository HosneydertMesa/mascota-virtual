'use strict';
/**
 * refit-shadow.js — mete los planos de sombra DENTRO de la silueta de su
 * masa sin encogerlos (plan §4.4.6 "Sombras contenidas").
 *
 * Idea: el plano de sombra de una masa es una banda que sigue el borde
 * iluminado de la silueta y vuelve por dentro. Al|authorarla, la "vuelta"
 * se dibuja por FUERA de la silueta (sobresale) o se aplana (se pierde el
 * plano de sombra). Aqui se corrige reflejando cada nodo que sobresale
 * respecto al borde de la silueta: la banda conserva su ancho original pero
 * pasa a caer dentro.
 *
 * Los nodos que ya estan dentro y a mas de MIN_INSET del borde no se tocan:
 * la forma del plano se respeta.
 *
 * Uso:
 *   node docs/qa/evidence/refit-shadow.js            (dry-run: informa)
 *   node docs/qa/evidence/refit-shadow.js --write    (reescribe el arte)
 */

const fs = require('fs');
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const WRITE = process.argv.includes('--write');
const MIN_INSET = 0.9; // px: separacion minima entre el plano y el borde
const TARGET = 0.25; // px: desborde que dispara el ajuste
const STEPS = 32; // muestras por curva
const ROOT = path.join(__dirname, '..', '..', '..');

// ------------------------------------------------------------------ path I/O

function parseStructured(d) {
  const tokens = String(d).match(/[MLCZmlcz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  const start = [0, 0];
  const segs = [];
  let cursor = [0, 0];
  let cmd = null;
  let first = true;
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'm': {
        const x = num();
        const y = num();
        cursor = cmd === 'M' ? [x, y] : [cursor[0] + x, cursor[1] + y];
        if (first) {
          start[0] = cursor[0];
          start[1] = cursor[1];
          first = false;
        }
        cmd = cmd === 'M' ? 'L' : 'l';
        break;
      }
      case 'L':
      case 'l': {
        const x = num();
        const y = num();
        const p = cmd === 'L' ? [x, y] : [cursor[0] + x, cursor[1] + y];
        segs.push({ type: 'L', p });
        cursor = p;
        break;
      }
      case 'C':
      case 'c': {
        const rel = cmd === 'c';
        const abs = (q) => (rel ? [cursor[0] + q[0], cursor[1] + q[1]] : [q[0], q[1]]);
        const c1 = abs([num(), num()]);
        const c2 = abs([num(), num()]);
        const p = abs([num(), num()]);
        segs.push({ type: 'C', c1, c2, p });
        cursor = p;
        break;
      }
      case 'Z':
      case 'z': {
        cmd = null;
        cursor = [start[0], start[1]];
        break;
      }
      default:
        i++;
        break;
    }
  }
  return { start, segs };
}

function fmt(n) {
  return String(Math.round(n * 10) / 10);
}

function serialize(pd) {
  const parts = [`M ${fmt(pd.start[0])},${fmt(pd.start[1])}`];
  for (const s of pd.segs) {
    if (s.type === 'C') {
      parts.push(
        `C ${fmt(s.c1[0])},${fmt(s.c1[1])} ${fmt(s.c2[0])},${fmt(s.c2[1])} ${fmt(s.p[0])},${fmt(s.p[1])}`
      );
    } else {
      parts.push(`L ${fmt(s.p[0])},${fmt(s.p[1])}`);
    }
  }
  parts.push('Z');
  return parts.join(' ');
}

function cubicAt(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
  ];
}

// ------------------------------------------------------------------- nodos

function nodeKey(segIdx, which) {
  if (which === 0) return segIdx === 0 ? 'start' : `p${segIdx - 1}`;
  if (which === 1) return `c1_${segIdx}`;
  if (which === 2) return `c2_${segIdx}`;
  return `p${segIdx}`;
}

function getNode(pd, key) {
  if (key === 'start') return pd.start;
  const m = /^(c1|c2|p)_?(\d+)$/.exec(key);
  const seg = pd.segs[Number(m[2])];
  if (m[1] === 'c1') return seg.c1;
  if (m[1] === 'c2') return seg.c2;
  return seg.p;
}

function setNode(pd, key, val) {
  if (key === 'start') {
    pd.start = val;
    return;
  }
  const m = /^(c1|c2|p)_?(\d+)$/.exec(key);
  const seg = pd.segs[Number(m[2])];
  if (m[1] === 'c1') seg.c1 = val;
  else if (m[1] === 'c2') seg.c2 = val;
  else seg.p = val;
}

/** Nodo reflejado o empujado hacia dentro de la silueta. */
function pullInside(P, host) {
  const info = geo.nearestBoundaryInfo(host, P[0], P[1]);
  if (info.inside) {
    if (info.dist >= MIN_INSET) return P;
    return [
      P[0] + info.normal[0] * (MIN_INSET - info.dist),
      P[1] + info.normal[1] * (MIN_INSET - info.dist)
    ];
  }
  if (info.dist > 10) return P; // salto demasiado grande: no se toca
  // reflejo: se cruza el borde y se aterriza al mismo lado, con la misma
  // distancia: la banda conserva su ancho y pasa a caer dentro
  return [
    info.point[0] + info.normal[0] * info.dist,
    info.point[1] + info.normal[1] * info.dist
  ];
}

/** Pesos de Bernstein de una cubica en t. */
function bernstein(t) {
  const u = 1 - t;
  return [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
}

/**
 * Empuja el segmento `segIdx` de la curva hacia dentro de la silueta,
 * repartiendo el desplazamiento entre sus 4 nodos (la curva se desplaza
 * exactamente `delta` en el punto de peor desborde).
 */
function pushSegmentInside(pd, segIdx, host) {
  const seg = pd.segs[segIdx];
  if (!seg || seg.type !== 'C') return false;
  const prev = segIdx === 0 ? pd.start : pd.segs[segIdx - 1].p;
  for (let pass = 0; pass < 40; pass++) {
    let worst = null;
    for (let k = 0; k <= STEPS; k++) {
      const t = k / STEPS;
      const p = cubicAt(prev, seg.c1, seg.c2, seg.p, t);
      const d = geo.outsideDistance(host, p[0], p[1]);
      if (d > 0.12 && (!worst || d > worst.d)) worst = { x: p[0], y: p[1], d, t };
    }
    if (!worst) return true;
    const info = geo.nearestBoundaryInfo(host, worst.x, worst.y);
    // direccion: hacia el borde mas cercano y un poco mas alla (hacia dentro)
    let dx = info.point[0] - worst.x;
    let dy = info.point[1] - worst.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) {
      dx = info.normal[0];
      dy = info.normal[1];
    } else {
      dx /= len;
      dy /= len;
    }
    const step = Math.min(worst.d, 1.0) * 0.9 + 0.25;
    const b = bernstein(worst.t);
    // el nodo inicial del segmento no se mueve (ahí la banda se une al
    // borde): el desplazamiento se reparte entre los otros tres.
    const wsum = b[1] + b[2] + b[3];
    if (wsum < 1e-6) return false;
    const nodes = [
      { key: `c1_${segIdx}`, get: () => seg.c1 },
      { key: `c2_${segIdx}`, get: () => seg.c2 },
      { key: `p${segIdx}`, get: () => seg.p }
    ];
    for (let i = 0; i < 3; i++) {
      const w = b[i + 1] / wsum;
      const P = nodes[i].get();
      setNode(pd, nodes[i].key, [P[0] + dx * step * w, P[1] + dy * step * w]);
    }
  }
  return false;
}

// ------------------------------------------------------------------ refit

function refit(d, host) {
  const pd = parseStructured(d);
  if (!pd.segs.length) return null;

  // 1. que segmentos se salen de la silueta
  const bulge = new Array(pd.segs.length).fill(false);
  let cursor = pd.start;
  pd.segs.forEach((seg, idx) => {
    let worst = 0;
    if (seg.type === 'C') {
      for (let k = 0; k <= STEPS; k++) {
        const p = cubicAt(cursor, seg.c1, seg.c2, seg.p, k / STEPS);
        worst = Math.max(worst, geo.outsideDistance(host, p[0], p[1]));
      }
    } else {
      worst = geo.outsideDistance(host, seg.p[0], seg.p[1]);
    }
    if (worst > TARGET) bulge[idx] = true;
    cursor = seg.p;
  });
  if (!bulge.some(Boolean)) return null;

  // 2. mover los nodos de esos segmentos
  const out = { start: pd.start.slice(), segs: pd.segs.map((s) => Object.assign({}, s)) };
  const startInfo = geo.nearestBoundaryInfo(host, pd.start[0], pd.start[1]);
  const startOnEdge = startInfo.dist <= 0.6;

  const touched = new Set();
  pd.segs.forEach((seg, idx) => {
    if (!bulge[idx]) return;
    // el nodo inicial del segmento se deja: es el punto donde la banda se
    // une al borde de la silueta (moverlo abriria un hueco).
    for (let which = 1; which < 4; which++) {
      if (seg.type !== 'C' && which > 0) break;
      const key = nodeKey(idx, which);
      if (touched.has(key)) continue;
      touched.add(key);
      const P = getNode(out, key);
      const moved = pullInside(P, host);
      setNode(out, key, moved);
    }
  });

  // 3. Empujar los segmentos que todavia sobresalen (la reflexion mueve los
  //    nodos pero la curva puede seguir saliendo; aqui se corrige).
  for (let round = 0; round < 6; round++) {
    let changed = false;
    for (let idx = 0; idx < out.segs.length; idx++) {
      if (!bulge[idx]) continue;
      if (pushSegmentInside(out, idx, host)) continue;
      changed = true;
    }
    if (!changed) break;
  }

  // el ultimo nodo cierra el plano: si el punto inicial esta en el borde y
  // el ultimo nodo esta fuera, se pega al inicial (la banda se afila).
  const lastIdx = pd.segs.length - 1;
  const lastKey = `p${lastIdx}`;
  const lastP = getNode(out, lastKey);
  const lastInfo = geo.nearestBoundaryInfo(host, lastP[0], lastP[1]);
  if ((!lastInfo.inside || lastInfo.dist < MIN_INSET) && startOnEdge) {
    const dist = Math.hypot(lastP[0] - pd.start[0], lastP[1] - pd.start[1]);
    if (dist < 5) setNode(out, lastKey, pd.start.slice());
  }

  const result = serialize(out);
  const maxOut = geo.maxOutsideFor(geo.parsePathData(result), host);
  return { d: result, maxOut };
}

/** Escala el path alrededor de un centro hasta que entra en la silueta. */
function shrinkInto(d, host, center) {
  const sc = (p) => [center[0] + (p[0] - center[0]) * s, center[1] + (p[1] - center[1]) * s];
  let s = 1;
  let best = null;
  for (let i = 0; i < 30; i++) {
    const next = s * 0.94;
    const pd = parseStructured(d);
    const scaled = {
      start: sc(pd.start),
      segs: pd.segs.map((seg) =>
        seg.type === 'C'
          ? { type: 'C', c1: sc(seg.c1), c2: sc(seg.c2), p: sc(seg.p) }
          : { type: 'L', p: sc(seg.p) }
      )
    };
    const out = serialize(scaled);
    const m = geo.maxOutsideFor(geo.parsePathData(out), host);
    if (m <= TARGET) {
      best = out;
      s = next;
      if (s < 0.5) break;
    } else {
      break;
    }
  }
  return best;
}

// ------------------------------------------------------------------- main

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

function areaOf(d) {
  return geo.parsePathData(d).reduce((a, p) => a + geo.polyArea(p), 0);
}

/** Redondea el path a coordenadas enteras (el arte usa enteros). */
function roundPath(d) {
  const pd = parseStructured(d);
  const r = (n) => Math.round(n);
  const out = {
    start: [r(pd.start[0]), r(pd.start[1])],
    segs: pd.segs.map((seg) =>
      seg.type === 'C'
        ? {
            type: 'C',
            c1: [r(seg.c1[0]), r(seg.c1[1])],
            c2: [r(seg.c2[0]), r(seg.c2[1])],
            p: [r(seg.p[0]), r(seg.p[1])]
          }
        : { type: 'L', p: [r(seg.p[0]), r(seg.p[1])] }
    )
  };
  return serialize(out);
}

let total = 0;
for (const file of ['cat.js', 'dog.js']) {
  const filePath = path.join(ROOT, 'src', 'assets', file);
  let src = fs.readFileSync(filePath, 'utf8');
  const blocks = [];
  const blockRe = /const (\w+SVG) = `([\s\S]*?)`;(\r?\n)/g;
  let m;
  while ((m = blockRe.exec(src))) blocks.push({ name: m[1], body: m[2], eol: m[3] });
  for (const block of blocks) {
    const shapes = geo.collectFilledShapes(block.body);
    const replacements = [];
    let si = 0;
    for (const shape of shapes) {
      if (!shape.isShadow) continue;
      const idx = si++;
      const host = hostFor(shapes, shape);
      if (!host) continue;
      const oldD = shape.el.attrs.d;
      const before = geo.maxOutsideFor(geo.transformPolys(shape.polys, shape.matrix), host);
      if (before <= TARGET) continue;
      const fixed = refit(oldD, host);
      if (!fixed) continue;
      let newD = fixed.d;
      let after = fixed.maxOut;
      if (after > TARGET) {
        // ultimo recurso: encoger el plano hacia su centro
        const center = geo.polygonCentroid(geo.parsePathData(oldD)[0]);
        const shrunk = shrinkInto(oldD, host, center);
        if (shrunk) {
          const m = geo.maxOutsideFor(geo.parsePathData(shrunk), host);
          if (m < after) {
            newD = shrunk;
            after = m;
          }
        }
      }
      const escaped = oldD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`<path class="cel-shadow"[^>]*d="${escaped}"`).test(block.body)) {
        console.log(`  ! no se localiza el d en ${block.name}: ${oldD.slice(0, 50)}`);
        continue;
      }
      // el arte usa coordenadas enteras: se redondea si el plano sigue
      // cabiendo dentro de la silueta.
      const rounded = roundPath(newD);
      const roundedOut = geo.maxOutsideFor(geo.parsePathData(rounded), host);
      if (roundedOut <= after + 0.1 && roundedOut <= 0.35) {
        newD = rounded;
        after = roundedOut;
      }
      // guarda: el punto inicial no se mueve, el area no se desploma y el
      // desborde tiene que mejorar. Si no, el plano se rehace a mano.
      const oldArea = areaOf(oldD);
      const newArea = areaOf(newD);
      const startMoved = Math.hypot(
        geo.parsePathData(newD)[0][0][0] - geo.parsePathData(oldD)[0][0][0],
        geo.parsePathData(newD)[0][0][1] - geo.parsePathData(oldD)[0][0][1]
      );
      const bad =
        after > before - 0.05 ||
        newArea < oldArea * 0.35 ||
        newArea > oldArea * 2.2 ||
        startMoved > 0.5;
      if (bad) {
        console.log(
          `  REVISAR ${block.name} #${idx}: fuera ${before.toFixed(2)} -> ${after.toFixed(2)}, ` +
          `area ${oldArea.toFixed(0)} -> ${newArea.toFixed(0)}\n` +
          `   - ${oldD}\n   + ${newD}`
        );
        continue;
      }
      replacements.push({ oldD, newD });
      total++;
      console.log(
        `${block.name} #${idx}  fuera ${before.toFixed(2)} -> ${after.toFixed(2)}  ` +
        `area ${areaOf(oldD).toFixed(0)} -> ${areaOf(newD).toFixed(0)}\n` +
        `   - ${oldD}\n   + ${newD}`
      );
    }
    for (const r of replacements) {
      const escaped = r.oldD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(<path class="cel-shadow"[^>]*d=")${escaped}(")`);
      block.body = block.body.replace(re, `$1${r.newD}$2`);
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
console.log(`\nplanos de sombra ajustados: ${total}${WRITE ? '' : ' (dry-run: use --write)'}`);

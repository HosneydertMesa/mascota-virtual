'use strict';

/**
 * nudge-shadow-inset.js — herramienta de un solo uso (migracion de arte).
 *
 * Recorre los `cel-shadow` de las 12 poses y empuja sus curvas para que el
 * plano de sombra quede DENTRO de la forma que sombrea (plan §4.4.6
 * "Sombras contenidas"), sin cambiar el numero de nodos ni el estilo de la
 * curva: solo mueve los puntos de control Affected por el desborde.
 *
 * Uso: node docs/qa/evidence/nudge-shadow-inset.js [TOLERANCIA_PX]
 *   (TOLERANCIA_PX = margen que se deja dentro de la silueta; 0.35 por defecto)
 *
 * Modifica src/assets/cat.js y src/assets/dog.js en el sitio.
 */

const fs = require('fs');
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const MARGIN = Number(process.argv[2] || 0.9);
const TARGET = Number(process.argv[3] || 0.6); // solo se tocan los que se salen mas que esto
const STEPS = 24;
const MAX_NODE_SHIFT = 2.5; // px maximos que se mueve un nodo en una pasada
const MAX_STEP = 1.5; // px maximos de correccion por pasada
const DAMPING = 0.6; // fraccion del desborde que se corrige por pasada

// ------------------------------------------------------------------ path I/O

function parsePathStructured(d) {
  const tokens = String(d).match(/[MLCZmlcz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  const segs = [];
  let cursor = [0, 0];
  let start = [0, 0];
  let cmd = null;
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'm': {
        const x = num();
        const y = num();
        cursor = cmd === 'M' ? [x, y] : [cursor[0] + x, cursor[1] + y];
        start = cursor.slice();
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
        cursor = start.slice();
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
  const r = Math.round(n);
  return String(r);
}

function serializePath(pathData) {
  const parts = [`M ${fmt(pathData.start[0])},${fmt(pathData.start[1])}`];
  for (const s of pathData.segs) {
    if (s.type === 'C') {
      parts.push(`C ${fmt(s.c1[0])},${fmt(s.c1[1])} ${fmt(s.c2[0])},${fmt(s.c2[1])} ${fmt(s.p[0])},${fmt(s.p[1])}`);
    } else {
      parts.push(`L ${fmt(s.p[0])},${fmt(s.p[1])}`);
    }
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Puntos aplanados con su (segmento, t) para poder corregir la curva. */
function flattenStructured(pathData) {
  const out = [];
  let cursor = pathData.start;
  pathData.segs.forEach((s, idx) => {
    if (s.type === 'C') {
      for (let k = 1; k <= STEPS; k++) {
        const t = k / STEPS;
        const u = 1 - t;
        const b0 = u * u * u;
        const b1 = 3 * u * u * t;
        const b2 = 3 * u * t * t;
        const b3 = t * t * t;
        out.push({
          x: b0 * cursor[0] + b1 * s.c1[0] + b2 * s.c2[0] + b3 * s.p[0],
          y: b0 * cursor[1] + b1 * s.c1[1] + b2 * s.c2[1] + b3 * s.p[1],
          seg: idx,
          t
        });
      }
    } else {
      out.push({ x: s.p[0], y: s.p[1], seg: idx, t: 1 });
    }
    cursor = s.p;
  });
  return out;
}

function basis(t) {
  const u = 1 - t;
  return [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
}

// ------------------------------------------------------------------- nudge

function nearestBoundary(poly, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const p of poly) {
    for (let k = 0; k < p.length; k++) {
      const a = p[k];
      const b = p[(k + 1) % p.length];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len2 = dx * dx + dy * dy;
      let t = len2 === 0 ? 0 : ((x - a[0]) * dx + (y - a[1]) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const qx = a[0] + t * dx;
      const qy = a[1] + t * dy;
      const d = Math.hypot(x - qx, y - qy);
      if (d < bestD) {
        bestD = d;
        best = [qx, qy];
      }
    }
  }
  return { point: best, dist: bestD };
}

/** Escala uniforme del path alrededor de un punto (en el espacio local). */
function scalePath(pathData, center, s) {
  const sc = (p) => [center[0] + (p[0] - center[0]) * s, center[1] + (p[1] - center[1]) * s];
  return {
    start: sc(pathData.start),
    segs: pathData.segs.map((seg) =>
      seg.type === 'C'
        ? { type: 'C', c1: sc(seg.c1), c2: sc(seg.c2), p: sc(seg.p) }
        : { type: 'L', p: sc(seg.p) }
    )
  };
}

/**
 * Escala minima (la mas cercana a 1) que mete el plano dentro de la forma.
 * Sirve para las lunas finas, donde mover nodos deforma la curva.
 */
function shrinkIntoHost(pathData, host, localCenter) {
  let lo = 0.4;
  let hi = 1;
  let best = null;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const d = serializePath(scalePath(parsePathStructured(pathData), localCenter, mid));
    const out = geo.maxOutsideFor(geo.parsePathData(d), host);
    if (out <= 0.05) {
      best = d;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

/** Empuja el path para que todos sus puntos queden dentro de `host`. */
function insetIntoHost(pathData, host) {
  const current = parsePathStructured(pathData);
  for (let pass = 0; pass < 60; pass++) {
    const pts = flattenStructured(current);
    let worst = null;
    for (const pt of pts) {
      let inside = false;
      let minD = Infinity;
      let nearest = null;
      for (const poly of host) {
        if (geo.pointInPolygon(poly, pt.x, pt.y)) {
          inside = true;
          break;
        }
        const nb = nearestBoundary([poly], pt.x, pt.y);
        if (nb.dist < minD) {
          minD = nb.dist;
          nearest = nb.point;
        }
      }
      if (inside) continue;
      const need = minD + MARGIN;
      if (!worst || need > worst.need) worst = { pt, need, nearest };
    }
    if (!worst) return serializePath(current);

    // direccion hacia dentro: del punto al borde mas cercano (se cruza el borde)
    const dx = worst.nearest[0] - worst.pt.x;
    const dy = worst.nearest[1] - worst.pt.y;
    const len = Math.hypot(dx, dy) || 1;
    const step = Math.min(worst.need, MAX_STEP) * DAMPING;
    const delta = [(dx / len) * step, (dy / len) * step];

    const seg = current.segs[worst.pt.seg];
    if (!seg || seg.type !== 'C') {
      // no se puede corregir con precision: se abandona este path
      return serializePath(current);
    }
    const b = basis(worst.pt.t);
    const prev = worst.pt.seg === 0 ? current.start : current.segs[worst.pt.seg - 1].p;
    const ctrl = [prev, seg.c1, seg.c2, seg.p];
    // se reparten los 4 nodos: S = sum(B^2) >= 0.3125 para una cubica
    const S = b.reduce((acc, v) => acc + v * v, 0);
    for (let k = 0; k < 4; k++) {
      let f = (delta[0] * b[k]) / S;
      let g = (delta[1] * b[k]) / S;
      const mag = Math.hypot(f, g);
      if (mag > MAX_NODE_SHIFT) {
        f = (f / mag) * MAX_NODE_SHIFT;
        g = (g / mag) * MAX_NODE_SHIFT;
      }
      ctrl[k][0] += f;
      ctrl[k][1] += g;
    }
    if (worst.pt.seg === 0) current.start = ctrl[0];
    seg.c1 = ctrl[1];
    seg.c2 = ctrl[2];
    seg.p = ctrl[3];
  }
  return serializePath(current);
}

// ------------------------------------------------------------------- main

function hostFor(shapes, shape) {
  // puntos de muestreo del plano (borde)
  const pts = [];
  for (const poly of geo.transformPolys(shape.polys, shape.matrix)) {
    for (const p of geo.sampleBoundary(poly, 0.5)) pts.push(p);
  }
  if (pts.length === 0) return null;
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
    const a = candPolys.reduce((acc, p) => acc + Math.abs(geo.polyArea(p)), 0);
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

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const blockRe = new RegExp('const (\\w+SVG) = `([\\s\\S]*?)`;(\\r?\\n)', 'g');
  let match;
  const blocks = [];
  while ((match = blockRe.exec(src))) {
    blocks.push({
      name: match[1],
      body: match[2],
      eol: match[3],
      index: match.index,
      len: match[0].length
    });
  }

  let changed = 0;
  for (const block of blocks) {
    const svg = block.body;
    const shapes = geo.collectFilledShapes(svg);
    // posicion de cada etiqueta <path class="cel-shadow"> en el texto
    const tagSpans = [];
    {
      const re = /class="cel-shadow"/g;
      let mm;
      while ((mm = re.exec(block.body))) {
        const open = block.body.lastIndexOf('<path', mm.index);
        const close = block.body.indexOf('>', mm.index);
        tagSpans.push({ open, close });
      }
    }
    const replacements = [];
    let si = 0;
    for (const shape of shapes) {
      if (!shape.isShadow) continue;
      const idx = si++;
      // centroide del plano
      let sArea = 0;
      let scx = 0;
      let scy = 0;
      for (const poly of geo.transformPolys(shape.polys, shape.matrix)) {
        const a = Math.abs(geo.polyArea(poly));
        const c = geo.polygonCentroid(poly);
        sArea += a;
        scx += c[0] * a;
        scy += c[1] * a;
      }
      shape.centroid = [scx / sArea, scy / sArea];
      const host = hostFor(shapes, shape);
      if (!host) continue;

      const oldD = shape.el.attrs.d;
      const shadowPolys = geo.transformPolys(shape.polys, shape.matrix);
      const before = geo.maxOutsideFor(shadowPolys, host);
      if (before <= TARGET) continue; // ya esta contenido: no se toca
      let newD = insetIntoHost(oldD, host);
      let after = geo.maxOutsideFor(geo.parsePathData(newD), host);
      // alternativa: escalar el plano dentro de la forma (para lunas finas)
      if (after > 0.05) {
        const inv = shape.matrix ? geo.invertMatrix(shape.matrix) : null;
        const hostCentroid = geo.polygonCentroid(host[0]);
        const localCenter = inv ? geo.applyMatrix(inv, hostCentroid[0], hostCentroid[1]) : hostCentroid;
        const shrunk = shrinkIntoHost(oldD, host, localCenter);
        if (shrunk) {
          const shrunkOut = geo.maxOutsideFor(geo.parsePathData(shrunk), host);
          if (shrunkOut < after) {
            newD = shrunk;
            after = shrunkOut;
          }
        }
      }
      if (newD === serializePath(parsePathStructured(oldD))) continue;
      // red de seguridad: si el ajuste empeora la sombra, se deja como estaba
      if (after > before + 0.02) {
        console.log(`  ${block.name}: se conserva el original (${before.toFixed(2)} -> ${after.toFixed(2)})`);
        continue;
      }
      const span = tagSpans[idx];
      if (!span) {
        console.log(`  ! sin etiqueta para ${block.name}: ${oldD.slice(0, 40)}...`);
        continue;
      }
      const tag = block.body.slice(span.open, span.close + 1);
      const at = tag.indexOf(`d="${oldD}"`);
      if (at === -1) {
        console.log(`  ! no se encontro el d exacto en ${block.name}: ${oldD.slice(0, 40)}...`);
        continue;
      }
      replacements.push({ at: span.open + at, len: `d="${oldD}"`.length, newD });
      changed++;
      console.log(`  ${block.name}: ${oldD}\n     -> ${newD}`);
    }
    // aplica de atrás hacia adelante para no invalidar los offsets
    replacements.sort((a, b) => b.at - a.at);
    for (const r of replacements) {
      block.body = block.body.slice(0, r.at) + `d="${r.newD}"` + block.body.slice(r.at + r.len);
    }
  }

  // reescribe los bloques modificados
  for (const block of blocks) {
    const re = new RegExp(`const ${block.name} = \`([\\s\\S]*?)\`;(\\r?\\n)`);
    const m = re.exec(src);
    if (!m) continue;
    src = src.replace(re, `const ${block.name} = \`${block.body}\`;${m[2]}`);
  }
  fs.writeFileSync(file, src);
  console.log(`${path.basename(file)}: ${changed} planos de sombra ajustados`);
}

processFile(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
processFile(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

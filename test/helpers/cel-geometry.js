'use strict';

/**
 * Geometria SVG minima (0 dependencias) para los guards cel-shading.
 *
 * Soporta el subconjunto de SVG que usan las 12 poses de produccion:
 * <g> con class, <path> con d en M/L/C/Z, <ellipse> y <circle>.
 *
 * Se usa para:
 *  - §4.4.6 "Sombras contenidas": el plano `cel-shadow` de una masa no
 *    cruza el contorno de esa masa.
 *  - §4.4.4 "Cola <-> grupa": la base de la cola queda oculta bajo el cuerpo.
 *  - §4.4.5 "Silueta continua": la union de las masas de la pose es una sola
 *    pieza conectada.
 *
 * Las medidas se toman sobre la geometria estatica (los `transform` inline
 * de cada <g> si se aplican), no sobre el frame animado.
 */

const CURVE_STEPS = 24; // segmentos por curva cubica al aplanar
const BOUNDARY_STEP = 0.25; // px de muestreo del borde de la sombra
const GRID_STEP = 0.5; // px de la rejilla interior del plano de sombra

// ---------------------------------------------------------------- parsing XML

function parseAttrs(attrStr) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(attrStr))) attrs[m[1]] = m[2];
  return attrs;
}

/** Arbol de elementos del SVG (sin texto ni comentarios: el arte no los usa). */
function parseElements(svg) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const tagRe = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let m;
  while ((m = tagRe.exec(svg))) {
    if (m[1] === '/') {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const el = { tag: m[2], attrs: parseAttrs(m[3]), children: [] };
    stack[stack.length - 1].children.push(el);
    if (!m[4]) stack.push(el);
  }
  return root;
}

function classTokens(el) {
  return (el.attrs.class || '').split(/\s+/).filter(Boolean);
}

/** Tokens de clase de un elemento (exportado para las herramientas de QA). */
function classTokensOf(el) {
  return classTokens(el);
}

function hasClass(el, cls) {
  return classTokens(el).includes(cls);
}

// ------------------------------------------------------------- path -> puntos

function cubicPoint(p0, p1, p2, p3, t) {
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

/**
 * Aplana un `d` (M/L/C/Z) a una lista de subpoligonos (arrays de [x, y]).
 */
function parsePathData(d) {
  const subpaths = [];
  let current = null;
  let cursor = [0, 0];
  let start = [0, 0];
  const tokens = String(d).match(/[MLCZmlcz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  let i = 0;
  const num = () => parseFloat(tokens[i++]);

  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'm': {
        const x = num();
        const y = num();
        cursor = cmd === 'M' ? [x, y] : [cursor[0] + x, cursor[1] + y];
        start = cursor;
        current = [cursor];
        subpaths.push(current);
        // toleramos implicitos: un M seguido de mas pares son L
        while (i + 1 < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
          const lx = num();
          const ly = num();
          cursor = [lx, ly];
          current.push(cursor);
        }
        break;
      }
      case 'L':
      case 'l': {
        const x = num();
        const y = num();
        cursor = cmd === 'L' ? [x, y] : [cursor[0] + x, cursor[1] + y];
        if (!current) {
          current = [cursor];
          subpaths.push(current);
        } else {
          current.push(cursor);
        }
        break;
      }
      case 'C':
      case 'c': {
        const rel = cmd === 'c';
        const c1 = [num(), num()];
        const c2 = [num(), num()];
        const p = [num(), num()];
        const abs = (q) => (rel ? [cursor[0] + q[0], cursor[1] + q[1]] : [q[0], q[1]]);
        const p1 = abs(c1);
        const p2 = abs(c2);
        const p3 = abs(p);
        if (!current) {
          current = [cursor];
          subpaths.push(current);
        }
        for (let s = 1; s <= CURVE_STEPS; s++) {
          current.push(cubicPoint(cursor, p1, p2, p3, s / CURVE_STEPS));
        }
        cursor = p3;
        break;
      }
      case 'Z':
      case 'z': {
        cursor = start;
        break;
      }
      default:
        break;
    }
  }
  return subpaths.filter((sp) => sp.length >= 3);
}

function ellipsePolygon(cx, cy, rx, ry) {
  const steps = 64;
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

/** Poligono(s) de un elemento de dibujo (path / ellipse / circle). */
function shapePolygons(el) {
  if (el.tag === 'path') {
    if (!el.attrs.d) return [];
    return parsePathData(el.attrs.d);
  }
  if (el.tag === 'ellipse') {
    const cx = parseFloat(el.attrs.cx || '0');
    const cy = parseFloat(el.attrs.cy || '0');
    const rx = parseFloat(el.attrs.rx || '0');
    const ry = parseFloat(el.attrs.ry || '0');
    return [ellipsePolygon(cx, cy, rx, ry)];
  }
  if (el.tag === 'circle') {
    const cx = parseFloat(el.attrs.cx || '0');
    const cy = parseFloat(el.attrs.cy || '0');
    const r = parseFloat(el.attrs.r || '0');
    return [ellipsePolygon(cx, cy, r, r)];
  }
  return [];
}

// ------------------------------------------------------------------ matrices

function multiply(m1, m2) {
  // m = [a, b, c, d, e, f]  ->  x' = a x + c y + e ; y' = b x + d y + f
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
  ];
}

function applyMatrix(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** Inversa de una afinacion 2x3 (null si no es invertible). */
function invertMatrix(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det) return null;
  const a = m[3] / det;
  const b = -m[1] / det;
  const c = -m[2] / det;
  const d = m[0] / det;
  const e = -(a * m[4] + c * m[5]);
  const f = -(b * m[4] + d * m[5]);
  return [a, b, c, d, e, f];
}

function translateMatrix(x, y) {
  return [1, 0, 0, 1, x, y];
}

function rotateMatrix(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
}

function scaleMatrix(sx, sy) {
  return [sx, 0, 0, sy, 0, 0];
}

function parseStyle(style) {
  const out = {};
  for (const decl of String(style || '').split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    out[decl.slice(0, idx).trim()] = decl.slice(idx + 1).trim();
  }
  return out;
}

/** Matriz de un <g> a partir de su `style` inline (transform + transform-origin). */
function groupMatrix(el) {
  const style = parseStyle(el.attrs.style);
  const transform = style.transform || '';
  if (!transform) return null;
  let m = null;
  const re = /(translate|rotate|scale)\(([^)]*)\)/g;
  let mm;
  while ((mm = re.exec(transform))) {
    const fn = mm[1];
    const args = mm[2].split(/[,\s]+/).filter(Boolean).map(parseFloat);
    if (fn === 'translate') {
      const x = args[0] || 0;
      const y = args.length > 1 ? args[1] : 0;
      m = m ? multiply(m, translateMatrix(x, y)) : translateMatrix(x, y);
    } else if (fn === 'rotate') {
      m = m ? multiply(m, rotateMatrix(args[0] || 0)) : rotateMatrix(args[0] || 0);
    } else if (fn === 'scale') {
      const sx = args[0] === undefined ? 1 : args[0];
      const sy = args.length > 1 ? args[1] : sx;
      m = m ? multiply(m, scaleMatrix(sx, sy)) : scaleMatrix(sx, sy);
    }
  }
  if (!m) return null;
  const originMatch = /^\s*(-?[\d.]+)px\s+(-?[\d.]+)px/.exec(style['transform-origin'] || '');
  if (originMatch) {
    const ox = parseFloat(originMatch[1]);
    const oy = parseFloat(originMatch[2]);
    m = multiply(translateMatrix(ox, oy), multiply(m, translateMatrix(-ox, -oy)));
  }
  return m;
}

// ------------------------------------------------------------------ poligonos

function polygonArea(poly) {
  let a = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

function polygonCentroid(poly) {
  // se desplaza el origen al primer vertice: las lunas finas tienen area
  // pequena y la formula sin desplazar pierde precision (el centroide se
  // vaia al infinito).
  const ox = poly[0][0];
  const oy = poly[0][1];
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const px = p[0] - ox;
    const py = p[1] - oy;
    const qx = q[0] - ox;
    const qy = q[1] - oy;
    const cross = px * qy - qx * py;
    a += cross;
    cx += (px + qx) * cross;
    cy += (py + qy) * cross;
  }
  if (Math.abs(a) < 1e-9) {
    let sx = 0;
    let sy = 0;
    for (const p of poly) {
      sx += p[0];
      sy += p[1];
    }
    return [sx / poly.length, sy / poly.length];
  }
  a *= 0.5;
  return [ox + cx / (6 * a), oy + cy / (6 * a)];
}

function polygonBBox(poly) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  return { minX, minY, maxX, maxY };
}

function pointInPolygon(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return Math.hypot(px - qx, py - qy);
}

/** Distancia de un punto al borde de un poligono. */
function distanceToPolygonEdge(poly, x, y) {
  let min = Infinity;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const d = distToSegment(x, y, p[0], p[1], q[0], q[1]);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Distancia "hacia afuera" de un punto respecto de un conjunto de poligonos:
 * 0 si esta dentro de alguno, >0 si esta fuera (distancia al borde mas cercano).
 */
function outsideDistance(polys, x, y) {
  let min = Infinity;
  for (const poly of polys) {
    if (pointInPolygon(poly, x, y)) return 0;
    const d = distanceToPolygonEdge(poly, x, y);
    if (d < min) min = d;
  }
  return min === Infinity ? 0 : min;
}

/**
 * Info del borde mas cercano a un punto: si esta dentro, a que distancia
 * del borde y hacia donde esta la normal (unitario, hacia dentro).
 */
function nearestBoundaryInfo(polys, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const poly of polys) {
    for (let i = 0, n = poly.length; i < n; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % n];
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
        best = { qx, qy, ax: a[0], ay: a[1], bx: b[0], by: b[1] };
      }
    }
  }
  if (!best) return { inside: false, dist: 0, point: [x, y], normal: [0, 0] };
  // normal de la arista mas cercana
  let nx = -(best.by - best.ay);
  let ny = best.bx - best.ax;
  const len = Math.hypot(nx, ny) || 1;
  nx /= len;
  ny /= len;
  const inside = pointInPolygon(polys[0], x, y) || polys.some((p) => pointInPolygon(p, x, y));
  // la normal debe apuntar hacia dentro de la forma
  const probe = [x + nx * 0.35, y + ny * 0.35];
  const probeInside = polys.some((p) => pointInPolygon(p, probe[0], probe[1]));
  if (inside ? !probeInside : probeInside) {
    nx = -nx;
    ny = -ny;
  }
  return {
    inside,
    dist: bestD,
    point: [best.qx, best.qy],
    normal: [nx, ny]
  };
}

// ------------------------------------------------------------------ muestreo

function sampleBoundary(poly, step) {
  const out = [];
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const steps = Math.max(1, Math.ceil(len / step));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

/** Puntos interiores de un poligono (rejilla sobre su bbox). */
function sampleInterior(poly, step) {
  const bbox = polygonBBox(poly);
  const out = [];
  for (let x = bbox.minX; x <= bbox.maxX; x += step) {
    for (let y = bbox.minY; y <= bbox.maxY; y += step) {
      if (pointInPolygon(poly, x, y)) out.push([x, y]);
    }
  }
  return out;
}

// ------------------------------------------------------------------ masas

/** Elemento <svg> raiz de la pose (sus hijos son las masas y el suelo). */
function svgRootElement(svg) {
  const root = parseElements(svg);
  const found = root.children.find((c) => c.tag === 'svg');
  return found || root;
}

/**
 * Extrae las masas de una pose. Una masa es un <g> con un `cel-outline`
 * como hijo directo; sus `cel-shadow` directos le pertenecen.
 */
function collectMasses(svg) {
  const root = svgRootElement(svg);
  const masses = [];
  const walk = (el, inherited, matrix) => {
    for (const child of el.children) {
      if (child.tag !== 'g') continue;
      const gm = groupMatrix(child);
      const m = gm ? (matrix ? multiply(matrix, gm) : gm) : matrix;
      const outlines = child.children.filter((c) => hasClass(c, 'cel-outline'));
      const shadows = child.children.filter((c) => hasClass(c, 'cel-shadow'));
      let mass = inherited;
      if (outlines.length > 0) {
        mass = {
          el: child,
          classes: classTokens(child),
          outlines,
          shadows: [],
          matrix: m
        };
        masses.push(mass);
      }
      if (shadows.length > 0 && mass) mass.shadows.push(...shadows);
      walk(child, mass, m);
    }
  };
  walk(root, null, null);
  return masses;
}

/**
 * Todas las formas rellenas de la pose, en orden de pintado, con su matriz
 * acumulada (los `transform` inline de los <g> ancestros ya aplicados).
 *
 * Cada forma ademas lleva `structuralHost`: la silueta (cel-outline) del
 * grupo mas cercano que la contiene. Es la referencia estructural del plano
 * de sombra: el <g> de la masa (cola, pata, cuerpo, cabeza...).
 */
function collectFilledShapes(svg) {
  const root = svgRootElement(svg);
  const shapes = [];
  let order = 0;
  const walk = (el, matrix, chain, structHost) => {
    for (const child of el.children) {
      let m = matrix;
      let childChain = chain;
      let childHost = structHost;
      if (child.tag === 'g') {
        const gm = groupMatrix(child);
        if (gm) m = m ? multiply(m, gm) : gm;
        childChain = chain.concat([child]);
        // el grupo puede aportar su propia silueta (cel-outline directo)
        const outlines = child.children.filter((c) => hasClass(c, 'cel-outline'));
        if (outlines.length) {
          const polys = [];
          for (const o of outlines) polys.push(...transformPolys(shapePolygons(o), m));
          childHost = polys;
        }
      }
      if (child.tag === 'path' || child.tag === 'ellipse' || child.tag === 'circle') {
        const fill = child.attrs.fill;
        const isGround = hasClass(child, 'pet-shadow');
        const isShadow = hasClass(child, 'cel-shadow');
        if (fill && fill !== 'none' && !isGround) {
          const polys = shapePolygons(child);
          if (polys.length) {
            shapes.push({
              el: child,
              polys,
              matrix: m,
              classes: classTokens(child),
              isShadow,
              order: order++,
              chain: childChain,
              structuralHost: childHost
            });
          }
        }
      }
      walk(child, m, childChain, childHost);
    }
  };
  walk(root, null, [], null);
  return shapes;
}

/** ¿La cadena de grupos de `a` es un prefijo de la de `b`? (a se pinta antes) */
function chainPrefix(a, b) {
  if (a.length > b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function transformPolys(polys, matrix) {
  if (!matrix) return polys;
  return polys.map((poly) => poly.map((p) => applyMatrix(matrix, p[0], p[1])));
}

// --------------------------------------------------------------- medidas API

/** Distancia maxima con la que un plano se sale de su forma anfitriona. */
function maxOutsideFor(shadowPolys, hostPolys) {
  let max = 0;
  for (const poly of shadowPolys) {
    for (const pt of sampleBoundary(poly, BOUNDARY_STEP)) {
      const d = outsideDistance(hostPolys, pt[0], pt[1]);
      if (d > max) max = d;
    }
    for (const pt of sampleInterior(poly, GRID_STEP)) {
      const d = outsideDistance(hostPolys, pt[0], pt[1]);
      if (d > max) max = d;
    }
  }
  return max;
}

/**
 * Resuelve la forma que sombrea un `cel-shadow`.
 *
 * Regla:
 *  1. la referencia estructural es la silueta (cel-outline) del grupo mas
 *     cercano que contiene al plano (la masa: cola, pata, cuerpo, cabeza);
 *  2. si hay una forma mas pequena que lo contiene por completo (el hocico
 *     crema dentro de la cabeza, el iris dentro de la cara), esa gana: es la
 *     masa real que se sombrea;
 *  3. si el plano se sale de su masa estructural, se mide contra ella (no
 *     contra una forma mayor que lo envuelve), que es justo el defecto que
 *     hay que detectar.
 *
 * La cobertura se mide con los puntos *interiores* del plano (no los del
 * borde): el borde de una banda que sigue la silueta cae justo sobre el
 * borde de la forma, asi que medirlo ahi es ambiguo; el interior siempre es
 * del anfitrion.
 *
 * Si el plano no tiene area (degenerate) se cae a los puntos del borde.
 */
function resolveHost(shapes, shape, samplePts) {
  const structural = shape.structuralHost || null;
  const structuralArea = structural
    ? structural.reduce((acc, p) => acc + Math.abs(polygonArea(p)), 0)
    : Infinity;

  let best = null;
  let bestArea = Infinity;
  let fallback = null;
  let fallbackCoverage = 0;
  for (const cand of shapes) {
    if (cand.isShadow || cand === shape) continue;
    if (cand.order >= shape.order) continue; // solo lo pintado antes
    if (!chainPrefix(cand.chain, shape.chain)) continue; // mismo subarbol
    const candPolys = transformPolys(cand.polys, cand.matrix);
    if (candPolys.length === 0) continue;
    const boxes = candPolys.map((p) => polygonBBox(p));
    let inside = 0;
    for (const pt of samplePts) {
      // dentro o pegado al borde (0.6 px): el muestreo no debe fallar en la
      // frontera de la forma
      let hit = false;
      for (let i = 0; i < candPolys.length && !hit; i++) {
        const box = boxes[i];
        if (
          pt[0] < box.minX - 0.6 || pt[0] > box.maxX + 0.6 ||
          pt[1] < box.minY - 0.6 || pt[1] > box.maxY + 0.6
        ) continue;
        if (pointInPolygon(candPolys[i], pt[0], pt[1])) hit = true;
        else if (distanceToPolygonEdge(candPolys[i], pt[0], pt[1]) <= 0.6) hit = true;
      }
      if (hit) inside++;
    }
    const coverage = inside / samplePts.length;
    const area = candPolys.reduce((acc, p) => acc + Math.abs(polygonArea(p)), 0);
    if (coverage > fallbackCoverage) {
      fallbackCoverage = coverage;
      fallback = candPolys;
    }
    if (coverage >= 0.98 && area < bestArea) {
      bestArea = area;
      best = candPolys;
    }
  }
  // una forma mas pequena que contiene el plano por completo es la masa real
  if (best && bestArea < structuralArea) return { host: best, coverage: 1 };
  if (structural) return { host: structural, coverage: 1 };
  return { host: best || fallback, coverage: best ? 1 : fallbackCoverage };
}

/**
 * Medidas de contencion y direccion de cada `cel-shadow` frente a la
 * silueta de su masa.
 *
 * Devuelve [{ mass, shadow, maxOutside, dx, dy }] con:
 *  - maxOutside: px que el plano de sombra se sale del relleno de la silueta.
 *  - dx/dy: desplazamiento del centroide de la sombra respecto al de la
 *    silueta (luz desde arriba-izquierda => dx > 0, dy > 0).
 */
function measureShadows(svg) {
  const shapes = collectFilledShapes(svg);
  const results = [];
  for (const shape of shapes) {
    if (!shape.isShadow) continue;
    const polys = transformPolys(shape.polys, shape.matrix);
    if (polys.length === 0) continue;

    // centroide del plano de sombra (en el espacio de la pose)
    let sArea = 0;
    let scx = 0;
    let scy = 0;
    for (const poly of polys) {
      const a = Math.abs(polygonArea(poly));
      const c = polygonCentroid(poly);
      sArea += a;
      scx += c[0] * a;
      scy += c[1] * a;
    }
    if (sArea <= 0) continue;
    const centroid = [scx / sArea, scy / sArea];

    // puntos de muestreo del plano: primero los interiores ( Always dentro
    // de su anfitrion), y si el plano es degenerado, los del borde.
    let samplePts = [];
    for (const poly of polys) {
      for (const pt of sampleInterior(poly, 0.4)) samplePts.push(pt);
    }
    if (samplePts.length === 0) {
      for (const poly of polys) {
        for (const pt of sampleBoundary(poly, 0.5)) samplePts.push(pt);
      }
    }
    if (samplePts.length === 0) continue;

    const { host: ref } = resolveHost(shapes, shape, samplePts);
    if (!ref) continue; // sin forma anfitriona: no hay contra que medir

    const refCentroid = polygonCentroid(ref[0]);
    let maxOutside = 0;
    let worst = null;
    const probe = (x, y) => {
      const d = outsideDistance(ref, x, y);
      if (d > maxOutside) {
        maxOutside = d;
        worst = [x, y];
      }
    };
    for (const poly of polys) {
      for (const pt of sampleBoundary(poly, BOUNDARY_STEP)) probe(pt[0], pt[1]);
      for (const pt of sampleInterior(poly, GRID_STEP)) probe(pt[0], pt[1]);
    }
    const group = shape.chain.length ? shape.chain[shape.chain.length - 1] : null;
    results.push({
      mass: group ? classTokens(group).join(' ') : '(pose)',
      massClasses: group ? classTokens(group) : [],
      shadowIndex: shape.order,
      host: ref.length ? '' : '',
      maxOutside,
      worst,
      dx: centroid[0] - refCentroid[0],
      dy: centroid[1] - refCentroid[1],
      refArea: 0,
      shadowArea: sArea
    });
  }
  return results;
}

/** Area (px2) del poligono (valor absoluto). */
function polyArea(poly) {
  return Math.abs(polygonArea(poly));
}

/**
 * Area de solape entre dos conjuntos de poligonos, por rejilla.
 * `cell` es el lado de la celda en px de viewBox.
 */
function overlapArea(polysA, polysB, cell = 0.25) {
  const bboxA = polysA.map(polygonBBox);
  const minX = Math.min(...bboxA.map((b) => b.minX));
  const minY = Math.min(...bboxA.map((b) => b.minY));
  const maxX = Math.max(...bboxA.map((b) => b.maxX));
  const maxY = Math.max(...bboxA.map((b) => b.maxY));
  let area = 0;
  for (let x = minX; x <= maxX; x += cell) {
    for (let y = minY; y <= maxY; y += cell) {
      if (polysA.some((p) => pointInPolygon(p, x, y)) && polysB.some((p) => pointInPolygon(p, x, y))) {
        area += cell * cell;
      }
    }
  }
  return area;
}

/**
 * Envergadura de la "raiz" compartida: la mayor seccion horizontal de la
 * region A ∩ B.
 *
 * Es la medida que distingue una cola ENRAIZADA en la grupa (una base
 * ancha escondida bajo el cuerpo) de una hoja flotante que solo roza la
 * grupa en una punta: en el primer caso la interseccion tiene envergadura,
 * en el segundo es una astilla.
 *
 * La seccion es horizontal porque la cola entra en la grupa de lado (es la
 * direccion en la que se ve el ancho de la raiz en la silueta).
 */
function overlapWidth(polysA, polysB, cell = 0.1) {
  const bboxA = polysA.map((p) => polygonBBox(p));
  const minX = Math.min(...bboxA.map((b) => b.minX));
  const minY = Math.min(...bboxA.map((b) => b.minY));
  const maxX = Math.max(...bboxA.map((b) => b.maxX));
  const maxY = Math.max(...bboxA.map((b) => b.maxY));
  const inside = (x, y) =>
    polysA.some((p) => pointInPolygon(p, x, y)) && polysB.some((p) => pointInPolygon(p, x, y));

  let best = 0;
  for (let y = minY; y <= maxY; y += cell) {
    let run = 0;
    for (let x = minX; x <= maxX; x += cell) {
      if (inside(x, y)) {
        run++;
        if (run * cell > best) best = run * cell;
      } else {
        run = 0;
      }
    }
  }
  return best;
}

/**
 * Silueta union de la pose: rasteriza todas las formas rellenas (mas el
 * medio grosor del trazo de tinta) y cuenta los componentes conexos.
 */
function silhouetteComponents(svg, options = {}) {
  const scale = options.scale || 4; // celdas por unidad de viewBox
  const dilate = options.dilate === undefined ? 1.7 : options.dilate; // medio trazo de tinta
  const shapes = collectFilledShapes(svg);
  const polys = shapes.flatMap((s) => transformPolys(s.polys, s.matrix));
  if (polys.length === 0) return { components: 0, areas: [] };

  const all = polys.flat();
  const bbox = polygonBBox(all);
  const w = Math.ceil((bbox.maxX - bbox.minX) * scale) + 1;
  const h = Math.ceil((bbox.maxY - bbox.minY) * scale) + 1;
  const grid = new Uint8Array(w * h);
  const px = (x) => Math.round((x - bbox.minX) * scale);
  const py = (y) => Math.round((y - bbox.minY) * scale);
  for (const poly of polys) {
    const pbox = polygonBBox(poly);
    const x0 = Math.max(0, px(pbox.minX));
    const x1 = Math.min(w - 1, px(pbox.maxX));
    const y0 = Math.max(0, py(pbox.minY));
    const y1 = Math.min(h - 1, py(pbox.maxY));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const wx = bbox.minX + x / scale;
        const wy = bbox.minY + y / scale;
        if (pointInPolygon(poly, wx, wy)) grid[y * w + x] = 1;
      }
    }
  }
  // dilatacion (la tinta se sale ~stroke-width/2 del relleno)
  const r = Math.max(0, Math.round(dilate * scale));
  const dilated = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!grid[y * w + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r + r) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          dilated[ny * w + nx] = 1;
        }
      }
    }
  }
  // componentes conexas (8-vecinos)
  const seen = new Uint8Array(w * h);
  const areas = [];
  const stack = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!dilated[idx] || seen[idx]) continue;
      let area = 0;
      stack.length = 0;
      stack.push([x, y]);
      seen[idx] = 1;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        area++;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const nidx = ny * w + nx;
            if (!dilated[nidx] || seen[nidx]) continue;
            seen[nidx] = 1;
            stack.push([nx, ny]);
          }
        }
      }
      areas.push({ area, cells: area / (scale * scale) });
    }
  }
  areas.sort((a, b) => b.area - a.area);
  return { components: areas.length, areas, grid: dilated, width: w, height: h, bbox, scale };
}

module.exports = {
  parseElements,
  parsePathData,
  shapePolygons,
  groupMatrix,
  transformPolys,
  invertMatrix,
  applyMatrix,
  chainPrefix,
  classTokensOf,
  collectMasses,
  collectFilledShapes,
  measureShadows,
  maxOutsideFor,
  overlapArea,
  overlapWidth,
  polyArea,
  polygonCentroid,
  polygonBBox,
  polygonArea,
  pointInPolygon,
  outsideDistance,
  nearestBoundaryInfo,
  distanceToPolygonEdge,
  sampleBoundary,
  sampleInterior,
  silhouetteComponents
};

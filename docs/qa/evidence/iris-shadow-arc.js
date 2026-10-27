'use strict';

/**
 * iris-shadow-arc.js — genera el path del plano de sombra de un iris
 * (elipse) siguiendo su borde inferior por dentro, para que el plano nunca
 * cruce el contorno de la masa (plan §4.4.6).
 *
 * Uso: node docs/qa/evidence/iris-shadow-arc.js <cx> <cy> <rx> <ry> [inset] [ang1] [ang2]
 *   ang1/ang2 en grados, 0 = derecha, 90 = abajo (sentido horario en pantalla).
 *   Por defecto: el arco va de 160° a 20° (la mitad de abajo) y cierra con una
 *   cuerda recta.
 */

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
  const f = (n) => (Number.isInteger(r(n)) ? String(r(n)) : String(r(n)));
  let d = `M ${f(P(a1)[0])},${f(P(a1)[1])}`;
  for (const s of segs) {
    d += ` C ${f(s.c1[0])},${f(s.c1[1])} ${f(s.c2[0])},${f(s.c2[1])} ${f(s.p[0])},${f(s.p[1])}`;
  }
  d += ' Z';
  return d;
}

const args = process.argv.slice(2).map(Number);
const [cx, cy, rx, ry] = args;
const inset = args.length > 4 ? args[4] : 1.2;
const a1 = args.length > 5 ? args[5] : 158;
const a2 = args.length > 6 ? args[6] : 22;
console.log(arcPath(cx, cy, rx, ry, inset, a1, a2));

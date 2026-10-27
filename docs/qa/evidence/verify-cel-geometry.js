'use strict';

/**
 * verify-cel-geometry.js — ¿el plano `cel-shadow` se sale de la silueta de
 * la forma que sombrea? (plan §4.4.6 "Sombras contenidas")
 *
 * Salida: una linea por plano de sombra con el desborde maximo en px, el punto
 * que mas se sale y el desplazamiento del centroide (dx, dy). Luz desde
 * arriba-izquierda => la sombra cae abajo-derecha => dx > 0 y dy > 0.
 *
 * Uso: node docs/qa/evidence/verify-cel-geometry.js [MAX_OUTSIDE]
 * Exit 1 si alguna masa incumple.
 */

const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const cat = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
const dog = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

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

const MAX_OUTSIDE = Number(process.argv[2] || process.env.MAX_OUTSIDE || 1.0); // px de desborde

let failures = 0;
let total = 0;

console.log('pose            masa                veredicto                 fuera   dx      dy    punto');
for (const [name, svg] of POSES) {
  const measures = geo.measureShadows(svg);
  for (const m of measures) {
    total++;
    const massName = m.mass;
    const over = m.maxOutside > MAX_OUTSIDE;
    const upLeft = m.dx < 0 && m.dy < 0 && Math.abs(m.dx) + Math.abs(m.dy) > 6;
    const verdict = over
      ? 'SOMBRA CRUZA CONTORNO'
      : upLeft
        ? 'SOMBRA ARRIBA-IZQUIERDA'
        : 'ok';
    if (verdict !== 'ok') failures++;
    const worst = m.worst ? `(${m.worst[0].toFixed(1)},${m.worst[1].toFixed(1)})` : '';
    console.log(
      `${name.padEnd(15)} ${massName.padEnd(20)} ${verdict.padEnd(26)} ` +
      `${m.maxOutside.toFixed(2).padStart(5)}  ${m.dx.toFixed(2).padStart(7)}  ${m.dy.toFixed(2).padStart(7)}  ${worst}`
    );
  }
}

console.log(`\nmasas con fallo: ${failures} de ${total}`);
process.exit(failures > 0 ? 1 : 0);

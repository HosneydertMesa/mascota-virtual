'use strict';

/**
 * silhouette-components.js — nº de componentes conexos de la silueta union
 * de cada pose (plan §4.4.5 "Silueta continua": la pose debe leerse como una
 * sola pieza, no como masas pegadas).
 *
 * Rasteriza las formas rellenas de la pose (con el medio grosor de la tinta)
 * y cuenta los componentes conexos.
 *
 * Uso: node docs/qa/evidence/silhouette-components.js
 * Exit 1 si alguna pose tiene mas de un componente.
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

let failures = 0;
for (const [name, svg] of POSES) {
  const res = geo.silhouetteComponents(svg, { scale: 4, dilate: 1.7 });
  const cells = res.areas.map((a) => Math.round(a.cells));
  const verdict = res.components <= 1 ? 'ok' : 'LA SILUETA ESTA PARTIDA';
  if (res.components > 1) failures++;
  console.log(
    `${name.padEnd(13)} ${String(res.components).padStart(2)} componente(s) ` +
    `[${cells.join(', ')}]  ${verdict}`
  );
}

console.log(`\nposes con la silueta partida: ${failures}`);
process.exit(failures > 0 ? 1 : 0);

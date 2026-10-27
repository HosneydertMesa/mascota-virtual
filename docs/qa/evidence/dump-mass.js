'use strict';
/**
 * dump-mass.js — imprime la silueta y los planos de sombra de una masa.
 *
 * Uso: node docs/qa/evidence/dump-mass.js <pose> <clase>
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

const pose = process.argv[2];
const cls = process.argv[3] || 'pet-ear';
const svg = POSES[pose];
if (!svg) {
  console.error('pose desconocida');
  process.exit(2);
}
for (const mass of geo.collectMasses(svg)) {
  if (!mass.classes.includes(cls)) continue;
  for (const o of mass.outlines) {
    console.log(`outline [${mass.classes.join(' ')}] ${o.attrs.d}`);
  }
  for (const s of mass.shadows) {
    console.log(`shadow  [${mass.classes.join(' ')}] ${s.attrs.d}`);
  }
}

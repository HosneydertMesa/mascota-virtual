'use strict';
/**
 * shadow-area-diff.js — compara el area de cada plano de sombra entre dos
 * versiones del arte (HEAD vs working tree) para detectar sombras que se
 * encogieron demasiado al meterlas dentro de la silueta.
 *
 * Uso: node docs/qa/evidence/shadow-area-diff.js <head-cat.js> <head-dog.js>
 */
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const headCat = require(process.argv[2]);
const headDog = require(process.argv[3]);
const workCat = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'cat.js'));
const workDog = require(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'dog.js'));

const POSES = [
  ['cat idle', 'catIdleSVG', 'cat'],
  ['cat walk', 'catWalkSVG', 'cat'],
  ['cat sleep', 'catSleepSVG', 'cat'],
  ['cat sit', 'catSitSVG', 'cat'],
  ['cat lay', 'catLaySVG', 'cat'],
  ['cat stretch', 'catStretchSVG', 'cat'],
  ['dog idle', 'dogIdleSVG', 'dog'],
  ['dog walk', 'dogWalkSVG', 'dog'],
  ['dog sleep', 'dogSleepSVG', 'dog'],
  ['dog sit', 'dogSitSVG', 'dog'],
  ['dog lay', 'dogLaySVG', 'dog'],
  ['dog stretch', 'dogStretchSVG', 'dog']
];

function shadowAreas(svg) {
  const out = [];
  const shapes = geo.collectFilledShapes(svg);
  for (const s of shapes) {
    if (!s.isShadow) continue;
    const polys = geo.transformPolys(s.polys, s.matrix);
    const area = polys.reduce((a, p) => a + geo.polyArea(p), 0);
    const group = s.chain.length ? s.chain[s.chain.length - 1] : null;
    const cls = group ? geo.classTokensOf(group) : [];
    out.push({ key: cls.join(' '), area, index: out.length });
  }
  return out;
}

for (const [name, key, species] of POSES) {
  const head = shadowAreas(species === 'cat' ? headCat[key] : headDog[key]);
  const work = shadowAreas(species === 'cat' ? workCat[key] : workDog[key]);
  const n = Math.max(head.length, work.length);
  for (let i = 0; i < n; i++) {
    const h = head[i];
    const w = work[i];
    if (!h || !w) {
      console.log(`${name.padEnd(12)} ${String(i).padStart(2)} ${(h ? h.key : w.key).padEnd(24)} ` +
        `FALTA (head ${h ? h.area.toFixed(0) : '-'} / work ${w ? w.area.toFixed(0) : '-'})`);
      continue;
    }
    const ratio = h.area > 0 ? w.area / h.area : 1;
    const flag = ratio < 0.55 ? '  <== encogida' : '';
    if (ratio < 0.999 || flag) {
      console.log(`${name.padEnd(12)} ${String(i).padStart(2)} ${h.key.padEnd(24)} ` +
        `head ${h.area.toFixed(0).padStart(5)} -> work ${w.area.toFixed(0).padStart(5)} ` +
        `(${(ratio * 100).toFixed(0)}%)${flag}`);
    }
  }
}

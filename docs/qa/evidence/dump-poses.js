'use strict';
/**
 * dump-poses.js — vuelca en JSON las 12 poses de produccion y el
 * transform-origin inline de cada <g> con pivote.
 *
 * Uso: node docs/qa/evidence/dump-poses.js [salida.json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const cat = require(path.join(ROOT, 'src', 'assets', 'cat.js'));
const dog = require(path.join(ROOT, 'src', 'assets', 'dog.js'));

const POSES = [
  ['cat', 'idle', cat.catIdleSVG],
  ['cat', 'walk', cat.catWalkSVG],
  ['cat', 'sleep', cat.catSleepSVG],
  ['cat', 'sit', cat.catSitSVG],
  ['cat', 'lay', cat.catLaySVG],
  ['cat', 'stretch', cat.catStretchSVG],
  ['dog', 'idle', dog.dogIdleSVG],
  ['dog', 'walk', dog.dogWalkSVG],
  ['dog', 'sleep', dog.dogSleepSVG],
  ['dog', 'sit', dog.dogSitSVG],
  ['dog', 'lay', dog.dogLaySVG],
  ['dog', 'stretch', dog.dogStretchSVG]
];

/** Clases de grupo cuyo transform-origin inline importa. */
const PIVOT_CLASSES = [
  'anim-wag', 'pet-body', 'pet-head',
  'back-foot-left', 'back-foot-right', 'left-paw', 'right-paw'
];

const out = { poses: [] };
for (const [species, state, svg] of POSES) {
  const groups = [];
  const re = /<g[^>]*class="([^"]*)"[^>]*>/g;
  let m;
  while ((m = re.exec(svg))) {
    const tokens = m[1].split(/\s+/).filter(Boolean);
    for (const cls of PIVOT_CLASSES) {
      if (!tokens.includes(cls)) continue;
      const o = /transform-origin:\s*([-\d.]+)px\s+([-\d.]+)px/.exec(m[0]);
      if (!o) continue;
      groups.push({ cls, x: parseFloat(o[1]), y: parseFloat(o[2]) });
    }
  }
  out.poses.push({ species, state, svg, groups });
}

const target = process.argv[2];
if (target) {
  fs.writeFileSync(target, JSON.stringify(out), 'utf8');
  console.log(target);
} else {
  process.stdout.write(JSON.stringify(out));
}

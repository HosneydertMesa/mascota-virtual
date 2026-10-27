'use strict';
/**
 * render-poses.js — genera una pagina HTML autocontenida con las 12 poses
 * de produccion (para renderizar y comparar visualmente).
 *
 * Uso: node docs/qa/evidence/render-poses.js <salida.html> [cat.js] [dog.js]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const outFile = process.argv[2] || path.join(__dirname, 'render', 'poses.html');
const catPath = process.argv[3] || path.join(ROOT, 'src', 'assets', 'cat.js');
const dogPath = process.argv[4] || path.join(ROOT, 'src', 'assets', 'dog.js');

const cat = require(catPath);
const dog = require(dogPath);

const POSES = [
  ['cat-idle', cat.catIdleSVG],
  ['cat-walk', cat.catWalkSVG],
  ['cat-sleep', cat.catSleepSVG],
  ['cat-sit', cat.catSitSVG],
  ['cat-lay', cat.catLaySVG],
  ['cat-stretch', cat.catStretchSVG],
  ['dog-idle', dog.dogIdleSVG],
  ['dog-walk', dog.dogWalkSVG],
  ['dog-sleep', dog.dogSleepSVG],
  ['dog-sit', dog.dogSitSVG],
  ['dog-lay', dog.dogLaySVG],
  ['dog-stretch', dog.dogStretchSVG]
];

const cards = POSES.map(([name, svg]) => `
  <div class="pose-card" data-pose="${name}">
    <div class="light"><div class="art">${svg}</div></div>
    <div class="dark"><div class="art">${svg}</div></div>
    <div class="label">${name}</div>
  </div>`).join('\n');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #cccccc; font-family: sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px; }
  .pose-card { }
  .light { background: #f4f4f0; }
  .dark { background: #23232b; }
  .art { width: 100%; }
  .art svg { width: 100%; height: auto; display: block; }
  .label { font-size: 12px; color: #222; padding: 2px 4px; }
</style></head><body>
<div class="grid">${cards}</div>
</body></html>`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');
console.log(outFile);

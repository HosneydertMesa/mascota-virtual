'use strict';
/**
 * list-failures.js — lista los planos de sombra que todavia fallan, con su
 * path actual, para poder rehacerlos a mano.
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

const TOL = 0.7;
for (const [name, svg] of POSES) {
  const shapes = geo.collectFilledShapes(svg);
  let si = 0;
  for (const shape of shapes) {
    if (!shape.isShadow) continue;
    const idx = si++;
    const group = shape.chain.length ? shape.chain[shape.chain.length - 1] : null;
    const cls = group ? geo.classTokensOf(group).join(' ') : '(pose)';
    const m = geo.measureShadows(svg).find(
      (x) => x.mass === cls && x.shadowIndex === shape.order
    );
    if (!m) continue;
    const bad = m.maxOutside > TOL;
    const dirBad = m.dx < 0 && m.dy < 0 && Math.abs(m.dx) + Math.abs(m.dy) > 6;
    if (!bad && !dirBad) continue;
    console.log(
      `${name} #${idx} ${cls}  fuera=${m.maxOutside.toFixed(2)} dx=${m.dx.toFixed(2)} dy=${m.dy.toFixed(2)}` +
      `${bad ? ' FUERA' : ''}${dirBad ? ' ARRIBA-IZQ' : ''}\n   ${shape.el.attrs.d}`
    );
  }
}

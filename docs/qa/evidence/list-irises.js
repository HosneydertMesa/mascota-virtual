'use strict';
/**
 * list-irises.js — lista los iris (elipses con class="cel-outline") y su
 * plano de sombra, para rehacerlos con un arco inferior coherente.
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

for (const [name, svg] of POSES) {
  const root = geo.parseElements(svg);
  const walk = (el) => {
    for (const c of el.children) {
      if (c.tag === 'ellipse' && (c.attrs.class || '').includes('cel-outline')) {
        console.log(
          `${name} iris cx=${c.attrs.cx} cy=${c.attrs.cy} rx=${c.attrs.rx} ry=${c.attrs.ry} ` +
          `sw=${c.attrs['stroke-width']} fill=${c.attrs.fill}`
        );
      }
      walk(c);
    }
  };
  walk(root);
}

'use strict';
/**
 * round-irises.js — redondea a enteros el plano de sombra de los iris (el
 * arte usa coordenadas enteras) y verifica que sigue cabiendo en el iris.
 *
 * Uso: node docs/qa/evidence/round-irises.js [--write]
 */
const fs = require('fs');
const path = require('path');
const geo = require(path.join(__dirname, '..', '..', '..', 'test', 'helpers', 'cel-geometry.js'));

const WRITE = process.argv.includes('--write');
const ROOT = path.join(__dirname, '..', '..', '..');

let problems = 0;
for (const file of ['cat.js', 'dog.js']) {
  const filePath = path.join(ROOT, 'src', 'assets', file);
  let src = fs.readFileSync(filePath, 'utf8');
  const blockRe = /const (\w+SVG) = `([\s\S]*?)`;(\r?\n)/g;
  const blocks = [];
  let m;
  while ((m = blockRe.exec(src))) blocks.push({ name: m[1], body: m[2] });

  for (const block of blocks) {
    const shapes = geo.collectFilledShapes(block.body);
    const re =
      /(<ellipse class="cel-outline" cx="(\d+)" cy="(\d+)" rx="(\d+)" ry="(\d+)" fill="#[0-9A-F]{6}"[^>]*\/>\s*<path class="cel-shadow" d=")([^"]+)(" fill=")/g;
    block.body = block.body.replace(re, (all, pre, cx, cy, rx, ry, oldD, post) => {
      const rounded = oldD.replace(/-?\d+(\.\d+)?/g, (n) => String(Math.round(parseFloat(n))));
      // verificacion: el plano redondeado tiene que seguir dentro del iris
      const shape = shapes.find((s) => s.isShadow && s.el.attrs.d === oldD);
      if (shape) {
        const host = geo.transformPolys(
          geo.shapePolygons(
            shapes.find((s) => s.el.attrs.fill === shape.el.attrs.fill && s.el.attrs.class === 'cel-outline' &&
              s.el.attrs.cx === cx && s.el.attrs.cy === cy) || { attrs: {} }
          ),
          null
        );
        if (host && host.length) {
          const out = geo.maxOutsideFor(geo.parsePathData(rounded), host);
          if (out > 0.4) {
            console.log(`  ! ${block.name}: el iris redondeado se sale ${out.toFixed(2)} px`);
            problems++;
            return all;
          }
        }
      }
      return `${pre}${rounded}${post}`;
    });
  }

  for (const block of blocks) {
    const re = new RegExp(`const ${block.name} = \`([\\s\\S]*?)\`;(\\r?\\n)`);
    const mm = re.exec(src);
    if (!mm) continue;
    src = src.replace(re, `const ${block.name} = \`${block.body}\`;${mm[2]}`);
  }
  if (WRITE) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`${file}: reescrito`);
  }
}
console.log(problems === 0 ? 'iris redondeados' : `problemas: ${problems}`);

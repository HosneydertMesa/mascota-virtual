'use strict';
/**
 * mutation-check.js — comprueba que los guards de arte MUERDEN: se mete una
 * mutacion en el arte, se espera que el test falle, y se restaura el arte.
 *
 * Las mutaciones reproducen los defectos que reporto la QA del 2026-10-27
 * (D1, D2, D6, D7 y D8) sobre el arte actual.
 *
 * Uso: node docs/qa/evidence/mutation-check.js
 * Exit 1 si algun guard no se da con cuenta de la mutacion.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const CAT = path.join(ROOT, 'src', 'assets', 'cat.js');
const DOG = path.join(ROOT, 'src', 'assets', 'dog.js');

const MUTATIONS = [
  {
    name: 'D1 — sombra de la cola del dog stretch asomando por fuera',
    file: DOG,
    from: 'd="M 138,100 C 142,78 138,54 122,44 C 125,50 131,60 133,68 C 135,79 136,90 138,100 Z"',
    to: 'd="M 138,100 C 142,78 138,54 122,44 C 118,58 126,80 142,96 C 150,102 142,104 138,100 Z"',
    expect: 'sombra'
  },
  {
    name: 'D2 — sombra del cuerpo del cat walk cruzando el vientre',
    file: CAT,
    from:
      'd="M 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 68,131 77,131 88,132 C 93,132 99,132 110,131 C 123,127 136,122 145,119 Z"',
    to:
      'd="M 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 66,141 76,143 86,144 C 92,145 100,145 112,143 C 128,141 143,134 151,125 Z"',
    expect: 'sombra'
  },
  {
    name: 'D6 — sombra de la cola del dog lay arriba-izquierda',
    file: DOG,
    from: 'd="M 175,120 C 186,109 190,92 182,76 C 181,86 181,93 180,99 C 179,106 177,114 175,120 Z"',
    to: 'd="M 175,120 C 186,109 190,92 182,76 C 172,66 158,62 150,72 C 146,80 150,92 158,100 C 160,106 168,114 175,120 Z"',
    expect: 'sombra'
  },
  {
    name: 'D7 — cola del dog stretch como hoja flotante',
    file: DOG,
    from:
      'd="M 138,100 C 142,78 138,54 122,44 C 110,37 100,48 108,60 C 114,69 122,78 128,92 C 130,95 134,98 138,100 Z"',
    to:
      'd="M 138,100 C 142,78 138,54 122,44 C 110,37 100,48 108,60 C 114,69 128,72 140,84 C 144,88 143,96 138,100 Z"',
    expect: 'cola'
  },
  {
    name: 'D8 — cola del dog sit sin raiz bajo la grupa',
    file: DOG,
    from:
      'd="M 124,158 C 146,153 168,138 175,120 C 178,109 174,100 166,99 C 160,98 156,104 160,109 C 164,114 164,120 160,126 C 154,135 146,140 139,140 C 135,146 130,152 124,158 Z"',
    to:
      'd="M 138,144 C 156,146 170,136 175,120 C 178,109 174,100 166,99 C 160,98 156,104 160,109 C 164,114 164,120 160,126 C 154,135 146,140 139,140 Z"',
    expect: 'cola'
  }
];

const backups = new Map();

function restore() {
  for (const [file, content] of backups) fs.writeFileSync(file, content);
}

let failures = 0;
let skipped = 0;
for (const mut of MUTATIONS) {
  if (!backups.has(mut.file)) backups.set(mut.file, fs.readFileSync(mut.file, 'utf8'));
  const original = backups.get(mut.file);
  if (!original.includes(mut.from)) {
    console.log(`SKIP  ${mut.name}: no se encontro el texto a mutar`);
    skipped++;
    continue;
  }
  fs.writeFileSync(mut.file, original.replace(mut.from, mut.to));
  const res = spawnSync(process.execPath, ['--test', 'test/pet-assets.test.js'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  restore();
  const out = res.stdout + res.stderr;
  const failed = res.status !== 0;
  const mentions = out.includes(mut.expect);
  const ok = failed && mentions;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK   ' : 'FALLA'} ${mut.name}: el test ${failed ? 'fallo' : 'NO fallo'} ` +
    `(exit ${res.status})`
  );
}
restore();

console.log(`\nguards que no muerden: ${failures}${skipped ? ` (mutaciones saltadas: ${skipped})` : ''}`);
process.exit(failures > 0 || skipped > 0 ? 1 : 0);

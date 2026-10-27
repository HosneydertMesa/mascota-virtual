"""silhouette-components.py — nº de componentes conexos de la silueta union
de cada pose (plan §4.4.5: la pose se lee como una sola silueta).

La medicion la hace el helper de geometria del proyecto
(test/helpers/cel-geometry.js), que rasteriza las formas rellenas de la pose
con la mitad del grosor de la tinta y cuenta los componentes conexos.

Uso: python docs/qa/evidence/silhouette-components.py
Exit 1 si alguna pose queda partida.
"""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent.parent
HELPER = REPO / "test" / "helpers" / "cel-geometry.js"

NODE_SNIPPET = r"""
const path = require('path');
const ROOT = process.cwd();
const geo = require(path.join(ROOT, 'test', 'helpers', 'cel-geometry.js'));
const cat = require(path.join(ROOT, 'src', 'assets', 'cat.js'));
const dog = require(path.join(ROOT, 'src', 'assets', 'dog.js'));
const POSES = [
  ['cat-idle', cat.catIdleSVG], ['cat-walk', cat.catWalkSVG],
  ['cat-sleep', cat.catSleepSVG], ['cat-sit', cat.catSitSVG],
  ['cat-lay', cat.catLaySVG], ['cat-stretch', cat.catStretchSVG],
  ['dog-idle', dog.dogIdleSVG], ['dog-walk', dog.dogWalkSVG],
  ['dog-sleep', dog.dogSleepSVG], ['dog-sit', dog.dogSitSVG],
  ['dog-lay', dog.dogLaySVG], ['dog-stretch', dog.dogStretchSVG]
];
const out = [];
for (const [name, svg] of POSES) {
  const res = geo.silhouetteComponents(svg, { scale: 4, dilate: 1.7 });
  out.push({
    pose: name,
    components: res.components,
    areas: res.areas.map((a) => Math.round(a.cells))
  });
}
process.stdout.write(JSON.stringify(out));
"""


def main():
    script = REPO / "docs" / "qa" / "evidence" / "render" / "silhouette-probe.js"
    script.parent.mkdir(parents=True, exist_ok=True)
    script.write_text(NODE_SNIPPET, encoding="utf-8")
    raw = subprocess.run(
        ["node", str(script)], cwd=str(REPO), check=True, capture_output=True, text=True
    ).stdout
    data = json.loads(raw)

    failures = 0
    for item in data:
        ok = item["components"] == 1
        if not ok:
            failures += 1
        print("{:<14} {} componente(s) [{}]  {}".format(
            item["pose"],
            item["components"],
            ", ".join(str(a) for a in item["areas"][:3]),
            "ok" if ok else "<- la silueta esta partida",
        ))
    print("\nposes con la silueta partida: {}".format(failures))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

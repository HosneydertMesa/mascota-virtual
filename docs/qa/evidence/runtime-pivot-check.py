"""runtime-pivot-check.py — el transform-origin COMPUTADO por Chromium debe
ser igual al transform-origin inline del <g> del SVG (plan §5).

Este check es independiente del test de la suite: monta la cadena DOM real
(body[data-pet] > #pet-container > #pet-svg-wrapper > svg#pet-svg > g) con el
bundle real de src/styles.css y lee el valor computado por el navegador, de
modo que no depende de replicar la cascada de CSS en otro lenguaje.

Uso: python docs/qa/evidence/runtime-pivot-check.py
Exit 1 si algun pivote no coincide.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent.parent
DUMP = REPO / "docs" / "qa" / "evidence" / "render" / "poses.json"

# Clases que el runtime pone en #pet-container segun el estado (ver
# src/renderer/pet-viewport.js -> setState).
STATE_CLASSES = {
    "idle": [],
    "walk": ["walking-bob"],
    "sleep": ["sleeping"],
    "sit": ["sitting"],
    "lay": ["laying"],
    "stretch": ["stretching"],
}


# Grupos con pivote verificado por estado (plan §5). La cola, el cuerpo y
# la cabeza rotan en los 6 estados; las patas solo rotan en walk y sit (en
# sleep/lay/stretch su pivote es inerte).
COVERAGE = {
    "idle": ["anim-wag", "pet-body", "pet-head"],
    "walk": ["anim-wag", "pet-body", "pet-head",
             "back-foot-left", "back-foot-right", "left-paw", "right-paw"],
    "sleep": ["anim-wag", "pet-body", "pet-head"],
    "sit": ["anim-wag", "pet-body", "pet-head",
            "back-foot-left", "back-foot-right", "left-paw", "right-paw"],
    "lay": ["anim-wag", "pet-body", "pet-head"],
    "stretch": ["anim-wag", "pet-body", "pet-head"],
}


def read_bundle() -> str:
    """Concatena los @import de src/styles.css en un solo <style>."""
    parts = []
    for name in ["variables.css", "animations.css", "pet.css", "dashboard.css"]:
        parts.append((REPO / "src" / "styles" / name).read_text(encoding="utf-8"))
    return "\n".join(parts)


def build_html(poses) -> str:
    cards = []
    for pose in poses:
        cards.append(
            '<article class="pose" data-species="{sp}" data-state="{st}" data-pose="{sp}-{st}">'
            '<div id="pet-container" class="{cls}"><div id="pet-svg-wrapper">{svg}</div></div>'
            "</article>".format(
                sp=pose["species"],
                st=pose["state"],
                cls=" ".join(STATE_CLASSES[pose["state"]]),
                svg=pose["svg"],
            )
        )
    return (
        "<!doctype html><html><head><meta charset='utf-8'><style>"
        + read_bundle()
        + """
        /* el SVG se dibuja 1:1 (200x200 px) para que 1 unidad de usuario == 1 px CSS */
        #pet-container { position: absolute; }
        #pet-svg { width: 200px; height: 200px; display: block; }
        .pose { position: absolute; top: 0; left: 0; }
        """
        + "</style></head><body>"
        + "".join(cards)
        + "</body></html>"
    )


def parse_origin(value: str):
    nums = re.findall(r"[-+]?\d*\.?\d+", value or "")
    if len(nums) < 2:
        return None
    return (round(float(nums[0]), 2), round(float(nums[1]), 2))


def main():
    DUMP.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["node", str(REPO / "docs" / "qa" / "evidence" / "dump-poses.js"), str(DUMP)],
        check=True,
        cwd=str(REPO),
    )
    data = json.loads(DUMP.read_text(encoding="utf-8"))
    poses = data["poses"]

    html = build_html(poses)
    html_file = DUMP.parent / "runtime-pivot.html"
    html_file.write_text(html, encoding="utf-8")

    checks = 0
    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 900, "height": 700})
        page.goto("file://{}".format(html_file.as_posix()))
        page.wait_for_load_state("networkidle")

        for pose in poses:
            species = pose["species"]
            state = pose["state"]
            selector = '.pose[data-species="{}"][data-state="{}"]'.format(species, state)
            classes = list(STATE_CLASSES[state])
            if state == "walk":
                classes.append(species + "-walk")
            page.eval_on_selector(
                selector,
                """(el, data) => {
                    document.body.dataset.pet = data.sp;
                    el.querySelector('#pet-container').className = data.cls;
                }""",
                {"sp": species, "cls": " ".join(classes)},
            )
            page.wait_for_timeout(30)

            computed = page.eval_on_selector(
                selector,
                """(el) => {
                    const out = {};
                    el.querySelectorAll('#pet-svg > g').forEach(g => {
                        (g.getAttribute('class') || '').trim().split(/\\s+/).forEach(cls => {
                            if (!cls) return;
                            const cs = getComputedStyle(g);
                            out[cls] = cs.transformOrigin;
                        });
                    });
                    return out;
                }""",
            )

            for group in pose["groups"]:
                if group["cls"] not in COVERAGE[state]:
                    continue
                checks += 1
                got = parse_origin(computed.get(group["cls"], ""))
                want = (group["x"], group["y"])
                if got is None or (abs(got[0] - want[0]) > 0.01 or abs(got[1] - want[1]) > 0.01):
                    failures.append(
                        "{} {} .{}: CSS {} != inline del SVG {}".format(
                            species, state, group["cls"],
                            computed.get(group["cls"], "(sin regla)"), want,
                        )
                    )
        browser.close()

    for line in failures:
        print("FALLO:", line)
    print("comprobaciones: {}   fallos: {}".format(checks, len(failures)))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

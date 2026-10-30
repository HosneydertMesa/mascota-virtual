"""
Capture one PNG per production pet pose into docs/pet-screenshots/.

Follows the same pattern as walk-cycle-capture.py: Playwright + headless
Chromium loading the local preview page over file:// and screenshotting
each pose card. The preview page renders the production SVGs from
src/assets/*.js, so the PNGs always show the current artwork.

Each PNG contains the pose twice: on a light background and on a dark one
(the app is a transparent window over the desktop, so both must be legible).

Usage:
    python test/preview/pet-poses-capture.py
    python test/preview/pet-poses-capture.py --scale 3
    python test/preview/pet-poses-capture.py --only cat-idle,dog-sit

Requirements:
    python -m pip install playwright
    python -m playwright install chromium
"""
import argparse
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # best effort tool: the preview page works without it
    print("Playwright no esta instalado. Instala las dependencias con:\n"
          "    python -m pip install playwright\n"
          "    python -m playwright install chromium")
    sys.exit(1)

REPO = Path(__file__).resolve().parent.parent.parent
PREVIEW_HTML = REPO / "test" / "preview" / "pet-poses-preview.html"
OUT_DIR = REPO / "docs" / "pet-screenshots"

# The 12 production poses (idle/walk/sleep/sit/lay/stretch x Luna/Max).
# The list is checked against the preview page before capturing: if a pose
# is added to the page, this script says so instead of silently skipping it.
POSES = [
    "cat-idle",
    "cat-walk",
    "cat-sleep",
    "cat-sit",
    "cat-lay",
    "cat-stretch",
    "dog-idle",
    "dog-walk",
    "dog-sleep",
    "dog-sit",
    "dog-lay",
    "dog-stretch",
]


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Captura un PNG por pose de produccion en docs/pet-screenshots/.")
    parser.add_argument("--scale", type=float, default=2.0,
                        help="device scale factor del screenshot (default 2)")
    parser.add_argument("--only", default="",
                        help="capturar solo estas poses (separadas por coma)")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)

    wanted = [p.strip() for p in args.only.split(",") if p.strip()] or list(POSES)
    unknown = [p for p in wanted if p not in POSES]
    if unknown:
        print("Poses desconocidas: {}".format(", ".join(unknown)))
        print("Poses validas: {}".format(", ".join(POSES)))
        return 1

    if not PREVIEW_HTML.exists():
        print("No se encuentra la pagina de preview: {}".format(PREVIEW_HTML))
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            viewport={"width": 1280, "height": 900},
            device_scale_factor=args.scale,
        )
        page.goto("file://{}".format(PREVIEW_HTML.as_posix()))
        page.wait_for_load_state("networkidle")

        rendered = page.eval_on_selector_all(
            ".pose-card", "els => els.map(e => e.dataset.pose)")
        if sorted(rendered) != sorted(POSES):
            print("La pagina de preview muestra {} poses y este script espera {}.".format(
                len(rendered), len(POSES)))
            print("Actualiza POSES en {} y el README de docs/pet-screenshots/.".format(
                Path(__file__).name))
            browser.close()
            return 1

        for pose in wanted:
            card = page.locator('.pose-card[data-pose="{}"]'.format(pose))
            card.wait_for(state="visible")
            page.wait_for_timeout(50)
            out_file = OUT_DIR / "{}.png".format(pose)
            card.screenshot(path=str(out_file))
            print("  {} -> {}".format(pose, out_file.relative_to(REPO).as_posix()))

        browser.close()

    print("Capturadas {} poses en {}/".format(len(wanted), OUT_DIR.relative_to(REPO).as_posix()))
    return 0


if __name__ == "__main__":
    sys.exit(main())

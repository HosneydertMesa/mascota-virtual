"""verify-screenshots-fresh.py — las 12 PNG de docs/pet-screenshots/ deben ser
identicas a un render actual de la pagina de preview.

Re-dibuja la pagina de preview real (test/preview/pet-poses-preview.html, que
toma el arte de src/assets/*.js) y compara byte a byte con los PNG
versionados.

Uso: python docs/qa/evidence/verify-screenshots-fresh.py
Exit 1 si alguna captura esta desactualizada.
"""
import filecmp
import shutil
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent.parent
PREVIEW_HTML = REPO / "test" / "preview" / "pet-poses-preview.html"
SHOTS = REPO / "docs" / "pet-screenshots"

POSES = [
    "cat-idle", "cat-walk", "cat-sleep", "cat-sit", "cat-lay", "cat-stretch",
    "dog-idle", "dog-walk", "dog-sleep", "dog-sit", "dog-lay", "dog-stretch",
]


def main():
    if not PREVIEW_HTML.exists():
        print("No se encuentra la pagina de preview: {}".format(PREVIEW_HTML))
        return 1

    tmp = Path(tempfile.mkdtemp(prefix="pet-shots-"))
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                viewport={"width": 1280, "height": 900}, device_scale_factor=2.0
            )
            page.goto("file://{}".format(PREVIEW_HTML.as_posix()))
            page.wait_for_load_state("networkidle")
            for pose in POSES:
                card = page.locator('.pose-card[data-pose="{}"]'.format(pose))
                card.wait_for(state="visible")
                page.wait_for_timeout(50)
                card.screenshot(path=str(tmp / "{}.png".format(pose)))
            browser.close()

        stale = []
        missing = []
        for pose in POSES:
            committed = SHOTS / "{}.png".format(pose)
            if not committed.exists():
                missing.append(pose)
                continue
            if not filecmp.cmp(str(committed), str(tmp / "{}.png".format(pose)), shallow=False):
                stale.append(pose)

        if missing:
            print("faltan capturas: {}".format(", ".join(missing)))
        if stale:
            print("capturas desactualizadas: {}".format(", ".join(stale)))
            print("regeneralas con: python test/preview/pet-poses-capture.py")
        if not missing and not stale:
            print("las {} capturas de docs/pet-screenshots/ son identicas a un render actual".format(
                len(POSES)))
        return 1 if (missing or stale) else 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())

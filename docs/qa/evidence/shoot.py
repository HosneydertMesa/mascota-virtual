"""shoot.py — captura un PNG por pose de la pagina de render.

Uso: python docs/qa/evidence/shoot.py <pagina.html> <dir-salida> [scale]
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def main(argv):
    page_path = Path(argv[0]).resolve()
    out_dir = Path(argv[1]).resolve()
    scale = float(argv[2]) if len(argv) > 2 else 3.0
    out_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            viewport={"width": 1400, "height": 900},
            device_scale_factor=scale,
        )
        page.goto("file://{}".format(page_path.as_posix()))
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(100)
        for card in page.query_selector_all(".pose-card"):
            pose = card.get_attribute("data-pose")
            card.screenshot(path=str(out_dir / "{}.png".format(pose)))
            print("  ", pose)
        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

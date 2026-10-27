"""silhouette.py — renderiza la silueta union de una pose (relleno negro, sin
tinta) y cuenta los componentes conexos.

Uso: python docs/qa/evidence/silhouette.py <pose> [salida.png]
"""
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent.parent.parent


def silhouette_html(pose):
    """Devuelve el HTML con la pose en negro (solo los rellenos)."""
    import re
    if pose.startswith("cat"):
        src = (ROOT / "src" / "assets" / "cat.js").read_text(encoding="utf-8")
    else:
        src = (ROOT / "src" / "assets" / "dog.js").read_text(encoding="utf-8")
    const = {
        "cat-idle": "catIdleSVG", "cat-walk": "catWalkSVG", "cat-sleep": "catSleepSVG",
        "cat-sit": "catSitSVG", "cat-lay": "catLaySVG", "cat-stretch": "catStretchSVG",
        "dog-idle": "dogIdleSVG", "dog-walk": "dogWalkSVG", "dog-sleep": "dogSleepSVG",
        "dog-sit": "dogSitSVG", "dog-lay": "dogLaySVG", "dog-stretch": "dogStretchSVG",
    }[pose]
    m = re.search(r"const %s = `([\s\S]*?)`;" % const, src)
    svg = m.group(1)
    # se queda solo con los rellenos (cel-outline y cel-shadow), en negro
    svg = re.sub(r'stroke="[^"]*"', 'stroke="none"', svg)
    svg = re.sub(r'fill="[^"]*"', 'fill="#000000"', svg)
    svg = re.sub(r'class="pet-shadow"', 'class="pet-shadow" opacity="0"', svg)
    return svg


def main(argv):
    pose = argv[0]
    out = Path(argv[1]) if len(argv) > 1 else ROOT / "docs" / "qa" / "evidence" / "render" / ("silhouette-%s.png" % pose)
    out.parent.mkdir(parents=True, exist_ok=True)
    html = (
        '<!doctype html><html><head><meta charset="utf-8"><style>'
        'body{margin:0;background:#fff}.art{width:600px}'
        'svg{width:100%;height:auto;display:block}</style></head>'
        '<body><div class="art">' + silhouette_html(pose) + '</div></body></html>'
    )
    tmp = out.with_suffix(".html")
    tmp.write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 700, "height": 700}, device_scale_factor=2)
        page.goto("file://{}".format(tmp.as_posix()))
        page.wait_for_load_state("networkidle")
        page.locator(".art").screenshot(path=str(out))
        browser.close()

    # componentes conexos con 8-vecinos (la imagen se compone sobre blanco:
    # el PNG sale con fondo transparente)
    im = Image.open(out).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im = Image.alpha_composite(bg, im).convert("L")
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    comps = []
    for y in range(h):
        for x in range(w):
            if px[x, y] > 128 or seen[y][x]:
                continue
            stack = [(x, y)]
            seen[y][x] = True
            n = 0
            minx = maxx = x
            miny = maxy = y
            while stack:
                cx, cy = stack.pop()
                n += 1
                minx = min(minx, cx); maxx = max(maxx, cx)
                miny = min(miny, cy); maxy = max(maxy, cy)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny] > 128:
                            seen[ny][nx] = True
                            stack.append((nx, ny))
            comps.append((n, (minx, miny, maxx, maxy)))
    comps.sort(reverse=True)
    # se ignoran los componentes de 1-2 px: son ruido de antialias del
    # borde del viewBox, no partes de la silueta.
    real = [c for c in comps if c[0] > 50]
    print("%s: %d componentes (>50 px)" % (pose, len(real)))
    for n, box in real:
        print("   %8d px  %dx%d@(%d,%d)" % (n, box[2] - box[0], box[3] - box[1], box[0], box[1]))
    return 0 if len(real) <= 1 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

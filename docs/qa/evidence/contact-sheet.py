"""contact-sheet.py — hoja de contacto de los 12 renders (recorte claro).

Uso: python docs/qa/evidence/contact-sheet.py <dir> <salida.png> [escala]
"""
import sys
from pathlib import Path

from PIL import Image

POSES = [
    "cat-idle", "cat-walk", "cat-sleep", "cat-sit", "cat-lay", "cat-stretch",
    "dog-idle", "dog-walk", "dog-sleep", "dog-sit", "dog-lay", "dog-stretch",
]


def main(argv):
    src = Path(argv[0])
    out = Path(argv[1])
    scale = float(argv[2]) if len(argv) > 2 else 0.34
    tiles = []
    for pose in POSES:
        im = Image.open(src / "{}.png".format(pose)).convert("RGB")
        w, h = im.size
        # solo la mitad clara (arriba) y centramos la mascota
        im = im.crop((0, 0, w, int(h * 0.48)))
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
        tiles.append((pose, im))
    tw = max(i.width for _, i in tiles)
    th = max(i.height for _, i in tiles)
    cols = 4
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 8) + 8), "#9a9a9a")
    for idx, (pose, im) in enumerate(tiles):
        x = 8 + (idx % cols) * (tw + 8)
        y = 8 + (idx // cols) * (th + 8)
        sheet.paste(im, (x, y))
    sheet.save(out)
    print(out, sheet.size)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

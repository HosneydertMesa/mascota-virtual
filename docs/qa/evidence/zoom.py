"""zoom.py — recorta y Amplia una region de un PNG.

Uso: python docs/qa/evidence/zoom.py <png> <salida.png> <left> <top> <right> <bottom> [scale]
"""
import sys
from pathlib import Path

from PIL import Image


def main(argv):
    src = Path(argv[0])
    out = Path(argv[1])
    box = tuple(int(v) for v in argv[2:6])
    scale = float(argv[6]) if len(argv) > 6 else 3.0
    im = Image.open(src).convert("RGB")
    crop = im.crop(box)
    crop = crop.resize((int(crop.width * scale), int(crop.height * scale)), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    crop.save(out)
    print(out, crop.size)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

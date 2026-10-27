"""compare.py — hoja de contacto HEAD vs WORK para las 12 poses.

Uso: python docs/qa/evidence/compare.py <dir-head-png> <dir-work-png> <salida.png>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

POSES = [
    "cat-idle", "cat-walk", "cat-sleep", "cat-sit", "cat-lay", "cat-stretch",
    "dog-idle", "dog-walk", "dog-sleep", "dog-sit", "dog-lay", "dog-stretch",
]


def main(argv):
    a_dir = Path(argv[0])
    b_dir = Path(argv[1])
    out = Path(argv[2])
    imgs = []
    for pose in POSES:
        a = Image.open(a_dir / "{}.png".format(pose)).convert("RGB")
        b = Image.open(b_dir / "{}.png".format(pose)).convert("RGB")
        imgs.append((pose, a, b))

    cell_w = max(i.width for _, a, b in imgs for i in (a, b))
    cell_h = max(i.height for _, a, b in imgs for i in (a, b))
    cols = 2
    rows = len(imgs)
    sheet = Image.new("RGB", (cols * cell_w + 120, rows * (cell_h + 18) + 20), "white")
    d = ImageDraw.Draw(sheet)
    for idx, (pose, a, b) in enumerate(imgs):
        y = 10 + idx * (cell_h + 18)
        sheet.paste(a, (60, y))
        sheet.paste(b, (60 + cell_w, y))
        d.text((4, y + 4), pose, fill="black")
        d.text((60 + cell_w + 4, y + 4), "WORK", fill="black")
    sheet.save(out)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

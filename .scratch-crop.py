from PIL import Image
import sys

src = "docs/pet-screenshots/dog-walk.png"
im = Image.open(src)
print("size", im.size)
# El panel claro ocupa la izquierda. Recortamos la zona de la union
# nuca/lomo y la ampliamos 4x.
box = (180, 200, 420, 400)   # light panel
crop = im.crop(box).resize(((box[2]-box[0])*3, (box[3]-box[1])*3), Image.NEAREST)
crop.save(".scratch-dog-walk-joint.png")

box2 = (700, 200, 940, 400)  # dark panel
crop2 = im.crop(box2).resize(((box2[2]-box2[0])*3, (box2[3]-box2[1])*3), Image.NEAREST)
crop2.save(".scratch-dog-walk-joint-dark.png")
print("ok")

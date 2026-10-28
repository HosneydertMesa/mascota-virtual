from PIL import Image

im = Image.open("docs/pet-screenshots/cat-walk.png")
print("size", im.size)
box = (250, 230, 460, 400)
im.crop(box).resize(((box[2]-box[0])*3, (box[3]-box[1])*3), Image.NEAREST).save(".scratch-cat-walk-joint.png")

im2 = Image.open("docs/pet-screenshots/dog-sleep.png")
print("size", im2.size)
box2 = (60, 300, 300, 560)
im2.crop(box2).resize(((box2[2]-box2[0])*3, (box2[3]-box2[1])*3), Image.NEAREST).save(".scratch-dog-sleep-joint.png")
print("ok")

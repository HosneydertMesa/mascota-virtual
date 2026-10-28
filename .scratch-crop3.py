from PIL import Image
im = Image.open("docs/pet-screenshots/dog-sleep.png")
box = (250, 290, 420, 430)
im.crop(box).resize(((box[2]-box[0])*4, (box[3]-box[1])*4), Image.LANCZOS).save(".scratch-dog-sleep-joint2.png")
box2 = (700, 290, 870, 430)
im.crop(box2).resize(((box2[2]-box2[0])*4, (box2[3]-box2[1])*4), Image.LANCZOS).save(".scratch-dog-sleep-joint2-dark.png")
print("ok")

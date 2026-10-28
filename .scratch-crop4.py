from PIL import Image
im = Image.open("docs/pet-screenshots/dog-walk.png")
box = (180, 180, 420, 400)
im.crop(box).resize(((box[2]-box[0])*3, (box[3]-box[1])*3), Image.LANCZOS).save(".scratch-dog-walk-new.png")
box2 = (690, 180, 930, 400)
im.crop(box2).resize(((box2[2]-box2[0])*3, (box2[3]-box2[1])*3), Image.LANCZOS).save(".scratch-dog-walk-new-dark.png")
print("ok")

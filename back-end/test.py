from utils.pdf_utils import pdf_to_images

imgs = pdf_to_images("test.pdf", "temp")
print(imgs)

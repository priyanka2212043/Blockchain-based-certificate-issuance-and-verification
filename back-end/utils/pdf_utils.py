# # utils/pdf_utils.py
# import os
# from pdf2image import convert_from_path

# # Set this to your poppler bin path on Windows, e.g.:
# # POPPLER_PATH = r"C:\poppler-24.08.0\Library\bin"
# # If you added poppler bin to PATH, you can set POPPLER_PATH = None
# POPPLER_PATH = r"C:\Users\Priya\Downloads\Release-25.07.0-0\poppler-25.07.0\Library\bin"
# def pdf_to_images(pdf_path: str, output_folder: str):
#     if not os.path.exists(pdf_path):
#         raise FileNotFoundError(f"PDF not found: {pdf_path}")

#     os.makedirs(output_folder, exist_ok=True)

#     images = convert_from_path(
#         pdf_path,
#         dpi=300,
#         poppler_path=POPPLER_PATH
#     )

#     saved = []
#     for i, img in enumerate(images, start=1):
#         out = os.path.join(output_folder, f"page_{i}.png")
#         img.save(out, "PNG")
#         saved.append(out)

#     return saved
import os
from pdf2image import convert_from_path

# ✅ Correct Poppler path (bin folder)
POPPLER_PATH = r"C:\Users\Priya\Downloads\Release-25.07.0-0\poppler-25.07.0\Library\bin"

def pdf_to_images(pdf_path: str, output_folder: str):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    os.makedirs(output_folder, exist_ok=True)

    images = convert_from_path(
        pdf_path,
        dpi=300,
        poppler_path=POPPLER_PATH
    )

    saved = []
    for i, img in enumerate(images, start=1):
        out_path = os.path.join(output_folder, f"page_{i}.png")
        img.save(out_path, "PNG")
        saved.append(out_path)

    return saved

# utils/ocr.py
import pytesseract
from PIL import Image

# <-- set to your tesseract install path if not in PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(image_path: str) -> str:
    """
    Extract text from an image file and return cleaned string.
    """
    img = Image.open(image_path)
    raw = pytesseract.image_to_string(img)
    # basic normalization: collapse whitespace
    cleaned = " ".join(raw.split())
    return cleaned
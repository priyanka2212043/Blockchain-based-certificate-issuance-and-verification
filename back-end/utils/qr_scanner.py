# utils/qr_scanner.py
import cv2

def scan_qr(image_path: str) -> str | None:
    """
    Uses OpenCV QRCodeDetector to decode a QR code from an image file.
    Returns decoded string (URL/CID) or None.
    """
    img = cv2.imread(image_path)
    if img is None:
        return None
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(img)
    if data:
        return data.strip()
    return None
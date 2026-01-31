import os
import time
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_cors import CORS

from utils.pdf_utils import pdf_to_images
from utils.ocr import extract_text
from utils.qr_scanner import scan_qr
from utils.ipfs_fetcher import fetch_metadata
from utils.verifier import compare_metadata

load_dotenv()

# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_FOLDER = os.path.join(BASE_DIR, "certificates")
TEMP_FOLDER = os.path.join(CERT_FOLDER, "temp")

os.makedirs(CERT_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# ---------- Flask app ----------
app = Flask(__name__)
app.config["CERT_FOLDER"] = CERT_FOLDER
app.config["TEMP_FOLDER"] = TEMP_FOLDER

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# ---------- Verify Route ----------
@app.route("/verify", methods=["POST"])
def verify():
    if "certificate" not in request.files:
        return jsonify({"success": False, "error": "No certificate uploaded"}), 400

    file = request.files["certificate"]

    if file.filename == "":
        return jsonify({"success": False, "error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["CERT_FOLDER"], filename)

    # 🔥 SAFE FILE SAVE (Windows fix)
    with open(file_path, "wb") as f:
        f.write(file.read())

    print("✅ Saved at:", file_path)
    print("📦 File size:", os.path.getsize(file_path))

    # Small delay to avoid Windows file lock
    time.sleep(0.2)

    images = []

    try:
        # ---------- PDF → Images ----------
        images = pdf_to_images(file_path, app.config["TEMP_FOLDER"])
        print("🖼 Images generated:", images)

        if not images:
            return jsonify({"success": False, "error": "PDF conversion failed"}), 500

        # ---------- OCR ----------
        full_text = ""
        for img in images:
            text = extract_text(img)
            if text:
                full_text += " " + text

        # ---------- QR Scan ----------
        qr_data = None
        for img in images:
            qr_data = scan_qr(img)
            if qr_data:
                break

        if not qr_data:
            return jsonify({
                "success": False,
                "error": "No QR code found in certificate",
                "extracted_text": full_text
            }), 400

        # ---------- Fetch Metadata ----------
        metadata = fetch_metadata(qr_data)

        # ---------- Verify ----------
        verification_details = compare_metadata(full_text, metadata)

        return jsonify({
            "success": True,
            "qr_data": qr_data,
            "metadata": metadata,
            "verification": verification_details
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        # ---------- Cleanup ----------
        for img in images:
            if os.path.exists(img):
                os.remove(img)

        if os.path.exists(file_path):
            os.remove(file_path)

# ---------- Run ----------
if __name__ == "__main__":
    app.run(debug=True, port=5001)

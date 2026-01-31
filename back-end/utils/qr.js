// utils/qr.js
import QRCode from "qrcode";

export async function generateQRCode(ipfsHash) {
  const verificationUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  try {
    // Generate base64 QR code image
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);
    return qrDataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

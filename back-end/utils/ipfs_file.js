// utils/ipfs.js
import axios from "axios";
import FormData from "form-data";
import "dotenv/config";

// ⬆️ Keep your uploadJSONToPinata as it is
export async function uploadFileToPinata(fileBuffer, fileName) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const headers = {
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
  };

  const formData = new FormData();

  // 👇 Force into Buffer
  const safeBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

  formData.append("file", safeBuffer, { filename: fileName });

  try {
    const res = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...headers,
        ...formData.getHeaders(),
      },
    });

    console.log(`✅ Stored file "${fileName}" → CID: ${res.data.IpfsHash}`);
    return res.data.IpfsHash;
  } catch (err) {
    console.error("❌ Error uploading file to Pinata:", err.response?.data || err);
    throw err;
  }
}

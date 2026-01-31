// utils/ipfs.js
import axios from "axios";
import "dotenv/config";

export async function uploadJSONToPinata(jsonData, enrollmentId) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const headers = {
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
  };

  // Wrap content + metadata properly
  const body = {
    pinataMetadata: {
      name: enrollmentId,   // 👈 Name shown in Pinata dashboard
    },
    pinataContent: jsonData, // 👈 Your certificate JSON
  };

  try {
    const res = await axios.post(url, body, { headers });
    console.log(
      `✅ Stored JSON with enrollmentId "${enrollmentId}" → CID: ${res.data.IpfsHash}`
    );
    return res.data.IpfsHash; // hash1
  } catch (err) {
    console.error("❌ Error uploading JSON to Pinata:", err.response?.data || err);
    throw err;
  }
}

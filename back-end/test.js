import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Load variables from .env

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

async function testUpload() {
  try {
    const data = { message: "Hello Pinata!" };
    const result = await pinata.pinJSONToIPFS(data);
    console.log("✅ Success! CID:", result.IpfsHash);
  } catch (err) {
    console.error("❌ Error uploading to Pinata:", err);
  }
}

testUpload();

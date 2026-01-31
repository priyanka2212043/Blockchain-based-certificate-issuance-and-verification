// blockchain.js
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const contractInfo = JSON.parse(fs.readFileSync("blockchain/certRegistry.json", "utf8"));

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

// ES module exports
export async function registerCertificate(studentId, cid) {
  const studentHash = ethers.id(studentId);
  const tx = await contract.registerCertificate(studentHash, cid);
  await tx.wait();
  return tx.hash;
}

export async function verifyCertificate(studentId) {
  const studentHash = ethers.id(studentId);
  const cert = await contract.getCertificate(studentHash);
  return {
    cid: cert[0],
  };
}

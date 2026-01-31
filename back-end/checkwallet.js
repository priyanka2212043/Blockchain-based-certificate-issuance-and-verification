import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function checkBalance() {
  // In Ethers v6, get balance via provider
  const balance = await provider.getBalance(wallet.address);

  console.log("Platform wallet address:", wallet.address);
  console.log("Balance (ETH):", ethers.formatEther(balance));
}

checkBalance();

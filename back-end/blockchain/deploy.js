// blockchain/deploy.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import solc from "solc";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.resolve();

async function main() {
  // Provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Read Solidity source
  const source = fs.readFileSync(path.join(__dirname, "blockchain/contracts/CertRegistry.sol"), "utf8");

  // Compile contract
  const input = {
    language: "Solidity",
    sources: { "CertRegistry.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const abi = output.contracts["CertRegistry.sol"]["CertRegistry"].abi;
  const bytecode = output.contracts["CertRegistry.sol"]["CertRegistry"].evm.bytecode.object;

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();  // ✅ Ethers v6

  console.log("Contract deployed at:", contract.target);

  // Save ABI + address for backend
  const info = { abi, address: contract.target };
  fs.writeFileSync(path.join(__dirname, "blockchain/certRegistry.json"), JSON.stringify(info, null, 2));

  console.log("Contract info saved to blockchain/certRegistry.json ✅");
}

main().catch(console.error);

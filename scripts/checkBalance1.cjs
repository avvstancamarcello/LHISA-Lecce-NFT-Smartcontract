require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  // Usa l'endpoint RPC di Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const address = process.env.WALLET_ADDRESS;

  console.log("Using RPC URL:", process.env.SEPOLIA_RPC_URL);
  console.log("Checking balance for address:", address);

  if (!address) {
    throw new Error("WALLET_ADDRESS is not defined in the .env file");
  }

  // Ottieni il saldo del wallet
  const balance = await provider.getBalance(address);
  console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
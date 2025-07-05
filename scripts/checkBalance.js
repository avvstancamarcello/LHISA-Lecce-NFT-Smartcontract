require("dotenv").config();
const { ethers } = require("ethers");

async function checkBalance() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL;

    console.log("BASE_RPC_URL:", rpcUrl);    // Log per debug

  if (!privateKey || !rpcUrl) {
    console.error("Errore: PRIVATE_KEY o BASE_RPC_URL non sono definiti nel file .env.");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Indirizzo del wallet:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    const requiredGas = ethers.ethers.utils.parseEther("0.01"); // Esempio: 0.01 ETH richiesti per il deploy
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di fondi sufficienti per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore durante la verifica del saldo:", error.message);
  }
}

checkBalance();

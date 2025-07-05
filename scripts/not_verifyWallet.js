require("dotenv").config();
const { ethers } = require("ethers");

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.BASE_RPC_URL;

if (!privateKey || !rpcUrl) {
  console.error("Errore: specifica PRIVATE_KEY e BASE_RPC_URL nel file .env.");
  process.exit(1);
}

// Rimuovi i log di debug
// console.log("DEBUG: PRIVATE_KEY:", privateKey);
// console.log("DEBUG: Lunghezza PRIVATE_KEY:", privateKey.length);
// console.log("DEBUG: BASE_RPC_URL:", rpcUrl);

console.log("Creazione del provider...");
const provider = new ethers.JsonRpcProvider(rpcUrl);

console.log("Creazione del wallet...");
const wallet = new ethers.Wallet(privateKey, provider);

console.log("Indirizzo del wallet:", wallet.address);

(async () => {
  console.log("Recupero del saldo...");
  const balance = await wallet.getBalance();
  console.log("Saldo del wallet:", ethers.formatEther(balance), "ETH");

  if (balance.gt(ethers.ethers.utils.parseEther("0.01"))) {
    console.log("Il wallet dispone di fondi sufficienti per il deploy.");
  } else {
    console.error("Fondi insufficienti nel wallet.");
  }
})();

require("dotenv").config();
const { ethers } = require("ethers");

function isValidPrivateKey(privateKey) {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}

async function validatePrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL;

  if (!privateKey || !rpcUrl) {
    console.error("Errore: PRIVATE_KEY o BASE_RPC_URL non sono definiti nel file .env.");
    process.exit(1);
  }

  if (isValidPrivateKey(privateKey)) {
    console.log("La chiave privata è valida nel formato.");
  } else {
    console.error("Errore: La chiave privata non è valida nel formato.");
    process.exit(1);
  }

  try {
    // Crea il provider con l'URL RPC
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Verifica la chiave privata
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);

    // Controlla il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    // Restituisci il risultato per l'uso in Hardhat
    return { isValid: true, walletAddress: wallet.address };
  } catch (error) {
    console.error("Errore durante la verifica della chiave privata:", error.message);
    return { isValid: false };
  }
}

validatePrivateKey().then((result) => {
  if (!result.isValid) {
    console.error("La chiave privata non è valida. Interrompo l'esecuzione.");
    process.exit(1);
  } else {
    console.log("Chiave privata verificata con successo.");
    process.exit(0);
  }
});

require("dotenv").config();
const { Wallet } = require("ethers");

function verifyPrivateKey(privateKey) {
  try {
    const wallet = new Wallet(privateKey);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet generato:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

const privateKey = process.env.PRIVATE_KEY;

// Rimuovi i log di debug
// console.log("DEBUG: PRIVATE_KEY:", privateKey);

if (!privateKey) {
  console.error("Errore: specifica una chiave privata nel file .env.");
  process.exit(1);
}

// Controllo aggiuntivo per la lunghezza e il formato della chiave privata
if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("Errore: la chiave privata deve essere una stringa esadecimale di 64 caratteri.");
  process.exit(1);
}

verifyPrivateKey(privateKey);

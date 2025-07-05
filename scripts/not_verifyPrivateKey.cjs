const { ethers } = require("ethers");

function verifyPrivateKey(privateKey) {
  console.log("Chiave privata ricevuta:", privateKey);
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

// Leggi la chiave privata dalla riga di comando
const privateKey = process.argv[2];

if (!privateKey) {
  console.error("Errore: specifica una chiave privata come argomento.");
  process.exit(1);
}

verifyPrivateKey(privateKey);
const ethers = require("ethers");

function verifyPrivateKey(privateKey) {
  console.log("Chiave privata ricevuta:", privateKey);
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

// Nuova chiave privata
const privateKey = "0x4f7dcf54bee439cd99e97a161a43539502228bd64d0f8fc007d48de03165c497";

verifyPrivateKey(privateKey);
const { ethers } = require("ethers");

function verifyPrivateKey(privateKey) {
  console.log("Chiave privata ricevuta:", privateKey);
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

// Leggi la chiave privata dalla riga di comando
const privateKey = process.argv[2];

if (!privateKey) {
  console.error("Errore: specifica una chiave privata come argomento.");
  process.exit(1);
}

verifyPrivateKey(privateKey);
require("dotenv").config();
const { ethers } = require("ethers");

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("BASE_RPC_URL:", process.env.BASE_RPC_URL);

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    const requiredGas = ethers.ethers.utils.parseEther("0.01");
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di gas sufficiente per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore:", error.message);
  }
}

main();
const { ethers } = require("ethers");

const PRIVATE_KEY = "0x40aad33f643b436f6b89e6fd78adf046c527d616"; // Inserisci direttamente la chiave privata corretta
const BASE_RPC_URL = "https://dawn-spring-hill.base-mainnet.quiknode.pro/85db06e7c4f5260e4128fdf91e8d03bf54b507d3"; // Inserisci direttamente l'URL RPC

console.log("PRIVATE_KEY:", PRIVATE_KEY);
console.log("BASE_RPC_URL:", BASE_RPC_URL);

async function main() {
  try {
    // Crea il provider con l'URL RPC
    console.log("Connettendosi alla rete...");
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    console.log("Connessione riuscita!");

    // Verifica la validità della chiave privata
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);

    // Controlla il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    // Controlla se il saldo è sufficiente per il deploy
    const requiredGas = ethers.ethers.utils.parseEther("0.01");
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di gas sufficiente per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore:", error.message);
  }
}

main();
require("dotenv").config();
const { ethers } = require("ethers");

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("BASE_RPC_URL:", process.env.BASE_RPC_URL);

async function main() {
  try {
    // Verifica che l'URL RPC sia definito
    if (!process.env.BASE_RPC_URL) {
      throw new Error("BASE_RPC_URL non è definito nel file .env");
    }

    // Crea il provider con l'URL RPC
    console.log("Connettendosi alla rete...");
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    console.log("Connessione riuscita!");

    // Verifica la validità della chiave privata
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);
    console.log("Creazione del provider completata.");
    console.log("Creazione del wallet completata.");

    // Controlla il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    // Controlla se il saldo è sufficiente per il deploy
    const requiredGas = ethers.ethers.utils.parseEther("0.01");
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di gas sufficiente per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore:", error.message);
  }
}

main();
require('dotenv').config();
const { ethers } = require('ethers');

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("BASE_RPC_URL:", process.env.BASE_RPC_URL);

async function main() {
  try {
    // Verifica che l'URL RPC sia definito
    if (!process.env.BASE_RPC_URL) {
      throw new Error("BASE_RPC_URL non è definito nel file .env");
    }

    // Crea il provider con l'URL RPC
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

    // Verifica la validità della chiave privata
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);

    // Controlla il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    // Controlla se il saldo è sufficiente per il deploy
    const requiredGas = ethers.ethers.utils.parseEther("0.01");
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di gas sufficiente per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore:", error.message);
  }
}

main();
require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL, {
  timeout: 10000, // Timeout di 10 secondi
});
if (error.code === 'TIMEOUT') {
  console.error("Errore: Timeout nella connessione al provider RPC. Verifica la tua connessione Internet o l'URL RPC.");
}

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("BASE_RPC_URL:", process.env.BASE_RPC_URL);
console.log("Script avviato con successo");
console.log("Chiave privata ricevuta:", privateKey);

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL); // Usa l'URL RPC della rete che vuoi testare

  try {
    // Verifica la validità della Private Key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Chiave privata valida! Indirizzo del wallet: ${wallet.address}`);

    // Controlla il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    // Controlla se il saldo è sufficiente per il deploy (esempio: 0.01 ETH richiesti)
    const requiredGas = ethers.ethers.utils.parseEther("0.01");
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di gas sufficiente per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error('Errore nella verifica della chiave privata o del saldo:', error.message);
  }
}

main();

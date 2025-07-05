require('dotenv').config();
const { ethers } = require('ethers');

async function checkConnection() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

  try {
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name}`);
  } catch (error) {
    console.error('Errore nella connessione al nodo:', error);
  }
}

checkConnection();

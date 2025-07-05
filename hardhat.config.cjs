require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Per favore, definisci PRIVATE_KEY nel file .env");
}

module.exports = {
  defaultNetwork: "hardhat", 
  solidity: {
    version: "0.8.26", // La versione del tuo compilatore, deve essere esatta
    settings: {
      optimizer: {
        enabled: true, // Abilita l'ottimizzatore per il deploy in produzione
        runs: 200,     // Numero di runs, valore comune
      },
    },
  },
  networks: {
    hardhat: {
      // CORREZIONE QUI: Aumenta il saldo iniziale per gli account di Hardhat Network
      // Questo risolve i problemi di "fondi insufficienti" nei test
      accounts: {
        count: 20, // Il numero di account di default che Hardhat genera
        initialBalance: "1000000000000000000000000000000" // 1000 miliardi di ETH/MATIC in Wei (10^21 ETH)
      }
    },
    myQuickNode: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    localhost: { url: "http://127.0.0.1:8545" },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    amoy: {
      url: process.env.AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
    base: {
      url: process.env.BASE_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      amoy: process.env.POLYGONSCAN_API_KEY, 
      // Se il nome del tuo contratto è diverso dal nome del file sorgente
      // Potresti dover aggiungere una entry specifica qui se Hardhat non lo risolve automaticamente
      // 'LHISA_LecceNFT': process.env.POLYGONSCAN_API_KEY, 
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
      { 
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/",
        },
      },
      { 
        network: "polygon", 
        chainId: 137,
        urls: {
          apiURL: "https://api.polygonscan.com/api",
          browserURL: "https://polygonscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

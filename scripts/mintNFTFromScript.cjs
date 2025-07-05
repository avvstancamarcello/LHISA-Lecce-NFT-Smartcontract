const { ethers } = require("hardhat"); // Usa Hardhat per ethers
require("dotenv").config(); // Carica le variabili d'ambiente dal file .env

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) {
        console.error("Errore: PRIVATE_KEY non definita nel file .env. Assicurati di averla configurata.");
        process.exit(1);
    }

    const QUICKNODE_MATIC_URL = process.env.QUICKNODE_MATIC_URL;
    if (!QUICKNODE_MATIC_URL) {
        console.error("Errore: QUICKNODE_MATIC_URL non definita nel file .env. Assicurati di averla configurata.");
        process.exit(1);
    }

    // Indirizzo del tuo smart contract LHI Lecce NFT (checksummed)
    const contractAddress = "0x6a6d5Dc29ad8ff23209186775873e123b31c26E9";

    // ABI minimale per le funzioni necessarie (mintNFT, e se vuoi, name)
    // È buona pratica includere solo le funzioni che userai in questo script per evitare ABI enormi
    const contractABI = [
        {
            "inputs": [
                { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
                { "internalType": "uint256", "name": "quantity", "type": "uint256" }
            ],
            "name": "mintNFT",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                { "internalType": "string", "name": "", "type": "string" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "name": "pricesInWei",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // Connettiti al provider di rete Polygon tramite Hardhat
    // Hardhat configurerà automaticamente il provider se hai QUICKNODE_MATIC_URL nel .env e hardhat.config.js
    const provider = new ethers.JsonRpcProvider(QUICKNODE_MATIC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Wallet connesso: ${wallet.address} (Saldo: ${ethers.formatEther(await provider.getBalance(wallet.address))} MATIC)`);

    // Crea un'istanza del contratto
    const nftContract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Dettagli del token da mintare
    const tokenIdToMint = 6;
    const quantityToMint = 1;

    try {
        // Ottieni il prezzo del token direttamente dal contratto
        console.log(`Recupero il prezzo per tokenId ${tokenIdToMint} dal contratto...`);
        const priceInWei = await nftContract.pricesInWei(tokenIdToMint);
        console.log(`Prezzo per tokenId ${tokenIdToMint}: ${ethers.formatEther(priceInWei)} MATIC (${priceInWei.toString()} WEI)`);

        const totalCostInWei = priceInWei * BigInt(quantityToMint); // Usa BigInt per i numeri grandi
        console.log(`Costo totale per ${quantityToMint} NFT (tokenId ${tokenIdToMint}): ${ethers.formatEther(totalCostInWei)} MATIC (${totalCostInWei.toString()} WEI)`);

        // Effettua il minting
        console.log(`Tentativo di minting per tokenId ${tokenIdToMint}, quantità ${quantityToMint}...`);
        const tx = await nftContract.mintNFT(tokenIdToMint, quantityToMint, {
            value: totalCostInWei // Invia il valore in WEI necessario per il mint
        });

        console.log(`Transazione di Mint inviata. Hash: ${tx.hash}`);
        console.log("Attendendo la conferma della transazione...");

        const receipt = await tx.wait(); // Attendi che la transazione venga minata
        console.log("Transazione confermata!");
        console.log(`Blocco: ${receipt.blockNumber}`);
        console.log(`Costo del gas utilizzato: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} MATIC`);

        console.log(`NFT(s) mintato(i) con successo!`);

        // Puoi anche provare a leggere il nome del contratto per ulteriore conferma
        const contractName = await nftContract.name();
        console.log(`Nome del Contratto: ${contractName}`);

    } catch (error) {
        console.error("--- ERRORE DURANTE IL MINTING ---");
        console.error(`Messaggio: ${error.message}`);
        console.error("Stack:", error.stack);

        // Se l'errore contiene un messaggio di revert, prova a decodificarlo
        if (error.data && error.data.message) {
            console.error("Messaggio di revert dal contratto:", error.data.message);
        } else if (error.reason) {
            console.error("Motivo del fallimento:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// scripts/mint_new_contract.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners(); // Il firmatario della transazione (dal tuo .env)

    // --- CONFIGURAZIONE PER IL MINT SUL CONTRATTO NUOVO E VERIFICATO ---
    // Indirizzo del tuo contratto LHISA_LecceNFT
    const CONTRACT_ADDRESS_NEW = "0x2a4364c0E9fc125D831257b289b70b0B16A02315"; 
    
    // NOME DELLA CLASSE DEL CONTRATTO (per caricare l'ABI dagli artifacts)
    const CONTRACT_NAME_NEW = "LHISA_LecceNFT"; 

    // Parametri per il Mint
    // *** ATTENZIONE: Questi sono i TOKEN ID VALIDI per il contratto NUOVO (multipli di 5, da 5 a 100) ***
    // Scegliamo tokenId 10, come esempio, e quantità 1.
    const TOKEN_ID_TO_MINT = 10; 
    const QUANTITY_TO_MINT = 1; 

    // Calcola il valore esatto da inviare (in Wei) per il contratto nuovo e tokenId 10
    // Prezzo per tokenId 'i' è 0.04 MATIC * i
    // Per tokenId 10, il prezzo è 0.04 * 10 = 0.4 MATIC
    const MINT_VALUE_MATIC = 0.4; 
    const MINT_VALUE_WEI = ethers.parseEther(MINT_VALUE_MATIC.toString()); // Converti in Wei (BigInt)

    console.log("------------------------------------------");
    console.log("Inizio l'operazione di Mint sul contratto LHISA_LecceNFT...");
    console.log("------------------------------------------");
    console.log("Account Firmatario:", signer.address);
    console.log("Contratto Target (LHISA_LecceNFT):", CONTRACT_ADDRESS_NEW);
    console.log("Token ID da Mintare:", TOKEN_ID_TO_MINT);
    console.log("Quantità da Mintare:", QUANTITY_TO_MINT);
    console.log("Valore da Inviare (MATIC):", MINT_VALUE_MATIC);
    console.log("Valore da Inviare (Wei):", MINT_VALUE_WEI.toString());
    console.log("------------------------------------------");

    // Ottieni l'istanza del contratto
    // getContractAt trova l'ABI dal nome del contratto e crea un'istanza all'indirizzo specificato.
    const contract = await ethers.getContractAt(CONTRACT_NAME_NEW, CONTRACT_ADDRESS_NEW, signer);

    // Esegui la transazione di Mint
    console.log("Invio transazione di Mint...");
    const tx = await contract.mintNFT(TOKEN_ID_TO_MINT, QUANTITY_TO_MINT, {
        value: MINT_VALUE_WEI // Invia il valore esatto
    });

    console.log("Transazione inviata, hash:", tx.hash);
    console.log("Attendendo conferma della transazione...");
    const receipt = await tx.wait(); // Attendi la conferma della transazione

    console.log("Transazione di Mint completata con successo!");
    console.log("Block Hash:", receipt.blockHash);
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Errore durante l'operazione di Mint:", error);
        process.exit(1);
    });

// scripts/update_cids.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    // IMPORTANTE: Assicurati che PRIVATE_KEY nel tuo .env corrisponda all'owner del contratto: 0xf9909c6CD90566BD56621EE0cAc42986ae334Ea3
    const [signer] = await ethers.getSigners(); 

    // --- CONFIGURAZIONE ---
    const CONTRACT_ADDRESS = "0x2a4364c0E9fc125D831257b289b70b0B16A02315"; 
    const CONTRACT_NAME = "LHISALecceNFT"; // Nome del contratto deployato (da abi.js)
    
    // --- CID per TokenID 10 ---
    const TOKEN_ID_10 = 10;
    const NEW_CID_10 = "bafybeigpqqaoft52a7dp2kkzcn5zapig7zgftcfrt2fbiqqnm55mwut6lq"; 

    // --- CID per TokenID 100 ---
    const TOKEN_ID_100 = 100;
    const NEW_CID_100 = "bafybeibzvith6ji34mzhb7mgdtascuhvczxvg3yyt3prlzg7n4f56qhhe";

    console.log("------------------------------------------");
    console.log("Inizio aggiornamento CID per Token ID 10 e 100...");
    console.log("------------------------------------------");
    console.log("Account Firmatario (deve essere l'owner):", signer.address);
    console.log("Contratto Target:", CONTRACT_ADDRESS);
    console.log(`Nuovo CID per Token ID ${TOKEN_ID_10}: ${NEW_CID_10}`);
    console.log(`Nuovo CID per Token ID ${TOKEN_ID_100}: ${NEW_CID_100}`);
    console.log("------------------------------------------");

    const contract = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS, signer);

    // Funzione helper per gestire l'aggiornamento e gli errori
    async function updateTokenCIDs(tokenId, newCid) {
        console.log(`Aggiornamento CID per Token ID ${tokenId}...`);
        try {
            // Aggiorna setEncryptedURI
            console.log(`Chiamata setEncryptedURI per Token ID ${tokenId}...`);
            let txEncrypted = await contract.setEncryptedURI(tokenId, newCid);
            console.log(`Transazione setEncryptedURI inviata (hash: ${txEncrypted.hash}).`);
            await txEncrypted.wait();
            console.log(`setEncryptedURI per Token ID ${tokenId} completato.`);

            // Aggiorna setTokenCID
            console.log(`Chiamata setTokenCID per Token ID ${tokenId}...`);
            let txTokenCID = await contract.setTokenCID(tokenId, newCid);
            console.log(`Transazione setTokenCID inviata (hash: ${txTokenCID.hash}).`);
            await txTokenCID.wait();
            console.log(`setTokenCID per Token ID ${tokenId} completato.`);

            console.log(`CID per Token ID ${tokenId} aggiornato con successo a ${newCid}!`);
        } catch (error) {
            console.error(`Errore durante l'aggiornamento del CID per Token ID ${tokenId}:`, error.message);
            if (error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("caller is not the owner")) {
                console.error("ATTENZIONE: Il firmatario non è l'owner del contratto. Assicurati che PRIVATE_KEY nel .env sia quella di 0xf9909c6CD90566BD56621EE0cAc42986ae334Ea3.");
            }
            process.exit(1); // Esci in caso di errore critico
        }
    }

    // Esegui l'aggiornamento per TokenID 10
    await updateTokenCIDs(TOKEN_ID_10, NEW_CID_10);

    // Esegui l'aggiornamento per TokenID 100
    await updateTokenCIDs(TOKEN_ID_100, NEW_CID_100);

    console.log("------------------------------------------");
    console.log("Tutte le operazioni di aggiornamento CID completate!");
    console.log("------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Errore irreversibile durante l'esecuzione dello script:", error);
        process.exit(1);
    });

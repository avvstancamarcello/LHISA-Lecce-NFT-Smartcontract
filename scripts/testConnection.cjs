// scripts/testConnection.cjs (Versione 6 - Test con provider.call diretto)
const hre = require("hardhat");
const { ethers, Interface } = require("ethers"); // Importa Interface
require("dotenv").config();

async function main() { // APERTURA { per main
    const contractAddress = "0x6a6d5c29ad8f23209186775873e123b31c26e9";

    console.log(`Rete target specificata: ${hre.network.name}`);
    let providerUrl;
    const networkConfig = hre.config.networks[hre.network.name];

    if (networkConfig && networkConfig.url) {
        providerUrl = networkConfig.url;
    } else if (hre.network.name === 'polygon' && process.env.QUICKNODE_MATIC_URL) {
        providerUrl = process.env.QUICKNODE_MATIC_URL;
        console.log(`URL RPC per la rete '${hre.network.name}' non trovato, utilizzo QUICKNODE_MATIC_URL da .env.`);
    } else {
        console.error(`URL RPC per la rete "${hre.network.name}" non trovato.`);
        return;
    }
    console.log(`Utilizzo dell'URL RPC: ${providerUrl}`);

    const provider = new ethers.JsonRpcProvider(providerUrl, 137); // Specifica chainId

    // Test getBlockNumber (molto importante che questo funzioni)
    try { // APERTURA { per try getBlockNumber
        console.log("Tentativo di chiamare provider.getBlockNumber()...");
        const blockNumber = await provider.getBlockNumber();
        console.log(`Numero blocco attuale: ${blockNumber}`);
    } catch (e) { // APERTURA { per catch getBlockNumber
        console.error("--- ERRORE chiamando provider.getBlockNumber(): ---", e.message);
        process.exitCode = 1;
        return;
    } // CHIUSURA } per catch getBlockNumber

    // Il signer non è necessario per provider.call a una view function,
    // ma lo definiamo se servisse per debug o altri test.
    if (!process.env.PRIVATE_KEY) { // APERTURA { per if PRIVATE_KEY
        console.warn("ATTENZIONE: La variabile d'ambiente PRIVATE_KEY non è definita nel file .env. Il signer non verrà creato.");
    } else { // APERTURA { per else PRIVATE_KEY
        const privateKeyRaw = process.env.PRIVATE_KEY;
        const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`Account (signer) disponibile: ${wallet.address}`);
    } // CHIUSURA } per else PRIVATE_KEY


    try { // APERTURA { per try interazione contratto
        console.log("Caricamento ABI del contratto da artifacts...");
        const contractArtifact = require("../artifacts/contracts/LHILecceNFT.sol/LHILecceNFT.json");
        const contractABI = contractArtifact.abi;
        console.log("ABI del contratto caricato con successo.");

        const iface = new Interface(contractABI);
        const calldata = iface.encodeFunctionData("name"); 

        console.log(`Tentativo di leggere il nome del contratto con provider.call diretto... Calldata: ${calldata}`);
        
        const result = await provider.call({
            to: contractAddress,
            data: calldata
        });
        console.log(`Risultato grezzo da provider.call: ${result}`);

        if (result === "0x" || result === null || result === undefined || result.length <= 2) { // APERTURA { per if risultato vuoto
            console.error(`Errore: provider.call ha restituito un risultato vuoto o nullo (${result}), impossibile decodificare.`);
            const code = await provider.getCode(contractAddress);
            if (code === "0x") { // APERTURA { per if code === "0x"
                console.error(`L'indirizzo ${contractAddress} non ha codice bytecode deployato sulla rete ${hre.network.name}. Verifica l'indirizzo e la rete.`);
            } // CHIUSURA } per if code === "0x"
        } else { // APERTURA { per else risultato vuoto
            const decodedResult = iface.decodeFunctionResult("name", result);
            console.log(`Nome del contratto letto con successo (da provider.call): ${decodedResult[0]}`);
            console.log("Test con provider.call diretto completato con successo.");
        } // CHIUSURA } per else risultato vuoto

    } catch (error) { // APERTURA { per catch interazione contratto
        console.error("--- ERRORE DURANTE IL TEST CON provider.call DIRETTO ---");
        console.error(`Messaggio: ${error.message}`);
        if (error.stack) { // APERTURA { per if error.stack
            console.error("Stack trace:", error.stack);
        } // CHIUSURA } per if error.stack
        console.error("-------------------------------------------------------");
        process.exitCode = 1;
    } // CHIUSURA } per catch interazione contratto
} // CHIUSURA } per main

main()
    .then(() => process.exit(0))
    .catch((error) => { // APERTURA { per catch di main()
        console.error(error);
        process.exit(1);
    }); // CHIUSURA } per catch di main()

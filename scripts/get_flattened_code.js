// scripts/get_flattened_code.js
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    // Specifica il percorso del tuo contratto principale
    const contractPath = "contracts/LHISALecceNFT.sol"; 

    // Hardhat ha un'utility interna per appiattire (flatten) i contratti.
    // Questo comando è solitamente usato internamente dal task 'verify'.
    // Non è un comando CLI diretto come 'npx hardhat flatten'.
    // Dobbiamo simulare la logica del task verify per ottenerlo.

    // Compila il contratto per assicurarsi che i percorsi siano risolti
    await hre.run("compile");

    // Ottieni l'elenco dei file sorgente risolti
    const { get } = hre.artifacts.getArtifactPathsSync; // This line might vary slightly based on hardhat version

    // Cerca il file sorgente del contratto specifico
    const files = await hre.artifacts.getBuildInfo(contractPath); // Get build info for the contract

    if (!files || !files.input || !files.input.sources) {
        console.error("Non è stato possibile ottenere le informazioni sul build per il contratto.");
        process.exit(1);
    }

    let flattenedCode = "";
    const sourceNames = Object.keys(files.input.sources).sort(); // Ordina per garantire output consistente

    // Concatena il codice di tutti i file sorgente in ordine di dipendenza
    // Nota: questo è un approccio semplificato; i tool di flattening reali gestiscono l'ordine delle import
    // e la deduplicazione in modo più sofisticato.
    // Per la verifica su Etherscan/Polygonscan, l'ordine non è sempre un problema critico se tutte le parti sono presenti.

    // Una soluzione più affidabile è prendere il contenuto dei file sorgente direttamente
    // e ordinarli. Ma la verifica di Etherscan/Polygonscan
    // si aspetta spesso un formato specifico quando il contratto importa librerie OpenZeppelin.

    // Proviamo a usare la funzionalità di `getContractAt` per ottenere l'ABI e il bytecode
    // e fare una verifica implicita che funzioni.

    // Metodo alternativo: Copia e incolla ogni file importato nel tuo contratto principale
    // Questo è il metodo manuale.

    // ***** METODO MIGLIORE PER LA VERIFICA MANUALE SU ETHERSCAN/POLYGONSCAN *****
    // Per ottenere il codice appiattito che Polygonscan si aspetta quando il tuo contratto
    // importa da `@openzeppelin/contracts`, la soluzione più affidabile è:
    // 1. Apri il tuo contratto `contracts/LHISALecceNFT.sol`
    // 2. Apri i file `@openzeppelin/contracts/...` che importi (Contesti, Ownable, ERC1155URIStorage)
    // 3. Incollali MANUALEmente, in ordine di dipendenza, nel tuo file `LHISALecceNFT.sol`
    //    (o crea un nuovo file temporaneo `LHISALecceNFT_flattened_manual.sol`)
    //    L'ordine dovrebbe essere:
    //    - Codice di `Context.sol`
    //    - Codice di `Ownable.sol` (che importa Context)
    //    - Codice di `ERC1155.sol` (che importa le sue dipendenze, ecc.)
    //    - Codice di `ERC1155URIStorage.sol` (che importa ERC1155)
    //    - Infine, il codice del tuo `LHISALecceNFT.sol`

    // Questa è la procedura che i plugin di flattening automatizzano.
    // Dato che hardhat-flatten non è disponibile, questa combinazione manuale è spesso necessaria.

    // Per il tuo specifico contratto:
    // LHISALecceNFT.sol importa:
    // "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol"
    // "@openzeppelin/contracts/access/Ownable.sol"

    // ERC1155URIStorage.sol importa:
    // "../ERC1155.sol"
    // "../../../utils/Strings.sol"

    // Ownable.sol importa:
    // "../utils/Context.sol"

    // Quindi, l'ordine di concatenazione manuale dovrebbe essere:
    // 1. Context.sol
    // 2. Ownable.sol
    // 3. Strings.sol
    // 4. ERC1155.sol (dovrà anche importare le sue utility, come ERC1155Utils, ERC165)
    // 5. ERC1155URIStorage.sol
    // 6. LHISALecceNFT.sol

    // Questo processo manuale è molto propenso a errori.

    // *** Soluzione Hardhat Interna (preferibile se funziona) ***
    // Hardhat ha un task interno `__get_flattened_source` che può essere usato.
    try {
        const flattenedSource = await hre.run("flatten:get-flattened-source", {
            files: [contractPath] // Array di percorsi ai file da appiattire
        });
        console.log(flattenedSource);
    } catch (e) {
        console.error("Errore durante l'appiattimento del codice sorgente:", e);
        console.log("\n--- ISTRUZIONI PER L'APPIATTIMENTO MANUALE ---");
        console.log("Dato che il flattening automatico ha fallito, dovrai combinare i file manualmente.");
        console.log("Copia e incolla il contenuto dei seguenti file, nell'ordine specificato, in un singolo file .sol per la verifica su Polygonscan:");
        console.log("1. node_modules/@openzeppelin/contracts/utils/Context.sol");
        console.log("2. node_modules/@openzeppelin/contracts/access/Ownable.sol");
        console.log("3. node_modules/@openzeppelin/contracts/utils/Strings.sol"); // Se importato indirettamente
        console.log("4. node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol");
        console.log("5. node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol");
        console.log("6. contracts/LHISALecceNFT.sol");
        console.log("\nAssicurati di includere anche gli import e i pragma di ogni file, ma senza duplicarli. Sarà un file molto lungo.");
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

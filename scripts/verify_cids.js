const fs = require('fs');
const path = require('path');

const METADATA_DIR = './'; // La directory corrente dove si trovano i file JSON
const SYNTHESIS_FILE = '20monete.json'; // Il tuo file di sintesi dei CID

async function verifyCIDs() {
    console.log("Inizio la verifica dei CID nei file JSON dei metadati...");

    // 1. Carica il file di sintesi dei CID (ora dovrebbe essere un array JSON valido)
    let synthesisDataArray;
    try {
        const synthesisData = fs.readFileSync(path.join(METADATA_DIR, SYNTHESIS_FILE), 'utf8');
        synthesisDataArray = JSON.parse(synthesisData); // Parsa direttamente come JSON valido
        
        // Verifica che sia un array
        if (!Array.isArray(synthesisDataArray)) {
            throw new Error("Il file di sintesi non è un array JSON valido.");
        }

        console.log(`✅ Caricato e parsato il file di sintesi: ${SYNTHESIS_FILE}`);
        console.log(`Trovati ${synthesisDataArray.length} blocchi JSON nel file di sintesi.`);

    } catch (error) {
        console.error(`❌ Errore nel caricamento o parsing di ${SYNTHESIS_FILE}:`, error.message);
        console.error("Assicurati che il file esista e sia un ARRAY JSON valido.");
        process.exit(1);
    }

    // Mappa i CID dal file di sintesi per un accesso più facile, associandoli al loro tokenId
    const synthesisCIDsMap = {};
    for (const item of synthesisDataArray) {
        const tokenIdAttr = item.attributes.find(attr => attr.trait_type === "Valore Numerico");
        if (!tokenIdAttr) {
            console.warn(`⚠️ Attenzione: Un blocco nel file di sintesi non ha l'attributo "Valore Numerico".`);
            continue;
        }
        const tokenId = tokenIdAttr.value;
        const imageUri = item.image;
        if (!imageUri || !imageUri.startsWith('ipfs://')) {
            console.warn(`⚠️ Attenzione: Il blocco per TokenID ${tokenId} nel file di sintesi non ha un campo 'image' valido con prefisso 'ipfs://'.`);
            continue;
        }
        const imageCid = imageUri.replace('ipfs://', '');
        synthesisCIDsMap[String(tokenId)] = imageCid;
    }


    // Array dei TokenID che ci aspettiamo
    const tokenIds = [];
    for (let i = 5; i <= 100; i += 5) {
        tokenIds.push(i);
    }

    let allCIDsMatch = true;

    for (const tokenId of tokenIds) {
        const jsonFileName = `${tokenId}.json`;
        const jsonFilePath = path.join(METADATA_DIR, jsonFileName);

        // Verifica che il CID esista nel file di sintesi per questo tokenId
        const expectedCidFromSynthesis = synthesisCIDsMap[String(tokenId)];
        if (!expectedCidFromSynthesis) {
            console.warn(`⚠️ Attenzione: Il TokenID ${tokenId} non ha un CID corrispondente nel file di sintesi ${SYNTHESIS_FILE}.`);
            allCIDsMatch = false;
            continue;
        }

        // 2. Carica e parsifica il file JSON di metadati individuale
        let metadata;
        try {
            const metadataData = fs.readFileSync(jsonFilePath, 'utf8');
            metadata = JSON.parse(metadataData);
        } catch (error) {
            console.error(`❌ Errore nel caricamento o parsing di ${jsonFileName}:`, error.message);
            console.error(`   - Assicurati che ${jsonFileName} esista e sia un JSON valido.`);
            allCIDsMatch = false;
            continue;
        }

        // 3. Estrai il CID dal campo 'image' del metadato
        const imageUri = metadata.image;
        if (!imageUri || !imageUri.startsWith('ipfs://')) {
            console.error(`❌ Errore: Il file ${jsonFileName} non contiene un campo 'image' valido con prefisso 'ipfs://'.`);
            allCIDsMatch = false;
            continue;
        }
        const actualCidInMetadata = imageUri.replace('ipfs://', '');

        // 4. Confronta i CID
        if (actualCidInMetadata === expectedCidFromSynthesis) {
            console.log(`✅ ${jsonFileName}: CID corrisponde. (${actualCidInMetadata})`);
        } else {
            console.error(`❌ ${jsonFileName}: CID NON CORRISPONDE!`);
            console.error(`   - Atteso (da ${SYNTHESIS_FILE}): ${expectedCidFromSynthesis}`);
            console.error(`   - Trovato (nel metadato):   ${actualCidInMetadata}`);
            allCIDsMatch = false;
        }
    }

    if (allCIDsMatch) {
        console.log("\n🎉 TUTTI I CID nei file JSON dei metadati corrispondono ai CID nel file di sintesi!");
    } else {
        console.log("\n⚠️ ATTENZIONE: Sono state trovate delle discrepanze nei CID. Controlla gli errori sopra.");
    }
}

verifyCIDs();

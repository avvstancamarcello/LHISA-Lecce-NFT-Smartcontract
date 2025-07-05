const fs = require("fs");
const path = require("path");

function createMetadata(cidsPath, keysPath, outputFolderPath) {
  const cids = JSON.parse(fs.readFileSync(cidsPath));
  const keys = JSON.parse(fs.readFileSync(keysPath));

  fs.mkdirSync(outputFolderPath, { recursive: true });

  Object.keys(cids).forEach((fileName, index) => {
    const metadata = {
      name: `NFT #${index + 1}`,
      description: "Descrizione dell'NFT",
      image: `ipfs://${cids[fileName]}`,
      encryptionKey: keys[fileName],
    };

    const metadataPath = path.join(outputFolderPath, `${index + 1}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadati creati: ${metadataPath}`);
  });
}

const cidsPath = process.argv[2]; // Primo argomento: file dei CID
const keysPath = process.argv[3]; // Secondo argomento: file delle chiavi
const outputFolderPath = process.argv[4]; // Terzo argomento: cartella di output

if (!cidsPath || !keysPath || !outputFolderPath) {
  console.error("Errore: specifica il file dei CID, delle chiavi e la cartella di output.");
  process.exit(1);
}

createMetadata(cidsPath, keysPath, outputFolderPath);

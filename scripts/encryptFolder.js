const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function encryptFile(inputFilePath, outputFilePath, secretKey) {
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, Buffer.alloc(16, 0)); // Inizializza il vettore IV
  const input = fs.createReadStream(inputFilePath);
  const output = fs.createWriteStream(outputFilePath);

  input.pipe(cipher).pipe(output);

  output.on("finish", () => {
    console.log(`File crittografato: ${outputFilePath}`);
  });
}

function encryptFolderRecursive(folderPath, outputFolderPath, secretKey) {
  fs.mkdirSync(outputFolderPath, { recursive: true }); // Crea la cartella di output se non esiste

  fs.readdirSync(folderPath, { withFileTypes: true }).forEach((entry) => {
    const inputPath = path.join(folderPath, entry.name);
    const outputPath = path.join(outputFolderPath, `${entry.name}.enc`);

    if (entry.isDirectory()) {
      // Ricorsione per le sottocartelle
      encryptFolderRecursive(inputPath, path.join(outputFolderPath, entry.name), secretKey);
    } else if (entry.isFile()) {
      encryptFile(inputPath, outputPath, secretKey);
    }
  });
}

// Esempio di utilizzo
const folderPath = process.argv[2]; // Primo argomento: cartella di input
const outputFolderPath = process.argv[3]; // Secondo argomento: cartella di output

if (!folderPath || !outputFolderPath) {
  console.error("Errore: specifica la cartella di input e di output.");
  process.exit(1);
}

const secretKey = crypto.randomBytes(32); // Genera una chiave segreta a 256 bit
encryptFolderRecursive(folderPath, outputFolderPath, secretKey);

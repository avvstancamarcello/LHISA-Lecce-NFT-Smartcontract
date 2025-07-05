import crypto from "crypto";
import fs from "fs";
import path from "path";

console.log("Script avviato con successo");
console.log("Cartella di input:", process.argv[2]);
console.log("Cartella di output:", process.argv[3]);

function encryptFileWithUniqueKey(inputFilePath, outputFilePath) {
  try {
    const secretKey = crypto.randomBytes(32); // Genera una chiave unica per ogni file
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, Buffer.alloc(16, 0)); // Inizializza il vettore IV
    const input = fs.createReadStream(inputFilePath);
    const output = fs.createWriteStream(outputFilePath);

    input.pipe(cipher).pipe(output);

    output.on("finish", () => {
      console.log(`File crittografato: ${outputFilePath}`);
      console.log(`Chiave segreta per ${path.basename(outputFilePath)}: ${secretKey.toString("hex")}`);
    });

    return secretKey.toString("hex"); // Restituisce la chiave segreta
  } catch (error) {
    console.error(`Errore durante la crittografia del file ${inputFilePath}:`, error.message);
    throw error;
  }
}

function encryptFolderWithUniqueKeys(folderPath, outputFolderPath) {
  try {
    console.log(`Inizio crittografia della cartella: ${folderPath}`);
    fs.mkdirSync(outputFolderPath, { recursive: true }); // Crea la cartella di output se non esiste

    const keys = {}; // Per salvare le chiavi segrete per ciascun file

    fs.readdirSync(folderPath).forEach((file) => {
      const inputFilePath = path.join(folderPath, file);
      const outputFilePath = path.join(outputFolderPath, `${file}.enc`);

      if (fs.lstatSync(inputFilePath).isFile()) {
        console.log(`Crittografia del file: ${inputFilePath}`);
        const secretKey = encryptFileWithUniqueKey(inputFilePath, outputFilePath);
        keys[file] = secretKey; // Associa il file alla sua chiave
      }
    });

    // Salva le chiavi in un file JSON
    const keysFilePath = path.join(outputFolderPath, "keys.json");
    fs.writeFileSync(keysFilePath, JSON.stringify(keys, null, 2));
    console.log(`Chiavi salvate in ${keysFilePath}`);
  } catch (error) {
    console.error("Errore durante la crittografia della cartella:", error.message);
    throw error;
  }
}

// Esempio di utilizzo
const folderPath = process.argv[2]; // Primo argomento: cartella di input
const outputFolderPath = process.argv[3]; // Secondo argomento: cartella di output

if (!folderPath || !outputFolderPath) {
  console.error("Errore: specifica la cartella di input e di output.");
  process.exit(1);
}

encryptFolderWithUniqueKeys(folderPath, outputFolderPath);

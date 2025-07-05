const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

async function uploadFileToIPFS(filePath) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const headers = {
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
    ...data.getHeaders(),
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.IpfsHash; // Restituisce il CID
  } catch (error) {
    console.error(`Errore durante il caricamento di ${filePath}:`, error.message);
    throw error;
  }
}

async function uploadFolderToIPFS(folderPath) {
  const cids = {};

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (fs.lstatSync(filePath).isFile()) {
      console.log(`Caricamento del file: ${filePath}`);
      const cid = await uploadFileToIPFS(filePath);
      cids[file] = cid;
      console.log(`File caricato: ${file}, CID: ${cid}`);
    }
  }

  const cidsFilePath = path.join(folderPath, "cids.json");
  fs.writeFileSync(cidsFilePath, JSON.stringify(cids, null, 2));
  console.log(`CIDs salvati in ${cidsFilePath}`);
}

const folderPath = process.argv[2]; // Primo argomento: cartella di input

if (!folderPath) {
  console.error("Errore: specifica la cartella da caricare su IPFS.");
  process.exit(1);
}

uploadFolderToIPFS(folderPath);

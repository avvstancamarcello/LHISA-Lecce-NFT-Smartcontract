const axios = require("axios");
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

async function verifyPinataAPI() {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error("Errore: PINATA_API_KEY o PINATA_SECRET_KEY non sono definiti nel file .env.");
    process.exit(1);
  }

  const url = "https://api.pinata.cloud/data/testAuthentication";

  try {
    const response = await axios.get(url, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    if (response.status === 200) {
      console.log("Chiavi API valide! Connessione a Pinata riuscita.");
    } else {
      console.error("Errore: Connessione a Pinata fallita. Verifica le chiavi API.");
    }
  } catch (error) {
    console.error("Errore durante la verifica delle chiavi API:", error.message);
  }
}

verifyPinataAPI();

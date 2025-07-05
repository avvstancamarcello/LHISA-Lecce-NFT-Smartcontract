require("dotenv").config();
const axios = require("axios");

const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;

if (!COINMARKET_API_KEY) {
  console.error("Errore: COINMARKET_API_KEY non è definito nel file .env.");
  process.exit(1);
}

async function verifyCoinMarketAPI() {
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";

  try {
    const response = await axios.get(url, {
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKET_API_KEY,
      },
      params: {
        start: 1,
        limit: 1,
        convert: "EUR",
      },
    });

    if (response.status === 200) {
      console.log("Chiave API valida! Connessione a CoinMarketCap riuscita.");
      console.log("Esempio di risposta:", response.data.data[0]);
    } else {
      console.error("Errore: Connessione a CoinMarketCap fallita. Verifica la chiave API.");
    }
  } catch (error) {
    console.error("Errore durante la verifica della chiave API:", error.message);
  }
}

verifyCoinMarketAPI();

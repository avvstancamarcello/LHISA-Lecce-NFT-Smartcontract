require("dotenv").config();
const axios = require("axios");

const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;

if (!COINMARKET_API_KEY) {
  console.error("Errore: COINMARKET_API_KEY non è definito nel file .env.");
  process.exit(1);
}

async function getEthereumPrice() {
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
  const params = {
    symbol: "ETH",
    convert: "EUR", // Converti in euro
  };

  const headers = {
    "X-CMC_PRO_API_KEY": COINMARKET_API_KEY,
  };

  try {
    const response = await axios.get(url, { headers, params });
    const ethPriceInEUR = response.data.data.ETH.quote.EUR.price;

    console.log(`Il valore attuale di Ethereum è: €${ethPriceInEUR.toFixed(2)}`);

    // Esempio: calcolo per 0.003054374226571047 ETH
    const ethAmount = 0.003054374226571047;
    const equivalentInEUR = ethAmount * ethPriceInEUR;

    console.log(`L'equivalente di ${ethAmount} ETH in euro è: €${equivalentInEUR.toFixed(2)}`);
  } catch (error) {
    console.error("Errore durante il recupero del valore di Ethereum:", error.message);
  }
}

getEthereumPrice();

const dotenv = require("dotenv");

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("Errore: PRIVATE_KEY non definita nel file .env");
  process.exit(1);
}

if (PRIVATE_KEY.startsWith("0x") && PRIVATE_KEY.length === 66) {
  console.log("La PRIVATE_KEY è valida.");
} else {
  console.error("Errore: La PRIVATE_KEY non è valida. Deve iniziare con '0x' e contenere 64 caratteri esadecimali.");
  process.exit(1);
}

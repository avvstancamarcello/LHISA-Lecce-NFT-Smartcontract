// scripts/deploy.cjs
require("dotenv").config();
const { ethers } = require("hardhat"); // Assicurati che 'hre' sia disponibile, potrebbe servire 'require("hardhat")' se usi hre.run

async function main() {
  const [deployer] = await ethers.getSigners(); // L'account che esegue il deploy e paga il gas

  // --- PARAMETRI CRUCIALI PER IL DEPLOY ---
  // Questo è il CID EFFETTIVO della cartella dei metadati che hai caricato su Pinata.
  // Assicurati che Pinata fornisca l'accesso pubblico a questo CID.
  const baseURI = "ipfs://bafybeidxlbnyoz4dyx5k5ydjya4kf7wsq6gx72vxhpzbdeda54w4ya3xsy/"; 
  
  // NOME DELLA CLASSE DEL CONTRATTO SOLICITY (con underscore)
  const CONTRACT_NAME = "LHISA_LecceNFT";

  // --- Indirizzi e Percentuali passati al costruttore del contratto Solidity ---
  // NOTA: Il costruttore del tuo contratto LHISA_LecceNFT ora prende:
  // (string memory _baseURI, address _ownerAddress, address _creatorWalletAddress)
  const DEPLOY_OWNER_ADDRESS = deployer.address; // L'owner del contratto deployato sarà il deployer
  const DEPLOY_CREATOR_WALLET_ADDRESS = "0xf18c4cC01F72b50B389252e4d84AA376649Eb347"; // L'indirizzo del creator wallet per il deploy reale

  // I seguenti console.log mostrano i valori usati per il deploy
  console.log("------------------------------------------");
  console.log("Inizio il Deploy del Contratto Smart LHISA-LecceNFT...");
  console.log("------------------------------------------");
  console.log("Account Deployer (firmatario della transazione):", deployer.address);
  console.log("Base URI configurato per i metadati NFT:", baseURI);
  console.log("Owner del Contratto (sarà dopo il deploy):", DEPLOY_OWNER_ADDRESS);
  console.log("Creator Wallet (sarà dopo il deploy):", DEPLOY_CREATOR_WALLET_ADDRESS);
  // La percentuale creatorSharePercentage è hardcoded nel contratto, non qui.
  console.log("Creator Share Percentage (hardcoded nel contratto): 6%"); 
  console.log("------------------------------------------");

  // Ottieni la Factory del contratto dal nome della CLASSE Solidity
  const ContractFactory = await ethers.getContractFactory(CONTRACT_NAME);
  
  // Esegui il deploy del contratto.
  // Passiamo baseURI, DEPLOY_OWNER_ADDRESS e DEPLOY_CREATOR_WALLET_ADDRESS come argomenti al costruttore.
  const contract = await ContractFactory.deploy(baseURI, DEPLOY_OWNER_ADDRESS, DEPLOY_CREATOR_WALLET_ADDRESS);

  await contract.waitForDeployment(); // Attendi che il contratto sia effettivamente deployato

  const contractAddress = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployato su indirizzo: ${contractAddress}`);

  console.log("Attendendo 5 blocchi per la conferma della transazione prima della verifica...");
  await contract.deploymentTransaction().wait(5);

  console.log("------------------------------------------");
  console.log("Avvio la verifica automatica del contratto su Polygonscan...");
  try {
    // Nota: 'hre' non è definito direttamente se si usa solo '{ ethers }'.
    // È necessario aggiungere 'const hre = require("hardhat");' all'inizio del file
    // se non l'hai già fatto. Oltre a 'require("@nomicfoundation/hardhat-toolbox");' nel config.
    await hre.run("verify:verify", {
      address: contractAddress,
      // Argomenti del costruttore per la verifica devono corrispondere a quelli passati al deploy
      constructorArguments: [
        baseURI,
        DEPLOY_OWNER_ADDRESS,
        DEPLOY_CREATOR_WALLET_ADDRESS
      ],
    });
    console.log("Contratto verificato con successo su Polygonscan!");
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contratto già verificato.");
    } else {
      console.error("Errore durante la verifica del contratto:", e);
    }
  }
  console.log("------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Errore durante il deploy o la verifica:", error);
    process.exit(1);
  });

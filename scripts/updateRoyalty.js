// scripts/updateRoyalty.js
const { ethers } = require("hardhat");

async function main() {
  // Inserisci l'indirizzo del contratto già deployato su Polygon
  const contractAddress = "INSERISCI_QUI_L_INDIRIZZO_DEL_CONTRATTO";
  // Nuovo destinatario delle royalties (può essere il creator o altro wallet)
  const newRoyaltyReceiver = "INSERISCI_QUI_L_INDIRIZZO_DEL_DESTINATARIO";
  // Imposta la percentuale di royalties (in basis points: 100 = 1%)
  const newRoyaltyBps = 25; // Esempio: 0.25%

  // Recupera il contratto e il signer (owner)
  const [deployer] = await ethers.getSigners();
  const ContractFactory = await ethers.getContractFactory("LHISA_LecceNFT");
  const contract = await ContractFactory.attach(contractAddress);

  // Aggiorna le royalties
  const tx = await contract.connect(deployer).setRoyaltyInfo(newRoyaltyReceiver, newRoyaltyBps);
  await tx.wait();

  console.log(`Royalties aggiornate! Receiver: ${newRoyaltyReceiver}, Percentuale: ${newRoyaltyBps / 100}%`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

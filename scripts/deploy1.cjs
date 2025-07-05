require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const baseURI = process.env.BASE_URI || "ipfs://QmExampleHash/";
  const owner = process.env.OWNER_WALLET && process.env.OWNER_WALLET !== "" ? process.env.OWNER_WALLET : deployer.address;
  const paymentToken = process.env.PAYMENT_TOKEN || "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

  console.log("DEBUG - baseURI:", baseURI, typeof baseURI);
  console.log("DEBUG - owner:", owner, typeof owner);
  console.log("DEBUG - paymentToken:", paymentToken, typeof paymentToken);

  console.log(`Deploying with baseURI: ${baseURI}, owner: ${owner}, paymentToken: ${paymentToken}`);

  const ContractFactory = await ethers.getContractFactory("LHILecceNFT");
  console.log("Sending deployment transaction...");

  const contract = await ContractFactory.deploy(baseURI, owner, paymentToken);
  await contract.deployed();
  console.log("Contratto deployato all'indirizzo:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
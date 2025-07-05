// scripts/encode_constructor.js
const { ethers } = require("hardhat"); // Importa ethers da hardhat

async function main() {
    // L'UNICO argomento del costruttore del tuo contratto LHISALecceNFT è _baseURI
    const baseURI = "ipfs://bafybeidxlbnyoz4dyx5k5ydjya4kf7wsq6gx72vxhpzbdeda54w4ya3xsy/";

    // Ottieni l'ABI del tuo contratto
    // Hardhat ha già compilato il contratto e generato l'ABI negli artifacts
    const artifact = await hre.artifacts.readArtifact("LHISALecceNFT");
    const contractAbi = artifact.abi;

    // Trova la definizione del costruttore nell'ABI
    const constructorAbi = contractAbi.find(item => item.type === 'constructor');

    if (!constructorAbi) {
        console.error("Errore: Definizione del costruttore non trovata nell'ABI del contratto.");
        process.exit(1);
    }

    // Crea un'interfaccia ethers.js dal frammento del costruttore
    const iface = new ethers.Interface([constructorAbi]);

    // Codifica gli argomenti
    const encodedArguments = iface.encodeDeploy([baseURI]);

    console.log("------------------------------------------");
    console.log("Argomenti del costruttore ABI-encoded:");
    console.log(encodedArguments);
    console.log("------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Errore durante la codifica degli argomenti del costruttore:", error);
        process.exit(1);
    });

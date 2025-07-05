// scripts/mint-lhinft.js

const hre = require("hardhat");

const ethers = hre.ethers;



async function main() {

    // --- CONFIGURAZIONE UTENTE ---

    const contractAddress = "0x6a6d5c29ad8f23209186775873e123b31c26e9"; // <--- METTI QUI L'INDIRIZZO DEL TUO CONTRATTO DEPLOYATO

    const tokenIdToMint = 15;    // <--- Token ID da mintare

    const quantityToMint = 1;    // <--- Quantità da mintare

    const payWithNativeCurrency = true; // <--- true per pagare con MATIC, false per pagare con token ERC20



    console.log("Inizio script di minting...");



    // Ottieni il signer (portafoglio) dalla configurazione di Hardhat per la rete specificata

    const [signer] = await ethers.getSigners();

    console.log(`Account utilizzato per il minting: ${signer.address}`);

    const balance = await ethers.provider.getBalance(signer.address);

    console.log(`Saldo dell'account: ${ethers.formatEther(balance)} MATIC`);



    if (balance < ethers.parseEther("0.1") && payWithNativeCurrency) { // Controllo base del saldo

        console.warn("Attenzione: il saldo MATIC dell'account è basso.");

    }



    // Carica l'istanza del contratto

    // Assicurati che il nome "LHILecceNFT" corrisponda esattamente al nome del tuo contratto

    const LHILecceNFT = await ethers.getContractFactory("LHILecceNFT");

    const nftContract = LHILecceNFT.attach(contractAddress);

    console.log(`Connesso al contratto LHILecceNFT all'indirizzo: ${contractAddress}`);



    let transactionOptions = {};

    let totalCostInWei;



    // Determina il costo e le opzioni di transazione

    const pricePerTokenInWei = await nftContract.pricesInWei(tokenIdToMint);

    if (pricePerTokenInWei == 0 && tokenIdToMint > 0) { // Controllo se il prezzo è impostato

        console.error(`Errore: il prezzo per tokenId ${tokenIdToMint} non è impostato o è zero nel contratto.`);

        return;

    }

    totalCostInWei = BigInt(pricePerTokenInWei) * BigInt(quantityToMint);



    if (payWithNativeCurrency) {

        transactionOptions = { value: totalCostInWei };

        console.log(`Tentativo di mint per tokenId: ${tokenIdToMint}, quantity: ${quantityToMint}`);

        console.log(`Pagamento con valuta nativa (MATIC). Costo totale: ${ethers.formatEther(totalCostInWei)} MATIC.`);

    } else {

        // Pagamento con token ERC20

        // IMPORTANTE: Questo script NON gestisce l'approvazione del token ERC20.

        // DEVI aver già approvato il contratto NFT a spendere i tuoi token ERC20.

        console.log(`Tentativo di mint per tokenId: ${tokenIdToMint}, quantity: ${quantityToMint}`);

        console.log(`Pagamento con token ERC20. Costo totale (in unità del token): ${totalCostInWei.toString()}`);

        console.log("ASSICURATI DI AVER APPROVATO IL CONTRATTO A SPENDERE QUESTO IMPORTO DEL TOKEN DI PAGAMENTO!");

        // transactionOptions resta vuoto per msg.value se si paga con ERC20

    }



    // Chiama la funzione mintNFT

    // Nota: il parametro 'payWithToken' del contratto è l'inverso di 'payWithNativeCurrency'

    // Se payWithNativeCurrency è true => il contratto payWithToken deve essere false

    // Se payWithNativeCurrency è false => il contratto payWithToken deve essere true

    const contractPayWithTokenFlag = !payWithNativeCurrency;



    try {

        console.log(`Chiamata a mintNFT con parametri: tokenId=${tokenIdToMint}, quantity=${quantityToMint}, payWithToken=${contractPayWithTokenFlag}`);

        if (payWithNativeCurrency) {

            console.log(`Valore (msg.value) inviato: ${ethers.formatEther(totalCostInWei)} MATIC`);

        }



        const tx = await nftContract.mintNFT(

            tokenIdToMint,

            quantityToMint,

            contractPayWithTokenFlag, // Questo è il parametro 'payWithToken' del contratto

            transactionOptions

        );



        console.log(`Transazione inviata! Hash: ${tx.hash}`);

        console.log("In attesa della conferma della transazione...");



        // Attendi la conferma (puoi specificare un numero di conferme se necessario)

        const receipt = await tx.wait(1);

        console.log("Transazione confermata con successo!");

        // console.log("Dettagli ricevuta:", receipt); // Puoi decommentare per vedere l'intera ricevuta



        // Cerca l'evento NFTMinted (opzionale, ma utile per conferma)

        if (receipt.logs) {

            const eventInterface = new ethers.Interface(["event NFTMinted (address indexed buyer, uint256 tokenId, uint256 quantity, uint256 price, string encryptedURI)"]);

            receipt.logs.forEach(log => {

                try {

                    // Confronta il topic0 con quello dell'evento NFTMinted

                    if (log.topics[0] === eventInterface.getEvent("NFTMinted").topicHash) {

                         const decodedLog = eventInterface.decodeEventLog("NFTMinted", log.data, log.topics);

                         console.log("Evento NFTMinted rilevato:");

                         console.log(`  Compratore: ${decodedLog.buyer}`);

                         console.log(`  Token ID: ${decodedLog.tokenId.toString()}`);

                         console.log(`  Quantità: ${decodedLog.quantity.toString()}`);

                         console.log(`  Prezzo (per unità): ${ethers.formatEther(decodedLog.price)}`);

                         console.log(`  URI Criptato: ${decodedLog.encryptedURI}`);

                    }

                } catch (e) {

                    // Ignora i log che non possono essere decodificati con questa interfaccia

                }

            });

        }





    } catch (error) {

        console.error("\n--- ERRORE DURANTE LA TRANSAZIONE DI MINTING ---");

        console.error(`Messaggio: ${error.message}`);



        // Prova a decodificare l'errore da revert se disponibile

        if (error.data) {

            console.error(`Dati dell'errore: ${error.data}`);

            // Potrebbe essere un errore con un custom error del contratto

        }

        if (error.transactionHash) {

            console.error(`Hash della transazione fallita: ${error.transactionHash}`);

        }

        console.error("---------------------------------------------\n");

        process.exitCode = 1; // Esce con codice di errore

    }

}



main()

    .then(() => process.exit(0))

    .catch((error) => {

        console.error(error);

        process.exit(1);

    });

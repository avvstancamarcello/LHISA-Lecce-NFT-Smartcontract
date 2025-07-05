const hre = require("hardhat");
const { expect } = require("chai");

// Il nome del describe DEVE corrispondere al nuovo nome della CLASSE del contratto Solidity
describe("LHISA_LecceNFT", function () { 
    let contract;
    let owner; 
    let creator; 
    let addr1; 
    let addr2; 

    // QUESTA BASE_URI DEVE CORRISPONDERE ESATTAMENTE A QUELLA USATA NEL deploy.cjs
    const BASE_URI = "ipfs://bafybeidxlbnyoz4dyx5k5ydjya4kf7wsq6gx72vxhpzbdeda54w4ya3xsy/"; 
    // NON PIÙ NECESSARI come costanti se owner/creator sono i signers generati da Hardhat.
    // Li lascio come commento per riferimento se servono per il deploy reale e non si vuole usare signers[0]/[1]
    // const CROWDFUNDING_WALLET = "0xf9909c6CD90566BD56621EE0cAc42986ae334Ea3";
    // const CREATOR_WALLET = "0xf18c4cC01F72b50B389252e4d84AA376649Eb347";
    const CREATOR_SHARE_PERCENTAGE = 6; 

    // Ogni test (it block) avrà un deploy fresco e signers con bilanci iniziali.
    beforeEach(async function () {
        // Hardhat Network genera signers con balance enorme da hardhat.config.cjs.
        // Assegnamo i primi signers generati come owner, creator, addr1, addr2.
        const signers = await hre.ethers.getSigners();
        owner = signers[0]; 
        creator = signers[1]; 
        addr1 = signers[2]; 
        addr2 = signers[3];

        // Non c'è più bisogno di impersonare o fare setBalance/sendTransaction per finanziare
        // owner, creator, addr1, addr2 qui, perché signers[0]...[3]
        // avranno già il loro initialBalance enorme configurato in hardhat.config.cjs.
        // Le righe per finanziare owner, creator, addr1, addr2 sono state rimosse da qui
        // perché Hardhat Network finanzia direttamente signers[0], [1], [2], [3] ecc.
        // con il grande initialBalance del hardhat.config.cjs.

        // Per i test che usano owner/creator, addr1, addr2 che spendono molti fondi:
        // si assume che il loro saldo iniziale (da hardhat.config.cjs) sia sufficiente.
        // Se in un test specifico un signer esaurisce i fondi (come addr1 nel burn test),
        // finanziamo quell'addr specificamente in un beforeEach del suo describe block,
        // prelevando fondi dall'owner (che è signers[0] con un balance enorme).

        const LHISALecceNFT = await hre.ethers.getContractFactory("LHISA_LecceNFT"); 
        
        contract = await LHISALecceNFT.deploy(BASE_URI, owner.address, creator.address);
        await contract.waitForDeployment();
    });

    describe("Inizializzazione e Proprietà", function () {
        it("Dovrebbe impostare il nome e il simbolo del contratto correttamente", async function () {
            expect(await contract.name()).to.equal("LHISA-LecceNFT"); 
            expect(await contract.symbol()).to.equal("LHISA");
        });

        it("Dovrebbe impostare owner, creatorWallet e creatorSharePercentage correttamente", async function () {
            expect(await contract.owner()).to.equal(owner.address); 
            expect(await contract.creatorWallet()).to.equal(creator.address); 
            expect(await contract.creatorSharePercentage()).to.equal(BigInt(CREATOR_SHARE_PERCENTAGE)); 
            expect(await contract.withdrawWallet()).to.equal(owner.address); 
        });

        it("Dovrebbe inizializzare i tokenID validi, i prezzi e le supply massime correttamente", async function () {
            const tokenId = 5;
            expect(await contract.isValidTokenId(tokenId)).to.be.true;
            expect(await contract.maxSupply(tokenId)).to.equal(2000n); 
            expect(await contract.pricesInWei(tokenId)).to.equal(hre.ethers.parseUnits("0.2", "ether"));

            const tokenId2 = 100;
            expect(await contract.isValidTokenId(tokenId2)).to.be.true;
            expect(await contract.maxSupply(tokenId2)).to.equal(2000n); 
            expect(await contract.pricesInWei(tokenId2)).to.equal(hre.ethers.parseUnits("4", "ether"));

            const invalidTokenId = 1;
            expect(await contract.isValidTokenId(invalidTokenId)).to.be.false;
            const anotherInvalidTokenId = 6;
            expect(await contract.isValidTokenId(anotherInvalidTokenId)).to.be.false;
        });

        it("Dovrebbe avere gli URI/CID inizializzati correttamente per i token ID validi", async function () {
            const tokenId = 50;
            const tokenCID = "bafybeiaexxgiukd46px63gjvggltykt3uoqs74ryvj5x577uvge66ntr2q";
            expect(await contract.tokenCIDs(tokenId)).to.equal(tokenCID);
            expect(await contract.uri(tokenId)).to.equal(`${BASE_URI}${tokenId}.json`); 

            expect(await contract.encryptedURIs(tokenId)).to.equal(tokenCID);
            expect(await contract.getEncryptedURI(tokenId)).to.equal(tokenCID);
        });
    });

    describe("Funzionalità di Minting (mintNFT)", function () {
        it("Dovrebbe permettere il minting e dividere i fondi correttamente", async function () {
            const tokenId = 10;
            const quantity = 2;
            const pricePerToken = await contract.pricesInWei(tokenId);
            const totalPrice = pricePerToken * BigInt(quantity);

            const initialOwnerBalance = await hre.ethers.provider.getBalance(owner.address);
            const initialCreatorBalance = await hre.ethers.provider.getBalance(creator.address);

            await expect(contract.connect(addr1).mintNFT(tokenId, quantity, { value: totalPrice }))
                .to.emit(contract, "NFTMinted")
                .withArgs(addr1.address, BigInt(tokenId), BigInt(quantity), pricePerToken, await contract.getEncryptedURI(tokenId));

            const balanceNFT = await contract.balanceOf(addr1.address, tokenId);
            expect(balanceNFT).to.equal(BigInt(quantity));

            const creatorShareExpected = (totalPrice * BigInt(CREATOR_SHARE_PERCENTAGE)) / 100n;
            const crowdfundingShareExpected = totalPrice - creatorShareExpected;

            expect(await hre.ethers.provider.getBalance(creator.address)).to.be.closeTo(initialCreatorBalance + creatorShareExpected, hre.ethers.parseUnits("0.001", "ether"));

            const contractBalanceAfterMint = await hre.ethers.provider.getBalance(await contract.getAddress());
            expect(contractBalanceAfterMint).to.equal(crowdfundingShareExpected);
        });

        it("Dovrebbe revertire se la quantità di ETH/MATIC inviata è errata", async function () {
            const tokenId = 5;
            const quantity = 1;
            const price = await contract.pricesInWei(tokenId);
            const incorrectPrice = price + 1n; 

            await expect(
                contract.connect(addr1).mintNFT(tokenId, quantity, { value: incorrectPrice })
            ).to.be.revertedWith("Incorrect ETH amount"); 
        });

        it("Dovrebbe revertire se si supera la supply massima", async function () {
            const tokenId = 5;
            const maxSupply = await contract.maxSupply(tokenId); 
            const price = await contract.pricesInWei(tokenId);

            // Mintiamo quasi tutta la supply per addr1
            const quantityToFill = maxSupply - 1n; 
            const totalPriceToFill = price * quantityToFill;
            await contract.connect(addr1).mintNFT(tokenId, quantityToFill, { value: totalPriceToFill });

            // Ora proviamo a mintare 2 token, superando di 1 la maxSupply
            const quantityToExceed = 2n;
            const totalPriceToExceed = price * quantityToExceed;

            await expect(
                contract.connect(addr1).mintNFT(tokenId, quantityToExceed, { value: totalPriceToExceed })
            ).to.be.revertedWith("Exceeds max supply");

            // Verifica che non abbia mintato i 2 token
            expect(await contract.balanceOf(addr1.address, tokenId)).to.equal(quantityToFill);
        });

        it("Dovrebbe revertire se il tokenId non è valido", async function () {
            const invalidTokenId = 1;
            const quantity = 1;
            const dummyPrice = hre.ethers.parseEther("0.001"); 

            await expect(
                contract.connect(addr1).mintNFT(invalidTokenId, quantity, { value: dummyPrice })
            ).to.be.revertedWith("Invalid tokenId");
        });
    });

    describe("Funzionalità di Prelievo (withdrawFunds)", function () {
        it("Dovrebbe permettere all'owner di prelevare i fondi di crowdfunding", async function () {
            const tokenId = 5;
            const quantity = 1;
            const price = await contract.pricesInWei(tokenId);

            await contract.connect(addr1).mintNFT(tokenId, quantity, { value: price });

            const contractBalanceBeforeWithdraw = await hre.ethers.provider.getBalance(await contract.getAddress());
            const ownerBalanceBeforeWithdraw = await hre.ethers.provider.getBalance(owner.address);

            const creatorShare = (price * BigInt(CREATOR_SHARE_PERCENTAGE)) / 100n;
            const expectedCrowdfundingShareInContract = price - creatorShare;

            expect(contractBalanceBeforeWithdraw).to.equal(expectedCrowdfundingShareInContract);

            await expect(contract.connect(owner).withdrawFunds())
                .to.emit(contract, "FundsWithdrawn")
                .withArgs(await contract.withdrawWallet(), contractBalanceBeforeWithdraw);

            expect(await hre.ethers.provider.getBalance(await contract.getAddress())).to.equal(0n);
            expect(await hre.ethers.provider.getBalance(owner.address)).to.be.closeTo(ownerBalanceBeforeWithdraw + contractBalanceBeforeWithdraw, hre.ethers.parseUnits("0.001", "ether"));
        });

        it("Dovrebbe revertire se un non-owner tenta di prelevare fondi", async function () {
            const tokenId = 5;
            const quantity = 1;
            const price = await contract.pricesInWei(tokenId);
            await contract.connect(addr1).mintNFT(tokenId, quantity, { value: price });

            await expect(contract.connect(addr2).withdrawFunds()).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });
    });

    describe("Gestione del Creator Wallet e Percentuale", function () {
        it("Dovrebbe permettere all'owner di cambiare il creator wallet", async function () {
            const newCreatorWallet = addr2.address;
            await expect(contract.connect(owner).setCreatorWallet(newCreatorWallet))
                .to.not.be.reverted; 

            expect(await contract.creatorWallet()).to.equal(newCreatorWallet);
        });

        it("Dovrebbe revertire se un non-owner tenta di cambiare il creator wallet", async function () {
            const newCreatorWallet = addr2.address;
            await expect(contract.connect(addr1).setCreatorWallet(newCreatorWallet))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });

        it("Dovrebbe permettere all'owner di cambiare la percentuale del creator", async function () {
            const newPercentage = 10;
            await expect(contract.connect(owner).setCreatorSharePercentage(newPercentage))
                .to.not.be.reverted;

            expect(await contract.creatorSharePercentage()).to.equal(BigInt(newPercentage));
        });

        it("Dovrebbe revertire se un non-owner tenta di cambiare la percentuale del creator", async function () {
            const newPercentage = 10;
            await expect(contract.connect(addr1).setCreatorSharePercentage(newPercentage))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });

        it("Dovrebbe revertire se la percentuale del creator supera il 100%", async function () {
            const invalidPercentage = 101;
            await expect(contract.connect(owner).setCreatorSharePercentage(invalidPercentage))
                .to.be.revertedWith("Creator share cannot exceed 100%");
        });
    });

    describe("Funzionalità di Voto", function () {
        let proposalId; 

        beforeEach(async function() {
            const description = "Test Proposal for voting";
            const durationDays = 7;
            const allowNewMints = false; 
            
            const tx = await contract.connect(owner).createProposal(description, durationDays, allowNewMints);
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'ProposalCreated');
            proposalId = BigInt(event.args.proposalId); 

            const tokenIdForVote = 5;
            const quantityForVote = 1;
            const priceForVote = await contract.pricesInWei(tokenIdForVote);
            await contract.connect(addr1).mintNFT(tokenIdForVote, quantityForVote, { value: priceForVote });
            await contract.connect(addr2).mintNFT(tokenIdForVote, quantityForVote, { value: priceForVote });
        });

        it("Dovrebbe permettere all'owner di creare una proposta (verifica iniziale)", async function () {
            const proposal = await contract.proposals(proposalId); 
            expect(proposal.description).to.equal("Test Proposal for voting"); 
            expect(proposal.active).to.be.true;
            expect(proposal.allowNewMintsToVote).to.be.false; 
            expect(proposal.yesVotes).to.equal(0n); 
            expect(proposal.noVotes).to.equal(0n); 
        });

        it("Dovrebbe permettere a un possessore di NFT di votare 'Sì'", async function () {
            await expect(contract.connect(addr1).vote(proposalId, true))
                .to.emit(contract, "Voted")
                .withArgs(proposalId, addr1.address, true); 

            const proposal = await contract.proposals(proposalId);
            expect(proposal.yesVotes).to.equal(1n); 
            expect(proposal.noVotes).to.equal(0n);
            expect(await contract.hasVoted(proposalId, addr1.address)).to.be.true;
        });

        it("Dovrebbe permettere a un altro possessore di NFT di votare 'No'", async function () {
            await expect(contract.connect(addr2).vote(proposalId, false))
                .to.emit(contract, "Voted")
                .withArgs(proposalId, addr2.address, false);

            const proposal = await contract.proposals(proposalId);
            expect(proposal.yesVotes).to.equal(0n); 
            expect(proposal.noVotes).to.equal(1n); 
            expect(await contract.hasVoted(proposalId, addr2.address)).to.be.true;
        });

        it("Dovrebbe revertire se un utente tenta di votare più di una volta", async function () {
            await contract.connect(addr1).vote(proposalId, true); 

            await expect(contract.connect(addr1).vote(proposalId, true))
                .to.be.revertedWith("You have already voted on this proposal");
        });

        it("Dovrebbe revertire se un utente senza NFT tenta di votare", async function () {
            const tempSigner = (await hre.ethers.getSigners())[6]; 
            // Non c'è più bisogno di owner.sendTransaction qui se default signer ha fondi enormi.
            // await owner.sendTransaction({ to: tempSigner.address, value: hre.ethers.parseEther("10") });
            // Con l'initialBalance elevato nel hardhat.config.cjs, tempSigner avrà già fondi sufficienti.
            
            await expect(contract.connect(tempSigner).vote(proposalId, true))
                .to.be.revertedWith("You must own at least one NFT to vote");
        });

        it("Dovrebbe permettere all'owner di terminare una proposta una volta scaduta", async function () {
            const proposal = await contract.proposals(proposalId);
            const timeToAdvance = proposal.endTime - BigInt(Math.floor(Date.now() / 1000)) + 10n; 

            await hre.network.provider.send("evm_increaseTime", [Number(timeToAdvance)]);
            await hre.network.provider.send("evm_mine");

            await expect(contract.connect(owner).endProposal(proposalId))
                .to.not.be.reverted;

            const endedProposal = await contract.proposals(proposalId);
            expect(endedProposal.active).to.be.false;
        });

        it("Dovrebbe revertire se si tenta di votare su una proposta terminata", async function () {
            const proposal = await contract.proposals(proposalId);
            const timeToAdvance = proposal.endTime - BigInt(Math.floor(Date.now() / 1000)) + 10n;
            await hre.network.provider.send("evm_increaseTime", [Number(timeToAdvance)]);
            await hre.network.provider.send("evm_mine");
            await contract.connect(owner).endProposal(proposalId); 

            await expect(contract.connect(addr1).vote(proposalId, true))
                .to.be.revertedWith("Proposal is not active"); 
        });

        it("Dovrebbe revertire se un non-owner tenta di creare una proposta", async function () {
            await expect(contract.connect(addr1).createProposal("Invalid proposal", 1, true))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });

        it("Dovrebbe revertire se un non-owner tenta di terminare una proposta", async function () {
            const description = "Another test proposal for non-owner end test"; 
            const durationDays = 1;
            const allowNewMints = true;

            const tx = await contract.connect(owner).createProposal(description, durationDays, allowNewMints);
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'ProposalCreated');
            const testProposalId = BigInt(event.args.proposalId); 

            const proposalToAdvance = await contract.proposals(testProposalId);
            const timeToAdvance = proposalToAdvance.endTime - BigInt(Math.floor(Date.now() / 1000)) + 10n; 
            await hre.network.provider.send("evm_increaseTime", [Number(timeToAdvance)]);
            await hre.network.provider.send("evm_mine");

            await expect(contract.connect(addr1).endProposal(testProposalId))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });
    });

    describe("Funzioni Owner-Only", function () {
        it("Dovrebbe permettere all'owner di impostare i CID pubblici per i token", async function () {
            const tokenId = 5;
            const newCID = "bafybeicnewpubliccidxyz";
            await expect(contract.connect(owner).setTokenCID(tokenId, newCID))
                .to.not.be.reverted;
            expect(await contract.tokenCIDs(tokenId)).to.equal(newCID);
            expect(await contract.uri(tokenId)).to.equal(`${BASE_URI}${tokenId}.json`); 
        });

        it("Dovrebbe permettere all'owner di impostare gli URI crittografati per i token", async function () {
            const tokenId = 10;
            const newEncryptedURI = "encrypted_uri_new_xyz";
            await expect(contract.connect(owner).setEncryptedURI(tokenId, newEncryptedURI))
                .to.not.be.reverted;
            expect(await contract.encryptedURIs(tokenId)).to.equal(newEncryptedURI);
            expect(await contract.getEncryptedURI(tokenId)).to.equal(newEncryptedURI);
        });

        it("Dovrebbe verificare la protezione del burn per il valore totale minimo", async function () {
            const tokenIdToTest = 5;
            // Con la nuova MINIMUM_TOTAL_VALUE = 1 ether, mintare 2 token è sufficiente per superarla
            // pricesInWei[5] (0.2 ether) * 2 token = 0.4 ether, che è maggiore di 1 ether
            const quantityForBurnTest = 2n; 
            
            const price = await contract.pricesInWei(tokenIdToTest);
            const totalPrice = price * quantityForBurnTest;

            await expect(contract.connect(addr1).mintNFT(tokenIdToTest, quantityForBurnTest, { value: totalPrice }))
                .to.not.be.reverted; 

            const burnTokenId = tokenIdToTest;
            const quantityToBurn = 1n; // Brucia 1 per scendere sotto la soglia

            await expect(
                contract.connect(addr1).requestBurn(burnTokenId, quantityToBurn)
            ).to.not.be.reverted; 

            const burnRequestId = 0n; 

            await expect(
                contract.connect(owner).approveBurn(burnRequestId, true)
            ).to.be.revertedWith("Cannot burn below minimum total value");

            expect(await contract.balanceOf(addr1.address, burnTokenId)).to.equal(quantityForBurnTest);
        });
    });
});

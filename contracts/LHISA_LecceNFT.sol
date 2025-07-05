// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26; // Pragma aggiornato a 0.8.26

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// NOME DELLA CLASSE DEL CONTRATTO CORRETTO: con underscore
contract LHISA_LecceNFT is ERC1155URIStorage, Ownable {
    string public name = "LHISA-LecceNFT"; // Nome pubblico del token/collezione (con trattino)
    string public symbol = "LHISA"; // Simbolo pubblico del token

    string private baseURI; // Store base URI for ERC-1155 compliant uri function

    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalMinted;
    mapping(uint256 => uint256) public pricesInWei;
    mapping(uint256 => bool) public isValidTokenId;
    mapping(uint256 => string) public encryptedURIs;
    mapping(uint256 => string) public tokenCIDs;

    address public withdrawWallet;
    address public creatorWallet;
    uint256 public creatorSharePercentage;

    struct Proposal {
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
        bool allowNewMintsToVote;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public nextProposalId;

    struct BurnRequest {
        address requester;
        uint256 tokenId;
        uint256 quantity;
        bool approved;
    }

    BurnRequest[] public burnRequests;

    uint256 public constant MINIMUM_TOTAL_VALUE = 84_000 ether;

    event NFTMinted(address indexed buyer, uint256 tokenId, uint256 quantity, uint256 price, string encryptedURI);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event NFTBurned(address indexed owner, uint256 tokenId, uint256 quantity);
    event BurnRequested(address indexed requester, uint256 tokenId, uint256 quantity, uint256 requestId);
    event BurnApproved(uint256 requestId, address indexed requester, uint256 tokenId, uint256 quantity);
    event BurnDenied(uint256 requestId, address indexed requester, uint256 tokenId, uint256 quantity);

    event CreatorShareTransferred(address indexed receiver, uint256 amount);

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);

    // Il costruttore ora prende _owner (deployer) e _creatorWalletAddress come parametri
    // Contenuto corretto del costruttore nel file contracts/LHISA_LecceNFT.sol
    constructor(string memory _baseURI, address _ownerAddress, address _creatorWalletAddress)
        ERC1155(_baseURI)
        Ownable(_ownerAddress) // Owner è il parametro _ownerAddress
    {
        require(bytes(_baseURI).length > 0, "Base URI cannot be empty");
        require(_ownerAddress != address(0), "Owner address cannot be zero"); // Controllo aggiuntivo
        require(_creatorWalletAddress != address(0), "Creator wallet address cannot be zero"); // Controllo aggiuntivo

        baseURI = _baseURI; // Store base URI for ERC-1155 compliant uri function
        withdrawWallet = _ownerAddress; // withdrawWallet coincide con l'owner (deployer)
        creatorWallet = _creatorWalletAddress; // creatorWallet è passato come parametro
        creatorSharePercentage = 6; // Percentuale è ancora 6%
        nextProposalId = 0; // Inizializzazione di nextProposalId CORRETTA

        // --- Definizione dei prezzi, maxSupply (2000) e tokenId validi ---
        // Questo blocco DEVE essere all'interno del costruttore
        for (uint256 i = 5; i <= 100; i += 5) {
            pricesInWei[i] = i * 4 * 10**16;
            maxSupply[i] = 2000; // maxSupply aggiornata a 2000
            isValidTokenId[i] = true;
        }

        // --- Inizializzazione degli URI/CID per i 20 token (pubblici e non crittografati) ---
        // Questo blocco DEVE essere all'interno del costruttore
        encryptedURIs[100] = "bafybeibzvith6ji34mzhb7mgdtascuhvczxvg3yyt3prlzg7n4f56qhhe";
        tokenCIDs[100] = "bafybeibzvith6ji34mzhb7mgdtascuhvczxvg3yyt3prlzg7n4f56qhhe"; // Corretto
        encryptedURIs[95] = "bafybeiarkwmmlxudlutqyw6jhrln3kkq7uzhendqnmhrtvtsu5gyrz62hm";
        tokenCIDs[95] = "bafybeiarkwmmlxudlutqyw6jhrln3kkq7uzhendqnmhrtvtsu5gyrz62hm";
        encryptedURIs[90] = "bafybeides3vx3ibatjjrm3wr22outg6gxclmsnerkydx3njjcm64tik3we";
        tokenCIDs[90] = "bafybeides3vx3ibatjjrm3wr22outg6gxclmsnerkydx3njjcm64tik3we";
        encryptedURIs[85] = "bafybeif4pdz2jhwlgnnonqti7reqyvszwjja45uimijzd47coilmj6jmvm";
        tokenCIDs[85] = "bafybeif4pdz2jhwlgnnonqti7reqyvszwjja45uimijzd47coilmj6jmvm";
        encryptedURIs[80] = "bafybeiboe3heopn3ki57hkbdkb4uep6mvbwlcyh4q6frcl2fqnmucswp3u";
        tokenCIDs[80] = "bafybeiboe3heopn3ki57hkbdkb4uep6mvbwlcyh4q6frcl2fqnmucswp3u";
        encryptedURIs[75] = "bafybeicgqdtiilzd23o2hhvb2kxfshjnyvxnwcic7eyftjfpalkokvm7di";
        tokenCIDs[75] = "bafybeicgqdtiilzd23o2hhvb2kxfshjnyvxnwcic7eyftjfpalkokvm7di";
        encryptedURIs[70] = "bafybeih6gfu4hss72sqjoszdsla6mioo2fbaam2jeqn7y6saihydtvjqam";
        tokenCIDs[70] = "bafybeih6gfu4hss72sqjoszdsla6mioo2fbaam2jeqn7y6saihydtvjqam";
        encryptedURIs[65] = "bafybeidyqyawcirrqbauf3daygvgmoqzq63duhsl6auw7fbfma4xlnj7cy";
        tokenCIDs[65] = "bafybeidyqyawcirrqbauf3daygvgmoqzq63duhsl6auw7fbfma4xlnj7cy";
        encryptedURIs[60] = "bafybeift6clex5dhe6unqqhcstdn4l3votj5uvuoiwpa5rwlsh6jovpeti";
        tokenCIDs[60] = "bafybeift6clex5dhe6unqqhcstdn4l3votj5uvuoiwpa5rwlsh6jovpeti";
        encryptedURIs[55] = "bafybeihhmmci3qjz55j3g5y33yhszt5fpbwmsnx4fbzklgkyofhsxn3bte";
        tokenCIDs[55] = "bafybeihhmmci3qjz55j3g5y33yhszt5fpbwmsnx4fbzklgkyofhsxn3bte";
        encryptedURIs[50] = "bafybeiaexxgiukd46px63gjvggltykt3uoqs74ryvj5x577uvge66ntr2q";
        tokenCIDs[50] = "bafybeiaexxgiukd46px63gjvggltykt3uoqs74ryvj5x577uvge66ntr2q";
        encryptedURIs[45] = "bafybeicspxdws7au6kdms6lfpfhggqxdpfkrzmrvsue7kvii5ncfk7d7tq";
        tokenCIDs[45] = "bafybeicspxdws7au6kdms6lfpfhggqxdpfkrzmrvsue7kvii5ncfk7d7tq";
        encryptedURIs[40] = "bafybeibuga3bq442mvnqrjyazhbhd2k3oek3bgevaja7jxla5to72cqeri";
        tokenCIDs[40] = "bafybeibuga3bq442mvnqrjyazhbhd2k3oek3bgevaja7jxla5to72cqeri";
        encryptedURIs[35] = "bafybeif2titfww7kqsggfocbtmm6smu5qmw7hwthaahaxjc7xzs2yf5yqq";
        tokenCIDs[35] = "bafybeif2titfww7kqsggfocbtmm6smu5qmw7hwthaahaxjc7xzs2yf5yqq";
        encryptedURIs[30] = "bafybeieqbykqxdjskgch5vtgkucvyvrbjtucpid47lwa3r3aejjc3xvbda";
        tokenCIDs[30] = "bafybeieqbykqxdjskgch5vtgkucvyvrbjtucpid47lwa3r3aejjc3xvbda";
        encryptedURIs[25] = "bafybeibo26hejdplqocrgxtg33lgdasqjuzzwkbs6cdrg7hdrkhehskukm";
        tokenCIDs[25] = "bafybeibo26hejdplqocrgxtg33lgdasqjuzzwkbs6cdrg7hdrkhehskukm";
        encryptedURIs[20] = "bafybeibk63t4vnlqpimomeeylnam2b52qdfdcx5bcfdxqtyiod2d6qnomy";
        tokenCIDs[20] = "bafybeibk63t4vnlqpimomeeylnam2b52qdfdcx5bcfdxqtyiod2d6qnomy";
        encryptedURIs[15] = "bafybeiek35bzmmhop35isxwade6ezfgsb466mhwoxr27zfwlly7etvpqo4";
        tokenCIDs[15] = "bafybeiek35bzmmhop35isxwade6ezfgsb466mhwoxr27zfwlly7etvpqo4";
        encryptedURIs[10] = "bafybeigpqqaoft52a7dp2kkzcn5zapig7zgftcfrt2fbiqqnm55mwut6lq";
        tokenCIDs[10] = "bafybeigpqqaoft52a7dp2kkzcn5zapig7zgftcfrt2fbiqqnm55mwut6lq";
        encryptedURIs[5] = "bafybeickzstleqd6hnjcsvp7bjc6tbsu7jqhmwzubws5qu7r64e3h4zhyq";
        tokenCIDs[5] = "bafybeickzstleqd6hnjcsvp7bjc6tbsu7jqhmwzubws5qu7r64e3h4zhyq";
    } // QUESTA È LA PARENTESI DI CHIUSURA CORRETTA DEL COSTRUTTORE!}

    function mintNFT(uint256 tokenId, uint256 quantity) external payable {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(totalMinted[tokenId] + quantity <= maxSupply[tokenId], "Exceeds max supply");
        require(quantity > 0, "Invalid quantity");

        uint256 totalCostInWei = pricesInWei[tokenId] * quantity;
        require(msg.value == totalCostInWei, "Incorrect ETH amount");

        uint256 creatorShare = (totalCostInWei * creatorSharePercentage) / 100;
        
        if (creatorShare > 0) {
            (bool successCreator, ) = creatorWallet.call{value: creatorShare}("");
            require(successCreator, "Failed to send creator share");
            emit CreatorShareTransferred(creatorWallet, creatorShare);
        }
        
        totalMinted[tokenId] += quantity;
        _mint(msg.sender, tokenId, quantity, "");

        if (nextProposalId > 0 && proposals[nextProposalId - 1].active) { 
            Proposal storage currentProposal = proposals[nextProposalId - 1];
            if (currentProposal.allowNewMintsToVote) { 
                if (!hasVoted[nextProposalId - 1][msg.sender]) {
                    currentProposal.yesVotes += 1;
                    hasVoted[nextProposalId - 1][msg.sender] = true;
                    emit Voted(nextProposalId - 1, msg.sender, true);
                }
            }
        }
        emit NFTMinted(msg.sender, tokenId, quantity, pricesInWei[tokenId], encryptedURIs[tokenId]);
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        // Questa è la versione che produce: ipfs://<baseuri>/<tokenid>.json
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
    }

    function getEncryptedURI(uint256 tokenId) external view returns (string memory) {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        return encryptedURIs[tokenId];
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(withdrawWallet).transfer(balance);
        emit FundsWithdrawn(withdrawWallet, balance);
    }

    function setCreatorWallet(address _newCreatorWallet) external onlyOwner {
        creatorWallet = _newCreatorWallet;
    }

    function setCreatorSharePercentage(uint256 _newCreatorSharePercentage) external onlyOwner {
        require(_newCreatorSharePercentage <= 100, "Creator share cannot exceed 100%");
        creatorSharePercentage = _newCreatorSharePercentage;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setURI(newBaseURI);
        emit BaseURIUpdated(newBaseURI);
    }

    function setTokenCID(uint256 tokenId, string memory cid) external onlyOwner {
        require(isValidTokenId[tokenId], "TokenId not valid for setting CID"); 
        tokenCIDs[tokenId] = cid;
    }

    function setEncryptedURI(uint256 tokenId, string memory uri_) external onlyOwner {
        require(isValidTokenId[tokenId], "TokenId not valid for setting encrypted URI");
        encryptedURIs[tokenId] = uri_;
    }

    function createProposal(string memory _description, uint256 _durationInDays, bool _allowNewMintsToVote) external onlyOwner returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_durationInDays > 0, "Duration must be at least one day");

        uint256 proposalId = nextProposalId;
        proposals[proposalId] = Proposal({
            description: _description,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationInDays * 1 days), 
            yesVotes: 0,
            noVotes: 0,
            active: true,
            allowNewMintsToVote: _allowNewMintsToVote
        });
        nextProposalId++;
        emit ProposalCreated(proposalId, _description, block.timestamp, block.timestamp + (_durationInDays * 1 days));
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _vote) external { // <--- Funzione vote come ESTERNA
        Proposal storage proposal = proposals[_proposalId];
        
        require(proposal.active, "Proposal is not active");
        require(block.timestamp >= proposal.startTime, "Voting has not started yet");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted on this proposal");

        uint256 totalNFTsOwned = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            totalNFTsOwned += balanceOf(msg.sender, i);
        }
        
        require(totalNFTsOwned > 0, "You must own at least one NFT to vote");

        if (_vote) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }
        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, msg.sender, _vote);
    }

    function endProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposal is not active");
        require(block.timestamp > proposal.endTime, "Voting period has not ended yet");
        proposal.active = false; 
    }

    function getProposalResults(uint256 _proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, bool active, uint256 endTime) {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.description, proposal.yesVotes, proposal.noVotes, proposal.active, proposal.endTime);
    }

    function requestBurn(uint256 tokenId, uint256 quantity) external {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(balanceOf(msg.sender, tokenId) >= quantity, "Insufficient balance");

        burnRequests.push(BurnRequest({
            requester: msg.sender,
            tokenId: tokenId,
            quantity: quantity,
            approved: false
        }));

        uint256 requestId = burnRequests.length - 1;
        emit BurnRequested(msg.sender, tokenId, quantity, requestId);
    }

    function approveBurn(uint256 requestId, bool approve) external onlyOwner {
        require(requestId < burnRequests.length, "Invalid requestId");
        BurnRequest storage request = burnRequests[requestId];
        require(!request.approved, "Request already processed");

        if (approve) {
            uint256 totalValueAfterBurn = calculateTotalValueAfterBurn(request.tokenId, request.quantity);
            require(totalValueAfterBurn >= MINIMUM_TOTAL_VALUE, "Cannot burn below minimum total value");

            _burn(request.requester, request.tokenId, request.quantity);
            totalMinted[request.tokenId] -= request.quantity;
            request.approved = true;

            emit BurnApproved(requestId, request.requester, request.tokenId, request.quantity);
        } else {
            emit BurnDenied(requestId, request.requester, request.tokenId, request.quantity);
        }
    }

    function calculateTotalValueAfterBurn(uint256 tokenId, uint256 quantity) public view returns (uint256) {
        uint256 totalValue = 0;

        uint256[] memory mintedTokens = new uint256[](20); 
        uint256 idx = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            mintedTokens[idx] = totalMinted[i];
            idx++;
        }

        uint256 tokenArrayIndex = (tokenId / 5) - 1;
        require(tokenArrayIndex < 20, "Token ID not in burn calculation range"); 

        mintedTokens[tokenArrayIndex] -= quantity; 

        idx = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            totalValue += mintedTokens[idx] * pricesInWei[i];
            idx++;
        }

        return totalValue;
    }

    function onlyOwnerFunction() external view {
        require(msg.sender == owner(), "Ownable: caller is not the owner");
    }
}

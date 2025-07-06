# LHISA-Lecce-NFT-Smartcontract

LHI Salento Lecce NFT è smart contract che conia NFT LHISA Coin, creati per curare e guarire DEPRESSIONE.

## Panoramica

Questo smart contract implementa una collezione di NFT ERC-1155 con funzionalità avanzate di governance, autenticità e gestione decentralizzata. Il contratto permette il minting di NFT con prezzi variabili, un sistema di voto per i possessori di token, e politiche di autenticità rafforzate attraverso la gestione dei CID IPFS.

## Caratteristiche Principali

- **Standard ERC-1155**: Supporto multi-token efficiente
- **Governance Decentralizzata**: Sistema di voto riservato ai possessori di NFT
- **Gestione Autenticità**: Controllo owner-only dei CID per politiche di autenticità rafforzate
- **Prezzo Dinamico**: 20 diverse tipologie di token con prezzi crescenti
- **Burn Request System**: Sistema di richiesta e approvazione per la distruzione di token
- **Revenue Sharing**: Divisione automatica dei ricavi tra owner e creator

## Authenticity Policy and CID Management

### Gestione dei CID riservata all'Owner

La possibilità di rettificare i CID (Content Identifier) dei token NFT è **riservata esclusivamente all'owner del contratto**. Questa funzionalità è implementata attraverso due funzioni principali:

- `setTokenCID(uint256 tokenId, string memory cid)`: Aggiorna il CID pubblico di un token
- `setEncryptedURI(uint256 tokenId, string memory uri_)`: Aggiorna l'URI crittografato di un token

### Policy di Autenticità Rafforzata

Questa funzione owner-only abilita una **policy di autenticità rafforzata** secondo il seguente meccanismo:

1. **Associazione di Immagini Pubbliche**: L'owner può associare ai CID immagini pubbliche ospitate su IPFS
2. **Marcatura Steganografica**: Le immagini possono contenere marcature steganografiche nascoste
3. **Verifica tramite Password**: Le marcature steganografiche sono rivelabili tramite password segrete
4. **Autenticazione Verificabile**: I possessori di NFT o terzi autorizzati possono verificare l'autenticità usando la password

### Benefici del Sistema di Autenticità

- **Protezione contro Contraffazione**: Solo l'owner può aggiornare i CID, impedendo modifiche non autorizzate
- **Verifica Indipendente**: Chiunque con la password può verificare l'autenticità dell'immagine
- **Trasparenza**: Tutti i CID sono pubblicamente visibili sulla blockchain
- **Flessibilità**: L'owner può aggiornare i contenuti per miglioramenti o correzioni mantenendo l'autenticità

### Processo di Verifica

1. Il possessore di NFT accede al CID tramite la funzione `tokenCIDs[tokenId]`
2. Scarica l'immagine da IPFS usando il CID
3. Utilizza strumenti steganografici con la password fornita dall'owner
4. Verifica la presenza della marcatura nascosta per confermare l'autenticità

## Funzionalità di Governance e Voto

Il contratto implementa un sistema di governance decentralizzata che permette ai possessori di NFT di partecipare alle decisioni attraverso proposte e votazioni.

### Funzioni di Governance riservate agli Holder NFT

#### Creazione di Proposte (Solo Owner)
```solidity
function createProposal(string memory _description, uint256 _durationInDays, bool _allowNewMintsToVote) external onlyOwner returns (uint256)
```

**Parametri:**
- `_description`: Descrizione testuale della proposta
- `_durationInDays`: Durata della votazione in giorni
- `_allowNewMintsToVote`: Se true, i nuovi mint durante la votazione votano automaticamente "sì"

**Esempi pratici d'uso:**
- Modifica delle percentuali di revenue sharing
- Aggiornamento dei prezzi dei token
- Decisioni su nuove funzionalità del contratto
- Approvazione di partnership o collaborazioni

#### Votazione (Holder NFT)
```solidity
function vote(uint256 _proposalId, bool _vote) external
```

**Logica di funzionamento on-chain:**
1. **Verifica Proprietà**: Il sistema controlla che l'utente possieda almeno un NFT di qualsiasi tipo (ID da 5 a 100)
2. **Controllo Tempistiche**: La votazione deve essere attiva e nel periodo consentito
3. **Prevenzione Doppi Voti**: Ogni address può votare una sola volta per proposta
4. **Conteggio Voti**: Ogni holder vale un voto, indipendentemente dal numero di NFT posseduti

**Esempio di utilizzo:**
```javascript
// Votare "sì" sulla proposta ID 0
await contract.vote(0, true);

// Votare "no" sulla proposta ID 1
await contract.vote(1, false);
```

#### Chiusura Proposte (Solo Owner)
```solidity
function endProposal(uint256 _proposalId) external onlyOwner
```
Permette all'owner di chiudere una proposta scaduta e renderne definitivi i risultati.

#### Consultazione Risultati
```solidity
function getProposalResults(uint256 _proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, bool active, uint256 endTime)
```

### Logica Avanzata: Auto-voto per Nuovi Mint

Se una proposta è configurata con `allowNewMintsToVote = true`, i nuovi acquirenti di NFT durante il periodo di votazione:
1. Ricevono automaticamente un voto "sì" sulla proposta attiva
2. Vengono registrati come votanti per prevenire voti multipli
3. Partecipano immediatamente alla governance senza azioni aggiuntive

### Esempi di Scenari di Governance

#### Scenario 1: Modifica Percentuale Creator
```solidity
// L'owner crea una proposta per cambiare la percentuale del creator dal 6% al 8%
uint256 proposalId = await contract.createProposal(
    "Aumentare la percentuale del creator dall'attuale 6% all'8% per supportare maggiormente l'artista", 
    7, // 7 giorni di votazione
    false // I nuovi mint non votano automaticamente
);

// Gli holder votano
await contract.connect(holder1).vote(proposalId, true);  // Voto favorevole
await contract.connect(holder2).vote(proposalId, false); // Voto contrario

// Dopo 7 giorni, l'owner chiude la proposta
await contract.endProposal(proposalId);

// Se la maggioranza ha votato "sì", l'owner può implementare il cambiamento
if (yesVotes > noVotes) {
    await contract.setCreatorSharePercentage(8);
}
```

#### Scenario 2: Decisioni su Nuove Funzionalità
```solidity
// Proposta per abilitare una nuova funzionalità con consenso della comunità
uint256 proposalId = await contract.createProposal(
    "Abilitare la funzione di trading P2P tra holder", 
    14, // 14 giorni per decisioni importanti
    true // I nuovi investitori sostengono automaticamente l'innovazione
);
```

## Specifiche Tecniche

### Versione Solidity
Il contratto utilizza **Solidity ^0.8.26**, garantendo:
- Protezioni matematiche integrate (overflow/underflow)
- Compatibilità con le ultime funzionalità del linguaggio
- Ottimizzazioni del compilatore più recenti
- Sicurezza migliorata rispetto a versioni precedenti

### Token Specification
- **Standard**: ERC-1155 (Multi-Token Standard)
- **Nome Collezione**: LHISA-LecceNFT
- **Simbolo**: LHISA
- **Token IDs Validi**: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
- **Max Supply per Token**: 2,000 unità
- **Prezzi**: Progressivi da 0.2 ETH (ID 5) a 4.0 ETH (ID 100)

### Dipendenze OpenZeppelin
```json
{
  "@openzeppelin/contracts": "^5.3.0"
}
```

Moduli utilizzati:
- `ERC1155URIStorage`: Gestione URI personalizzati per token
- `Ownable`: Controllo accessi owner-only
- `Strings`: Utilities per manipolazione stringhe

## Deployment e Configurazione

### Prerequisiti
1. **Node.js** >= 16.0.0
2. **npm** o **yarn**
3. **Hardhat** ^2.25.0
4. Account wallet con fondi sufficienti per gas

### Installazione
```bash
npm install
```

### Configurazione Ambiente
Creare un file `.env` con le seguenti variabili:
```env
PRIVATE_KEY=your_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Compilazione
```bash
npm run compile
```

### Deploy
```bash
npm run deploy
```

### Parametri del Costruttore
Il contratto richiede tre parametri al momento del deploy:
1. `_baseURI`: URI base per i metadati IPFS
2. `_ownerAddress`: Indirizzo che diventerà owner del contratto
3. `_creatorWalletAddress`: Indirizzo per ricevere la percentuale del creator (6%)

### Esempio di Deploy
```javascript
const baseURI = "ipfs://bafybeidxlbnyoz4dyx5k5ydjya4kf7wsq6gx72vxhpzbdeda54w4ya3xsy/";
const ownerAddress = "0xf9909c6CD90566BD56621EE0cAc42986ae334Ea3";
const creatorAddress = "0x1234567890123456789012345678901234567890";

const contract = await ContractFactory.deploy(baseURI, ownerAddress, creatorAddress);
```

### Verifica del Contratto
Il deploy include verifica automatica su Polygonscan:
```bash
npx hardhat verify --network polygon CONTRACT_ADDRESS "baseURI" "ownerAddress" "creatorAddress"
```

### Best Practices di Sicurezza
1. **Multi-sig Wallet**: Utilizzare un wallet multi-signature per l'owner
2. **Timelock**: Considerare l'implementazione di timelock per funzioni critiche
3. **Audit**: Sottoporre il contratto ad audit di sicurezza prima del mainnet
4. **Testing**: Eseguire test completi su testnet prima del deploy in produzione
5. **Backup delle Chiavi**: Mantenere backup sicuri delle chiavi private

### Testing
```bash
npm run test
```

Il contratto include una suite completa di test che verifica:
- Funzionalità di minting
- Sistema di governance e voto
- Controlli di accesso owner-only
- Gestione CID e URI
- Sistema di burn request
- Distribuzione revenue sharing

### Struttura del Progetto
```
/
├── contracts/
│   ├── LHISA_LecceNFT.sol          # Contratto principale
│   ├── LHISA_LecceNFT_flattened.sol # Versione flattened per verifica
│   └── ERC20Mock.sol               # Mock per testing
├── scripts/
│   ├── deploy.cjs                  # Script di deploy
│   └── update_cid_10.cds          # Script aggiornamento CID
├── test/
│   └── LHISA_LecceNFT.test.js     # Test suite completa
├── hardhat.config.cjs              # Configurazione Hardhat
└── package.json                    # Dipendenze del progetto
```

## Licenza
MIT License - Vedi file LICENSE per dettagli.

# LHISA-Lecce-NFT-Smartcontract

LHI Salento Lecce NFT è uno smart contract avanzato che conia NFT LHISA Coin, creati per curare e guarire DEPRESSIONE.

## Caratteristiche Principali

### 🎨 Standard ERC-1155
- Supporto multi-token per NFT e token fungibili
- Efficienza nei trasferimenti batch
- Compatibilità con tutti i principali marketplace

### 💰 Sistema Royalties Avanzato - Doppio Meccanismo

Il contratto implementa un sistema sofisticato di royalties con due meccanismi separati e complementari:

#### 1. Royalty sul Mint (6% fisso)
- **Percentuale**: 6% fisso sui ricavi del mint
- **Beneficiario**: Creator wallet specificato nel contratto
- **Caratteristiche**:
  - Pagamento automatico durante l'acquisto tramite `mintNFT()`
  - Percentuale **non modificabile** dopo il deploy per garantire trasparenza
  - Separata dalle royalties del mercato secondario
  - Variabile: `creatorSharePercentage`

#### 2. Royalty Vendite Secondarie (EIP-2981)
- **Standard**: EIP-2981 compatibile con OpenSea e marketplace principali
- **Configurazione iniziale**: 0% per incentivare la fase di lancio
- **Caratteristiche**:
  - Modificabile dall'owner tramite `setRoyaltyInfo(address, uint96)`
  - Limite massimo: **10%** per proteggere i trader
  - Compatibile con tutti i marketplace che supportano EIP-2981
  - Gestione tramite variabili private `_royaltyRecipient` e `_royaltyFeeBps`

### 🔧 Funzioni Royalty

```solidity
// Imposta royalty per vendite secondarie (solo owner)
function setRoyaltyInfo(address recipient, uint96 feeBps) external onlyOwner

// Ottiene informazioni royalty per un token (standard EIP-2981)
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)

// Visualizza configurazione royalty attuale
function getRoyaltyInfo() external view returns (address recipient, uint96 feeBps)
```

### 📊 Vantaggi del Sistema Dual-Royalty

1. **Trasparenza**: Gli acquirenti conoscono esattamente i costi al momento del mint
2. **Flessibilità**: Possibilità di adattare le royalties secondarie alle condizioni di mercato
3. **Protezione**: Limite del 10% per evitare commissioni eccessive
4. **Compatibilità**: Standard EIP-2981 supportato dai principali marketplace
5. **Incentivi Launch**: Royalties secondarie inizialmente a 0% per favorire l'adozione

## Sviluppo e Tecnologie

### 🛠️ Stack Tecnologico
- **Linguaggi**: Solidity, Linux, Java, HTML
- **Standard**: ERC-1155, EIP-2981, IPFS
- **Tools**: VS Code, GIMP, Hardhat, OpenZeppelin
- **AI**: GitHub Copilot, ChatGPT, Gemini, Grok, Deep Seek

### ⏱️ Timeline di Sviluppo
- **Durata**: 7 mesi di sviluppo intensivo
- **Approccio**: Multidisciplinare con utilizzo di AI avanzate
- **Sfide superate**: 
  - Bug critici delle AI nelle implementazioni
  - Armonizzazione tra linguaggi diversi
  - Watermark invisibili nelle immagini
  - Gestione CID IPFS per storage decentralizzato

## Deployment e Compatibilità

- **Blockchain target**: Polygon (rete principale)
- **Compatibilità**: Mantenuta con versioni precedenti
- **Marketplace**: OpenSea, Rarible, e tutti i marketplace EIP-2981 compliant

## Sicurezza e Trasparenza

- Controlli di accesso con OpenZeppelin Ownable
- Validazione parametri per prevenire errori
- Eventi per tracking delle modifiche royalty
- Limits predefiniti per proteggere gli utenti

---

*Questo progetto rappresenta l'innovazione nell'intersezione tra tecnologia blockchain, benessere mentale e arte digitale.*

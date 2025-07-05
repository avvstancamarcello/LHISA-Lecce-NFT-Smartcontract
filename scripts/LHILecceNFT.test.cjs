const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LHILecceNFT (ERC-1155)", function () {
  let lhiLecceNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const LHILecceNFT = await ethers.getContractFactory("LHILecceNFT");
    // Passa entrambi i parametri richiesti: baseURI e owner address
    const baseURI = "ipfs://";
    lhiLecceNFT = await LHILecceNFT.deploy(baseURI, owner.address);
    await lhiLecceNFT.waitForDeployment();
  });

  const encryptedURIs = [
    "bafybeibcdd7xkcnysru7z4kianttaykhhrl5zewizngzuw2m7ij6atzunq",
    "bafybeicwotpc5l2v6uhbdxyyyjm57asclfekez2g5j7bbkisx5rfcjb6ta",
    "bafybeigbxjmng64ztva7nc5sfkwebvxajv2qjv6s4222p3mqu6ulxk4twi",
    "bafybeicpsoa63f4mvj6tffo3iyaeq6zfyocgieidtzao3hkgcjyctpve5u",
    "bafybeiekmmfdut2begk6orihy2i7czigvgl7tz52aqpevz77ffnmzcmsii",
    "bafybeihthtbusz5krrwal6ikyilhno3xowkjnqnx7svkha5kmci3me43fm",
    "bafybeie3djtgvjvqg5gg2ngawj2h2wnoxzkx7ndi2amppqmzgpfipzbubi",
    "bafybeifdheepywqg4jt6tg4n36dltu2yvvunog472gz63n6qktihqkd5uq",
    "bafybeidro46zjdvtvabedg7vkzbbsqazztey24indvyhxw476a4eajamca",
    "bafybeifopjtpis5z5nmpiojdojpsr67n3q6oyehcwft5mv3bjideli2eli",
    "bafybeifv4lv752infxvwimz6dab5cm5p6qnaykqqv6hbhadhyv3ocoyzga",
    "bafybeih7f5ud2ogbnldlanvt2zldgi2f45ttptka6qxi2stpzxy5u2mz5a",
    "bafybeiajdlk3ggb4zeavnj3bd5fiewe7weyzf6ypxycs4niw2yengbezhu",
    "bafybeifjvku5x2xajhx77cwbpkefgquztwse2kynjcnrkl32eaactxn4ta",
    "bafybeielptqraatqmzmhzewndanf5u445cqr56vtxphoa2vinf7ou24yoe",
    "bafybeigsbban76tpciuf3yukjrgtjrc7wwrjf3w42ssgybtputzwmybuyq",
    "bafybeigzb6hv6jqgiirbdtxtjmpio7p6d6mbtorvoi3zgisyny6gcznpo4",
    "bafybeignmui522fqu3x74m3di4qxisll6jn63piiucod72q7ridfoetna4",
    "bafybeibzrtl5kpqwrnie52ktczdg55zm44rcebyu2tk3jzxod42ughbu5q",
    "bafybeid35sdnjt4n3ko6axlknhjmfojhtgag6hqabijuqtmzzf26gnfdci",
    "bafybeia4v7mnjhvsk4bchkdcclq7rl2jont7bmuyb5wrvrqi5sbshua5ge",
    "bafybeifmwyc4ucgh5fbqlxgup5evkzk3kv7tes65vdjixtnnl2lwgkrobi",
    "bafybeicgz6ztjlnzp5eet4tze74ck5x7hzumz2qfm2sc5tx6tmzhb6nu64",
    "bafybeihooyvtk7fka5bfh5biqusufanljc6ngxx4vvehksq5halovui3n4"
  ];

  it("Should mint NFTs correctly", async function () {
    const tokenId = 1;
    const quantity = 2;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    // Calcola il prezzo totale senza parseEther
    const totalPrice = price * BigInt(quantity);
    
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: totalPrice });
    
    expect(await lhiLecceNFT.balanceOf(addr1.address, tokenId)).to.equal(quantity);
  });

  it("Should fail for invalid tokenId", async function () {
    const tokenId = 25; // Token ID non valido
    const quantity = 1;
    
    // Tenta di coniare un token non valido
    await expect(
      lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Invalid tokenId");
  });

  for (let tokenId = 1; tokenId <= 24; tokenId++) {
    it(`Should return the correct encrypted URI for tokenId ${tokenId}`, async function () {
      const encryptedURI = await lhiLecceNFT.getEncryptedURI(tokenId);
      const expectedURI = encryptedURIs[tokenId - 1];
      expect(encryptedURI).to.equal(expectedURI);
    });
  }

  it("Should allow the owner to withdraw funds", async function () {
    const tokenId = 1;
    const quantity = 1;
    
    // Usa il prezzo dal contratto invece di parseEther
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    
    // Esegui il mint
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price });
    
    const initialContractBalance = await ethers.provider.getBalance(
      await lhiLecceNFT.getAddress()
    );
    expect(initialContractBalance).to.be.gt(0);
    
    // Esegui il withdraw
    await lhiLecceNFT.connect(owner).withdrawFunds();
    
    // Verifica che il contratto non abbia più fondi
    const finalContractBalance = await ethers.provider.getBalance(
      await lhiLecceNFT.getAddress()
    );
    expect(finalContractBalance).to.equal(0);
  });
});
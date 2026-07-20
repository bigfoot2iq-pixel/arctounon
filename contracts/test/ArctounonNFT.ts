import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ArctounonNFT } from "../typechain-types";

describe("ArctounonNFT", () => {
  let nft: ArctounonNFT;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  const price = ethers.parseEther("0.05");

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ArctounonNFT");
    nft = await factory.deploy(owner.address, "ipfs://base/");
    await nft.waitForDeployment();
  });

  it("public mint needs exact payment and honors the per-wallet cap", async () => {
    await expect(
      nft.connect(bob).publicMint(1, { value: price }),
    ).to.be.revertedWithCustomError(nft, "PublicClosed");

    await nft.setPublicMintOpen(true);
    await nft.setPublicPrice(price);

    await expect(nft.connect(bob).publicMint(0, { value: 0 })).to.be.revertedWithCustomError(
      nft,
      "ZeroQuantity",
    );
    await expect(
      nft.connect(bob).publicMint(2, { value: price }),
    ).to.be.revertedWithCustomError(nft, "WrongPayment");

    await nft.connect(bob).publicMint(3, { value: price * 3n });
    expect(await nft.balanceOf(bob.address)).to.equal(3n);
    expect(await nft.ownerOf(1)).to.equal(bob.address); // tokens start at #1

    await expect(
      nft.connect(bob).publicMint(3, { value: price * 3n }),
    ).to.be.revertedWithCustomError(nft, "ExceedsWalletCap");

    await nft.connect(bob).publicMint(2, { value: price * 2n });
    expect(await nft.minted(bob.address)).to.equal(5n);
    expect(await nft.remainingForWallet(bob.address)).to.equal(0n);
  });

  it("owner mints for free to any address, exempt from the per-wallet cap", async () => {
    await expect(nft.connect(alice).ownerMint(alice.address, 1)).to.be.revertedWithCustomError(
      nft,
      "OwnableUnauthorizedAccount",
    );
    await expect(nft.ownerMint(alice.address, 0)).to.be.revertedWithCustomError(
      nft,
      "ZeroQuantity",
    );

    // Owner can mint past the per-wallet cap (5) — it only bounds public mints.
    await nft.ownerMint(alice.address, 8);
    expect(await nft.balanceOf(alice.address)).to.equal(8n);
    expect(await nft.totalMinted()).to.equal(8n);
    // ownerMint doesn't touch the public per-wallet counter.
    expect(await nft.minted(alice.address)).to.equal(0n);
  });

  it("lets the owner withdraw proceeds", async () => {
    await nft.setPublicMintOpen(true);
    await nft.setPublicPrice(price);
    await nft.connect(bob).publicMint(2, { value: price * 2n });

    const contractAddress = await nft.getAddress();
    expect(await ethers.provider.getBalance(contractAddress)).to.equal(price * 2n);

    await nft.withdraw(owner.address);
    expect(await ethers.provider.getBalance(contractAddress)).to.equal(0n);
  });

  it("serves per-token metadata and reverts for unknown ids", async () => {
    await nft.ownerMint(bob.address, 1);

    expect(await nft.tokenURI(1)).to.equal("ipfs://base/1.json");
    await expect(nft.tokenURI(999)).to.be.revertedWithCustomError(
      nft,
      "URIQueryForNonexistentToken",
    );
  });
});

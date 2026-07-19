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

  it("registers once, respecting the window, uniqueness and the global cap", async () => {
    await expect(nft.connect(alice).joinAllowlist()).to.be.revertedWithCustomError(
      nft,
      "RegistrationClosed",
    );

    await nft.setRegistrationOpen(true);
    await expect(nft.connect(alice).joinAllowlist())
      .to.emit(nft, "Joined")
      .withArgs(alice.address, 1n);
    expect(await nft.allowlistAllowance(alice.address)).to.equal(1n);
    expect(await nft.allowlistCount()).to.equal(1n);

    await expect(nft.connect(alice).joinAllowlist()).to.be.revertedWithCustomError(
      nft,
      "AlreadyRegistered",
    );

    await nft.setMaxAllowlist(1);
    await expect(nft.connect(bob).joinAllowlist()).to.be.revertedWithCustomError(
      nft,
      "AllowlistFull",
    );
  });

  it("free allowlist mint is gated by phase, membership and allowance", async () => {
    await nft.setRegistrationOpen(true);
    await nft.connect(alice).joinAllowlist(); // allowance 1

    await expect(nft.connect(alice).allowlistMint(1)).to.be.revertedWithCustomError(
      nft,
      "AllowlistClosed",
    );

    await nft.setAllowlistMintOpen(true);
    await expect(nft.connect(bob).allowlistMint(1)).to.be.revertedWithCustomError(
      nft,
      "NotAllowlisted",
    );
    await expect(nft.connect(alice).allowlistMint(2)).to.be.revertedWithCustomError(
      nft,
      "ExceedsAllowance",
    );

    await nft.connect(alice).allowlistMint(1);
    expect(await nft.balanceOf(alice.address)).to.equal(1n);
    expect(await nft.minted(alice.address)).to.equal(1n);
    expect(await nft.ownerOf(1)).to.equal(alice.address); // tokens start at #1

    await expect(nft.connect(alice).allowlistMint(1)).to.be.revertedWithCustomError(
      nft,
      "ExceedsAllowance",
    );
  });

  it("owner can bump a wallet's allowance; the 5 cap spans both phases", async () => {
    await nft.setAllowlistMintOpen(true);
    await nft.setAllowlistAllowance([alice.address], 5);
    expect(await nft.allowlistCount()).to.equal(1n);

    await nft.connect(alice).allowlistMint(5);
    expect(await nft.balanceOf(alice.address)).to.equal(5n);

    // At the cap now — a public mint on top must be rejected.
    await nft.setPublicMintOpen(true);
    await nft.setPublicPrice(price);
    await expect(
      nft.connect(alice).publicMint(1, { value: price }),
    ).to.be.revertedWithCustomError(nft, "ExceedsWalletCap");
  });

  it("public mint needs exact payment and honors the per-wallet cap", async () => {
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

    await expect(
      nft.connect(bob).publicMint(3, { value: price * 3n }),
    ).to.be.revertedWithCustomError(nft, "ExceedsWalletCap");

    await nft.connect(bob).publicMint(2, { value: price * 2n });
    expect(await nft.minted(bob.address)).to.equal(5n);
    expect(await nft.remainingForWallet(bob.address)).to.equal(0n);
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
    await nft.setPublicMintOpen(true);
    await nft.setPublicPrice(0);
    await nft.connect(bob).publicMint(1, { value: 0 });

    expect(await nft.tokenURI(1)).to.equal("ipfs://base/1.json");
    await expect(nft.tokenURI(999)).to.be.revertedWithCustomError(
      nft,
      "URIQueryForNonexistentToken",
    );
  });
});

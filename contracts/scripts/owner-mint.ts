import { ethers } from "hardhat";
import fs from "fs";

// Owner tool to mint for FREE straight to wallets (team/treasury reserves and
// allowlist distributions). Uses {ownerMint}, which is exempt from the
// per-wallet cap but still bounded by total supply.
//
// Single wallet (PowerShell):
//   $env:TO="0xabc..."; $env:QTY="2"; npx hardhat run scripts/owner-mint.ts --network arcTestnet
//
// Batch from a file (one address per line — e.g. the arc_allowlist export
// downloaded from /api/allowlist/download?format=txt):
//   $env:WALLETS_FILE="wallets.txt"; $env:QTY_EACH="1"; npx hardhat run scripts/owner-mint.ts --network arcTestnet
const ADDRESS =
  process.env.NFT_ADDRESS || "0xF0D49d9a65981Eeef5322CF8D860c30eff75D29d";

async function main() {
  const nft = await ethers.getContractAt("ArctounonNFT", ADDRESS);

  if (process.env.TO) {
    const qty = BigInt(process.env.QTY || "1");
    const tx = await nft.ownerMint(process.env.TO, qty);
    await tx.wait();
    console.log(`ownerMint -> ${process.env.TO} x${qty}`);
    return;
  }

  const file = process.env.WALLETS_FILE;
  if (!file) {
    throw new Error("Set TO (single) or WALLETS_FILE (batch). See header for usage.");
  }

  const qtyEach = BigInt(process.env.QTY_EACH || "1");
  const wallets = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => ethers.isAddress(l));

  console.log(`Minting ${qtyEach} to each of ${wallets.length} wallets…`);
  for (const to of wallets) {
    const tx = await nft.ownerMint(to, qtyEach);
    await tx.wait();
    console.log(`  ownerMint -> ${to} x${qtyEach}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

import { ethers } from "hardhat";

// Owner tool to flip the public phase + set price. Only acts on the env vars you pass.
// Examples (PowerShell):
//   $env:PUBLIC_MINT="on"; $env:PRICE_USDC="0.05"; npx hardhat run scripts/set-phase.ts --network arcTestnet
// Allowlist distributions are done off-chain via ownerMint — see scripts/owner-mint.ts.
const ADDRESS =
  process.env.NFT_ADDRESS || "0xF0D49d9a65981Eeef5322CF8D860c30eff75D29d";

const on = (v?: string) => v === "on" || v === "true" || v === "1";

async function main() {
  const nft = await ethers.getContractAt("ArctounonNFT", ADDRESS);

  if (process.env.PUBLIC_MINT !== undefined) {
    const tx = await nft.setPublicMintOpen(on(process.env.PUBLIC_MINT));
    await tx.wait();
    console.log("publicMintOpen ->", on(process.env.PUBLIC_MINT));
  }
  if (process.env.PRICE_USDC !== undefined) {
    const wei = ethers.parseUnits(process.env.PRICE_USDC, 18);
    const tx = await nft.setPublicPrice(wei);
    await tx.wait();
    console.log("publicPrice ->", process.env.PRICE_USDC, "USDC");
  }
  if (process.env.BASE_URI !== undefined) {
    // Must end with "/". Tokens resolve to <BASE_URI><tokenId>.json
    const tx = await nft.setBaseURI(process.env.BASE_URI);
    await tx.wait();
    console.log("baseURI ->", process.env.BASE_URI);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

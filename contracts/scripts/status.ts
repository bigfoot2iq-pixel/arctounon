import { ethers } from "hardhat";

// Prints the live state of the deployed contract.
// Usage: npx hardhat run scripts/status.ts --network arcTestnet
const ADDRESS =
  process.env.NFT_ADDRESS || "0xF0D49d9a65981Eeef5322CF8D860c30eff75D29d";

async function main() {
  const nft = await ethers.getContractAt("ArctounonNFT", ADDRESS);
  // Sequential reads — the public RPC rate-limits bursts of parallel calls.
  console.log("address:", ADDRESS);
  console.log("name:", await nft.name());
  console.log("symbol:", await nft.symbol());
  console.log("owner:", await nft.owner());
  console.log("registrationOpen:", await nft.registrationOpen());
  console.log("allowlistMintOpen:", await nft.allowlistMintOpen());
  console.log("publicMintOpen:", await nft.publicMintOpen());
  console.log("publicPriceWei:", (await nft.publicPrice()).toString());
  console.log("allowlistDefaultAllowance:", (await nft.allowlistDefaultAllowance()).toString());
  console.log("allowlistCount:", (await nft.allowlistCount()).toString());
  console.log("totalMinted:", (await nft.totalMinted()).toString());
  console.log("MAX_PER_WALLET:", (await nft.MAX_PER_WALLET()).toString());
  console.log("MAX_SUPPLY:", (await nft.MAX_SUPPLY()).toString());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

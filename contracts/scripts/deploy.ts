import { ethers } from "hardhat";

// Deploys ArctounonNFT. The deployer becomes the owner and receives admin
// rights over phases, pricing and the allowlist. Pass metadata via BASE_URI.
async function main() {
  const [deployer] = await ethers.getSigners();
  const baseURI = process.env.BASE_URI ?? "";

  console.log("Deploying ArctounonNFT");
  console.log("  deployer:", deployer.address);
  console.log("  baseURI :", baseURI || "(none — set later with setBaseURI)");

  const factory = await ethers.getContractFactory("ArctounonNFT");
  const contract = await factory.deploy(deployer.address, baseURI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nArctounonNFT deployed to:", address);
  console.log("\nNext steps:");
  console.log("  1. Put the address in the web app: lib/arctounon-nft.ts");
  console.log("     and .env.local -> NEXT_PUBLIC_ARCTOUNON_NFT_ADDRESS");
  console.log("  2. Open registration: setRegistrationOpen(true)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

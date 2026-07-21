import { ethers } from "hardhat";
import fs from "fs";

// Owner tool to configure the on-chain allowlist phase. Only acts on the env
// vars you pass, so you can set one thing at a time.
//
// Set the member list (batch, one address per line — e.g. the arc_allowlist
// export from /api/allowlist/download?format=txt). ALLOWED=off removes them:
//   $env:WALLETS_FILE="wallets.txt"; $env:ALLOWED="on"; npx hardhat run scripts/set-allowlist.ts --network arcTestnet
//
// Set price / per-wallet limit / window (ISO datetimes or unix seconds):
//   $env:PRICE_USDC="0.03"; npx hardhat run scripts/set-allowlist.ts --network arcTestnet
//   $env:LIMIT="2"; npx hardhat run scripts/set-allowlist.ts --network arcTestnet
//   $env:START="2026-08-01T00:00:00Z"; $env:END="2026-08-02T00:00:00Z"; npx hardhat run scripts/set-allowlist.ts --network arcTestnet
//
// Close the phase:  $env:START="0"; $env:END="0"; ...
const ADDRESS =
  process.env.NFT_ADDRESS || "0xF0D49d9a65981Eeef5322CF8D860c30eff75D29d";

const on = (v?: string) => v === "on" || v === "true" || v === "1";

// Accepts a unix-seconds string or any Date-parseable string (ISO recommended).
const toUnix = (v: string): bigint => {
  if (/^\d+$/.test(v.trim())) return BigInt(v.trim());
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) throw new Error(`Cannot parse datetime: ${v}`);
  return BigInt(Math.floor(ms / 1000));
};

async function main() {
  const nft = await ethers.getContractAt("ArctounonNFT", ADDRESS);

  if (process.env.WALLETS_FILE !== undefined) {
    const allowed = on(process.env.ALLOWED ?? "on");
    const wallets = fs
      .readFileSync(process.env.WALLETS_FILE, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => ethers.isAddress(l));
    const tx = await nft.setAllowlist(wallets, allowed);
    await tx.wait();
    console.log(`setAllowlist -> ${wallets.length} wallets, allowed=${allowed}`);
  }

  if (process.env.PRICE_USDC !== undefined) {
    const wei = ethers.parseUnits(process.env.PRICE_USDC, 18);
    const tx = await nft.setAllowlistPrice(wei);
    await tx.wait();
    console.log("allowlistPrice ->", process.env.PRICE_USDC, "USDC");
  }

  if (process.env.LIMIT !== undefined) {
    const tx = await nft.setAllowlistMintLimit(BigInt(process.env.LIMIT));
    await tx.wait();
    console.log("allowlistMintLimit ->", process.env.LIMIT);
  }

  if (process.env.START !== undefined || process.env.END !== undefined) {
    if (process.env.START === undefined || process.env.END === undefined) {
      throw new Error("Set both START and END together.");
    }
    const start = toUnix(process.env.START);
    const end = toUnix(process.env.END);
    const tx = await nft.setAllowlistWindow(start, end);
    await tx.wait();
    console.log(`allowlistWindow -> [${start}, ${end}]`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

"use client";

// Live mint-phase state read straight from the NFT contract, for use anywhere
// on the marketing site (home hero, mint-info, schedule pills). Wallet-agnostic
// — it only reflects the owner-flipped phase switches, not per-wallet allowance.
// The richer, wallet-aware phase logic lives in components/LaunchpadMint.tsx.

import { useReadContract } from "wagmi";
import {
  ARCTOUNON_NFT_ADDRESS,
  arctounonNftAbi,
  isNftConfigured,
} from "./arctounon-nft";
import { arcChain } from "./arc-chain";

const nftContract = {
  address: ARCTOUNON_NFT_ADDRESS,
  abi: arctounonNftAbi,
  chainId: arcChain.id,
} as const;

export type MintPhase = "allowlist" | "public" | "none";
export type ScheduleStatus = "Live" | "Soon";

export type MintStatus = {
  /** True once a real contract address is wired in (else values are static). */
  configured: boolean;
  /** Active phase, allowlist taking priority when both are open. */
  phase: MintPhase;
  /** Any mint phase currently open on-chain. */
  isLive: boolean;
  registrationOpen: boolean;
  allowlistMintOpen: boolean;
  publicMintOpen: boolean;
};

export function useMintStatus(): MintStatus {
  const enabled = isNftConfigured;

  const { data: allowlistMintOpen } = useReadContract({
    ...nftContract,
    functionName: "allowlistMintOpen",
    query: { enabled },
  });
  const { data: publicMintOpen } = useReadContract({
    ...nftContract,
    functionName: "publicMintOpen",
    query: { enabled },
  });
  const { data: registrationOpen } = useReadContract({
    ...nftContract,
    functionName: "registrationOpen",
    query: { enabled },
  });

  const alOpen = Boolean(allowlistMintOpen);
  const pubOpen = Boolean(publicMintOpen);
  const phase: MintPhase = alOpen ? "allowlist" : pubOpen ? "public" : "none";

  return {
    configured: enabled,
    phase,
    isLive: phase !== "none",
    registrationOpen: Boolean(registrationOpen),
    allowlistMintOpen: alOpen,
    publicMintOpen: pubOpen,
  };
}

/** Live status for a MINT_SCHEDULE row, matched by its phase name. */
export function scheduleStatusFor(
  name: string,
  s: Pick<MintStatus, "allowlistMintOpen" | "publicMintOpen">,
): ScheduleStatus {
  const n = name.toLowerCase();
  if (n.startsWith("allowlist")) return s.allowlistMintOpen ? "Live" : "Soon";
  if (n.startsWith("public")) return s.publicMintOpen ? "Live" : "Soon";
  return "Soon";
}

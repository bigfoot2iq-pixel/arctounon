// Mint-phase bits shared by the marketing pages (home hero, mint-info,
// schedule). State is driven by the static MINT_LIVE flag in lib/collection.ts
// — the site sends no transactions and reads nothing from the contract. Flip
// MINT_LIVE when the mint opens.

import Link from "next/link";
import { MINT_LIVE } from "@/lib/collection";
import { ArrowRight } from "./icons";

/** Hero primary CTA — "Coming Soon" until MINT_LIVE, then a live mint link. */
export function HeroMintCta() {
  return (
    <Link
      href="/launchpad"
      className={"btn-aurora h-11 px-6 text-sm" + (MINT_LIVE ? " gap-1.5" : " btn-soon")}
    >
      {MINT_LIVE ? "Mint — Live" : "Mint — Coming Soon"}
      {MINT_LIVE ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

/** Hero stats strip — the "Mint" value flips Soon → Live. */
export function HeroMintStat() {
  return (
    <div className="flex flex-col">
      <span
        className={
          "font-mono text-xl font-bold sm:text-2xl " +
          (MINT_LIVE ? "text-glacier" : "text-frost")
        }
      >
        {MINT_LIVE ? "Live" : "Soon"}
      </span>
      <span className="eyebrow mt-0.5 !text-[9px] !tracking-[0.2em]">Mint</span>
    </div>
  );
}

/** MintInfo mini-stat tile — the "Mint" value flips TBA → Live. */
export function MintPhaseTile() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
      <p className="font-mono text-sm font-bold text-aurora">{MINT_LIVE ? "Live" : "TBA"}</p>
      <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Mint</p>
    </div>
  );
}

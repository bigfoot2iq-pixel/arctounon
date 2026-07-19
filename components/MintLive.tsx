"use client";

// Live, contract-driven bits embedded in otherwise-static server components
// (Hero, MintInfo). Each mirrors the markup of the placeholder it replaces so
// the layout is unchanged — only the copy/state flips when the owner opens a
// phase on-chain.

import Link from "next/link";
import { useMintStatus } from "@/lib/useMintStatus";
import { ArrowRight } from "./icons";

/** Hero primary CTA — "Coming Soon" until a phase opens, then a live mint link. */
export function HeroMintCta() {
  const { phase, isLive } = useMintStatus();

  const label =
    phase === "allowlist"
      ? "Mint — Allowlist Live"
      : phase === "public"
        ? "Mint — Public Live"
        : "Mint — Coming Soon";

  return (
    <Link
      href="/launchpad"
      className={"btn-aurora h-11 px-6 text-sm" + (isLive ? " gap-1.5" : " btn-soon")}
    >
      {label}
      {isLive ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

/** Hero stats strip — the "Mint" value flips Soon → Live. */
export function HeroMintStat() {
  const { isLive } = useMintStatus();
  return (
    <div className="flex flex-col">
      <span
        className={
          "font-mono text-xl font-bold sm:text-2xl " +
          (isLive ? "text-glacier" : "text-frost")
        }
      >
        {isLive ? "Live" : "Soon"}
      </span>
      <span className="eyebrow mt-0.5 !text-[9px] !tracking-[0.2em]">Mint</span>
    </div>
  );
}

/** MintInfo mini-stat tile — the "Mint" value flips TBA → Live. */
export function MintPhaseTile() {
  const { isLive } = useMintStatus();
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
      <p className="font-mono text-sm font-bold text-aurora">{isLive ? "Live" : "TBA"}</p>
      <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Mint</p>
    </div>
  );
}

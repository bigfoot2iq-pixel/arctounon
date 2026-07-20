"use client";

import { useState } from "react";
import Image from "next/image";
import {
  SITE,
  MAX_PER_WALLET,
  SHOWCASE,
  COLLECTION_STATS,
  MINT_SCHEDULE,
  MINT_LIVE,
} from "@/lib/collection";
import { Reveal } from "./ui/Reveal";
import { XIcon, Globe, Share, Verified, Plus, Minus, Clock } from "./icons";

// Display-only launchpad. The site sends no transactions and reads nothing from
// the contract — mint opens off-site. Everything here is static preview copy;
// flip MINT_LIVE in lib/collection.ts when the mint goes live.

const GALLERY_IMAGES = [SHOWCASE.hero, ...SHOWCASE.thumbs];

function StatusPill({ status }: { status: string }) {
  const live = status === "Live";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide " +
        (live ? "bg-teal/15 text-teal" : "bg-violet/15 text-violet")
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={"pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full " + (live ? "text-teal" : "text-violet")} />
        <span className={"relative inline-flex h-1.5 w-1.5 rounded-full " + (live ? "bg-teal" : "bg-violet")} />
      </span>
      {status}
    </span>
  );
}

export function LaunchpadMint() {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_PER_WALLET, q + 1));

  const supply = SITE.supply;
  const minted = 0;
  const mintedPct = Math.max(2, (minted / supply) * 100);

  const phaseTitle = MINT_LIVE ? "Public Phase" : "Mint";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      {/* ---- Collection identity bar ---- */}
      <Reveal className="glass rounded-2xl p-3.5 sm:p-4">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="ring-aurora relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
              <Image src="/art/1.png" alt={SITE.name} fill sizes="44px" className="object-cover" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-lg font-bold tracking-tight text-frost">{SITE.name}</h1>
                <Verified className="h-4 w-4 shrink-0 text-glacier" />
                <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-glacier sm:inline-flex">
                  <span className="h-1 w-1 rounded-full bg-violet" />
                  {SITE.chainTagline}
                </span>
              </div>
              <p className="mt-0.5 max-w-md truncate text-xs text-muted">{SITE.tagline}</p>
            </div>
          </div>

          {/* Utility buttons */}
          <div className="flex items-center gap-1.5">
            <a
              href={SITE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Arctounon on X"
              className="btn-ghost h-9 w-9 p-0"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href={SITE.links.arc}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost h-9 gap-1.5 px-3 text-[13px]"
            >
              <Globe className="h-3.5 w-3.5" />
              Arc
            </a>
            <button type="button" aria-label="Share" className="btn-ghost h-9 w-9 p-0">
              <Share className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:grid-cols-4">
          {COLLECTION_STATS.map((s) => (
            <div key={s.label} className="bg-surface/60 px-3.5 py-2">
              <p className="font-mono text-sm font-bold text-frost">{s.value}</p>
              <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.16em]">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ---- Main: gallery + mint panel ---- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Gallery */}
        <Reveal delay={80} className="flex flex-col gap-2.5">
          <div className="ring-aurora glass relative overflow-hidden rounded-2xl p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                key={GALLERY_IMAGES[active]}
                src={GALLERY_IMAGES[active]}
                alt="Arctounon preview"
                fill
                priority
                sizes="(max-width:1024px) 92vw, 55vw"
                className="object-cover"
              />
              <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5 text-glacier">
                  <span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glacier" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-frost">Live preview</span>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {GALLERY_IMAGES.slice(1, 5).map((src, i) => {
              const idx = i + 1;
              const on = active === idx;
              return (
                <button
                  key={src}
                  onClick={() => setActive(idx)}
                  aria-label={`Preview ${idx}`}
                  className={
                    "relative aspect-square overflow-hidden rounded-lg border transition-all " +
                    (on ? "border-transparent ring-aurora" : "border-white/10 opacity-60 hover:opacity-100")
                  }
                >
                  <Image src={src} alt="" fill sizes="18vw" className="object-cover" />
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Mint panel */}
        <Reveal delay={140} className="glass flex h-fit flex-col rounded-2xl p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow !text-[9px]">Mint phase</p>
              <h2 className="mt-0.5 font-display text-base font-bold text-frost">{phaseTitle}</h2>
            </div>
            <StatusPill status={MINT_LIVE ? "Live" : "Soon"} />
          </div>

          <div className="mt-3.5 flex items-end justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
            <div>
              <p className="eyebrow !text-[9px] !tracking-[0.16em]">Price</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-frost">TBA</p>
            </div>
            <p className="font-mono text-[11px] text-faint">per panda</p>
          </div>

          {/* Quantity (preview) */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[9px] !tracking-[0.16em]">Quantity</p>
              <p className="font-mono text-[11px] text-faint">Max {MAX_PER_WALLET} / wallet</p>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
              <button
                onClick={dec}
                disabled={qty <= 1}
                aria-label="Decrease"
                className="btn-ghost h-9 w-9 p-0 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-display text-xl font-bold text-frost">{qty}</span>
              <button
                onClick={inc}
                disabled={qty >= MAX_PER_WALLET}
                aria-label="Increase"
                className="btn-ghost h-9 w-9 p-0 disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[13px]">
            <span className="text-muted">Total</span>
            <span className="flex items-center gap-2 text-sm font-bold text-frost">TBA {SITE.currency}</span>
          </div>

          {/* CTA — display only; minting opens off-site */}
          <button disabled className="btn-aurora btn-soon mt-3.5 h-11 w-full text-sm">
            {MINT_LIVE ? "Mint" : "Mint — Coming Soon"}
          </button>

          {/* Supply progress */}
          <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between font-mono text-[11px] text-muted">
              <span>Minted</span>
              <span>
                <span className="text-frost">{minted.toLocaleString()}</span> / {supply.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-ice to-glacier" style={{ width: `${mintedPct}%` }} />
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-faint">
            Follow{" "}
            <a href={SITE.links.x} target="_blank" rel="noopener noreferrer" className="text-glacier hover:underline">
              @Arctounon
            </a>{" "}
            for the go-live.
          </p>

          {/* Mint schedule */}
          <div className="mt-4 border-t border-white/10 pt-3.5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-frost">
                <Clock className="h-3.5 w-3.5 text-glacier" />
                Mint schedule
              </h3>
              <a
                href="/allowlist"
                className="text-[11px] text-glacier hover:underline"
              >
                Join allowlist
              </a>
            </div>

            <ul className="mt-2.5 space-y-1.5">
              {MINT_SCHEDULE.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-frost">{p.name}</p>
                    <p className="truncate text-[11px] text-muted">{p.note}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[11px] text-frost">{p.price}</span>
                    <StatusPill status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* ---- Leaderboard (unlocks at mint) ---- */}
      <Reveal delay={80} className="glass mt-4 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-frost">Top minters</h3>
          <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet">
            Coming soon
          </span>
        </div>
        <div className="mt-3 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-7 text-center">
          <p className="font-display text-sm font-bold text-frost">The leaderboard is frozen</p>
          <p className="max-w-sm text-xs text-muted">
            Once the mint opens, the pack&apos;s biggest forgers show up here. Be one of them.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

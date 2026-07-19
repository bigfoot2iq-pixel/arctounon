"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { formatUnits } from "viem";
import {
  SITE,
  MAX_PER_WALLET,
  SHOWCASE,
  COLLECTION_STATS,
  MINT_SCHEDULE,
} from "@/lib/collection";
import {
  ARCTOUNON_NFT_ADDRESS,
  arctounonNftAbi,
  isNftConfigured,
} from "@/lib/arctounon-nft";
import { scheduleStatusFor } from "@/lib/useMintStatus";
import { Reveal } from "./ui/Reveal";
import { XIcon, Globe, Share, Verified, Plus, Minus, Clock, Wallet } from "./icons";
import {
  useAccount,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { arcChain, shortAddress } from "@/lib/arc-chain";

const GALLERY_IMAGES = [SHOWCASE.hero, ...SHOWCASE.thumbs];

const nftContract = {
  address: ARCTOUNON_NFT_ADDRESS,
  abi: arctounonNftAbi,
  chainId: arcChain.id,
} as const;

type MintPhase = "allowlist" | "public" | "none";

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

function MintCta({
  phase,
  qty,
  valueWei,
  canMint,
  onMinted,
}: {
  phase: MintPhase;
  qty: number;
  valueWei: bigint;
  canMint: boolean;
  onMinted: () => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: switching, error: switchError } = useSwitchChain();
  const onArc = isConnected && chainId === arcChain.id;

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (confirmed) onMinted();
  }, [confirmed, onMinted]);

  const submit = () => {
    reset();
    if (phase === "allowlist") {
      writeContract({ ...nftContract, functionName: "allowlistMint", args: [BigInt(qty)] });
    } else if (phase === "public") {
      writeContract({ ...nftContract, functionName: "publicMint", args: [BigInt(qty)], value: valueWei });
    }
  };

  let button: React.ReactNode;
  if (!isConnected) {
    button = (
      <button onClick={openConnectModal} className="btn-aurora mt-3.5 h-11 w-full gap-1.5 text-sm">
        <Wallet className="h-4 w-4" />
        Connect wallet to mint
      </button>
    );
  } else if (!onArc) {
    button = (
      <button
        onClick={() => switchChain({ chainId: arcChain.id })}
        disabled={switching}
        className="btn-aurora mt-3.5 h-11 w-full gap-1.5 text-sm disabled:opacity-60"
      >
        {switching ? "Switching…" : `Switch to ${arcChain.name}`}
      </button>
    );
  } else if (phase === "none") {
    button = (
      <button disabled className="btn-aurora btn-soon mt-3.5 h-11 w-full text-sm">
        {confirmed ? "Minted ✓" : "Mint — Coming Soon"}
      </button>
    );
  } else {
    const label = phase === "allowlist" ? `Mint ${qty} free` : `Mint ${qty} now`;
    button = (
      <button
        onClick={submit}
        disabled={!canMint || isPending || confirming}
        className="btn-aurora mt-3.5 h-11 w-full text-sm disabled:opacity-60"
      >
        {isPending ? "Confirm in wallet…" : confirming ? "Minting…" : confirmed ? "Minted ✓ — mint more" : label}
      </button>
    );
  }

  return (
    <>
      {button}
      {(error || switchError) ? (
        <p className="mt-2 text-center text-[11px] text-violet" role="alert">
          {(error || switchError)!.message.split("\n")[0]}
        </p>
      ) : null}
      {isConnected && address ? (
        <p className="mt-2 text-center font-mono text-[11px] text-faint">
          {shortAddress(address)} · {onArc ? arcChain.name : "wrong network"}
        </p>
      ) : null}
    </>
  );
}

export function LaunchpadMint() {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const { address, isConnected, chainId } = useAccount();
  const onArc = isConnected && chainId === arcChain.id;
  const readEnabled = isNftConfigured;
  const walletReadEnabled = readEnabled && !!address;

  // ---- Live contract reads -------------------------------------------------
  const { data: allowlistMintOpen } = useReadContract({
    ...nftContract, functionName: "allowlistMintOpen", query: { enabled: readEnabled },
  });
  const { data: publicMintOpen } = useReadContract({
    ...nftContract, functionName: "publicMintOpen", query: { enabled: readEnabled },
  });
  const { data: publicPrice } = useReadContract({
    ...nftContract, functionName: "publicPrice", query: { enabled: readEnabled },
  });
  const { data: totalMinted, refetch: refetchTotal } = useReadContract({
    ...nftContract, functionName: "totalMinted", query: { enabled: readEnabled },
  });
  const { data: mintedByWallet, refetch: refetchMinted } = useReadContract({
    ...nftContract, functionName: "minted", args: address ? [address] : undefined,
    query: { enabled: walletReadEnabled },
  });
  const { data: allowance } = useReadContract({
    ...nftContract, functionName: "allowlistAllowance", args: address ? [address] : undefined,
    query: { enabled: walletReadEnabled },
  });
  const { data: freeMinted } = useReadContract({
    ...nftContract, functionName: "freeMinted", args: address ? [address] : undefined,
    query: { enabled: walletReadEnabled },
  });

  // ---- Derived phase + per-wallet limits ----------------------------------
  const priceWei = (publicPrice ?? 0n) as bigint;
  const mintedCount = Number(mintedByWallet ?? 0n);
  const allowanceCount = Number(allowance ?? 0n);
  const freeUsed = Number(freeMinted ?? 0n);
  const walletRemaining = Math.max(0, MAX_PER_WALLET - mintedCount);
  const allowlistRemaining = Math.max(0, Math.min(allowanceCount - freeUsed, walletRemaining));

  const phase: MintPhase =
    allowlistMintOpen && allowlistRemaining > 0
      ? "allowlist"
      : publicMintOpen
        ? "public"
        : "none";

  // How many this wallet may mint right now in the active phase.
  const maxQty =
    phase === "allowlist" ? allowlistRemaining : phase === "public" ? walletRemaining : MAX_PER_WALLET;
  const capForStepper = Math.max(1, maxQty);

  // Keep the chosen quantity within the current cap.
  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), capForStepper));
  }, [capForStepper]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(capForStepper, q + 1));

  const isFree = phase === "allowlist";
  const totalWei = isFree ? 0n : priceWei * BigInt(qty);
  const canMint = onArc && phase !== "none" && maxQty > 0 && qty <= maxQty;

  const perPandaLabel =
    phase === "allowlist"
      ? "Free"
      : priceWei > 0n
        ? `${formatUnits(priceWei, 18)}`
        : "TBA";
  const totalLabel = isFree
    ? "Free"
    : priceWei > 0n
      ? `${formatUnits(totalWei, 18)} ${SITE.currency}`
      : `TBA ${SITE.currency}`;

  const supply = SITE.supply;
  const minted = Number(totalMinted ?? 0n);
  const mintedPct = Math.min(100, Math.max(2, (minted / supply) * 100));

  const phaseTitle =
    phase === "allowlist" ? "Allowlist Phase" : phase === "public" ? "Public Phase" : "Mint";
  const phaseLive = phase !== "none";

  const onMinted = useCallback(() => {
    refetchTotal();
    refetchMinted();
  }, [refetchTotal, refetchMinted]);

  // Live override of the static "Minted" stat.
  const stats = COLLECTION_STATS.map((s) =>
    s.label === "Minted" && readEnabled ? { ...s, value: minted.toLocaleString() } : s,
  );

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
          {stats.map((s) => (
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
            <StatusPill status={phaseLive ? "Live" : "Soon"} />
          </div>

          <div className="mt-3.5 flex items-end justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
            <div>
              <p className="eyebrow !text-[9px] !tracking-[0.16em]">Price</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-frost">
                {perPandaLabel} {!isFree ? <span className="text-sm text-muted">{SITE.currency}</span> : null}
              </p>
            </div>
            <p className="font-mono text-[11px] text-faint">per panda</p>
          </div>

          {/* Quantity */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[9px] !tracking-[0.16em]">Quantity</p>
              <p className="font-mono text-[11px] text-faint">
                {isConnected && readEnabled
                  ? `${walletRemaining} left · max ${MAX_PER_WALLET} / wallet`
                  : `Max ${MAX_PER_WALLET} / wallet`}
              </p>
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
                disabled={qty >= capForStepper}
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
            <span className="flex items-center gap-2 text-sm font-bold text-frost">{totalLabel}</span>
          </div>

          {/* CTA — wallet-gated: connect, then be on Arc, then mint */}
          <MintCta phase={phase} qty={qty} valueWei={totalWei} canMint={canMint} onMinted={onMinted} />

          {phase === "allowlist" ? (
            <p className="mt-2 text-center text-[11px] text-teal">
              Allowlist active — {allowlistRemaining} free mint{allowlistRemaining === 1 ? "" : "s"} left for you.
            </p>
          ) : null}

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
                View eligibility
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
                    <StatusPill
                      status={
                        readEnabled
                          ? scheduleStatusFor(p.name, {
                              allowlistMintOpen: Boolean(allowlistMintOpen),
                              publicMintOpen: Boolean(publicMintOpen),
                            })
                          : p.status
                      }
                    />
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

"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, isAddress, parseUnits } from "viem";
import {
  ARCTOUNON_NFT_ADDRESS,
  arctounonNftAbi,
  isNftConfigured,
} from "@/lib/arctounon-nft";
import { arcChain, shortAddress } from "@/lib/arc-chain";
import { SITE } from "@/lib/collection";
import { ConnectButton } from "./ConnectButton";
import { Reveal } from "./ui/Reveal";
import { Check, Clock, Wallet } from "./icons";

// Owner-only admin console. Reads the live contract state on load, then exposes
// every onlyOwner setter as a small form. Nothing here is reachable from the
// public nav — it's an unlisted /owner route. Writes still revert on-chain for
// anyone who isn't the owner, so this is convenience, not the access control.

// ---- helpers ---------------------------------------------------------------

function cleanErr(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { shortMessage?: string; message?: string };
    return err.shortMessage || err.message || "Transaction failed";
  }
  return "Transaction failed";
}

const fmtUsdc = (v?: bigint) =>
  v === undefined ? "…" : `${formatUnits(v, 18)} ${SITE.currency}`;
const fmtNum = (v?: bigint) => (v === undefined ? "…" : v.toString());
const fmtDate = (v?: bigint) => {
  if (v === undefined) return "…";
  if (v === 0n) return "not set";
  return new Date(Number(v) * 1000).toLocaleString();
};

// datetime-local -> unix seconds. The input holds local wall-clock time, and
// `new Date("YYYY-MM-DDTHH:mm")` parses as local, so the conversion is direct.
function fromLocalInput(s: string): bigint {
  if (!s) return 0n;
  const ms = new Date(s).getTime();
  return Number.isNaN(ms) ? 0n : BigInt(Math.floor(ms / 1000));
}

function parseAddrs(s: string): `0x${string}`[] {
  const set = new Set<string>();
  for (const raw of s.split(/[\s,]+/)) {
    const a = raw.trim();
    if (isAddress(a)) set.add(a.toLowerCase());
  }
  return [...set] as `0x${string}`[];
}

// A price string that parses to a non-negative USDC amount.
function priceOk(s: string): boolean {
  if (!/^\d+(\.\d+)?$/.test(s.trim())) return false;
  try {
    parseUnits(s.trim(), 18);
    return true;
  } catch {
    return false;
  }
}

// ---- one transaction lifecycle (send -> confirm -> refetch) ----------------

function useTx() {
  const qc = useQueryClient();
  const { writeContractAsync, isPending, reset } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();
  const receipt = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  useEffect(() => {
    if (receipt.isSuccess) qc.invalidateQueries();
  }, [receipt.isSuccess, qc]);

  async function send(functionName: string, args: readonly unknown[]) {
    setError(undefined);
    setHash(undefined);
    reset();
    try {
      const h = await writeContractAsync({
        address: ARCTOUNON_NFT_ADDRESS,
        abi: arctounonNftAbi,
        functionName,
        args,
      } as unknown as Parameters<typeof writeContractAsync>[0]);
      setHash(h);
    } catch (e) {
      setError(cleanErr(e));
    }
  }

  return {
    send,
    busy: isPending || receipt.isLoading,
    isPending,
    confirming: receipt.isLoading,
    done: receipt.isSuccess,
    error: error ?? (receipt.error ? cleanErr(receipt.error) : undefined),
  };
}

type Tx = ReturnType<typeof useTx>;

// A single no-arg view read, gated until the contract address is configured.
function useNftRead(functionName: string) {
  return useReadContract({
    address: ARCTOUNON_NFT_ADDRESS,
    abi: arctounonNftAbi,
    functionName,
    query: { enabled: isNftConfigured },
  } as unknown as Parameters<typeof useReadContract>[0]);
}

// ---- small presentational pieces -------------------------------------------

function TxNote({ tx }: { tx: Tx }) {
  if (tx.error)
    return (
      <p className="mt-2 text-[11px] text-violet" role="alert">
        {tx.error}
      </p>
    );
  if (tx.isPending)
    return <p className="mt-2 text-[11px] text-glacier">Confirm in your wallet…</p>;
  if (tx.confirming)
    return <p className="mt-2 text-[11px] text-glacier">Waiting for the block…</p>;
  if (tx.done) return <p className="mt-2 text-[11px] text-teal">Saved on-chain ✓</p>;
  return null;
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="glass rounded-2xl p-4 sm:p-5">
      <h2 className="font-display text-base font-bold text-frost">{title}</h2>
      {hint ? <p className="mt-0.5 text-[12px] text-muted">{hint}</p> : null}
      <div className="mt-3.5">{children}</div>
    </Reveal>
  );
}

function Current({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[11px] text-faint">
      {label}: <span className="font-mono text-glacier">{value}</span>
    </p>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 font-mono text-[13px] text-frost outline-none transition-colors placeholder:text-faint focus:border-glacier disabled:opacity-40";

function ActionButton({
  onClick,
  disabled,
  busy,
  children,
  variant = "aurora",
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  children: React.ReactNode;
  variant?: "aurora" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className={
        (variant === "aurora" ? "btn-aurora" : "btn-ghost") +
        " h-11 px-4 text-sm disabled:opacity-40 " +
        (disabled && variant === "aurora" ? "btn-soon" : "")
      }
    >
      {busy ? "Working…" : children}
    </button>
  );
}

// ---- the console ------------------------------------------------------------

export function OwnerConsole() {
  const [mounted, setMounted] = useState(false);
  // Live "now", kept out of render to stay pure; refreshed every 30s so the
  // window helper stays roughly current.
  const [now, setNow] = useState(0n);
  useEffect(() => {
    setMounted(true);
    setNow(BigInt(Math.floor(Date.now() / 1000)));
    const id = setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 30_000);
    return () => clearInterval(id);
  }, []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // ---- reads (cached by react-query; refetched after every write) ----
  const ownerRead = useNftRead("owner");
  const publicOpen = useNftRead("publicMintOpen");
  const publicPrice = useNftRead("publicPrice");
  const alPrice = useNftRead("allowlistPrice");
  const alStart = useNftRead("allowlistStart");
  const alEnd = useNftRead("allowlistEnd");
  const alLimit = useNftRead("allowlistMintLimit");
  const alOpen = useNftRead("allowlistOpen");
  const totalMinted = useNftRead("totalMinted");
  const maxSupply = useNftRead("MAX_SUPPLY");
  const balance = useBalance({
    address: ARCTOUNON_NFT_ADDRESS,
    chainId: arcChain.id,
    query: { enabled: isNftConfigured },
  });

  const owner = ownerRead.data as string | undefined;
  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();
  const wrongChain = isConnected && chainId !== arcChain.id;
  const canWrite = isConnected && isOwner && !wrongChain;

  // ---- form state ----
  const [publicPriceIn, setPublicPriceIn] = useState("");
  const [baseUriIn, setBaseUriIn] = useState("");
  const [alPriceIn, setAlPriceIn] = useState("");
  const [alLimitIn, setAlLimitIn] = useState("");
  const [alStartIn, setAlStartIn] = useState("");
  const [alEndIn, setAlEndIn] = useState("");
  const [listIn, setListIn] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [mintQty, setMintQty] = useState("");
  const [withdrawTo, setWithdrawTo] = useState("");
  const [checkAddr, setCheckAddr] = useState("");

  // ---- one tx lifecycle per action group ----
  const txPubOpen = useTx();
  const txPubPrice = useTx();
  const txBaseUri = useTx();
  const txAlPrice = useTx();
  const txAlLimit = useTx();
  const txAlWindow = useTx();
  const txAlList = useTx();
  const txMint = useTx();
  const txWithdraw = useTx();

  // Live allowlist status lookup for an arbitrary address.
  const checkRead = useReadContract({
    address: ARCTOUNON_NFT_ADDRESS,
    abi: arctounonNftAbi,
    functionName: "allowlisted",
    args: [checkAddr as `0x${string}`],
    query: { enabled: isNftConfigured && isAddress(checkAddr) },
  } as unknown as Parameters<typeof useReadContract>[0]);

  const listAddrs = parseAddrs(listIn);

  // ---- gated render states ----
  if (!mounted) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-8 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-glacier" />
        </div>
      </Shell>
    );
  }

  if (!isNftConfigured) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-8 text-center">
          <h1 className="font-display text-xl font-bold text-frost">
            No contract wired
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Set <span className="font-mono text-glacier">NEXT_PUBLIC_ARCTOUNON_NFT_ADDRESS</span>{" "}
            (or re-run <span className="font-mono">export-abi.cjs &lt;address&gt;</span>) so the
            console knows which deployment to talk to.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Access banner */}
      <Reveal className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={
                "flex h-9 w-9 items-center justify-center rounded-xl " +
                (canWrite ? "bg-teal/15 text-teal" : "bg-violet/15 text-violet")
              }
            >
              {canWrite ? <Check className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-frost">
                {!isConnected
                  ? "Connect the owner wallet"
                  : wrongChain
                    ? `Switch to ${arcChain.name}`
                    : isOwner
                      ? "Owner verified"
                      : "This wallet is not the owner"}
              </p>
              <p className="text-[11px] text-muted">
                Owner:{" "}
                <span className="font-mono text-glacier">
                  {owner ? shortAddress(owner) : "…"}
                </span>
                {isConnected && address ? (
                  <>
                    {" · "}You: <span className="font-mono">{shortAddress(address)}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <ConnectButton />
        </div>
        {isConnected && !isOwner && !wrongChain ? (
          <p className="mt-3 rounded-xl border border-violet/30 bg-violet/10 px-3 py-2 text-[11px] text-violet">
            Read-only: this wallet isn&apos;t the contract owner. Setters will revert if you send
            them.
          </p>
        ) : null}
      </Reveal>

      {/* State overview */}
      <Reveal delay={60} className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-frost">Contract state</h2>
          <span className="font-mono text-[10px] text-faint">
            {shortAddress(ARCTOUNON_NFT_ADDRESS)}
          </span>
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:grid-cols-3">
          <Stat label="Public mint" value={publicOpen.data === undefined ? "…" : publicOpen.data ? "Open" : "Closed"} />
          <Stat label="Public price" value={fmtUsdc(publicPrice.data as bigint | undefined)} />
          <Stat label="Total minted" value={`${fmtNum(totalMinted.data as bigint | undefined)} / ${fmtNum(maxSupply.data as bigint | undefined)}`} />
          <Stat label="Allowlist" value={alOpen.data === undefined ? "…" : alOpen.data ? "Open" : "Closed"} />
          <Stat label="Allowlist price" value={fmtUsdc(alPrice.data as bigint | undefined)} />
          <Stat label="Per-wallet limit" value={fmtNum(alLimit.data as bigint | undefined)} />
          <Stat label="Window start" value={fmtDate(alStart.data as bigint | undefined)} />
          <Stat label="Window end" value={fmtDate(alEnd.data as bigint | undefined)} />
          <Stat label="Balance" value={balance.data ? `${balance.data.formatted} ${balance.data.symbol}` : "…"} />
        </div>
      </Reveal>

      {/* ---- Allowlist members ---- */}
      <Card
        title="Allowlist members"
        hint="One or more addresses (newline / space / comma separated). Add or revoke in a single transaction."
      >
        <textarea
          value={listIn}
          onChange={(e) => setListIn(e.target.value)}
          placeholder={"0xabc…\n0xdef…"}
          rows={4}
          spellCheck={false}
          className={inputCls + " h-auto py-2.5 leading-relaxed"}
        />
        <p className="mt-1.5 text-[11px] text-faint">
          {listAddrs.length} valid address{listAddrs.length === 1 ? "" : "es"} detected.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton
            onClick={() => txAlList.send("setAllowlist", [listAddrs, true])}
            disabled={!canWrite || listAddrs.length === 0}
            busy={txAlList.busy}
          >
            Add to allowlist
          </ActionButton>
          <ActionButton
            variant="ghost"
            onClick={() => txAlList.send("setAllowlist", [listAddrs, false])}
            disabled={!canWrite || listAddrs.length === 0}
            busy={txAlList.busy}
          >
            Revoke
          </ActionButton>
        </div>
        <TxNote tx={txAlList} />

        {/* status lookup */}
        <div className="mt-4 border-t border-white/10 pt-3.5">
          <label className="eyebrow !text-[9px]">Check a wallet</label>
          <input
            value={checkAddr}
            onChange={(e) => setCheckAddr(e.target.value)}
            placeholder="0x…"
            spellCheck={false}
            className={inputCls + " mt-1.5"}
          />
          {isAddress(checkAddr) ? (
            <p className="mt-1.5 text-[11px]">
              {checkRead.data === undefined ? (
                <span className="text-faint">Checking…</span>
              ) : checkRead.data ? (
                <span className="text-teal">On the allowlist ✓</span>
              ) : (
                <span className="text-muted">Not on the allowlist</span>
              )}
            </p>
          ) : null}
        </div>
      </Card>

      {/* ---- Allowlist window ---- */}
      <Card
        title="Allowlist window"
        hint="Start and end of the allowlist mint, in your local time. Start must be before end."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="eyebrow !text-[9px]">Start</label>
            <input
              type="datetime-local"
              value={alStartIn}
              onChange={(e) => setAlStartIn(e.target.value)}
              className={inputCls + " mt-1.5"}
            />
          </div>
          <div>
            <label className="eyebrow !text-[9px]">End</label>
            <input
              type="datetime-local"
              value={alEndIn}
              onChange={(e) => setAlEndIn(e.target.value)}
              className={inputCls + " mt-1.5"}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-faint">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Now: <span className="font-mono">{fmtDate(now)}</span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ActionButton
            onClick={() =>
              txAlWindow.send("setAllowlistWindow", [
                fromLocalInput(alStartIn),
                fromLocalInput(alEndIn),
              ])
            }
            disabled={
              !canWrite ||
              !alStartIn ||
              !alEndIn ||
              fromLocalInput(alStartIn) >= fromLocalInput(alEndIn)
            }
            busy={txAlWindow.busy}
          >
            Set window
          </ActionButton>
          <ActionButton
            variant="ghost"
            onClick={() => txAlWindow.send("setAllowlistWindow", [0n, 0n])}
            disabled={!canWrite}
            busy={txAlWindow.busy}
          >
            Close phase
          </ActionButton>
        </div>
        <div className="mt-2 space-y-0.5">
          <Current label="Current start" value={fmtDate(alStart.data as bigint | undefined)} />
          <Current label="Current end" value={fmtDate(alEnd.data as bigint | undefined)} />
        </div>
        <TxNote tx={txAlWindow} />
      </Card>

      {/* ---- Allowlist price + limit ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Allowlist price" hint={`Per token, in ${SITE.currency}.`}>
          <input
            value={alPriceIn}
            onChange={(e) => setAlPriceIn(e.target.value)}
            placeholder="0.03"
            inputMode="decimal"
            className={inputCls}
          />
          <div className="mt-3">
            <ActionButton
              onClick={() => txAlPrice.send("setAllowlistPrice", [parseUnits(alPriceIn.trim(), 18)])}
              disabled={!canWrite || !priceOk(alPriceIn)}
              busy={txAlPrice.busy}
            >
              Set price
            </ActionButton>
          </div>
          <p className="mt-2">
            <Current label="Current" value={fmtUsdc(alPrice.data as bigint | undefined)} />
          </p>
          <TxNote tx={txAlPrice} />
        </Card>

        <Card title="Per-wallet limit" hint="Max tokens each allowlisted wallet may mint.">
          <input
            value={alLimitIn}
            onChange={(e) => setAlLimitIn(e.target.value.replace(/\D/g, ""))}
            placeholder="2"
            inputMode="numeric"
            className={inputCls}
          />
          <div className="mt-3">
            <ActionButton
              onClick={() => txAlLimit.send("setAllowlistMintLimit", [BigInt(alLimitIn || "0")])}
              disabled={!canWrite || !alLimitIn}
              busy={txAlLimit.busy}
            >
              Set limit
            </ActionButton>
          </div>
          <p className="mt-2">
            <Current label="Current" value={fmtNum(alLimit.data as bigint | undefined)} />
          </p>
          <TxNote tx={txAlLimit} />
        </Card>
      </div>

      {/* ---- Public phase ---- */}
      <Card title="Public phase" hint="Open the paid public mint and set its per-token price.">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => txPubOpen.send("setPublicMintOpen", [true])}
            disabled={!canWrite || publicOpen.data === true}
            busy={txPubOpen.busy}
          >
            Open public mint
          </ActionButton>
          <ActionButton
            variant="ghost"
            onClick={() => txPubOpen.send("setPublicMintOpen", [false])}
            disabled={!canWrite || publicOpen.data === false}
            busy={txPubOpen.busy}
          >
            Close
          </ActionButton>
        </div>
        <TxNote tx={txPubOpen} />
        <div className="mt-4 border-t border-white/10 pt-3.5">
          <label className="eyebrow !text-[9px]">Public price ({SITE.currency})</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <input
              value={publicPriceIn}
              onChange={(e) => setPublicPriceIn(e.target.value)}
              placeholder="0.05"
              inputMode="decimal"
              className={inputCls + " sm:max-w-xs"}
            />
            <ActionButton
              onClick={() => txPubPrice.send("setPublicPrice", [parseUnits(publicPriceIn.trim(), 18)])}
              disabled={!canWrite || !priceOk(publicPriceIn)}
              busy={txPubPrice.busy}
            >
              Set price
            </ActionButton>
          </div>
          <p className="mt-2">
            <Current label="Current" value={fmtUsdc(publicPrice.data as bigint | undefined)} />
          </p>
          <TxNote tx={txPubPrice} />
        </div>
      </Card>

      {/* ---- Owner mint ---- */}
      <Card title="Owner mint" hint="Mint free straight to an address (team / treasury). Exempt from the per-wallet cap, still bounded by supply.">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
            placeholder="0x… recipient"
            spellCheck={false}
            className={inputCls}
          />
          <input
            value={mintQty}
            onChange={(e) => setMintQty(e.target.value.replace(/\D/g, ""))}
            placeholder="Qty"
            inputMode="numeric"
            className={inputCls + " sm:w-28"}
          />
        </div>
        <div className="mt-3">
          <ActionButton
            onClick={() => txMint.send("ownerMint", [mintTo as `0x${string}`, BigInt(mintQty || "0")])}
            disabled={!canWrite || !isAddress(mintTo) || !mintQty || mintQty === "0"}
            busy={txMint.busy}
          >
            Mint
          </ActionButton>
        </div>
        <TxNote tx={txMint} />
      </Card>

      {/* ---- Metadata + withdraw ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Base URI" hint="Metadata base. Must end with '/'. Tokens resolve to <base><id>.json.">
          <input
            value={baseUriIn}
            onChange={(e) => setBaseUriIn(e.target.value)}
            placeholder="ipfs://…/"
            spellCheck={false}
            className={inputCls}
          />
          <div className="mt-3">
            <ActionButton
              onClick={() => txBaseUri.send("setBaseURI", [baseUriIn.trim()])}
              disabled={!canWrite || !baseUriIn.trim()}
              busy={txBaseUri.busy}
            >
              Set base URI
            </ActionButton>
          </div>
          <TxNote tx={txBaseUri} />
        </Card>

        <Card title="Withdraw" hint="Send the full contract balance to an address.">
          <input
            value={withdrawTo}
            onChange={(e) => setWithdrawTo(e.target.value)}
            placeholder={owner ? `${shortAddress(owner)} (owner)` : "0x…"}
            spellCheck={false}
            className={inputCls}
          />
          <div className="mt-3">
            <ActionButton
              onClick={() => txWithdraw.send("withdraw", [withdrawTo as `0x${string}`])}
              disabled={!canWrite || !isAddress(withdrawTo)}
              busy={txWithdraw.busy}
            >
              Withdraw {balance.data ? `${balance.data.formatted} ${balance.data.symbol}` : ""}
            </ActionButton>
          </div>
          <TxNote tx={txWithdraw} />
        </Card>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-glacier">
          <span className="h-1 w-1 rounded-full bg-glacier" /> Owner console
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-frost sm:text-3xl">
          Contract controls
        </h1>
      </Reveal>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface/60 px-3.5 py-2.5">
      <p className="font-mono text-[13px] font-bold text-frost">{value}</p>
      <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.16em]">{label}</p>
    </div>
  );
}

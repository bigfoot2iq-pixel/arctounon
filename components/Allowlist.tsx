"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { shortAddress } from "@/lib/arc-chain";
import {
  X_HANDLE,
  ALLOWLIST_POST_ID,
  ALLOWLIST_CELEBRATION,
  ALLOWLIST_TASK_SECONDS,
  ALLOWLIST_DEADLINE,
} from "@/lib/collection";
import { Reveal } from "./ui/Reveal";
import {
  XIcon,
  Wallet,
  Check,
  UserPlus,
  Heart,
  Repeat,
  Megaphone,
  ArrowUpRight,
} from "./icons";

// ---- Social tasks (honor-system, timer-gated) ---------------------------
type TaskId = "follow" | "like" | "retweet" | "post";
type TaskStatus = "idle" | "running" | "done";

const TASKS: {
  id: TaskId;
  title: string;
  subtitle: string;
  action: string;
  icon: (c: { className?: string }) => React.ReactNode;
  href: () => string;
}[] = [
  {
    id: "follow",
    title: "Follow @Arctounon on X",
    subtitle: "Stay close to the pack for every drop.",
    action: "Follow",
    icon: (c) => <UserPlus {...c} />,
    href: () => `https://x.com/intent/follow?screen_name=${X_HANDLE}`,
  },
  {
    id: "like",
    title: "Like the announcement",
    subtitle: "Show the campaign post some love.",
    action: "Like",
    icon: (c) => <Heart {...c} />,
    href: () => `https://x.com/intent/like?tweet_id=${ALLOWLIST_POST_ID}`,
  },
  {
    id: "retweet",
    title: "Retweet the post",
    subtitle: "Spread the word across the timeline.",
    action: "Retweet",
    icon: (c) => <Repeat {...c} />,
    href: () => `https://x.com/intent/retweet?tweet_id=${ALLOWLIST_POST_ID}`,
  },
  {
    id: "post",
    title: "Post your celebration",
    subtitle: "Tell X you just joined the allowlist.",
    action: "Post",
    icon: (c) => <Megaphone {...c} />,
    href: () =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(ALLOWLIST_CELEBRATION)}`,
  },
];

type Statuses = Record<TaskId, TaskStatus>;
type Timers = Record<TaskId, number>;

const initialStatuses: Statuses = { follow: "idle", like: "idle", retweet: "idle", post: "idle" };
const initialTimers: Timers = { follow: 0, like: 0, retweet: 0, post: 0 };

const submittedKey = (addr: string) => `arc_allowlist:${addr.toLowerCase()}`;

// A handful of pandas from the collection, shown as the "pack" on this page.
const ALLOWLIST_ART = ["/art/2.png", "/art/7.png", "/art/9.png", "/art/11.png", "/art/4.png"];

/** Overlapping circular panda avatars — the pack you're joining. */
function PackCluster() {
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="flex -space-x-3">
        {ALLOWLIST_ART.map((src, i) => (
          <span
            key={src}
            style={{ zIndex: ALLOWLIST_ART.length - i }}
            className="ring-aurora relative h-11 w-11 overflow-hidden rounded-full border-2 border-space"
          >
            <Image src={src} alt="" fill sizes="44px" className="object-cover" />
          </span>
        ))}
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-space bg-white/[0.06] font-mono text-[10px] font-bold text-glacier">
          2222
        </span>
      </div>
    </div>
  );
}

function TaskRow({
  index,
  title,
  subtitle,
  action,
  icon,
  status,
  timer,
  enabled,
  onStart,
  external = true,
}: {
  index: number;
  title: string;
  subtitle: string;
  action: string;
  icon: React.ReactNode;
  status: TaskStatus;
  timer: number;
  enabled: boolean;
  onStart: () => void;
  external?: boolean;
}) {
  const done = status === "done";
  const running = status === "running";
  const accent = done
    ? "border-l-teal"
    : running
      ? "border-l-glacier"
      : "border-l-white/10";
  const progress = running ? ((ALLOWLIST_TASK_SECONDS - timer) / ALLOWLIST_TASK_SECONDS) * 100 : 0;

  return (
    <div
      className={
        "glass overflow-hidden rounded-xl border-l-[3px] transition-opacity " +
        accent +
        (!enabled && !done ? " opacity-40" : "")
      }
    >
      <div className="flex items-center gap-3 p-3 sm:p-3.5">
        <span
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " +
            (done
              ? "bg-teal/15 text-teal"
              : running
                ? "bg-glacier/15 text-glacier"
                : "bg-white/[0.04] text-muted")
          }
        >
          {done ? (
            <Check className="h-5 w-5" />
          ) : running ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            icon
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-faint">0{index}</span>
            <h3 className="truncate text-[13px] font-semibold text-frost">{title}</h3>
          </div>
          <p className="truncate text-[11px] text-muted">
            {running ? `Verifying… ${timer}s left` : subtitle}
          </p>
        </div>

        <div className="shrink-0">
          {done ? (
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal">Done</span>
          ) : running ? (
            <span className="text-[11px] font-bold uppercase tracking-widest text-glacier">
              …
            </span>
          ) : (
            <button
              onClick={onStart}
              disabled={!enabled}
              className="btn-ghost h-9 gap-1.5 px-3 text-[12px] disabled:opacity-30"
            >
              {action}
              {external ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
            </button>
          )}
        </div>
      </div>

      {running ? (
        <div className="h-0.5 w-full bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-ice to-glacier transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ---- Countdown ----------------------------------------------------------
const DEADLINE_MS = Date.parse(ALLOWLIST_DEADLINE);

/** Ticks once a second, returns time left to the allowlist deadline. */
function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, DEADLINE_MS - now);
  const totalSec = Math.floor(diff / 1000);
  return {
    closed: diff <= 0,
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="ring-aurora flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.03] font-mono text-2xl font-bold tabular-nums text-frost sm:h-16 sm:w-16 sm:text-[28px]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-faint">{label}</span>
    </div>
  );
}

/** Clean, urgency-building banner showing time left before the list locks. */
function CountdownBanner({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <Reveal delay={30} className="glass mt-5 rounded-2xl border border-teal/25 p-5 text-center">
      <div className="inline-flex items-center gap-1.5">
        <span className="pulse-dot relative h-1.5 w-1.5 rounded-full bg-teal text-teal" />
        <span className="eyebrow !text-[9px] !text-teal">Allowlist closing</span>
      </div>
      <div className="mt-3.5 flex items-center justify-center gap-2 sm:gap-3">
        <TimeBlock value={hours} label="Hours" />
        <span className="-mt-4 font-mono text-2xl font-bold text-faint">:</span>
        <TimeBlock value={minutes} label="Mins" />
        <span className="-mt-4 font-mono text-2xl font-bold text-faint">:</span>
        <TimeBlock value={seconds} label="Secs" />
      </div>
      <p className="mt-4 text-[12px] text-muted">
        Spots lock when the timer hits zero. Join the pack before it&apos;s gone.
      </p>
    </Reveal>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-28 sm:pt-32">
      <Reveal className="glass rounded-2xl p-8 text-center">{children}</Reveal>
    </div>
  );
}

type JoinState = "idle" | "submitting" | "done" | "error";

export function Allowlist() {
  const [mounted, setMounted] = useState(false);
  const [statuses, setStatuses] = useState<Statuses>(initialStatuses);
  const [timers, setTimers] = useState<Timers>(initialTimers);
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinError, setJoinError] = useState("");
  // The wallet we actually save. Auto-filled from the connected account, but
  // editable so mints can be routed to a different address if the user wants.
  const [wallet, setWallet] = useState("");
  const [submittedWallet, setSubmittedWallet] = useState("");
  const intervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const { address, isConnected, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { closed, hours, minutes, seconds } = useCountdown();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const map = intervals.current;
    return () => Object.values(map).forEach(clearInterval);
  }, []);

  // Remember, per wallet, that this browser already submitted — so a returning
  // visitor lands straight on the confirmation instead of the task list.
  useEffect(() => {
    if (!address) {
      setJoinState("idle");
      setWallet("");
      return;
    }
    setWallet(address);
    const already =
      typeof window !== "undefined" ? window.localStorage.getItem(submittedKey(address)) : null;
    if (already) {
      // Stored value is the wallet that was submitted (may differ from address).
      setSubmittedWallet(already === "1" ? address : already);
      setJoinState("done");
    } else {
      setJoinState("idle");
    }
    setJoinError("");
  }, [address]);

  const startTask = useCallback((id: TaskId, href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setStatuses((s) => ({ ...s, [id]: "running" }));
    setTimers((t) => ({ ...t, [id]: ALLOWLIST_TASK_SECONDS }));

    intervals.current[id] = setInterval(() => {
      setTimers((t) => {
        const next = t[id] - 1;
        if (next <= 0) {
          clearInterval(intervals.current[id]);
          setStatuses((s) => ({ ...s, [id]: "done" }));
          return { ...t, [id]: 0 };
        }
        return { ...t, [id]: next };
      });
    }, 1000);
  }, []);

  // Task 1 is "connect wallet" — done automatically once connected. The four
  // social tasks follow, unlocking sequentially only after the wallet is in.
  const socialCompleted = TASKS.filter((t) => statuses[t.id] === "done").length;
  const totalTasks = TASKS.length + 1;
  const completed = (isConnected ? 1 : 0) + socialCompleted;
  const allDone = isConnected && socialCompleted === TASKS.length;

  const socialEnabled = (i: number) =>
    isConnected && (i === 0 || statuses[TASKS[i - 1].id] === "done");

  const trimmedWallet = wallet.trim();
  const walletValid = isAddress(trimmedWallet);
  const walletError = trimmedWallet.length > 0 && !walletValid;

  const onJoin = useCallback(async () => {
    if (Date.now() >= DEADLINE_MS) {
      setJoinError("The allowlist has closed.");
      setJoinState("error");
      return;
    }
    const w = wallet.trim();
    if (!isAddress(w)) {
      setJoinError("Enter a valid wallet address.");
      setJoinState("error");
      return;
    }
    setJoinState("submitting");
    setJoinError("");
    try {
      const res = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: w }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not join. Please try again.");
      // Key on the connected account so a returning visitor lands on the
      // confirmation; store the submitted wallet so we can show it back.
      if (typeof window !== "undefined" && address) {
        window.localStorage.setItem(submittedKey(address), w);
      }
      setSubmittedWallet(w);
      setJoinState("done");
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Could not join. Please try again.");
      setJoinState("error");
    }
  }, [wallet, address]);

  // ---- Gated render states -------------------------------------------------
  if (!mounted || isReconnecting) {
    return (
      <Centered>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-glacier" />
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">Loading…</p>
      </Centered>
    );
  }

  if (joinState === "done" && address) {
    return (
      <Centered>
        <div className="relative mx-auto h-20 w-20">
          <span className="ring-aurora relative block h-20 w-20 overflow-hidden rounded-2xl">
            <Image src="/art/9.png" alt="Arctounon panda" fill sizes="80px" className="object-cover" />
          </span>
          <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-space bg-teal text-space">
            <Check className="h-4 w-4" />
          </span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-frost">You&apos;re on the allowlist</h1>
        <p className="mt-2 text-sm text-muted">
          <span className="font-mono text-frost">{shortAddress(submittedWallet || address)}</span> is saved. Being on the
          allowlist doesn&apos;t guarantee a mint — we&apos;ll announce the details on{" "}
          <a
            href={`https://x.com/${X_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-glacier hover:underline"
          >
            @{X_HANDLE}
          </a>
          .
        </p>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(ALLOWLIST_CELEBRATION)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-5 inline-flex h-10 gap-1.5 px-4 text-sm"
        >
          <XIcon className="h-3.5 w-3.5" /> Share on X
        </a>
      </Centered>
    );
  }

  // Timer ran out — lock the list for anyone who hasn't already joined.
  if (closed) {
    return (
      <Centered>
        <div className="relative mx-auto h-20 w-20">
          <span className="relative block h-20 w-20 overflow-hidden rounded-2xl opacity-70 grayscale">
            <Image src="/art/4.png" alt="Arctounon panda" fill sizes="80px" className="object-cover" />
          </span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          Allowlist closed
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-frost">The window has closed</h1>
        <p className="mt-2 text-sm text-muted">
          Allowlist submissions are locked. Follow{" "}
          <a
            href={`https://x.com/${X_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-glacier hover:underline"
          >
            @{X_HANDLE}
          </a>{" "}
          for public mint details.
        </p>
        <a
          href={`https://x.com/${X_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-5 inline-flex h-10 gap-1.5 px-4 text-sm"
        >
          <XIcon className="h-3.5 w-3.5" /> Follow for updates
        </a>
      </Centered>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-glacier">
          <span className="h-1 w-1 rounded-full bg-glacier" /> Allowlist
        </span>
        <PackCluster />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-frost sm:text-3xl">
          Reserve your spot
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Complete the tasks to add your wallet to the Arctounon allowlist.
        </p>
      </Reveal>

      {/* Countdown — the list locks when this hits zero */}
      <CountdownBanner hours={hours} minutes={minutes} seconds={seconds} />

      {/* Progress */}
      <Reveal delay={60} className="glass mt-5 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow !text-[9px]">Progress</span>
          <span className="font-mono text-[11px] text-glacier">
            {completed}/{totalTasks}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ice to-glacier transition-all duration-500"
            style={{ width: `${(completed / totalTasks) * 100}%` }}
          />
        </div>

        <div className="mt-4 space-y-2.5">
          {/* Task 1 — connect wallet (auto-done once connected). */}
          <TaskRow
            index={1}
            title="Connect wallet"
            subtitle={address ? shortAddress(address) : "Connect to begin — takes a sec"}
            action="Connect"
            icon={<Wallet className="h-5 w-5" />}
            status={isConnected ? "done" : "idle"}
            timer={0}
            enabled
            onStart={() => openConnectModal?.()}
            external={false}
          />
          {TASKS.map((t, i) => (
            <TaskRow
              key={t.id}
              index={i + 2}
              title={t.title}
              subtitle={t.subtitle}
              action={t.action}
              icon={t.icon({ className: "h-5 w-5" })}
              status={statuses[t.id]}
              timer={timers[t.id]}
              enabled={socialEnabled(i)}
              onStart={() => startTask(t.id, t.href())}
            />
          ))}
        </div>

        {/* Wallet address — auto-filled from the connected account, editable. */}
        <div className="mt-4">
          <label htmlFor="wallet" className="eyebrow !text-[9px]">
            Your wallet address
          </label>
          <input
            id="wallet"
            type="text"
            inputMode="text"
            spellCheck={false}
            autoComplete="off"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            disabled={!isConnected}
            className={
              "mt-1.5 h-11 w-full rounded-xl border bg-white/[0.03] px-3 font-mono text-[13px] text-frost outline-none transition-colors placeholder:text-faint disabled:opacity-40 " +
              (walletError ? "border-violet focus:border-violet" : "border-white/10 focus:border-glacier")
            }
          />
          <p
            className={"mt-1.5 text-[11px] " + (walletError ? "text-violet" : "text-faint")}
            role={walletError ? "alert" : undefined}
          >
            {walletError
              ? "Enter a valid wallet address."
              : "Auto-filled from your connected wallet — edit to send mints elsewhere."}
          </p>
        </div>

        {/* Join */}
        <div className="mt-4">
          <button
            onClick={onJoin}
            disabled={!allDone || !walletValid || joinState === "submitting"}
            className={"btn-aurora h-11 w-full text-sm " + (!allDone || !walletValid ? "btn-soon" : "")}
          >
            {joinState === "submitting"
              ? "Saving…"
              : allDone
                ? "Join the allowlist"
                : "Complete all tasks to join"}
          </button>
          {joinState === "error" && joinError ? (
            <p className="mt-2 text-center text-[11px] text-violet" role="alert">
              {joinError}
            </p>
          ) : null}
          <p className="mt-2.5 text-center text-[11px] text-faint">
            No transaction, no gas — we just save your wallet address.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

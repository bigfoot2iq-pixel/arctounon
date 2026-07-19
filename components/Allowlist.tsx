"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { arcChain, shortAddress } from "@/lib/arc-chain";
import {
  ARCTOUNON_NFT_ADDRESS,
  arctounonNftAbi,
  isNftConfigured,
} from "@/lib/arctounon-nft";
import {
  X_HANDLE,
  ALLOWLIST_POST_ID,
  ALLOWLIST_CELEBRATION,
  ALLOWLIST_TASK_SECONDS,
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
    subtitle: "Tell X you just reserved your spot.",
    action: "Post",
    icon: (c) => <Megaphone {...c} />,
    href: () =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(ALLOWLIST_CELEBRATION)}`,
  },
];

const nftContract = {
  address: ARCTOUNON_NFT_ADDRESS,
  abi: arctounonNftAbi,
  chainId: arcChain.id,
} as const;

type Statuses = Record<TaskId, TaskStatus>;
type Timers = Record<TaskId, number>;

const initialStatuses: Statuses = { follow: "idle", like: "idle", retweet: "idle", post: "idle" };
const initialTimers: Timers = { follow: 0, like: 0, retweet: 0, post: 0 };

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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-28 sm:pt-32">
      <Reveal className="glass rounded-2xl p-8 text-center">{children}</Reveal>
    </div>
  );
}

export function Allowlist() {
  const [mounted, setMounted] = useState(false);
  const [statuses, setStatuses] = useState<Statuses>(initialStatuses);
  const [timers, setTimers] = useState<Timers>(initialTimers);
  const intervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const { address, isConnected, isReconnecting, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: switching } = useSwitchChain();
  const onArc = isConnected && chainId === arcChain.id;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const map = intervals.current;
    return () => Object.values(map).forEach(clearInterval);
  }, []);

  // ---- On-chain reads (always from Arc, regardless of wallet's network) ----
  const enabledRead = isNftConfigured;
  const { data: registrationOpen } = useReadContract({
    ...nftContract,
    functionName: "registrationOpen",
    query: { enabled: enabledRead },
  });
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: allowanceLoading,
  } = useReadContract({
    ...nftContract,
    functionName: "allowlistAllowance",
    args: address ? [address] : undefined,
    // Cache the "already joined?" result for the whole session. Only a full
    // page refresh (new QueryClient) re-checks; our own join flow refetches
    // explicitly on success. No refetch on remount/focus/reconnect.
    query: {
      enabled: enabledRead && !!address,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
  const { data: allowlistCount } = useReadContract({
    ...nftContract,
    functionName: "allowlistCount",
    query: { enabled: enabledRead },
  });
  const { data: maxAllowlist } = useReadContract({
    ...nftContract,
    functionName: "maxAllowlist",
    query: { enabled: enabledRead },
  });

  const isRegistered = (allowance ?? 0n) > 0n;

  // ---- joinAllowlist write ----
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (confirmed) refetchAllowance();
  }, [confirmed, refetchAllowance]);

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

  const onReserve = () => {
    reset();
    writeContract({ ...nftContract, functionName: "joinAllowlist" });
  };

  // ---- Gated render states -------------------------------------------------
  if (!mounted) {
    return (
      <Centered>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-glacier" />
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">Loading…</p>
      </Centered>
    );
  }

  if (!isNftConfigured) {
    return (
      <Centered>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet">
          <span className="h-1.5 w-1.5 rounded-full bg-violet" /> Coming soon
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-frost">Allowlist opens soon</h1>
        <p className="mt-2 text-sm text-muted">
          The allowlist isn&apos;t live yet. Follow{" "}
          <a
            href={`https://x.com/${X_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-glacier hover:underline"
          >
            @{X_HANDLE}
          </a>{" "}
          to catch the go-live.
        </p>
      </Centered>
    );
  }

  // While the wallet reconnects on load, or the on-chain "already joined?"
  // check is still in flight, hold on a loader so a registered wallet never
  // flashes the task list.
  const checkingJoined =
    isReconnecting || (isConnected && !!address && allowanceLoading);
  if (checkingJoined) {
    return (
      <Centered>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-glacier" />
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">
          Checking allowlist status…
        </p>
      </Centered>
    );
  }

  if (isRegistered && address) {
    return (
      <Centered>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/15 text-teal">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-frost">You&apos;re on the allowlist</h1>
        <p className="mt-2 text-sm text-muted">
          {(allowance ?? 0n).toString()} free mint{allowance === 1n ? "" : "s"} reserved for{" "}
          <span className="font-mono text-frost">{shortAddress(address)}</span>. We&apos;ll open the
          allowlist mint on{" "}
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

  const registrationClosed = registrationOpen === false;
  const spots =
    (maxAllowlist ?? 0n) > 0n
      ? `${(allowlistCount ?? 0n).toString()} / ${(maxAllowlist ?? 0n).toString()} spots`
      : `${(allowlistCount ?? 0n).toString()} reserved`;

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-glacier">
          <span className="h-1 w-1 rounded-full bg-glacier" /> Allowlist · Free mint
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-frost sm:text-3xl">
          Reserve your spot
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Complete the tasks, then reserve a guaranteed free mint on-chain. {spots}.
        </p>
      </Reveal>

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
            enabled={!registrationClosed}
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
              enabled={socialEnabled(i) && !registrationClosed}
              onStart={() => startTask(t.id, t.href())}
            />
          ))}
        </div>

        {/* Reserve */}
        <div className="mt-4">
          {registrationClosed ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted">
              Registration is closed
            </div>
          ) : allDone && !onArc ? (
            <button
              onClick={() => switchChain({ chainId: arcChain.id })}
              disabled={switching}
              className="btn-aurora h-11 w-full text-sm disabled:opacity-60"
            >
              {switching ? "Switching…" : `Switch to ${arcChain.name}`}
            </button>
          ) : (
            <button
              onClick={onReserve}
              disabled={!allDone || isPending || confirming}
              className={"btn-aurora h-11 w-full text-sm " + (!allDone ? "btn-soon" : "")}
            >
              {isPending
                ? "Confirm in wallet…"
                : confirming
                  ? "Reserving…"
                  : allDone
                    ? "Reserve my spot"
                    : "Complete all tasks to reserve"}
            </button>
          )}
          {error ? (
            <p className="mt-2 text-center text-[11px] text-violet" role="alert">
              {error.message.split("\n")[0]}
            </p>
          ) : null}
          <p className="mt-2.5 text-center text-[11px] text-faint">
            Reserving writes your wallet to the Arctounon contract — one small transaction.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

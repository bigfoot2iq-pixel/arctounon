"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "./icons";

/**
 * Wallet button for the nav, backed by RainbowKit but styled to match the
 * site. States: disconnected → connect modal, wrong chain → switch to Arc,
 * connected → short address opening the account modal (disconnect lives there).
 */
export function ConnectButton({ className = "" }: { className?: string }) {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        // Avoid hydration mismatch: render a stable placeholder until mounted.
        if (!mounted) {
          return (
            <button
              aria-hidden
              tabIndex={-1}
              className={"btn-aurora pointer-events-none h-10 gap-1.5 px-4 text-sm opacity-0 " + className}
            >
              <Wallet className="h-4 w-4" />
              Connect wallet
            </button>
          );
        }

        if (!account || !chain) {
          return (
            <button
              onClick={openConnectModal}
              className={"btn-aurora h-10 gap-1.5 px-4 text-sm " + className}
            >
              <Wallet className="h-4 w-4" />
              Connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className={"btn-aurora h-10 gap-1.5 px-4 text-sm " + className}
              title="This dApp only supports Arc"
            >
              <Wallet className="h-4 w-4" />
              Switch to Arc
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            className={"btn-ghost h-10 gap-2 px-4 font-mono text-[13px] " + className}
          >
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full text-teal" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            {account.displayName}
          </button>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}

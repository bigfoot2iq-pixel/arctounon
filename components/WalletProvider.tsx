"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { arcChain } from "@/lib/arc-chain";

// RainbowKit modal styled to match the site's aurora/ice palette (globals.css).
const theme = darkTheme({
  accentColor: "#27e2e8", // --color-glacier
  accentColorForeground: "#04121f",
  borderRadius: "large",
  overlayBlur: "small",
});
theme.colors.modalBackground = "#0c1222"; // --color-surface
theme.colors.modalBorder = "rgba(90, 172, 255, 0.16)";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} initialChain={arcChain} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

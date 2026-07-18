import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcChain } from "./arc-chain";

// WalletConnect Cloud project id — required for mobile/QR wallets.
// Get one free at https://cloud.reown.com and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
// Browser-extension wallets work fine without it.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "ARCTOUNON_PLACEHOLDER";

export const wagmiConfig = getDefaultConfig({
  appName: "Arctounon",
  projectId,
  chains: [arcChain],
  ssr: true,
});

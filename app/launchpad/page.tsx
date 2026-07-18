import type { Metadata } from "next";
import { LaunchpadMint } from "@/components/LaunchpadMint";

export const metadata: Metadata = {
  title: "Launchpad",
  description:
    "Mint your Arctounon on the Arc Chain. Pick your bundle, check the schedule, and forge up to 5 pandas per wallet.",
};

export default function LaunchpadPage() {
  return <LaunchpadMint />;
}

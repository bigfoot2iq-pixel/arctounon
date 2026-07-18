import type { Metadata } from "next";
import { Raffle } from "@/components/Raffle";

export const metadata: Metadata = {
  title: "Raffle",
  description:
    "Holder-first raffles for the rarest Arctounon pandas, whitelist spots and on-chain rewards. Coming soon.",
};

export default function RafflePage() {
  return (
    <div className="pt-20 sm:pt-24">
      <Raffle />
    </div>
  );
}

import type { Metadata } from "next";
import { Allowlist } from "@/components/Allowlist";

export const metadata: Metadata = {
  title: "Allowlist",
  description:
    "Complete a few quick tasks to add your wallet to the Arctounon allowlist.",
};

export default function AllowlistPage() {
  return <Allowlist />;
}

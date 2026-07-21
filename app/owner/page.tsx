import type { Metadata } from "next";
import { OwnerConsole } from "@/components/OwnerConsole";

export const metadata: Metadata = {
  title: "Owner console",
  description: "Admin controls for the Arctounon NFT contract.",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return <OwnerConsole />;
}

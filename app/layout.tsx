import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import { SITE } from "@/lib/collection";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const title = `${SITE.name} — ${SITE.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://arctounon.xyz"),
  title: {
    default: title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.short,
  keywords: [
    "Arctounon",
    "Arc Chain",
    "NFT",
    "Pandas",
    "2222",
    "mint",
    "web3",
  ],
  openGraph: {
    title,
    description: SITE.short,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE.short,
    site: "@Arctounon",
    creator: "@Arctounon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Atmosphere */}
        <div className="bg-layers" aria-hidden>
          <div className="bg-base" />
          <div className="bg-aurora" />
          <div className="bg-stars" />
        </div>
        <div className="bg-grain" aria-hidden />
        <WalletProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}

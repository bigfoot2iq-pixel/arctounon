// Central config for the Arctounon hype site.
// Owner-editable values live here so copy, tiers and links can be updated in one place.

export const MINT_LIVE = false; // flip to true when the mint opens

export const SITE = {
  name: "Arctounon",
  hashtag: "#Arctounon",
  supply: 2222,
  chainName: "Arc",
  chainTagline: "Arc Chain",
  tagline: "2222 Pandas on Arc Chain",
  short:
    "No JPEGs. No empty hype. Here for the long run — wait for the end and watch real utility drop.",
  long:
    "Arctounon is a collection of 2222 hand-forged pandas living on the Arc Chain. Built for the long run: no empty promises, no noise. Hold, stake, and wait for the end — that's when the real utility drops.",
  links: {
    x: "https://x.com/Arctounon",
    arc: "https://www.arc.io/",
  },
  currency: "ARC", // mint fee denomination — set on-chain by the owner
} as const;

// Mint amount tiers 1..5 — each tier has its own fee, configurable on-chain by the owner.
// Values below are indicative placeholders shown for hype; the live fee is read from the contract.
export type Tier = {
  amount: number;
  fee: number; // total fee for the whole bundle, in SITE.currency
  label: string;
  tag?: string;
};

export const TIERS: Tier[] = [
  { amount: 1, fee: 0.05, label: "Cub" },
  { amount: 2, fee: 0.095, label: "Pair", tag: "Popular" },
  { amount: 3, fee: 0.135, label: "Troop" },
  { amount: 4, fee: 0.17, label: "Pack" },
  { amount: 5, fee: 0.2, label: "Whale", tag: "Best value" },
];

export const TRAIT_CATEGORIES = [
  { name: "Background", examples: ["Space", "Bamboo", "Snow", "Night"] },
  { name: "Skin", examples: ["Zebra", "Leopard", "Ice", "Cosmic"] },
  { name: "Eyes", examples: ["Closed", "Angry", "Focused"] },
  { name: "Head", examples: ["Top Hat", "Horn", "Unicorn", "None"] },
  { name: "Clothes", examples: ["Shirt", "Hoodie", "Scarf"] },
  { name: "Mouth", examples: ["Angry", "Grin", "Calm"] },
];

export const UTILITIES = [
  {
    title: "Holder-gated access",
    body: "Every Arctounon is your key — raffles, allowlists and drops open first to holders.",
  },
  {
    title: "Staking & rewards",
    body: "Lock your panda to earn. Rewards mechanics roll out post-mint, native to Arc.",
  },
  {
    title: "Real utility, at the end",
    body: "No roadmap theatre. Utility ships when it's ready — and it drops all at once.",
  },
  {
    title: "On-chain on Arc",
    body: "Minted natively on the Arc Chain — fast, cheap, stablecoin-grade settlement.",
  },
];

export const BRIDGE_STEPS = [
  {
    step: "01",
    title: "Get an Arc wallet",
    body: "Use any EVM wallet and add the Arc network to start transacting on-chain.",
  },
  {
    step: "02",
    title: "Bridge to Arc",
    body: "Move funds to the Arc Chain through the official bridge before mint day.",
  },
  {
    step: "03",
    title: "Mint your panda",
    body: "Pick a tier (1–5), confirm the fee, and forge your Arctounon.",
  },
];

export const MARKETPLACES = [
  { name: "Arc Marketplace", status: "Coming soon" },
  { name: "OpenSea", status: "Coming soon" },
  { name: "Magic Eden", status: "Coming soon" },
];

// Launchpad — upcoming drops. Images point to local art; names shown, descriptions teased.
export const LAUNCHPAD = [
  {
    img: "/art/3.png",
    name: "Arctounon Genesis",
    desc: "Description coming soon",
    status: "Coming soon",
  },
  {
    img: "/art/6.png",
    name: "Frost Legends",
    desc: "Description coming soon",
    status: "Coming soon",
  },
  {
    img: "/art/9.png",
    name: "Arc Guardians",
    desc: "Description coming soon",
    status: "Coming soon",
  },
];

export const ROADMAP = [
  {
    phase: "Phase 01",
    title: "The Gathering",
    status: "Now",
    points: ["Reveal 2222 pandas", "Grow the pack on X", "Allowlist & raffle warm-up"],
  },
  {
    phase: "Phase 02",
    title: "The Mint",
    status: "Next",
    points: ["Official mint on Arc", "Tiered fees, 1–5 per wallet", "Marketplace listings go live"],
  },
  {
    phase: "Phase 03",
    title: "The Drop",
    status: "Soon",
    points: ["Staking goes live", "Holder-only utility unlocks", "Wait for the end 🐼"],
  },
];

export const FAQ = [
  {
    q: "What is Arctounon?",
    a: "A collection of 2222 pandas minted natively on the Arc Chain. Built for the long run — real utility over empty hype.",
  },
  {
    q: "When does minting open?",
    a: "Soon. The mint button is live as “Coming Soon” for now — follow @Arctounon on X so you don't miss the go-live.",
  },
  {
    q: "How much does it cost to mint?",
    a: "You can mint 1 to 5 per transaction, and each amount tier has its own fee. Fees are set on-chain by the owner and can be updated before launch.",
  },
  {
    q: "What chain is this on?",
    a: "Arc Chain. Bridge your funds to Arc ahead of mint day so you're ready when it opens.",
  },
];

// Local art used across gallery / hero (downloaded from the collection's IPFS).
export const GALLERY = Array.from({ length: 12 }, (_, i) => `/art/${i + 1}.png`);

// ---- Launchpad mint page -------------------------------------------------
// Max pandas a single wallet can forge in one transaction.
export const MAX_PER_WALLET = 5;

// Featured artwork on the launchpad mint page. Swap `hero` for an animated
// .gif/.webp when the reveal drops — it renders through next/image unchanged.
export const SHOWCASE = {
  hero: "/art/6.png",
  thumbs: ["/art/1.png", "/art/2.png", "/art/9.png", "/art/11.png"],
};

// Headline stats shown as a strip under the collection identity bar.
export const COLLECTION_STATS = [
  { label: "Supply", value: SITE.supply.toLocaleString() },
  { label: "Minted", value: "0" },
  { label: "Chain", value: SITE.chainName },
  { label: "Max / wallet", value: String(MAX_PER_WALLET) },
];

// Mint schedule phases. All indicative until the mint goes live on-chain.
export type Phase = {
  name: string;
  note: string;
  price: string; // display price, e.g. "0.05 ARC"
  status: "Live" | "Soon" | "Ended";
};

export const MINT_SCHEDULE: Phase[] = [
  { name: "Allowlist · GTD", note: "Guaranteed spot for the pack. Time TBA.", price: "0.05 ARC", status: "Soon" },
  { name: "FCFS", note: "First come, first served for leftovers.", price: "0.05 ARC", status: "Soon" },
  { name: "Public", note: "Open to everyone on Arc. Time TBA.", price: "0.05 ARC", status: "Soon" },
];

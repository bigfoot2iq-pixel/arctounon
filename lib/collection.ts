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
  currency: "USDC", // mint fee denomination — set on-chain by the owner
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
    title: "Launchpad on Arc",
    body: "Launch your NFT collection directly on Arc Chain. Arctounon provides a simple, fast, and reliable launchpad for creators building on Arc.",
  },
  {
    title: "Raffle Platform",
    body: "The first dedicated raffle platform on Arc Chain. Participate in exclusive NFT raffles, giveaways, and community campaigns.",
  },
  {
    title: "Staking & Rewards",
    body: "Stake your Arctounon Panda to earn rewards and unlock exclusive ecosystem benefits available only to holders.",
  },
  {
    title: "Arctounon Token",
    body: "The native Arctounon token powers the ecosystem. Holders will receive exclusive airdrops and gain access to future utilities and governance.",
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
    title: "Foundation",
    status: "Now",
    points: [
      "Launch the official website",
      "Build the Arctounon community",
      "Reveal the 2,222 Panda NFT collection",
      "Strategic partnerships across the Arc ecosystem",
      "Whitelist campaign & community events",
    ],
  },
  {
    phase: "Phase 02",
    title: "Mint",
    status: "Next",
    points: [
      "Launch the 2,222 Panda NFT collection",
      "Marketplace listing",
      "Holder verification",
      "Exclusive holder channels & benefits",
      "Community growth initiatives",
    ],
  },
  {
    phase: "Phase 03",
    title: "Holder Utility",
    status: "Soon",
    points: [
      "Daily reward system",
      "NFT Staking",
      "Exclusive raffles for holders",
      "Community quests & leaderboard",
      "Holder-only giveaways",
    ],
  },
  {
    phase: "Phase 04",
    title: "Ecosystem",
    status: "Soon",
    points: [
      "Arctounon Launchpad",
      "Community governance",
      "Project collaborations",
      "Merchandise collection",
      "Ecosystem expansion",
    ],
  },
  {
    phase: "Phase 05",
    title: "Token",
    status: "Soon",
    points: [
      "Official Arctounon Token launch",
      "Token utility across the ecosystem",
      "Staking rewards in token",
      "Liquidity & ecosystem growth",
      "Future integrations",
    ],
  },
  {
    phase: "Phase 06",
    title: "Airdrop",
    status: "Soon",
    points: [
      "Snapshot for holders & active community",
      "Token Airdrop",
      "Reward top supporters",
      "Community incentive campaigns",
    ],
  },
];

export const FAQ = [
  {
    q: "What is Arctounon?",
    a: "Arctounon is a collection of 2,222 unique Panda NFTs built on the Arc blockchain, designed to combine digital collectibles with long-term community utility.",
  },
  {
    q: "How many NFTs are available?",
    a: "There are 2,222 unique Panda NFTs in the collection.",
  },
  {
    q: "Which blockchain is Arctounon built on?",
    a: "Arctounon is built on the Arc blockchain.",
  },
  {
    q: "What utilities will holders receive?",
    a: "Holders will have access to staking, raffles, launchpad allocations, token rewards, airdrops, exclusive events, and future ecosystem benefits.",
  },
  {
    q: "Will there be a token?",
    a: "Yes. Arctounon plans to launch its own ecosystem token with utilities across staking, rewards, and future platform features.",
  },
  {
    q: "Will holders receive an airdrop?",
    a: "Yes. Eligible holders and active community members will qualify for future airdrops based on announced criteria.",
  },
  {
    q: "Is staking available?",
    a: "Yes. NFT staking will allow holders to earn ecosystem rewards and unlock additional benefits.",
  },
  {
    q: "What is the Arctounon Launchpad?",
    a: "The Launchpad will provide holders with priority access and allocations for selected NFT and ecosystem projects.",
  },
  {
    q: "How can I stay updated?",
    a: "Follow our official social media channels and join the community to receive the latest announcements and updates.",
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
  { name: "Allowlist", note: "Reserve your spot with the pack. Time TBA.", price: "TBA", status: "Soon" },
  { name: "Public", note: "Open to everyone on Arc. Time TBA.", price: "TBA", status: "Soon" },
];

// ---- Allowlist page ------------------------------------------------------
// Live mint state (phases, price, supply, per-wallet counts) is read from the
// NFT contract at runtime — see lib/arctounon-nft.ts. The values below are just
// copy + the X campaign the social tasks point at.

// X (Twitter) handle used for the follow intent — screen_name, no leading @.
export const X_HANDLE = "Arctounon";

// The campaign post users like + retweet.
// https://x.com/Arctounon/status/2079502833624187221
export const ALLOWLIST_POST_ID = "2079502833624187221";

// Celebration status users publish as the final task.
export const ALLOWLIST_CELEBRATION =
  "I just reserved my spot on the @Arctounon allowlist 🐼\n𝟐,𝟐𝟐𝟐 𝐏𝐚𝐧𝐝𝐚𝐬 are coming to @arc 𝐂𝐡𝐚𝐢𝐧. 👀\nComplete the tasks, then claim your spot while it's available.";

// Seconds each social task "verifies" for. The tasks are honor-system — X can't
// be checked without login — so completion is a client-side timer after the
// intent opens. When all tasks are done the wallet is saved to the off-chain
// allowlist (Supabase) — no transaction, no gas.
export const ALLOWLIST_TASK_SECONDS = 15;

// Hard deadline after which the allowlist stops accepting wallets. Set to a
// FIXED instant (ISO 8601, UTC "Z") so every visitor sees the same countdown —
// a per-visit "24h from now" would reset on each reload. To relaunch a fresh
// window, set this to (open time + window length). Currently: 24h window
// reopened 2026-07-29, closing 2026-07-30 22:00 UTC.
export const ALLOWLIST_DEADLINE = "2026-07-30T22:00:00Z";

import type { NextConfig } from "next";

// Optional @x402/* peers of @coinbase/cdp-sdk (via wagmi's Coinbase connector)
// are lazy-imported but not installed; alias them to an empty stub so
// Turbopack can resolve them. They only run if x402 payments are used (never).
const x402Stub = "./lib/x402-stub.cjs";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/svm/exact/client": x402Stub,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link",
      },
    ],
  },
};

export default nextConfig;

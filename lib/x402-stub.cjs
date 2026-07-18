// Empty stand-in for the optional @x402/* packages lazy-imported by
// @coinbase/cdp-sdk (pulled in via wagmi's Coinbase connector). We never use
// x402 payments, so the real packages aren't installed; this keeps Turbopack's
// module resolution happy. CJS on purpose: its exports are dynamic, so the
// bundler can't statically flag the named imports as missing.
// See resolveAlias in next.config.ts.
module.exports = new Proxy(
  {},
  {
    get() {
      throw new Error("@x402/* packages are not installed (stubbed out)");
    },
  },
);

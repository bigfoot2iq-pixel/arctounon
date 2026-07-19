import { SITE } from "@/lib/collection";
import { XIcon, ArrowRight } from "./icons";
import { HeroShowcase } from "./HeroShowcase";
import { HeroMintCta, HeroMintStat } from "./MintLive";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-xl font-bold text-frost sm:text-2xl">{value}</span>
      <span className="eyebrow mt-0.5 !text-[9px] !tracking-[0.2em]">{label}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative mx-auto max-w-6xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Copy */}
        <div className="rise flex flex-col items-start gap-5">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5 text-glacier">
              <span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glacier" />
            </span>
            {SITE.supply} Pandas · {SITE.chainTagline}
          </span>

          <h1 className="font-display text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl">
            <span className="text-aurora glow-text">Arctounon</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            <span className="text-frost">{SITE.tagline}.</span> {SITE.short}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <HeroMintCta />
            <a
              href={SITE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost h-11 px-5 text-sm"
            >
              <XIcon className="h-4 w-4" />
              Join the hype
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-1 grid w-full max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-5">
            <Stat label="Supply" value={SITE.supply.toLocaleString()} />
            <Stat label="Chain" value={SITE.chainName} />
            <HeroMintStat />
          </div>
        </div>

        {/* Showcase */}
        <div className="rise" style={{ animationDelay: "150ms" }}>
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}

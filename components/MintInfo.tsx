import { SITE, UTILITIES, BRIDGE_STEPS, MARKETPLACES, MINT_SCHEDULE } from "@/lib/collection";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { ArrowUpRight } from "./icons";

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ring-aurora inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] text-glacier">
      {children}
    </span>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MintInfo() {
  return (
    <section id="info" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Mint Info"
        title={
          <>
            Everything you need <span className="text-aurora">before mint day</span>
          </>
        }
        desc="Where to bridge, what the supply looks like, why you'd hold, and where you'll trade."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Infos */}
        <Reveal className="glass card-hover flex flex-col rounded-2xl p-4 sm:p-5">
          <IconBadge>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
              <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
              <path d="m3 12 9 4.5L21 12M3 16.5 12 21l9-4.5" />
            </svg>
          </IconBadge>
          <h3 className="mt-4 font-display text-lg font-bold text-frost">Infos</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            A fixed collection of{" "}
            <span className="font-mono text-frost">{SITE.supply.toLocaleString()}</span> pandas —
            each generated from 6 trait layers. No stealth reprints, no hidden mints.
          </p>

          <div className="mt-auto pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <p className="font-mono text-2xl font-bold text-aurora">{SITE.supply.toLocaleString()}</p>
                <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Total</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <p className="font-mono text-2xl font-bold text-aurora">50+</p>
                <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Traits</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <p className="font-mono text-sm font-bold text-aurora">{SITE.chainName}</p>
                <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Chain</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <p className="font-mono text-sm font-bold text-aurora">{MINT_SCHEDULE.length}</p>
                <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Phases</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <p className="font-mono text-sm font-bold text-aurora">TBA</p>
                <p className="eyebrow mt-0.5 !text-[9px] !tracking-[0.18em]">Mint</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bridge */}
        <Reveal delay={80} className="glass card-hover flex flex-col rounded-2xl p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <IconBadge>
                <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
                  <path d="M3 8h18M3 8a4 4 0 0 1 8 0M21 8a4 4 0 0 0-8 0M5 8v8m14-8v8M3 16h18" />
                </svg>
              </IconBadge>
              <h3 className="mt-4 font-display text-lg font-bold text-frost">How to bridge to Arc</h3>
              <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted">
                Arctounon mints natively on the Arc Chain. Get funds onto Arc before launch so you&apos;re ready the second mint opens.
              </p>
            </div>
            <a
              href={SITE.links.arc}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost h-9 shrink-0 gap-1.5 px-3.5 text-[13px]"
            >
              Arc <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BRIDGE_STEPS.map((s) => (
              <div key={s.step} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <span className="font-mono text-[13px] font-bold text-glacier">{s.step}</span>
                <h4 className="mt-1.5 text-sm font-semibold text-frost">{s.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Utility */}
        <Reveal delay={120} className="glass card-hover flex flex-col rounded-2xl p-4 sm:p-5 lg:col-span-2">
          <IconBadge>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
              <path d="M13 2 4.5 13.5H11l-1 8L19.5 10H13l0-8Z" />
            </svg>
          </IconBadge>
          <h3 className="mt-4 font-display text-lg font-bold text-frost">Utility</h3>
          <ul className="mt-3 grid gap-x-8 gap-y-3.5 sm:grid-flow-col sm:grid-rows-2">
            {UTILITIES.map((u) => (
              <li key={u.title} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-glacier" />
                <div>
                  <p className="text-sm font-semibold text-frost">{u.title}</p>
                  <p className="text-[13px] leading-relaxed text-muted">{u.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Marketplaces */}
        <Reveal delay={160} className="glass card-hover flex flex-col rounded-2xl p-4 sm:p-5">
          <IconBadge>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
              <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5V20h18V9.5M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            </svg>
          </IconBadge>
          <h3 className="mt-4 font-display text-lg font-bold text-frost">Marketplaces</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Trade Arctounon on Arc-native and cross-chain markets. Listings drop with the mint.
          </p>
          <ul className="mt-3 space-y-2">
            {MARKETPLACES.map((m) => (
              <li
                key={m.name}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5"
              >
                <span className="text-sm font-semibold text-frost">{m.name}</span>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet">
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

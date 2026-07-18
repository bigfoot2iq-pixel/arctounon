import Image from "next/image";
import { SITE } from "@/lib/collection";
import { Reveal } from "./ui/Reveal";
import { XIcon } from "./icons";

export function Raffle() {
  return (
    <section id="raffle" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Reveal className="glass ring-aurora relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
        {/* soft glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-violet), transparent 70%)" }}
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col items-start gap-5">
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-violet">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full text-violet" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet" />
              </span>
              Raffle · Coming Soon
            </span>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-frost sm:text-6xl">
              Win rare <span className="text-aurora">Arctounon</span>
            </h2>
            <p className="max-w-lg text-lg leading-relaxed text-muted">
              Holder-first raffles for the rarest pandas, whitelist spots and on-chain rewards. The
              wheel starts spinning soon — be in the pack before it does.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SITE.links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-aurora px-6"
                style={{ height: "3.25rem" }}
              >
                <XIcon className="h-4 w-4" />
                Get notified
              </a>
              <span className="font-mono text-sm text-faint">Snapshot mechanics TBA</span>
            </div>
          </div>

          {/* Ticket */}
          <div className="relative mx-auto w-full max-w-xs">
            <div className="ring-aurora float-y relative aspect-square overflow-hidden rounded-3xl">
              <Image src="/art/11.png" alt="Rare Arctounon" fill sizes="320px" className="object-cover" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-space via-transparent to-transparent">
                <div className="w-full p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-glacier">Grand prize</p>
                  <p className="font-display text-lg font-bold text-frost">1 / 1 Golden Panda</p>
                </div>
              </div>
              <span className="absolute right-3 top-3 -rotate-6 rounded-lg border border-white/20 bg-black/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-frost backdrop-blur">
                Soon
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

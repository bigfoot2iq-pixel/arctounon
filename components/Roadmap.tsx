import { ROADMAP } from "@/lib/collection";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

const statusColor: Record<string, string> = {
  Now: "text-glacier bg-glacier/15",
  Next: "text-ice bg-ice/15",
  Soon: "text-violet bg-violet/15",
};

export function Roadmap() {
  return (
    <section id="roadmap" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Roadmap"
        title={
          <>
            Built for <span className="text-aurora">the long run</span>
          </>
        }
        desc="Six phases, one promise — from foundation to airdrop, watch real utility drop."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ROADMAP.map((p, i) => (
          <Reveal
            key={p.phase}
            delay={i * 110}
            className="glass card-hover relative flex flex-col rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] text-faint">{p.phase}</span>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide " +
                  (statusColor[p.status] ?? "text-muted bg-white/10")
                }
              >
                {p.status}
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-frost">{p.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2.5 text-[13px] text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-ice to-glacier" />
                  {pt}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

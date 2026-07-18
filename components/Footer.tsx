import Link from "next/link";
import { SITE } from "@/lib/collection";
import { XIcon, ArrowUpRight } from "./icons";

const LINKS = [
  { href: "/", label: "Info" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/raffle", label: "Raffle" },
];

export function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/10">
      {/* CTA strip */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Don&apos;t miss the drop</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-frost sm:text-3xl">
              Join the <span className="text-aurora">pack</span>.
            </h3>
          </div>
          <a
            href={SITE.links.x}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-aurora h-11 px-6 text-sm"
          >
            <XIcon className="h-4 w-4" />
            Follow @Arctounon
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div
        aria-hidden
        className="pointer-events-none select-none px-4 text-center font-display text-[14vw] font-extrabold leading-none tracking-tighter text-white/[0.03] sm:text-[12vw]"
      >
        ARCTOUNON
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 sm:flex-row sm:px-6">
        <p className="font-mono text-xs text-faint">
          © {new Date().getFullYear()} {SITE.name} · {SITE.supply.toLocaleString()} Pandas on {SITE.chainTagline}
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-xs text-muted transition-colors hover:text-frost">
              {l.label}
            </Link>
          ))}
          <a
            href={SITE.links.arc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted transition-colors hover:text-frost"
          >
            Arc Chain
          </a>
        </nav>
      </div>
    </footer>
  );
}

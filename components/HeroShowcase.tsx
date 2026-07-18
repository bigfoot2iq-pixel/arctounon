"use client";

import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/lib/collection";

const ITEMS = [
  { src: "/art/4.png", edition: 4 },
  { src: "/art/6.png", edition: 6 },
  { src: "/art/7.png", edition: 7 },
  { src: "/art/10.png", edition: 10 },
  { src: "/art/2.png", edition: 2 },
];

const pad = (n: number) => String(n).padStart(4, "0");

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const cur = ITEMS[active];

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--color-ice) 45%, transparent), transparent 70%)",
        }}
      />

      {/* Featured card */}
      <div className="ring-aurora glass rounded-2xl p-2">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          {ITEMS.map((it, i) => (
            <Image
              key={it.src}
              src={it.src}
              alt={`Arctounon #${pad(it.edition)}`}
              fill
              priority={i === 0}
              sizes="(max-width:1024px) 90vw, 40vw"
              className={
                "object-cover transition-all duration-500 ease-out " +
                (i === active ? "scale-100 opacity-100" : "scale-105 opacity-0")
              }
            />
          ))}

          {/* top chips */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-full bg-black/45 px-3 py-1 font-mono text-xs text-frost backdrop-blur-md">
              #{pad(cur.edition)}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 font-mono text-xs text-frost backdrop-blur-md">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-ice to-glacier text-[#04121f]">
                <Check className="h-2.5 w-2.5" />
              </span>
              {SITE.chainName}
            </span>
          </div>

          {/* bottom caption */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-space via-space/50 to-transparent p-3 pt-10">
            <p className="font-display text-base font-bold text-frost">{SITE.name}</p>
            <p className="font-mono text-[11px] text-muted">
              1 of {SITE.supply.toLocaleString()} · Forged on {SITE.chainTagline}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail rail */}
      <div className="mt-2.5 grid grid-cols-5 gap-2">
        {ITEMS.map((it, i) => (
          <button
            key={it.src}
            onClick={() => setActive(i)}
            aria-label={`View Arctounon #${pad(it.edition)}`}
            aria-pressed={i === active}
            className={
              "relative aspect-square overflow-hidden rounded-xl transition-all duration-300 " +
              (i === active
                ? "ring-aurora scale-100"
                : "opacity-55 hover:-translate-y-0.5 hover:opacity-100")
            }
          >
            <Image src={it.src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

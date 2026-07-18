"use client";

import { useState } from "react";
import { FAQ } from "@/lib/collection";
import { SectionHeading } from "./ui/SectionHeading";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" />

      <div className="mt-8 flex flex-col gap-2.5">
        {FAQ.map((item, i) => {
          const active = open === i;
          return (
            <div
              key={item.q}
              className={
                "glass overflow-hidden rounded-2xl transition-colors " +
                (active ? "ring-aurora" : "")
              }
            >
              <button
                onClick={() => setOpen(active ? null : i)}
                aria-expanded={active}
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
              >
                <span className="font-display text-sm font-bold text-frost sm:text-base">
                  {item.q}
                </span>
                <span
                  className={
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-glacier transition-transform duration-300 " +
                    (active ? "rotate-45" : "")
                  }
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-[13px] leading-relaxed text-muted">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

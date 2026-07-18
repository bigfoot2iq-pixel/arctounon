"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/collection";
import { XIcon } from "./icons";
import { ConnectButton } from "./ConnectButton";

const LINKS = [
  { href: "/", label: "Info" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/raffle", label: "Raffle" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-300 " +
          (scrolled ? "py-2.5" : "py-4")
        }
      >
        <div
          className={
            "flex w-full items-center justify-between gap-4 rounded-full px-3 py-2 sm:px-4 transition-all duration-300 " +
            (scrolled ? "glass" : "")
          }
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="ring-aurora relative h-9 w-9 overflow-hidden rounded-full">
              <Image src="/art/1.png" alt="Arctounon" fill sizes="36px" className="object-cover" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-frost">
              {SITE.name}
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors " +
                    (active
                      ? "bg-ice/15 text-ice"
                      : "text-muted hover:bg-white/[0.05] hover:text-frost")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={SITE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on X"
              className="btn-ghost h-10 w-10 p-0 sm:h-10 sm:w-auto sm:px-4 text-sm"
            >
              <XIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Follow</span>
            </a>
            <ConnectButton className="hidden sm:inline-flex" />

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="btn-ghost h-10 w-10 p-0 md:hidden"
            >
              <div className="flex flex-col gap-1">
                <span
                  className={"h-0.5 w-4 bg-current transition-transform " + (open ? "translate-y-[3px] rotate-45" : "")}
                />
                <span
                  className={"h-0.5 w-4 bg-current transition-transform " + (open ? "-translate-y-[3px] -rotate-45" : "")}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="mx-4 mt-1 md:hidden">
          <nav className="glass flex flex-col gap-1 rounded-2xl p-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors " +
                  (isActive(l.href)
                    ? "bg-ice/15 text-ice"
                    : "text-muted hover:bg-white/[0.05] hover:text-frost")
                }
              >
                {l.label}
              </Link>
            ))}
            <div className="p-2 sm:hidden">
              <ConnectButton className="w-full justify-center" />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

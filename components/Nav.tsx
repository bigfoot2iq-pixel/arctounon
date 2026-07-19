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
  { href: "/allowlist", label: "Allowlist" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/raffle", label: "Raffle" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
            "flex w-full items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 sm:gap-4 sm:px-4 " +
            (scrolled ? "glass" : "")
          }
        >
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="ring-aurora relative h-9 w-9 overflow-hidden rounded-full">
              <Image src="/art/1.png" alt="Arctounon" fill sizes="36px" className="object-cover" />
            </span>
            <span className="hidden font-display text-lg font-bold tracking-tight text-frost sm:inline">
              {SITE.name}
            </span>
          </Link>

          {/* Nav links — inline on every size; scroll horizontally if cramped */}
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto md:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-sm " +
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
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={SITE.links.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on X"
              className="btn-ghost h-10 w-10 p-0 text-sm sm:w-auto sm:px-4"
            >
              <XIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Follow</span>
            </a>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { LAUNCHPAD } from "@/lib/collection";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { ArrowRight } from "./icons";

export function Launchpad() {
  return (
    <section id="launchpad" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Launchpad"
          title={
            <>
              Drops incubating <span className="text-aurora">on Arc</span>
            </>
          }
          desc="A first look at what's forging in the lab. Names are set — the full stories drop soon."
        />
        <Link href="/launchpad" className="btn-ghost h-9 shrink-0 gap-1.5 px-4 text-[13px]">
          Enter the Launchpad
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LAUNCHPAD.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 90}
            className="glass card-hover group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={item.img}
                alt={item.name}
                fill
                sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space via-space/10 to-transparent" />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-glacier backdrop-blur">
                {item.status}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base font-bold text-frost">{item.name}</h3>
              <p className="mt-1.5 flex-1 text-[13px] italic text-faint">{item.desc}</p>
              <button
                disabled
                className="btn-ghost btn-soon mt-4 h-9 w-full text-[13px] opacity-70"
              >
                Reveal soon
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

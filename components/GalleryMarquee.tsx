import Image from "next/image";
import { GALLERY } from "@/lib/collection";

function Row({ reverse = false, slow = false }: { reverse?: boolean; slow?: boolean }) {
  const items = [...GALLERY, ...GALLERY];
  return (
    <div className="flex overflow-hidden">
      <div
        className={"marquee gap-4 pr-4 " + (slow ? "marquee-slow" : "")}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="ring-aurora relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-36 sm:w-36"
          >
            <Image
              src={src}
              alt="Arctounon panda"
              fill
              sizes="192px"
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryMarquee() {
  return (
    <section aria-label="Collection preview" className="relative py-6">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-space to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-space to-transparent" />
      <div className="flex flex-col gap-4">
        <Row />
        <Row reverse slow />
      </div>
    </section>
  );
}

import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={
        "flex flex-col gap-2.5 " +
        (align === "center" ? "items-center text-center mx-auto max-w-xl" : "max-w-xl")
      }
    >
      <span className="eyebrow flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-glacier" />
        {eyebrow}
      </span>
      <h2 className="font-display text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight text-frost">
        {title}
      </h2>
      {desc ? <p className="text-muted text-sm sm:text-[15px] leading-relaxed">{desc}</p> : null}
    </Reveal>
  );
}

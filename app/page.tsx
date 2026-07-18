import { Hero } from "@/components/Hero";
import { GalleryMarquee } from "@/components/GalleryMarquee";
import { MintInfo } from "@/components/MintInfo";
import { Launchpad } from "@/components/Launchpad";
import { Roadmap } from "@/components/Roadmap";
import { Faq } from "@/components/Faq";

export default function Home() {
  return (
    <>
      <Hero />
      <GalleryMarquee />
      <MintInfo />
      <Launchpad />
      <Roadmap />
      <Faq />
    </>
  );
}

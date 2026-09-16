import type { ComponentType } from "react";
import type { Section } from "@/lib/types";
import type { BlockContext, BlockProps } from "./components/shared";
import About from "./components/About";
import Blog from "./components/Blog";
import Brands from "./components/Brands";
import Counters from "./components/Counters";
import Cta from "./components/Cta";
import Hero from "./components/Hero";
import ImageBanner from "./components/ImageBanner";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import TextSlider from "./components/TextSlider";
import Trust from "./components/Trust";
import VideoBanner from "./components/VideoBanner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<string, ComponentType<BlockProps<any>>> = {
  hero: Hero,
  about: About,
  brands: Brands,
  services: Services,
  videoBanner: VideoBanner,
  portfolio: Portfolio,
  counters: Counters,
  trust: Trust,
  textSlider: TextSlider,
  testimonials: Testimonials,
  imageBanner: ImageBanner,
  blog: Blog,
  cta: Cta,
};

export function RenderSections({ sections, ctx }: { sections: Section[]; ctx: BlockContext }) {
  return (
    <>
      {sections
        .filter((s) => s.visible)
        .map((s) => {
          const Component = COMPONENTS[s.type];
          if (!Component) return null;
          return <Component key={s.id} data={s.data} ctx={ctx} anchor={s.anchor || undefined} />;
        })}
    </>
  );
}

import { Icon } from "@/components/site/Icon";
import type { BlockProps } from "./shared";

type TextSliderData = { items?: { left?: string; right?: string }[] };

export default function TextSlider({ data, anchor }: BlockProps<TextSliderData>) {
  const items = data.items ?? [];
  // Repeat items so the continuous loop never shows a gap.
  const slides = items.length ? Array.from({ length: Math.max(2, Math.ceil(6 / items.length)) }).flatMap(() => items) : [];
  return (
    <div id={anchor} className="tp-text-slider-area pt-25 pb-25 tp-bg-theme-primary">
      <div className="swiper-container tp-text-slider-active">
        <div className="swiper-wrapper slide-transtion">
          {slides.map((s, i) => (
            <div className="swiper-slide" key={i}>
              <div className="tp-text-slider-item">
                <span>{s.left}</span>
                <span className="icons">
                  <Icon name="textSliderIcon" />
                </span>
                <span>{s.right}</span>
                <span className="borders"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

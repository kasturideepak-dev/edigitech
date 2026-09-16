import type { ImageValue } from "@/lib/types";
import { type BlockProps, src } from "./shared";

type BrandsData = {
  title?: string;
  logos?: { image?: ImageValue; name?: string; url?: string }[];
};

export default function Brands({ data, anchor }: BlockProps<BrandsData>) {
  const logos = (data.logos ?? []).filter((l) => src(l.image));
  // The marquee needs enough slides to loop smoothly.
  const slides = logos.length > 0 ? Array.from({ length: Math.max(2, Math.ceil(9 / logos.length)) }).flatMap(() => logos) : [];

  return (
    <div id={anchor} className="tp-brand-area tp-brand-spacing tp-bg-common-white z-index-1 p-relative">
      <span className="tp-brand-bottom-border"></span>
      {data.title && (
        <div className="tp-brand-customer-wrap">
          <span className="tp-brand-customer tp-ff-heading fs-18 fs-xs-15 fw-700 tp-text-common-black">{data.title}</span>
        </div>
      )}
      <div className="tp-brand-wrap">
        <div className="swiper-container tp-brand-slide-active">
          <div className="swiper-wrapper slide-transtion">
            {slides.map((l, i) => (
              <div className="swiper-slide" key={i}>
                <div className="tp-brand-item">
                  {l.url ? (
                    <a href={l.url} target="_blank" rel="noopener">
                      <img src={src(l.image)} alt={l.image?.alt || l.name || ""} loading="lazy" />
                    </a>
                  ) : (
                    <span>
                      <img src={src(l.image)} alt={l.image?.alt || l.name || ""} loading="lazy" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

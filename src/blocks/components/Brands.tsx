import type { ImageValue } from "@/lib/types";
import { type BlockProps, src } from "./shared";
import BrandsMarquee from "./BrandsMarquee";

type BrandsData = {
  title?: string;
  logos?: { image?: ImageValue; name?: string; url?: string }[];
};

export default function Brands({ data, anchor }: BlockProps<BrandsData>) {
  const logos = (data.logos ?? []).filter((l) => src(l.image));

  return (
    <div id={anchor} className="tp-brand-area tp-brand-spacing tp-bg-common-white z-index-1 p-relative">
      <span className="tp-brand-bottom-border"></span>
      {data.title && (
        <div className="tp-brand-customer-wrap">
          <span className="tp-brand-customer tp-ff-heading fs-18 fs-xs-15 fw-700 tp-text-common-black">{data.title}</span>
        </div>
      )}
      <div className="tp-brand-wrap">{logos.length > 0 && <BrandsMarquee logos={logos} />}</div>
    </div>
  );
}

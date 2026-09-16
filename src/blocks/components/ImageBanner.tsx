import type { ImageValue } from "@/lib/types";
import { type BlockProps, alt, src } from "./shared";

export default function ImageBanner({ data, anchor }: BlockProps<{ image?: ImageValue }>) {
  if (!src(data.image)) return null;
  return (
    <div id={anchor} className="tp-banner-thumb scale-up-img">
      <img data-speed="0.4" className="img-cover scale-up" src={src(data.image)} alt={alt(data.image)} loading="lazy" />
    </div>
  );
}

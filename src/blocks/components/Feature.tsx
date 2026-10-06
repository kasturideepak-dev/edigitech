import type { ImageValue, Link } from "@/lib/types";
import { Text } from "@/components/site/Text";
import { type BlockProps, hasLink, linkProps, src, alt } from "./shared";

type FeatureData = {
  image?: ImageValue | null;
  /** Which side the image sits on. */
  imageSide?: "left" | "right";
  theme?: "dark" | "light";
  title?: string;
  text?: string;
  points?: { label?: string }[];
  button?: Partial<Link>;
};

const Tick = () => (
  <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.7503 0.276674L7.8072 14.7403C7.57495 15.0311 7.22607 15.0888 6.93501 14.8568C6.87645 14.799 6.87645 14.799 6.81763 14.7403L0.0258056 5.79766C-0.032257 5.7399 0.0258056 5.68214 0.0258056 5.68214C0.083618 5.62438 0.141681 5.68214 0.141681 5.68214L7.23308 10.8441L18.4597 0.0438828C18.5175 -0.0146276 18.6341 -0.0146276 18.6919 0.0438828C18.7503 0.101393 18.7503 0.217914 18.7503 0.276674Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Split section: image on one side, a colour panel on the other with a heading,
 * text and a tick list. Mirrors the template's about-feature design, using this
 * site's own typography classes rather than the modern theme's font family.
 */
export default function Feature({ data, ctx, anchor }: BlockProps<FeatureData>) {
  const points = (data.points ?? []).filter((p) => p.label?.trim());
  const dark = data.theme !== "light";
  const imageFirst = data.imageSide !== "right";
  const link = linkProps(data.button, ctx);

  const Thumb = (
    <div className="col-lg-6">
      <div className="tp-about-feature-thumb h-100">
        {src(data.image) && <img className="w-100 h-100" style={{ objectFit: "cover" }} src={src(data.image)} alt={alt(data.image, data.title ?? "")} loading="lazy" />}
      </div>
    </div>
  );

  const Panel = (
    <div className="col-lg-6">
      <div className={`tp-about-feature-info h-100 ${dark ? "tp-bg-common-black-1" : "tp-bg-common-white"}`}>
        {data.title && (
          <h2
            className={`fw-500 fs-60 fs-xl-50 fs-xs-35 lh-120-per tp-ff-heading mb-20 tp_fade_anim ${dark ? "tp-text-grey-5" : "tp-text-common-black"}`}
            data-delay=".3"
            data-fade-from={imageFirst ? "right" : "left"}
          >
            {data.title}
          </h2>
        )}
        {data.text && (
          <div className="tp_fade_anim" data-delay=".4" data-fade-from={imageFirst ? "right" : "left"}>
            <p className={`fs-18 lh-140-per mb-30 ${dark ? "tp-text-grey-6" : "tp-text-grey-1"}`}>
              <Text value={data.text} />
            </p>
          </div>
        )}
        {points.length > 0 && (
          <div className="tp-service-cst-info-list mb-35 tp_fade_anim" data-delay=".5" data-fade-from={imageFirst ? "right" : "left"}>
            <ul>
              {points.map((p, i) => (
                <li key={i}>
                  <span>
                    <Tick />
                  </span>
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasLink(data.button) && (
          <a
            className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500"
            href={link.href}
            {...(link.newTab ? { target: "_blank", rel: "noopener" } : {})}
          >
            {data.button?.label}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div id={anchor} className="tp-about-feature-area fix pb-40">
      <div className="conteiner-fluid p-0">
        <div className="row gx-0">
          {imageFirst ? (
            <>
              {Thumb}
              {Panel}
            </>
          ) : (
            <>
              {Panel}
              {Thumb}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

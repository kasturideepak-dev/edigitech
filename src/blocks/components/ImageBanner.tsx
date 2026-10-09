import type { ImageValue, Link } from "@/lib/types";
import { SwitchButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, hasLink, linkProps, src } from "./shared";

type ImageBannerData = {
  image?: ImageValue;
  eyebrow?: string;
  title?: string;
  text?: string;
  primaryCta?: Link;
  secondaryCta?: Link;
  /** How hard the scrim sits on the photo. See the note in edigitech.css. */
  overlay?: "none" | "soft" | "medium" | "strong";
};

/**
 * Full-width photo, optionally carrying a call to action over it.
 *
 * With no heading or buttons it stays the plain parallax banner it was.
 */
export default function ImageBanner({ data, ctx, anchor }: BlockProps<ImageBannerData>) {
  if (!src(data.image)) return null;

  const primary = linkProps(data.primaryCta, ctx);
  const secondary = linkProps(data.secondaryCta, ctx);
  const hasCta = Boolean(data.title?.trim() || hasLink(data.primaryCta) || hasLink(data.secondaryCta));
  const overlay = data.overlay ?? "medium";

  return (
    <div
      id={anchor}
      className={`tp-banner-thumb scale-up-img${hasCta ? ` ed-banner-cta ed-banner-scrim-${overlay}` : ""}`}
    >
      <img data-speed="0.4" className="img-cover scale-up" src={src(data.image)} alt={alt(data.image)} loading="lazy" />

      {hasCta && (
        <div className="ed-banner-cta-inner">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-9 col-lg-10 text-center">
                {data.eyebrow && (
                  <span className="tp-section-subtitle tp-section-subtitle-white tp-text-common-white tp-ff-heading fw-500 fs-16 mb-25 d-inline-block">
                    <span className="borders d-inline-block"></span>
                    {data.eyebrow}
                  </span>
                )}
                {/* No tp_fade_anim on any of this. The template's reveal is driven by
                    ScrollTrigger, and inside this absolutely-positioned overlay — in a
                    fixed-height, overflow-hidden container — it computes a trigger that
                    never fires: the copy sat at opacity 0 permanently, including after
                    scrolling past and back. A reveal that can silently swallow the
                    closing CTA isn't worth it; the photo's parallax is motion enough. */}
                {data.title && (
                  <h2 className="tp-section-title fs-70 fs-lg-50 fs-xs-35 fw-700 text-uppercase mb-25 tp-text-common-white">
                    <Text value={data.title} />
                  </h2>
                )}
                {data.text && (
                  /* White, not the usual muted grey: over a photo even a light
                     grey drops under AA once the scrim is light enough to keep
                     the picture readable. */
                  <p className="fs-20 lh-28 mb-45 tp-text-common-white">
                    <Text value={data.text} />
                  </p>
                )}
                {(hasLink(data.primaryCta) || hasLink(data.secondaryCta)) && (
                  <div className="ed-btn-group justify-content-center">
                    {hasLink(data.primaryCta) && (
                      <SwitchButton
                        href={primary.href}
                        newTab={primary.newTab}
                        label={data.primaryCta!.label}
                        className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500 tp-bg-theme-primary tp-text-common-white hover-text-white"
                      />
                    )}
                    {hasLink(data.secondaryCta) && (
                      <SwitchButton
                        href={secondary.href}
                        newTab={secondary.newTab}
                        label={data.secondaryCta!.label}
                        className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500 ed-btn-white tp-text-common-black hover-text-black"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

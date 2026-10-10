import type { ImageValue, Link } from "@/lib/types";
import { SwitchButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import Reveal from "@/components/site/Reveal";
import ShaderBackdrop from "@/components/site/ShaderBackdrop";
import { type BlockProps, alt, hasLink, linkProps, src } from "./shared";

type ServiceHeroData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  badges?: { label?: string }[];
  primaryCta?: Link;
  secondaryCta?: Link;
  image?: ImageValue | null;
};

/**
 * Service landing hero: deep navy with a drifting brand-blue field, an
 * oversized headline, trust badges and the photo alongside.
 *
 * The shader is decoration only — it is skipped without WebGL or under
 * reduced motion, and the gradient underneath carries the section on its own.
 */
export default function ServiceHero({ data, ctx, anchor }: BlockProps<ServiceHeroData>) {
  const badges = (data.badges ?? []).map((b) => b.label?.trim()).filter(Boolean);
  const primary = linkProps(data.primaryCta, ctx);
  const secondary = linkProps(data.secondaryCta, ctx);

  return (
    <div id={anchor} className="ed-shero ed-shader-host">
      <ShaderBackdrop className="ed-shader-canvas" />
      <div className="container container-1230">
        <div className="row align-items-center">
          <div className={src(data.image) ? "col-lg-7" : "col-lg-10"}>
            <Reveal className="ed-shero-copy" selector=".ed-shero-step" stagger={0.11} y={26}>
              {data.eyebrow && (
                <div className="ed-shero-step">
                  <span className="ed-shero-eyebrow">{data.eyebrow}</span>
                </div>
              )}
              {data.title && (
                <div className="ed-shero-step">
                  <h1 className="ed-shero-title">
                    <Text value={data.title} boldClassName="ed-shero-accent" />
                  </h1>
                </div>
              )}
              {data.intro && (
                <div className="ed-shero-step">
                  <p className="ed-shero-intro">
                    <Text value={data.intro} />
                  </p>
                </div>
              )}
              {badges.length > 0 && (
                <div className="ed-shero-step">
                  <ul className="ed-shero-badges">
                    {badges.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(hasLink(data.primaryCta) || hasLink(data.secondaryCta)) && (
                <div className="ed-shero-step">
                  <div className="ed-btn-group">
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
                </div>
              )}
            </Reveal>
          </div>

          {src(data.image) && (
            <div className="col-lg-5">
              <div className="ed-shero-thumb">
                <img src={src(data.image)} alt={alt(data.image, data.title ?? "")} fetchPriority="high" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

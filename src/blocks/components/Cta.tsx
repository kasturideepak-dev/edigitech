import type { Link } from "@/lib/types";
import { SwitchButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, hasLink, linkProps } from "./shared";

type CtaData = {
  eyebrow?: string;
  theme?: "light" | "dark" | "primary";
  title?: string;
  text?: string;
  primaryCta?: Link;
  secondaryCta?: Link;
};

export default function Cta({ data, ctx, anchor }: BlockProps<CtaData>) {
  const theme = data.theme ?? "dark";
  // "primary" uses the deeper logo blue so white text keeps a strong contrast ratio.
  const onDark = theme === "dark" || theme === "primary";
  const bg = theme === "dark" ? "tp-bg-common-black" : theme === "primary" ? "ed-bg-brand-deep" : "";
  const heading = onDark ? "tp-text-common-white" : "tp-text-common-black";
  const primary = linkProps(data.primaryCta, ctx);
  const secondary = linkProps(data.secondaryCta, ctx);

  return (
    <div id={anchor} className={`ed-cta-area ed-cta-${theme} p-relative z-index-1 pt-120 pb-120 ${bg}`}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10 text-center">
            {data.eyebrow && (
              <span
                className={`tp-section-subtitle tp-ff-heading fw-500 fs-16 mb-30 d-inline-block ${
                  onDark ? "tp-section-subtitle-white tp-text-common-white" : "tp-text-common-black"
                }`}
              >
                <span className="borders d-inline-block"></span>
                {data.eyebrow}
              </span>
            )}
            <h2 className={`tp-section-title fs-70 fs-lg-50 fs-xs-40 fw-700 text-uppercase mb-25 tp_fade_anim ${heading}`} data-delay=".3">
              <Text value={data.title} />
            </h2>
            {data.text && (
              <p className={`fs-20 lh-28 mb-45 tp_fade_anim ${onDark ? "tp-text-grey-2" : "tp-text-grey-1"}`} data-delay=".5">
                {data.text}
              </p>
            )}
            <div className="ed-btn-group justify-content-center tp_fade_anim" data-delay=".6" data-ease="bounce">
              {hasLink(data.primaryCta) && (
                <SwitchButton
                  href={primary.href}
                  newTab={primary.newTab}
                  label={data.primaryCta.label}
                  className={`tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500 ${
                    theme === "primary"
                      ? "ed-btn-white tp-text-common-black hover-text-black"
                      : "tp-bg-theme-primary tp-text-common-white hover-text-white"
                  }`}
                />
              )}
              {hasLink(data.secondaryCta) && (
                <SwitchButton
                  href={secondary.href}
                  newTab={secondary.newTab}
                  label={data.secondaryCta.label}
                  className={`tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500 ed-btn-outline ${
                    onDark ? "tp-text-common-white hover-text-white" : "tp-text-common-black hover-text-black"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

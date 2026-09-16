import type { ImageValue, Link } from "@/lib/types";
import { Icon, SwitchButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { socialIconClass } from "../common-fields";
import { type BlockProps, alt, hasLink, linkProps, src } from "./shared";

type HeroData = {
  titlePrefix?: string;
  title?: string;
  subtitle?: string;
  stats?: { value: string; label: string }[];
  avatar?: ImageValue;
  primaryCta?: Link;
  secondaryCta?: Link;
  videoUrl?: string;
  videoText?: string;
  sideText?: string;
  socialLabel?: string;
  socials?: { platform: string; url: string }[];
  image?: ImageValue;
  highlight?: { eyebrow?: string; title?: string; url?: string };
};

export default function Hero({ data, ctx, anchor }: BlockProps<HeroData>) {
  // Falls back to the site-wide social links when the hero has none of its own.
  const socials = ((data.socials ?? []).filter((s) => s.url).length ? data.socials! : ctx.settings.general.socials ?? []).filter(
    (s) => s.url,
  );
  const stats = (data.stats ?? []).filter((s) => s.value || s.label);
  const hl = data.highlight ?? {};
  const primary = linkProps(data.primaryCta, ctx);
  const secondary = linkProps(data.secondaryCta, ctx);

  return (
    <div id={anchor} className="tp-hero-area pre-header tp-hero-spacing fix">
      <div className="container-fluid container-1800 containers">
        <div className="row">
          <div className="col-lg-1 col-md-1 d-none d-md-block">
            {socials.length > 0 && (
              <div className="tp-hero-social d-flex align-items-center mt-20">
                <span className="d-flex align-items-center mb-55">
                  {data.socialLabel}
                  <Icon name="followLine" className="mt-15" />
                </span>
                {socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener" aria-label={s.platform}>
                    <i className={socialIconClass(s.platform)}></i>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="col-lg-9 col-md-11">
            <div className="tp-hero-content ml-75">
              <h1 className="tp-hero-title">
                {data.titlePrefix && (
                  <span className="tp-hero-title-sm d-inline-block">
                    <span>{data.titlePrefix}</span>
                    <Icon name="heroTitleSm" />
                  </span>
                )}{" "}
                <Text value={data.title} />
              </h1>
              <div className="tp-hero-bottom-content">
                {/* Top-aligned: the stats block is much shorter than the text column. */}
                <div className="row align-items-start">
                  <div className="col-lg-6">
                    {stats.length > 0 && (
                      <div className="tp-hero-customer d-flex align-items-center mb-50">
                        <span className="d-inline-block mr-20 ed-hero-customer-icon">
                          <Icon name="heroCustomer" />
                        </span>
                        <div>
                          {src(data.avatar) && <img className="mb-15" src={src(data.avatar)} alt={alt(data.avatar)} />}
                          <div className="ed-hero-stats">
                            {stats.map((s, i) => (
                              <p key={i} className="fw-500 fs-16 tp-text-grey-1 lh-130-per mb-0">
                                <b className="tp-text-common-black">{s.value}</b>
                                <br />
                                {s.label}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-lg-5">
                    <div className="tp-hero-customer-text mb-30">
                      {data.subtitle && <p className="fs-20 lh-28 mb-40">{data.subtitle}</p>}
                      {(hasLink(data.primaryCta) || hasLink(data.secondaryCta)) && (
                        <div className="ed-btn-group mb-40">
                          {hasLink(data.primaryCta) && (
                            <SwitchButton
                              href={primary.href}
                              newTab={primary.newTab}
                              label={data.primaryCta.label}
                              className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-common-black text-uppercase ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white tp-ff-heading fw-500"
                            />
                          )}
                          {hasLink(data.secondaryCta) && (
                            <SwitchButton
                              href={secondary.href}
                              newTab={secondary.newTab}
                              label={data.secondaryCta.label}
                              className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-text-common-black hover-text-black tp-ff-heading fw-500"
                            />
                          )}
                        </div>
                      )}
                      {data.videoUrl && (
                        <div className="tp-hero-video d-flex align-items-center">
                          <a className="tp-hero-video-btn popup-video mr-20" href={data.videoUrl} aria-label="Play video">
                            <span>
                              <Icon name="play" />
                            </span>
                          </a>
                          <p className="tp-ff-heading lh-110-per mb-0 fw-700 fs-18 tp-text-common-black">
                            <Text value={data.videoText} />
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-2 d-none d-lg-block">
            <div className="tp-hero-right-content ml-80 pt-15 mb-30">
              <h5 className="fw-500 fs-25 mb-10">
                <Text value={data.sideText} />
              </h5>
              <span className="d-inline-block mb-100">
                <Icon name="line193" className="svg" />
              </span>
              <div className="tp-hero-right-shape tp-btn-bounce">
                <span className="shape-1" data-speed="0.9">
                  <Icon name="shape1" />
                </span>
                <span className="shape-2">
                  <Icon name="shape2" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="tp-hero-bottom pt-40">
        <div className="container-fluid p-0">
          <div className="row">
            <div className={hl.title ? "col-lg-9" : "col-lg-12"}>
              <div className="tp-hero-bottom-thumb p-relative h-100 mr-40">
                <div className="tp-hero-bottom-height fix scale-up-img">
                  {src(data.image) && (
                    <img
                      data-speed="0.8"
                      className="img-cover w-100 h-100 scale-up"
                      src={src(data.image)}
                      alt={alt(data.image, ctx.settings.general.siteName)}
                      fetchPriority="high"
                    />
                  )}
                </div>
                <img className="tp-hero-bottom-shape" src="/assets/img/hero/shape.png" alt="" />
              </div>
            </div>
            {hl.title && (
              <div className="col-lg-3">
                <div className="tp-hero-bottom-right h-100 tp-bg-common-black tp-left-right p-relative z-index-1 pb-50">
                  <img className="tp-hero-customer-shape" src="/assets/img/hero/grid-shape.png" alt="" />
                  <div className="tp-hero-bottom-box">
                    <span className="tp-hero-bottom-icon d-inline-block mb-55">
                      <Icon name="heroBottomIcon" />
                    </span>
                    <span className="tp-hero-bottom-border mb-15">
                      <Icon name="border380" />
                    </span>
                    <div className="d-flex align-items-end justify-content-between">
                      <div>
                        {hl.eyebrow && (
                          <span className="tp-text-common-white fw-400 fs-18 mb-10 d-inline-block">{hl.eyebrow}</span>
                        )}
                        <h5 className="fw-700 fs-25 tp-text-common-white">
                          <a href={linkProps({ url: hl.url }, ctx).href} className="hover-text-white">
                            {hl.title}
                          </a>
                        </h5>
                      </div>
                      <span className="tp-arrow-angle mb-10">
                        <Icon name="arrowTopRight" className="tp-arrow-svg-top-right" />
                      </span>
                    </div>
                  </div>
                  <div className="tp-hero-bottom-line mt-100"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

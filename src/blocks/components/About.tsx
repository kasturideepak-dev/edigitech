import type { ImageValue, Link } from "@/lib/types";
import { RoundedButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, hasLink, linkProps, src } from "./shared";

type AboutData = {
  eyebrow?: string;
  statement?: string;
  text?: string;
  counterValue?: string;
  counterSuffix?: string;
  counterLabel?: string;
  image1?: ImageValue;
  image2?: ImageValue;
  button?: Link;
};

export default function About({ data, ctx, anchor }: BlockProps<AboutData>) {
  const btn = linkProps(data.button, ctx);
  // The template sizes this for a short sentence; step down for longer statements.
  const len = (data.statement ?? "").length;
  const size = len > 160 ? "fs-38 fs-xl-35 fs-lg-30" : len > 100 ? "fs-45 fs-xl-40 fs-lg-35" : "fs-50 fs-xl-45 fs-lg-35";
  return (
    <div id={anchor} className="tp-about-area pt-140 pb-125">
      <div className="container">
        <div className="row">
          <div className="col-xxl-5 col-xl-4 col-lg-4">
            {data.eyebrow && (
              <div className="tp-about-subtitle mb-30 tp_fade_anim" data-delay=".3">
                <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              </div>
            )}
          </div>
          <div className="col-xxl-7 col-xl-8 col-lg-8">
            <div className="tp-about-content mb-30">
              <h2
                className={`tp-about-title ${size} fw-500 lh-120-per ls-0 mb-25 tp_fade_anim`}
                data-delay=".5"
              >
                <span></span>
                {data.statement}
              </h2>
              {data.text && (
                <div className="tp_fade_anim" data-delay=".6">
                  <p className="tp-about-para tp-ff-heading fw-500 fs-22 tp-text-grey-1">{data.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="tp-about-bottom pt-40 mt-30">
          <div className="row">
            <div className="col-lg-3">
              {data.counterValue && (
                <div className="tp-about-expreance d-flex align-items-end mb-30 tp_fade_anim" data-delay=".3">
                  <h3 className="fw-500 fs-100 p-relative d-inline-block mb-0 lh-1">
                    {data.counterValue} <span className="plus fs-25">{data.counterSuffix}</span>
                  </h3>
                  <span className="tp-ff-heading fs-18 fw-700 tp-text-common-black mb-15 ml-35">
                    <Text value={data.counterLabel} />
                  </span>
                </div>
              )}
            </div>
            <div className="col-lg-2 col-md-6">
              <div className="tp-about-thumb text-end mb-30 tp_fade_anim" data-delay=".5">
                <div className="tp-about-thumb-height mb-40 fix">
                  {src(data.image1) && (
                    <img data-speed=".9" className="img-cover" src={src(data.image1)} alt={alt(data.image1)} loading="lazy" />
                  )}
                </div>
                <img className="mr-25" src="/assets/img/about/shape.png" alt="" />
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tp-about-thumb tp-about-thumb-height-2 fix mb-30 tp_fade_anim" data-delay=".7">
                {src(data.image2) && (
                  <img data-speed=".9" className="img-cover" src={src(data.image2)} alt={alt(data.image2)} loading="lazy" />
                )}
              </div>
            </div>
            <div className="col-lg-3">
              {hasLink(data.button) && (
                <div
                  className="tp-rounded-btn-wrap text-md-end mr-40 mb-30 tp_fade_anim"
                  data-delay=".8"
                  data-fade-from="top"
                  data-ease="bounce"
                >
                  <RoundedButton href={btn.href} newTab={btn.newTab} label={data.button.label} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

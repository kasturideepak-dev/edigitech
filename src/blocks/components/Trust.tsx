import type { ImageValue } from "@/lib/types";
import { Text } from "@/components/site/Text";
import { type BlockProps, src } from "./shared";

type TrustData = {
  eyebrow?: string;
  leftText?: string;
  title?: string;
  column1?: string;
  column2?: string;
  items?: { icon?: ImageValue; emoji?: string; title?: string; meta?: string }[];
};

export default function Trust({ data, anchor }: BlockProps<TrustData>) {
  const items = data.items ?? [];
  return (
    <div id={anchor} className="tp-awards-area tp-bg-common-black p-relative z-index-1 pt-110 pb-90">
      <img className="tp-awards-bg-shape" src="/assets/img/awards/grid-shape.png" alt="" />
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="tp-awards-left mb-30">
              {data.eyebrow && (
                <span className="tp-section-subtitle tp-section-subtitle-white tp-ff-heading fw-500 tp-text-common-white fs-16 mb-180">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              )}
              <p className="fs-25 fw-500 tp-text-common-white lh-36 tp-ff-heading">
                <Text value={data.leftText} />
              </p>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="tp-awards-right mb-30">
              <h2 className="fs-50 fw-500 fs-xl-40 fs-lg-35 tp-text-common-white lh-120-per mb-55 tp_text_invert">
                {data.title}
              </h2>
              <div className="tp-awards-wrap">
                {(data.column1 || data.column2) && (
                  <div className="tp-awards-item-top mb-35">
                    <span className="fw-400 fs-22 fs-xs-18 tp-text-grey-2 mr-30">{data.column1}</span>
                    <span className="fw-400 fs-22 fs-xs-18 tp-text-grey-2 mr-30">{data.column2}</span>
                  </div>
                )}
                {items.map((it, i) => (
                  <div className={`tp-awards-item${i < items.length - 1 ? " borders" : ""}`} key={i}>
                    {src(it.icon) ? (
                      <img className="mr-30" src={src(it.icon)} alt={it.icon?.alt || ""} loading="lazy" />
                    ) : it.emoji ? (
                      <span className="mr-30 ed-award-emoji" aria-hidden="true">
                        {it.emoji}
                      </span>
                    ) : null}
                    <div>
                      <span className="fw-600 fs-22 fs-xs-18 tp-text-common-white mr-30">{it.title}</span>
                    </div>
                    <span className="fw-600 fs-22 fs-xs-18 tp-text-common-white mr-30">{it.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

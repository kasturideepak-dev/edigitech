import type { ImageValue, Link } from "@/lib/types";
import { Text } from "@/components/site/Text";
import { type BlockProps, hasLink, linkProps, src, alt } from "./shared";
import { BtnArrow } from "./BtnArrow";

type Tab = { title?: string; body?: string; button?: Partial<Link> };

type AboutModernData = {
  statement?: string;
  image?: ImageValue | null;
  counterValue?: string;
  counterSuffix?: string;
  counterLabel?: string;
  tabs?: Tab[];
  image2?: ImageValue | null;
  cardImage?: ImageValue | null;
  cardTitle?: string;
  cardPoints?: { label?: string }[];
};

const Tick = () => (
  <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.5002 0.18445L5.2048 9.82684C5.04997 10.0207 4.81738 10.0592 4.62334 9.90452C4.5843 9.86601 4.5843 9.86601 4.54509 9.82684L0.0172037 3.86511C-0.0215047 3.8266 0.0172037 3.78809 0.0172037 3.78809C0.0557453 3.74959 0.0944537 3.78809 0.0944537 3.78809L4.82205 7.22938L12.3065 0.0292552C12.345 -0.00975174 12.4223 -0.00975174 12.4608 0.0292552C12.5002 0.0677621 12.5002 0.145776 12.5002 0.18445Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * The template's about-modern section: a full-width statement, then a thumb with
 * an experience counter, tabbed copy, and a second image carrying a highlight
 * card. Bootstrap drives the tabs, so the ids must be unique on the page.
 */
export default function AboutModern({ data, ctx, anchor }: BlockProps<AboutModernData>) {
  const tabs = (data.tabs ?? []).filter((t) => t.title?.trim() || t.body?.trim());
  const points = (data.cardPoints ?? []).filter((p) => p.label?.trim());
  const base = anchor || "about-modern";

  return (
    <div id={anchor} className="tp-about-area pt-150 pb-100">
      <div className="container-fluid container-1524">
        <div className="row">
          {data.statement && (
            <div className="col-lg-12">
              <div className="tp-about-cst-title-wrap mb-80">
                <h2 className="tp-about-2-title fs-md-40 fs-xs-30 tp-ff-dm fw-600 tp-text-common-black-1">
                  <Text value={data.statement} />
                </h2>
              </div>
            </div>
          )}

          <div className="col-xl-3 col-lg-5">
            <div className="tp-about-cst-thumb-wrap mb-30">
              {src(data.image) && (
                <div className="tp-about-cst-thumb pb-60">
                  <img className="mr-30" src={src(data.image)} alt={alt(data.image)} loading="lazy" />
                </div>
              )}
              {data.counterValue && (
                <div className="tp-about-expreance d-flex align-items-end mb-30">
                  <h2 className="fw-600 fs-100 tp-ff-dm p-relative d-inline-block mb-0 lh-1">
                    {data.counterValue} <span className="plus fs-25">{data.counterSuffix || "+"}</span>
                  </h2>
                  <span className="tp-ff-dm fs-18 fw-700 tp-text-common-black mb-10 ml-15">
                    <Text value={data.counterLabel ?? ""} />
                  </span>
                </div>
              )}
            </div>
          </div>

          {tabs.length > 0 && (
            <div className="col-xl-4 col-lg-7">
              <div className="tp-about-cst-tab-wrap ml-35 mb-30">
                <div className="tp-about-cst-tab mb-25">
                  <ul role="tablist">
                    {tabs.map((t, i) => (
                      <li className="nav-tab-item" role="presentation" key={i}>
                        <a href={`#${base}-tab-${i}`} className={i === 0 ? "active" : undefined} data-bs-toggle="tab">
                          {`0${i + 1}. `}
                          {t.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tab-content p-relative mb-45">
                  {tabs.map((t, i) => {
                    const link = linkProps(t.button, ctx);
                    return (
                      <div className={`tab-pane${i === 0 ? " active show" : ""}`} id={`${base}-tab-${i}`} role="tabpanel" key={i}>
                        <div className="tp-about-cst-tab-content">
                          {t.body && (
                            <p className="fs-18 tp-ff-dm lh-140-per mb-40">
                              <Text value={t.body} />
                            </p>
                          )}
                          {hasLink(t.button) && (
                            <a
                              href={link.href}
                              {...(link.newTab ? { target: "_blank", rel: "noopener" } : {})}
                              className="tp-btn-cst d-inline-block mr-5 lh-0 tp-round-26 fs-16 ed-bg-brand ls-0 tp-btn-switch-2-animation fw-700 tp-ff-dm"
                            >
                              <span className="d-flex align-items-center justify-content-center">
                                <span className="btn-text">{t.button?.label}</span>
                                <BtnArrow />
                                <BtnArrow />
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="col-xl-5">
            <div className="tp-about-cst-list-wrap ml-30 p-relative mb-30">
              {src(data.image2) && (
                <div className="tp-about-cst-list-thumb text-end fix ml-150 tp-round-20">
                  <img data-speed="0.9" className="tp-round-20" src={src(data.image2)} alt={alt(data.image2)} loading="lazy" />
                </div>
              )}
              {(data.cardTitle || points.length > 0) && (
                <div className="tp-about-cst-list ed-bg-brand tp-round-8 d-inline-block" data-speed="0.9">
                  {src(data.cardImage) && <img className="w-100" src={src(data.cardImage)} alt={alt(data.cardImage)} loading="lazy" />}
                  <div className="tp-about-cst-list-inner">
                    {data.cardTitle && <h4 className="tp-ff-dm fw-600 fs-18 mb-5">{data.cardTitle}</h4>}
                    {points.length > 0 && (
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
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

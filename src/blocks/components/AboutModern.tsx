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
  cardButton?: Partial<Link>;
  /** The swinging doodle that fills the space under the tab column. */
  shape?: boolean;
};

/** Arrow on the card's own button — smaller than the page buttons' BtnArrow. */
const CardArrow = () => (
  <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.8 4.00047C10.5066 3.11428 7.66113 1.60168 5.89705 0L7.12686 3.54162H0.440804C0.353649 3.54164 0.268309 3.56806 0.195839 3.61849C0.123344 3.66894 0.0671054 3.74115 0.033736 3.82504C0.000415994 3.90889 -0.00860368 4.00106 0.00837916 4.09007C0.025379 4.17914 0.0676362 4.26117 0.129277 4.3254C0.211785 4.41135 0.323646 4.45959 0.440351 4.4598H7.12641L5.89705 8C7.66083 6.39798 10.5065 4.88609 12.8 4.00047Z"
      fill="currentColor"
    />
  </svg>
);

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
  const cardLink = linkProps(data.cardButton, ctx);

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
                          {/* Blank lines split the copy into real paragraphs, the way
                              the template sets them - a <br><br> reads as a cramped gap. */}
                          {(t.body ?? "")
                            .split(/\n\s*\n/)
                            .map((para) => para.trim())
                            .filter(Boolean)
                            .map((para, pi, all) => (
                              <p className={`fs-18 tp-ff-dm lh-140-per ${pi === all.length - 1 ? "mb-40" : "mb-30"}`} key={pi}>
                                <Text value={para} />
                              </p>
                            ))}
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
                {data.shape !== false && (
                  /* Balances the column: without it the tab copy stops short and
                     the row reads lopsided against the taller card beside it. */
                  <span className="tp-about-cst-shape text-center d-block ml-100 tpswing" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="97" height="55" viewBox="0 0 97 55" fill="none">
                      <path
                        d="M83.9847 54C78.6511 51.5322 68.0674 44.655 61.7108 35.7342M61.7108 35.7342C57.5824 29.9403 55.2371 23.2843 57.2715 16.4144C60.0986 7.49032 70.2847 -6.31124 90.9344 5.6788C98.7241 10.2019 98.4556 20.6021 83.5646 27.5777C79.0031 29.7146 71.0686 33.5275 61.7108 35.7342ZM61.7108 35.7342C53.4442 37.6836 44.0668 38.3795 34.9229 35.559C25.1202 32.5353 9.6859 22.4932 2.95683 11.8205M2.95683 11.8205C2.62313 11.2912 2.31083 10.7604 2.02169 10.2288M2.95683 11.8205C2.64312 11.2405 2.3276 10.7065 2.02169 10.2288M2.95683 11.8205C6.02114 17.4865 8.91304 27.5524 1 32.5592M2.02169 10.2288C4.26447 13.5357 12.5228 18.93 27.614 14.0517M60.1349 46.4081C56.4491 47.6903 43.2901 50.1894 32.1762 43.8776"
                        stroke="#030303"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                )}
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
                    {hasLink(data.cardButton) && (
                      <a
                        className="tp-about-cst-list-btn tp-bg-common-black-1 text-capitalize d-flex justify-content-between align-items-center tp-text-grey-5 fw-700 fs-14 tp-ff-dm"
                        href={cardLink.href}
                        {...(cardLink.newTab ? { target: "_blank", rel: "noopener" } : {})}
                      >
                        {data.cardButton?.label}
                        <CardArrow />
                      </a>
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

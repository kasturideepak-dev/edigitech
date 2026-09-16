import type { ImageValue, Link } from "@/lib/types";
import { SwitchButton } from "@/components/site/Icon";
import { type BlockProps, hasLink, linkProps, resolveUrl, src } from "./shared";

type PortfolioData = {
  title?: string;
  intro?: string;
  tags?: { text?: string }[];
  projects?: { image?: ImageValue; title?: string; url?: string; category?: string; year?: string }[];
  button?: Link;
};

// The template lays projects out in a repeating 5-item staggered pattern.
const LAYOUT = [
  { col: "col-lg-6", item: "mb-70", thumb: "thumb-1" },
  { col: "col-lg-6", item: "p-relative mb-70 ml-110 mt-135", thumb: "thumb-2" },
  { col: "col-lg-12", item: "p-relative mb-70", thumb: "thumb-1" },
  { col: "col-lg-6", item: "p-relative mb-70 mr-110", thumb: "thumb-2" },
  { col: "col-lg-6", item: "p-relative mb-70", thumb: "thumb-1" },
];
const BUTTON_SLOT = 3;

const BTN_CLASS =
  "tp-btn-xl d-inline-block lh-0 tp-round-36 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-text-common-black hover-text-black tp-ff-heading fw-600";

export default function Portfolio({ data, ctx, anchor }: BlockProps<PortfolioData>) {
  const projects = data.projects ?? [];
  const tags = (data.tags ?? []).filter((t) => t.text);
  const btn = linkProps(data.button, ctx);
  const showBtn = hasLink(data.button);
  const btnInGrid = showBtn && projects.length > BUTTON_SLOT;

  return (
    <div id={anchor} className="tp-portfolio-area pt-110 pb-70">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-lg-8">
            <div className="tp-portfolio-title-wrap mb-110 tp-text-perspective">
              <h2 className="tp-portfolio-sectitle tp-ff-heading text-uppercase d-flex align-items-center">
                {data.title} <span className="borders ml-40"></span>
              </h2>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="tp-portfolio-para">
              {data.intro && (
                <div className="tp_fade_anim" data-delay=".4">
                  <p className="fs-18 tp-text-grey-1 lh-28">{data.intro}</p>
                </div>
              )}
              {tags.length > 0 && (
                <div className="tp-portfolio-tag tp_fade_anim" data-delay=".5" data-ease="bounce">
                  {tags.map((t, i) => (
                    <span key={i}>{t.text}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          {projects.map((p, i) => {
            const l = LAYOUT[i % LAYOUT.length];
            const href = resolveUrl(p.url, ctx);
            return (
              <div className={l.col} key={i}>
                <div className={`tp-portfolio-item ${l.item}`}>
                  <div className="not-hide-cursor" data-cursor="View<br>Project">
                    <a href={href} className={`tp-portfolio-thumb ${l.thumb} mb-20 d-block cursor-hide`}>
                      {src(p.image) && (
                        <img data-speed=".8" className="img-cover" src={src(p.image)} alt={p.image?.alt || p.title || ""} loading="lazy" />
                      )}
                    </a>
                  </div>
                  <div className="tp-portfolio-content">
                    <h3 className="tp-portfolio-title fs-25 lh-36 mb-15">
                      <a href={href} className="underline-black">
                        {p.title}
                      </a>
                    </h3>
                    <div className="tp-portfolio-tag">
                      {p.category && <span>{p.category}</span>}
                      {p.year && <span>{p.year}</span>}
                    </div>
                  </div>
                  {btnInGrid && i === BUTTON_SLOT && (
                    <div
                      className="tp-portfolio-btn pt-70 text-center d-none d-lg-block tp_fade_anim"
                      data-delay=".5"
                      data-fade-from="top"
                      data-ease="bounce"
                    >
                      <SwitchButton href={btn.href} newTab={btn.newTab} label={data.button!.label} className={BTN_CLASS} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {showBtn && (
            <div className={btnInGrid ? "col-12 d-lg-none" : "col-12"}>
              <div className="tp-portfolio-btn mb-40 text-center tp_fade_anim" data-delay=".5" data-ease="bounce">
                <SwitchButton href={btn.href} newTab={btn.newTab} label={data.button!.label} className={BTN_CLASS} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

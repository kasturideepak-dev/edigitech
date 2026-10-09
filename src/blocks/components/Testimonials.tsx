import type { ImageValue } from "@/lib/types";
import { Icon } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, src } from "./shared";

type Item = {
  quote?: string;
  name?: string;
  designation?: string;
  service?: string;
  avatar?: ImageValue;
  /** Stars to show on the card. Left unset, the card shows none. */
  rating?: number;
};

type TestimonialsData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  counterValue?: string;
  counterLabel?: string;
  image?: ImageValue;
  videoUrl?: string;
  image2?: ImageValue;
  items?: Item[];
  layout?: "cards" | "split";
  /** Aggregate score shown beside the heading, e.g. "4.5" over "5284+ reviews". */
  ratingScore?: string;
  ratingNote?: string;
};

const Star = ({ on }: { on: boolean }) => (
  <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M7.5 0L9.45 4.42L14.26 4.93L10.66 8.17L11.67 12.9L7.5 10.48L3.33 12.9L4.34 8.17L0.74 4.93L5.55 4.42L7.5 0Z"
      fill={on ? "currentColor" : "rgba(3,3,3,.16)"}
    />
  </svg>
);

/** Two initials, so a card without a photo still has an anchor. */
const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

function Cards({ data, anchor }: BlockProps<TestimonialsData>) {
  const items = (data.items ?? []).filter((t) => t.quote?.trim());
  if (!items.length) return null;

  return (
    <div id={anchor} className="tp-testimonial-area pt-140 pb-120">
      <div className="container container-1230">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="text-center mb-60 tp_fade_anim" data-delay=".3">
              {data.eyebrow && (
                <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-20">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              )}
              {data.title && (
                <h2 className="tp-section-title fs-60 fs-lg-50 fs-xs-35 fw-700 text-uppercase mb-20">
                  {/* **word** in the title paints that word in the brand blue. */}
                  <Text value={data.title} boldClassName="tp-text-theme-primary" />
                </h2>
              )}
              {data.intro && (
                <p className="fs-18 lh-28 tp-text-grey-1 mb-0">
                  <Text value={data.intro} />
                </p>
              )}
              {data.ratingScore && (
                <div className="ed-trating">
                  <span className="ed-trating-score">{data.ratingScore}</span>
                  <span className="ed-trating-stars" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} on={i < Math.round(Number(data.ratingScore) || 0)} />
                    ))}
                  </span>
                  {data.ratingNote && <span className="ed-trating-note">{data.ratingNote}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          {items.map((t, i) => (
            <div className="col-lg-4 col-md-6 mb-30" key={i}>
              <div className="ed-tcard h-100 tp_fade_anim" data-delay={`.${3 + i}`} data-fade-from="bottom">
                <span className="ed-tcard-quote" aria-hidden="true">
                  &rdquo;
                </span>
                <div className="ed-tcard-head">
                  {src(t.avatar) ? (
                    <img className="ed-tcard-avatar" src={src(t.avatar)} alt={alt(t.avatar, t.name ?? "")} loading="lazy" />
                  ) : (
                    <span className="ed-tcard-avatar ed-tcard-initials" aria-hidden="true">
                      {initials(t.name)}
                    </span>
                  )}
                  <div>
                    <h5 className="ed-tcard-name">{t.name}</h5>
                    {t.designation && <span className="ed-tcard-role">{t.designation}</span>}
                  </div>
                </div>
                <p className="ed-tcard-quote-text">&ldquo;{t.quote}&rdquo;</p>
                {Number(t.rating) > 0 && (
                  <span className="ed-tcard-stars" aria-label={`${t.rating} out of 5`}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <Star key={n} on={n < Number(t.rating)} />
                    ))}
                  </span>
                )}
                {t.service && <span className="ed-tcard-tag">{t.service}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials(props: BlockProps<TestimonialsData>) {
  if ((props.data.layout ?? "cards") === "cards") return <Cards {...props} />;
  return <Split {...props} />;
}

function Split({ data, anchor }: BlockProps<TestimonialsData>) {
  const items = data.items ?? [];
  return (
    <div id={anchor} className="tp-testimonial-area pt-140 pb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="tp-service-title-wrap mb-60 tp_fade_anim" data-delay=".4" data-fade-from="left">
              {data.eyebrow && (
                <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-35">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              )}
              <p className="tp-ff-heading fs-25 fw-500 tp-text-grey-1 tp-service-para">
                <Text value={data.intro} />
              </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="mb-45 tp_fade_anim" data-delay=".4" data-fade-from="right">
              <h2 className="tp-section-title fs-70 fs-xs-40 fw-700 text-uppercase">{data.title}</h2>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="tp-testimonial-thumb-wrap">
              <div className="row align-items-end">
                <div className="col-lg-5 col-md-5 col-sm-5">
                  {data.counterValue && (
                    <div className="tp-testimonial-agents mb-90 tp_fade_anim" data-delay=".4">
                      <h3 className="fs-70 fw-500">{data.counterValue}</h3>
                      <span className="tp-ff-heading fw-700 fs-18 tp-text-common-black">{data.counterLabel}</span>
                    </div>
                  )}
                </div>
                <div className="col-lg-7 col-md-7 col-sm-7">
                  {src(data.image) && (
                    <div className="tp-testimonial-thumb p-relative d-inline-block mb-30 ml-10 tp_fade_anim" data-delay=".5">
                      <img src={src(data.image)} alt={alt(data.image)} loading="lazy" />
                      {data.videoUrl && (
                        <div className="tp-video-main tp-testimonial-video">
                          <a className="tp-hero-video-btn popup-video" href={data.videoUrl} aria-label="Play video">
                            <span>
                              <Icon name="playSmall" />
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 mb-30">
            <div className="tp-testimonial-slider-wrap mt-40 p-relative h-100">
              <div className="swiper tp-testimonial-slider-active">
                <div className="swiper-wrapper">
                  {items.map((t, i) => (
                    <div className="swiper-slide" key={i}>
                      <div className="tp-testimonial-slider-item">
                        {t.service && <span className="ed-testimonial-tag">{t.service}</span>}
                        <p className="tp-ff-heading fs-35 fs-sm-25 fw-500 tp-text-common-black lh-120-per mb-30">
                          “{t.quote}”
                        </p>
                        <div>
                          <h5 className="fs-25 mb-0">{t.name}</h5>
                          <span className="fs-18 fw-400 tp-text-grey-1">{t.designation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fraction-wrapper">
                <div id="paginations"></div>
                <div className="shop-slider-progress-bar">
                  <span></span>
                </div>
              </div>
              {src(data.image2) && (
                <div className="tp-testimonial-thumb-2 tp_fade_anim" data-delay=".7">
                  <img src={src(data.image2)} alt={alt(data.image2)} loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { ImageValue } from "@/lib/types";
import { Icon } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, src } from "./shared";

type TestimonialsData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  counterValue?: string;
  counterLabel?: string;
  image?: ImageValue;
  videoUrl?: string;
  image2?: ImageValue;
  items?: { quote?: string; name?: string; designation?: string; service?: string }[];
};

export default function Testimonials({ data, anchor }: BlockProps<TestimonialsData>) {
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

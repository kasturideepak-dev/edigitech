import type { ImageValue, Link } from "@/lib/types";
import { Icon, SwitchButton } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, hasLink, linkProps, src } from "./shared";

type VideoBannerData = {
  text?: string;
  image?: ImageValue;
  videoUrl?: string;
  videoText?: string;
  button?: Link;
};

export default function VideoBanner({ data, ctx, anchor }: BlockProps<VideoBannerData>) {
  const btn = linkProps(data.button, ctx);
  return (
    <div id={anchor} className="tp-video-area tp-video-spacing scale-up-img p-relative z-index-1 fix">
      <div className="tp-video-thumb">
        {src(data.image) && (
          <img data-speed="0.4" className="img-cover scale-up" src={src(data.image)} alt={alt(data.image)} loading="lazy" />
        )}
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xxl-4 col-xl-5 col-lg-6">
            <div className="tp-video-content tp-bg-common-black">
              <h2 className="tp-text-common-white fw-500 fs-25 fs-xs-20 lh-36 mb-50">{data.text}</h2>
              <span className="tp-hero-bottom-border mb-40">
                <Icon name="border344" />
              </span>
              {data.videoUrl && (
                <div className="tp-video-main tp-hero-video d-flex align-items-center">
                  <a className="tp-hero-video-btn popup-video mr-20" href={data.videoUrl} aria-label="Play video">
                    <span>
                      <Icon name="play" />
                    </span>
                  </a>
                  <p className="tp-ff-heading lh-110-per mb-0 fw-700 fs-18 tp-text-common-white">
                    <Text value={data.videoText} />
                  </p>
                </div>
              )}
              {hasLink(data.button) && (
                <div className={data.videoUrl ? "mt-40" : ""}>
                  <SwitchButton
                    href={btn.href}
                    newTab={btn.newTab}
                    label={data.button.label}
                    className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-text-common-black hover-text-black tp-ff-heading fw-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

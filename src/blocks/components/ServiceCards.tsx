import type { ImageValue } from "@/lib/types";
import { Text } from "@/components/site/Text";
import { type BlockProps, alt, resolveUrl, src } from "./shared";

export type ServiceColumn = {
  title?: string;
  url?: string;
  description?: string;
  image?: ImageValue;
  tags?: { label?: string }[];
  tint?: "blue" | "soft" | "navy";
  buttonLabel?: string;
  items?: { label?: string; url?: string }[];
};

type ServicesData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  background?: "none" | "gradient";
  columns?: ServiceColumn[];
};

const Arrow = () => (
  <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M12.8 4.00047C10.5066 3.11428 7.66113 1.60168 5.89705 0L7.12686 3.54162H0.440804C0.353649 3.54164 0.268309 3.56806 0.195839 3.61849C0.123344 3.66894 0.0671054 3.74115 0.033736 3.82504C0.000415994 3.90889 -0.00860368 4.00106 0.00837916 4.09007C0.025379 4.17914 0.0676362 4.26117 0.129277 4.3254C0.211785 4.41135 0.323646 4.45959 0.440351 4.4598H7.12641L5.89705 8C7.66083 6.39798 10.5065 4.88609 12.8 4.00047Z"
      fill="currentColor"
    />
  </svg>
);

// The reference alternates pastel mint and peach. The brief is to build from
// the logo blue, so the cycle is brand-blue tints against a cool neutral
// instead of importing a second colour family.
const TINTS: NonNullable<ServiceColumn["tint"]>[] = ["blue", "soft", "navy", "soft"];

/**
 * Service cards: tag pills and copy on a tinted panel, a photo filling the
 * lower half, and a pill button sitting over the photo's bottom-left corner.
 */
export default function ServiceCards({ data, ctx, anchor }: BlockProps<ServicesData>) {
  const columns = (data.columns ?? []).filter((c) => c.title?.trim());
  if (!columns.length) return null;
  const colClass = columns.length >= 4 ? "col-xl-3 col-lg-6 col-md-6" : "col-lg-4 col-md-6";

  return (
    <div id={anchor} className={`tp-service-area pt-150 pb-120${data.background === "gradient" ? " ed-services-bg" : ""}`}>
      <div className="container container-1230">
        <div className="row align-items-end mb-55">
          <div className="col-lg-7">
            {data.eyebrow && (
              <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-20 tp_fade_anim" data-delay=".3">
                <span className="borders d-inline-block"></span>
                {data.eyebrow}
              </span>
            )}
            {data.title && (
              <h2 className="tp-section-title fs-60 fs-lg-50 fs-xs-35 fw-700 text-uppercase mb-0 tp_fade_anim" data-delay=".4">
                <Text value={data.title} boldClassName="tp-text-theme-primary" />
              </h2>
            )}
          </div>
          {data.intro && (
            <div className="col-lg-5">
              <p className="fs-18 lh-28 tp-text-grey-1 mb-0 tp_fade_anim" data-delay=".5">
                <Text value={data.intro} />
              </p>
            </div>
          )}
        </div>

        <div className="row">
          {columns.map((col, i) => {
            const href = col.url ? resolveUrl(col.url, ctx) : "";
            // Falls back to the first two sub-items, which already name the work.
            const tags = (col.tags?.length ? col.tags : (col.items ?? []).slice(0, 2).map((it) => ({ label: it.label })))
              .map((t) => t.label?.trim())
              .filter(Boolean)
              .slice(0, 2);

            return (
              <div className={`${colClass} mb-30`} key={i}>
                <article
                  className={`ed-scard ed-scard-${col.tint ?? TINTS[i % TINTS.length]} h-100 tp_fade_anim`}
                  data-delay={`.${4 + i}`}
                  data-fade-from="bottom"
                >
                  <div className="ed-scard-top">
                    <div className="ed-scard-meta">
                      <div className="ed-scard-tags">
                        {tags.map((t, j) => (
                          <span className="ed-scard-tag" key={j}>
                            {t}
                          </span>
                        ))}
                      </div>
                      {/* Solid on the first card, ringed on the rest — the reference's
                          way of marking the lead service without extra copy. */}
                      <span className={`ed-scard-dot${i === 0 ? " is-filled" : ""}`} aria-hidden="true"></span>
                    </div>
                    <h3 className="ed-scard-title">{href ? <a href={href}>{col.title}</a> : col.title}</h3>
                    {col.description && (
                      <p className="ed-scard-text">
                        <Text value={col.description} />
                      </p>
                    )}
                  </div>

                  {src(col.image) && (
                    <div className="ed-scard-media">
                      <img src={src(col.image)} alt={alt(col.image, col.title ?? "")} loading="lazy" />
                      {href && (
                        <a className="ed-scard-btn" href={href} aria-label={`${col.buttonLabel || "Read more"} about ${col.title}`}>
                          <span>{col.buttonLabel || "Read More"}</span>
                          <Arrow />
                        </a>
                      )}
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

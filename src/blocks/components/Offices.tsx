import type { ImageValue } from "@/lib/types";
import { Text } from "@/components/site/Text";
import { type BlockProps, src, alt } from "./shared";

type Office = {
  image?: ImageValue | null;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  mapUrl?: string;
  buttonLabel?: string;
};

type OfficesData = {
  items?: Office[];
  /** Short line shown in a textured panel above the cards. */
  note?: string;
  noteBackground?: ImageValue | null;
};

const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

/** Location cards with contact details — the template's contact-us-info section. */
export default function Offices({ data, anchor }: BlockProps<OfficesData>) {
  const items = (data.items ?? []).filter((o) => o.title?.trim());
  if (!items.length) return null;
  const cols = items.length >= 3 ? "col-xl-4 col-lg-4 col-md-6" : "col-lg-6";

  const noteBg =
    src(data.noteBackground) || "/assets/img/contact/contact-us-shape.png";

  return (
    <>
      {data.note?.trim() && (
        <div className="cn-contactform-support-area mb-140">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div
                  className="cn-contactform-support-bg d-flex align-items-center justify-content-center"
                  data-background={noteBg}
                  style={{ backgroundImage: `url(${noteBg})` }}
                >
                  <div className="cn-contactform-support-text text-center">
                    <span>
                      <Text value={data.note} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div id={anchor} className="tp-contact-us-info-area pb-120">
        <div className="container container-1230">
          <div className="row">
            {items.map((o, i) => (
              <div className={`${cols} mb-30`} key={i}>
                {/* Middle card sits lower in the template's staggered layout. */}
                <div
                  className={`tp-contact-us-content text-center${i === 1 ? " mt-60" : ""}`}
                  data-speed={i === 1 ? ".9" : "1.2"}
                >
                  {src(o.image) && (
                    <div className="tp-contact-us-thumb d-flex justify-content-center">
                      <img
                        src={src(o.image)}
                        alt={alt(o.image, o.title ?? "")}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="tp-contact-us-bottom">
                    <div className="tp-contact-us-info-details">
                      <h4 className="tp-contact-us-info-title">{o.title}</h4>
                      {o.address && (
                        <p className="fs-16 lh-26 mb-10">{o.address}</p>
                      )}
                      {o.email && <a href={`mailto:${o.email}`}>{o.email}</a>}
                      {o.phone && <a href={telHref(o.phone)}>{o.phone}</a>}
                    </div>
                    {o.mapUrl && (
                      <div className="tp-contact-us-btn">
                        <a
                          href={o.mapUrl}
                          target="_blank"
                          rel="noopener"
                          className={`tp-btn-xl w-100 d-inline-block lh-0 tp-round-26 fs-15 text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500 ${
                            i === 1
                              ? "tp-bg-theme-primary tp-text-common-black hover-text-black"
                              : "tp-bg-common-black tp-text-common-white hover-text-white"
                          }`}
                        >
                          <span className="d-flex align-items-center justify-content-center">
                            <span className="btn-text">
                              {o.buttonLabel || "View Location"}
                            </span>
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

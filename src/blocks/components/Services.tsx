import { type BlockProps, resolveUrl } from "./shared";

type ServicesData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  columns?: { title?: string; url?: string; items?: { label?: string; url?: string }[] }[];
};

export default function Services({ data, ctx, anchor }: BlockProps<ServicesData>) {
  const columns = data.columns ?? [];
  const colClass = columns.length >= 4 ? "col-xl-3 col-lg-6 col-md-6" : "col-lg-4 col-md-6";

  return (
    <div id={anchor} className="tp-service-area pt-160 mb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="tp-service-title-wrap mb-45">
              {data.eyebrow && (
                <span
                  className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-80 tp_fade_anim"
                  data-delay=".3"
                >
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              )}
              {data.intro && (
                <div className="d-sm-flex align-items-start tp_fade_anim" data-delay=".5">
                  <img className="mr-40 tp-service-shape" src="/assets/img/service/shape.png" alt="" />
                  <p className="tp-ff-heading fs-25 fw-500 tp-text-grey-1 tp-service-para">{data.intro}</p>
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="mb-45 tp_fade_anim" data-delay=".4">
              <h2 className="tp-section-title fs-70 fs-xl-60 fs-lg-50 fw-700 text-uppercase">{data.title}</h2>
            </div>
          </div>
          {columns.map((col, i) => (
            <div className={colClass} key={i}>
              <div
                className={`tp-service-item p-relative mb-30 tp_fade_anim${columns.length >= 4 ? " ed-service-compact" : ""}`}
                data-delay={`.${6 + i}`}
                data-fade-from="left"
              >
                <img className="tp-service-item-bg" src="/assets/img/service/grid-shape.png" alt="" />
                <h3 className="tp-service-item-title">
                  {col.url ? <a href={resolveUrl(col.url, ctx)}>{col.title}</a> : col.title}
                </h3>
                <ul>
                  {(col.items ?? []).map((item, j) => (
                    <li key={j}>
                      {item.url ? <a href={resolveUrl(item.url, ctx)}>{item.label}</a> : <span>{item.label}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

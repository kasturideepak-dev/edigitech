import { Text } from "@/components/site/Text";
import Reveal from "@/components/site/Reveal";
import { type BlockProps, resolveUrl } from "./shared";

type OfferColumnsData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  columns?: { title?: string; items?: { label?: string; url?: string }[] }[];
};

const Tick = () => (
  <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M12.5002 0.18445L5.2048 9.82684C5.04997 10.0207 4.81738 10.0592 4.62334 9.90452C4.5843 9.86601 4.5843 9.86601 4.54509 9.82684L0.0172037 3.86511C-0.0215047 3.8266 0.0172037 3.78809 0.0172037 3.78809C0.0557453 3.74959 0.0944537 3.78809 0.0944537 3.78809L4.82205 7.22938L12.3065 0.0292552C12.345 -0.00975174 12.4223 -0.00975174 12.4608 0.0292552C12.5002 0.0677621 12.5002 0.145776 12.5002 0.18445Z"
      fill="currentColor"
    />
  </svg>
);

/** "What we offer" — grouped capability lists, one card per group. */
export default function OfferColumns({ data, ctx, anchor }: BlockProps<OfferColumnsData>) {
  const columns = (data.columns ?? []).filter((c) => c.title?.trim() || (c.items ?? []).length);
  if (!columns.length) return null;
  const cols = columns.length >= 4 ? "col-xl-3 col-md-6" : "col-lg-4 col-md-6";

  return (
    <div id={anchor} className="ed-offer">
      <div className="container container-1230">
        <div className="row justify-content-center">
          <div className="col-lg-9 text-center">
            {data.eyebrow && (
              <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-20 d-inline-block">
                <span className="borders d-inline-block"></span>
                {data.eyebrow}
              </span>
            )}
            {data.title && (
              <h2 className="tp-section-title fs-60 fs-lg-50 fs-xs-35 fw-700 text-uppercase mb-20">
                <Text value={data.title} boldClassName="tp-text-theme-primary" />
              </h2>
            )}
            {data.intro && (
              <p className="fs-18 lh-28 tp-text-grey-1 mb-55">
                <Text value={data.intro} />
              </p>
            )}
          </div>
        </div>

        <Reveal className="row" selector=".ed-offer-card" stagger={0.1} y={26}>
          {columns.map((col, i) => (
            <div className={`${cols} mb-30`} key={i}>
              <div className="ed-offer-card h-100">
                <span className="ed-offer-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ed-offer-title">{col.title}</h3>
                <ul className="ed-offer-list">
                  {(col.items ?? [])
                    .filter((it) => it.label?.trim())
                    .map((it, j) => (
                      <li key={j}>
                        <span className="ed-offer-tick">
                          <Tick />
                        </span>
                        {it.url ? <a href={resolveUrl(it.url, ctx)}>{it.label}</a> : it.label}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}

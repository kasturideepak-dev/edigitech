import type { BlockProps } from "./shared";

type CountersData = { items?: { value?: number | string; suffix?: string; label?: string }[] };

export default function Counters({ data, anchor }: BlockProps<CountersData>) {
  const items = data.items ?? [];
  return (
    <div id={anchor} className="tp-counter-area pb-140">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="tp-counter-wrap">
              <div className="tp-counter-wrap-box bounce_animation">
                {items.map((c, i) => (
                  <div className="tp-counter-item bounce__anim" key={i}>
                    <h3 className="fw-500 fs-70 fs-md-50 text-uppercase">
                      <span data-purecounter-duration="1" data-purecounter-end={Number(c.value) || 0} className="purecounter">
                        {Number(c.value) || 0}
                      </span>
                      {c.suffix}
                    </h3>
                    <span className="fw-500 fs-18 fs-md-15 lh-22 tp-text-grey-1">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

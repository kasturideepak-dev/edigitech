import CountUp from "@/components/site/CountUp";
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
                    {/* A div, not an h3. These are figures, not section titles —
                        as headings they put "1,000+" and "500+" into the document
                        outline, which is noise for screen readers and crawlers. */}
                    <div className="tp-counter-number fw-500 fs-70 fs-md-50 text-uppercase">
                      {/* purecounter is initialised on DOMContentLoaded, before this
                          content exists, so the figures never animated. */}
                      <CountUp value={Number(c.value) || 0} />
                      {c.suffix}
                    </div>
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

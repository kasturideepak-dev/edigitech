import { Text } from "@/components/site/Text";
import type { BlockProps } from "./shared";

type ProseItem = { title?: string; body?: string };

type ProseData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Optional sub-blocks rendered as columns, e.g. Vision / Mission / Values. */
  items?: ProseItem[];
};

/**
 * Plain written content: a heading, an intro, and optional titled columns.
 * Used for About/Terms/Privacy style pages where the design is just text.
 */
export default function Prose({ data, anchor }: BlockProps<ProseData>) {
  const items = (data.items ?? []).filter((i) => i.title?.trim() || i.body?.trim());
  if (!data.title && !data.intro && !items.length) return null;
  const cols = items.length >= 3 ? "col-lg-4 col-md-6" : items.length === 2 ? "col-lg-6" : "col-lg-12";

  return (
    <div id={anchor} className="tp-about-area pt-120 pb-60">
      <div className="container">
        {(data.eyebrow || data.title || data.intro) && (
          <div className="row justify-content-center">
            <div className="col-lg-9 text-center mb-60">
              {data.eyebrow && (
                <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-20">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              )}
              {data.title && <h2 className="tp-section-title fs-60 fs-lg-50 fs-xs-36 mb-25">{data.title}</h2>}
              {data.intro && (
                <p className="fs-18 tp-text-grey-1 lh-28">
                  <Text value={data.intro} />
                </p>
              )}
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="row">
            {items.map((item, i) => (
              <div className={cols} key={i}>
                <div className="mb-50">
                  {item.title && <h3 className="fs-25 mb-15">{item.title}</h3>}
                  {item.body && (
                    <p className="fs-17 tp-text-grey-1 lh-28">
                      <Text value={item.body} />
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

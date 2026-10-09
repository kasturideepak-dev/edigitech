import { Text } from "@/components/site/Text";
import type { BlockProps } from "./shared";

type FaqItem = { question?: string; answer?: string };

type FaqData = {
  eyebrow?: string;
  title?: string;
  items?: FaqItem[];
  background?: "none" | "dark";
};

/**
 * Bootstrap accordion, matching the Aleric template's FAQ section.
 * bootstrap-bundle.js (loaded by TemplateScripts) drives the collapse behaviour,
 * so the ids below must be unique per section on the page.
 */
export default function Faq({ data, anchor }: BlockProps<FaqData>) {
  const items = (data.items ?? []).filter((i) => i.question?.trim());
  if (!items.length) return null;
  const base = anchor || "faq";

  return (
    <div
      id={anchor}
      className={`tp-faq-area pre-header tp-faq-spacing pb-140${data.background === "dark" ? " ed-faq-dark" : ""}`}
    >
      <div className="container containers">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="tp-faq-wrap">
              <div className="text-center mb-45">
                {data.eyebrow && (
                  <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-20">
                    <span className="borders d-inline-block"></span>
                    {data.eyebrow}
                  </span>
                )}
                {data.title && <h2 className="tp-section-title fs-70 fs-xl-60 fs-lg-50 fs-xs-40">{data.title}</h2>}
              </div>
              <div className="tp-custom-accordion">
                <div className="accordion" id={`${base}-accordion`}>
                  {items.map((item, i) => {
                    const panelId = `${base}-panel-${i}`;
                    const headingId = `${base}-heading-${i}`;
                    const open = i === 0;
                    return (
                      <div key={i} className={`accordion-item mb-25${open ? " tp-faq-active" : ""}`}>
                        <h2 className="accordion-header p-relative" id={headingId}>
                          <button
                            className={`accordion-button tp-faq-btn${open ? "" : " collapsed"}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${panelId}`}
                            aria-expanded={open}
                            aria-controls={panelId}
                          >
                            {item.question}
                            <span className="accordion-btn">
                              <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M2.7 4.93333L0.2 1.6C-0.294427 0.940764 0.175955 0 1 0H6C6.82405 0 7.29443 0.940764 6.8 1.6L4.3 4.93333C3.9 5.46667 3.1 5.46667 2.7 4.93333Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </button>
                        </h2>
                        <div
                          id={panelId}
                          className={`accordion-collapse collapse${open ? " show" : ""}`}
                          aria-labelledby={headingId}
                          data-bs-parent={`#${base}-accordion`}
                        >
                          <div className="accordion-body tp-faq-details-para">
                            <p>
                              <Text value={item.answer ?? ""} />
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

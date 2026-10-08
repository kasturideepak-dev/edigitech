import { Text } from "@/components/site/Text";
import type { BlockProps } from "./shared";

type PageHeaderData = {
  title?: string;
  intro?: string;
  /** Decorative squiggle beside the heading. */
  shape?: boolean;
};

/**
 * Inner-page header: large heading on the left, supporting text on the right.
 * The template uses this on contact, service and portfolio pages.
 */
export default function PageHeader({ data, anchor }: BlockProps<PageHeaderData>) {
  if (!data.title) return null;
  return (
    <div id={anchor} className="tp-portfolio-colum-spacing pre-header tp-portfolio-area">
      <div className="container containers">
        <div className="row">
          <div className="col-lg-7">
            <div className="tp-service-hero-left p-relative mb-40">
              <h1 className="fs-70 fs-lg-60 fs-xs-40">{data.title}</h1>
              {data.shape !== false && (
                /* Decorative squiggle beside the heading. `tpswing` is the template's
                   swinging animation, driven by its own CSS. */
                <span className="tp-service-hero-shape tpswing d-none d-sm-inline-block" aria-hidden="true">
                  <svg width="52" height="94" viewBox="0 0 52 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 16.1098C5.58433 24.0984 22.6118 44.5692 38.3295 38.0785C46.3521 34.5835 58.2264 23.6551 45.206 5.12554C40.2943 -1.86444 30.6673 -0.666183 25.559 14.1127C22.6118 22.6393 15.2441 43.0714 22.612 61.0456C26.5006 70.5321 39.1318 88.3148 50.9999 92.9999"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
          {data.intro && (
            <div className="col-lg-5">
              <div className="tp-service-hero-right mt-130">
                <p className="fs-20 lh-140-per">
                  <Text value={data.intro} />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

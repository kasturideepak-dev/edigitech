import { Text } from "@/components/site/Text";
import type { BlockProps } from "./shared";

type PageHeaderData = {
  title?: string;
  intro?: string;
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

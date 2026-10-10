import { Text } from "@/components/site/Text";
import Reveal from "@/components/site/Reveal";
import { type BlockProps } from "./shared";

type ProcessStepsData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  theme?: "dark" | "light";
  steps?: { title?: string; text?: string }[];
};

/**
 * Numbered steps as cards, the reference's 01/02/03 treatment: pale cards on a
 * dark panel, each with its index set large and faint behind the heading.
 */
export default function ProcessSteps({ data, anchor }: BlockProps<ProcessStepsData>) {
  const steps = (data.steps ?? []).filter((s) => s.title?.trim());
  if (!steps.length) return null;
  const dark = (data.theme ?? "dark") === "dark";
  const cols = steps.length >= 4 ? "col-xl-3 col-lg-6 col-md-6" : "col-lg-4 col-md-6";

  return (
    <div id={anchor} className={`ed-steps ${dark ? "ed-steps-dark" : "ed-steps-light"}`}>
      <div className="container container-1230">
        <div className="row justify-content-center">
          <div className="col-lg-9 text-center">
            {data.eyebrow && (
              <span className={`tp-section-subtitle tp-ff-heading fw-500 fs-16 mb-20 d-inline-block ${dark ? "tp-section-subtitle-white tp-text-common-white" : "tp-text-common-black"}`}>
                <span className="borders d-inline-block"></span>
                {data.eyebrow}
              </span>
            )}
            {data.title && (
              <h2 className={`tp-section-title fs-60 fs-lg-50 fs-xs-35 fw-700 text-uppercase mb-20 ${dark ? "tp-text-common-white" : ""}`}>
                <Text value={data.title} boldClassName={dark ? "ed-shero-accent" : "tp-text-theme-primary"} />
              </h2>
            )}
            {data.intro && (
              <p className={`fs-18 lh-28 mb-55 ${dark ? "ed-steps-intro" : "tp-text-grey-1"}`}>
                <Text value={data.intro} />
              </p>
            )}
          </div>
        </div>

        <Reveal className="row" selector=".ed-step" stagger={0.1} y={26}>
          {steps.map((s, i) => (
            <div className={`${cols} mb-30`} key={i}>
              <div className="ed-step h-100">
                <span className="ed-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ed-step-title">{s.title}</h3>
                {s.text && (
                  <p className="ed-step-text">
                    <Text value={s.text} />
                  </p>
                )}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}

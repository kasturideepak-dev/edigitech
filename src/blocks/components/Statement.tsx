import { Text } from "@/components/site/Text";
import Reveal from "@/components/site/Reveal";
import { type BlockProps } from "./shared";

type StatementData = {
  label?: string;
  text?: string;
  footnote?: string;
};

/**
 * A small side label against one oversized paragraph, phrases inside it
 * picked out in the brand blue — the reference's "fund structure" treatment.
 *
 * The highlight is driven by **asterisks** in the copy, so the client chooses
 * what to emphasise from the editor rather than needing markup.
 */
export default function Statement({ data, anchor }: BlockProps<StatementData>) {
  if (!data.text?.trim()) return null;

  return (
    <div id={anchor} className="ed-statement">
      <div className="container container-1230">
        <div className="row">
          <div className="col-lg-3">
            {data.label && <span className="ed-statement-label">{data.label}</span>}
          </div>
          <div className="col-lg-9">
            <Reveal selector=".ed-statement-part" stagger={0.12} y={22}>
              <p className="ed-statement-text ed-statement-part">
                <Text value={data.text} boldClassName="ed-statement-accent" />
              </p>
              {data.footnote && (
                <p className="ed-statement-foot ed-statement-part">
                  <Text value={data.footnote} />
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { ImageValue } from "@/lib/types";
import { Text } from "@/components/site/Text";
import Reveal from "@/components/site/Reveal";
import { type BlockProps, alt, src } from "./shared";

type Usp = {
  glyph?: string;
  icon?: ImageValue | null;
  title?: string;
  text?: string;
};

type UspCardsData = {
  eyebrow?: string;
  title?: string;
  items?: Usp[];
};

/**
 * Line glyphs rather than the reference's 3D renders — we have no 3D asset
 * set, and a flat mark in the brand blue sits better beside the rest of the
 * page than a stock pseudo-3D icon would. An uploaded image overrides it.
 */
const GLYPHS: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  tag: (
    <>
      <path d="M3 11.5V4.5a1.5 1.5 0 011.5-1.5h7L21 12.5 12.5 21 3 11.5z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </>
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0116 0v2" />
      <rect x="2.5" y="13.5" width="4" height="6" rx="1.6" />
      <rect x="17.5" y="13.5" width="4" height="6" rx="1.6" />
    </>
  ),
  shield: <path d="M12 2.8l7.5 3v6c0 4.6-3.1 8.6-7.5 9.9-4.4-1.3-7.5-5.3-7.5-9.9v-6l7.5-3z" />,
  rocket: (
    <>
      <path d="M12 2.8c3.4 2.4 5.2 6 5.2 9.8L12 18.2 6.8 12.6c0-3.8 1.8-7.4 5.2-9.8z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  code: (
    <>
      <path d="M8.5 8.5L4 12l4.5 3.5" />
      <path d="M15.5 8.5L20 12l-4.5 3.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </>
  ),
};

export default function UspCards({ data, anchor }: BlockProps<UspCardsData>) {
  const items = (data.items ?? []).filter((i) => i.title?.trim());
  if (!items.length) return null;
  const cols = items.length >= 4 ? "col-xl-3 col-lg-6 col-md-6" : "col-lg-4 col-md-6";

  return (
    <div id={anchor} className="ed-usp">
      <div className="ed-usp-band">
        <div className="container container-1230">
          {(data.eyebrow || data.title) && (
            <div className="ed-usp-head">
              {data.eyebrow && <span className="ed-usp-eyebrow">{data.eyebrow}</span>}
              {data.title && (
                <h2 className="ed-usp-title">
                  <Text value={data.title} boldClassName="ed-shero-accent" />
                </h2>
              )}
            </div>
          )}

          <Reveal className="row" selector=".ed-usp-card" stagger={0.09} y={24}>
            {items.map((u, i) => (
              <div className={`${cols} mb-30`} key={i}>
                <div className="ed-usp-card h-100">
                  <span className="ed-usp-icon">
                    {src(u.icon) ? (
                      <img src={src(u.icon)} alt={alt(u.icon, "")} loading="lazy" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {GLYPHS[u.glyph ?? "shield"] ?? GLYPHS.shield}
                      </svg>
                    )}
                  </span>
                  <h3 className="ed-usp-card-title">{u.title}</h3>
                  {u.text && (
                    <p className="ed-usp-card-text">
                      <Text value={u.text} />
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </div>
  );
}

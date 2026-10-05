import type { ImageValue } from "@/lib/types";
import { Text } from "@/components/site/Text";
import type { BlockProps } from "./shared";
import { src, alt } from "./shared";

type Member = {
  photo?: ImageValue | null;
  name?: string;
  role?: string;
  bio?: string;
};

type TeamData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  members?: Member[];
};

/** People cards — name, role and a short bio. Reuses the template's team styles. */
export default function Team({ data, anchor }: BlockProps<TeamData>) {
  const members = (data.members ?? []).filter((m) => m.name?.trim());
  if (!members.length) return null;
  const cols = members.length === 4 ? "col-lg-3 col-md-6" : members.length === 3 ? "col-lg-4 col-md-6" : "col-lg-6";

  return (
    <div id={anchor} className="tp-team-area pt-120 pb-60">
      <div className="container">
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
        <div className="row">
          {members.map((m, i) => (
            <div className={cols} key={i}>
              <div className="tp-team-it-item mb-60">
                {src(m.photo) && (
                  <div className="tp-team-it-thumb mb-25">
                    <img className="w-100" src={src(m.photo)} alt={alt(m.photo, m.name ?? "")} loading="lazy" />
                  </div>
                )}
                <div className="tp-team-it-content">
                  <h3 className="fs-24 mb-5">{m.name}</h3>
                  {m.role && <span className="tp-section-subtitle tp-ff-heading fw-500 fs-15 d-block mb-15">{m.role}</span>}
                  {m.bio && (
                    <p className="fs-16 tp-text-grey-1 lh-26">
                      <Text value={m.bio} />
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

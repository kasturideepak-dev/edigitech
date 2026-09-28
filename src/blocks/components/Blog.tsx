import type { ImageValue } from "@/lib/types";
import { Icon } from "@/components/site/Icon";
import { Text } from "@/components/site/Text";
import { entryPath, getTypeByKey, latestEntries, listTerms } from "@/lib/content-types";
import { formatPostDate } from "@/components/site/BlogParts";
import { type BlockProps, resolveUrl, src } from "./shared";

type BlogPostItem = { image?: ImageValue | null; title?: string; url?: string; category?: string; date?: string };

type BlogData = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** "latest" pulls from a content type automatically; "manual" uses the list below. */
  source?: "latest" | "manual";
  /** Content type key to pull from when source is "latest". Defaults to blog posts. */
  contentType?: string;
  count?: number;
  posts?: BlogPostItem[];
};

const FADE_FROM = ["left", "bottom", "right"];

/** Newest entries of a content type as cards; links honour the type's editable URL prefix. */
async function latestFromType(data: BlogData): Promise<BlogPostItem[]> {
  const type = await getTypeByKey(data.contentType || "post");
  if (!type) return [];
  const entries = await latestEntries(type, Number(data.count) || 3);
  const tax = (type.taxonomies ?? [])[0];
  const names = tax ? new Map((await listTerms(type.id, tax.key)).map((t) => [t.slug, t.name])) : new Map<string, string>();
  return entries.map((e) => {
    const termSlug = tax ? e.terms?.[tax.key]?.[0] : undefined;
    return {
      image: e.coverImage ?? ((e.data?.image as ImageValue | undefined) || null),
      title: e.title,
      url: entryPath(type, e.slug),
      category: termSlug ? (names.get(termSlug) ?? termSlug) : "",
      date: type.supports?.publishDate ? formatPostDate(e.publishedAt) : "",
    };
  });
}

export default async function Blog({ data, ctx, anchor }: BlockProps<BlogData>) {
  const posts: BlogPostItem[] = data.source === "manual" ? (data.posts ?? []) : await latestFromType(data);
  // Nothing to show yet: hide the section rather than render empty cards.
  if (posts.length === 0) return null;
  return (
    <div id={anchor} className="tp-blog-area pt-140 pb-95">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            {data.eyebrow && (
              <div className="tp-blog-subtitle mb-30 tp_fade_anim" data-delay=".3">
                <span className="tp-section-subtitle tp-ff-heading fw-500 tp-text-common-black fs-16 mb-35">
                  <span className="borders d-inline-block"></span>
                  {data.eyebrow}
                </span>
              </div>
            )}
          </div>
          <div className="col-lg-8">
            <div className="tp-blog-title-wrap ml-20 mb-45">
              <h2 className="tp-section-title fs-70 fs-lg-50 fs-xs-40 fw-700 text-uppercase mb-50 tp_fade_anim" data-delay=".5">
                {data.title}
              </h2>
              {data.intro && (
                <div className="d-flex align-items-start tp_fade_anim" data-delay=".7">
                  <span className="mr-40 tp-service-shape d-inline-block">
                    <Icon name="blogShape" />
                  </span>
                  <p className="fs-18 tp-text-grey-1 lh-28">
                    <Text value={data.intro} />
                  </p>
                </div>
              )}
            </div>
          </div>
          {posts.map((p, i) => {
            const href = resolveUrl(p.url, ctx);
            return (
              <div className="col-lg-4 col-md-6" key={i}>
                <div
                  className="tp-blog-item tp--hover-item mb-40 tp_fade_anim"
                  data-delay=".5"
                  data-fade-from={FADE_FROM[i % 3]}
                  data-ease="bounce"
                >
                  <a href={href} className="tp-blog-thumb d-block mb-30 p-relative fix d-inline-block">
                    <div
                      className="tp--hover-img"
                      data-displacement="/assets/img/imghover/strip.png"
                      data-intensity="0.2"
                      data-speedin="1"
                      data-speedout="1"
                    >
                      {src(p.image) && <img className="w-100" src={src(p.image)} alt={p.image?.alt || p.title || ""} loading="lazy" />}
                    </div>
                  </a>
                  <div className="tp-blog-content text-center">
                    <div className="tp-blog-meta mb-15">
                      {p.category && <span>{p.category}</span>}
                      {p.category && p.date && <span className="borders"></span>}
                      {p.date && <span>{p.date}</span>}
                    </div>
                    <h3 className="fs-25">
                      <a className="underline-black" href={href}>
                        {p.title}
                      </a>
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

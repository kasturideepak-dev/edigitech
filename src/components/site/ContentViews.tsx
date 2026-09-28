// Generic public views for any content type: archive, taxonomy term archive and
// single entry. Every link is built from the type's editable URL prefix.
import type { ContentType, EntryCard, EntryDetail } from "@/lib/content-types";
import { archivePath, entryPath } from "@/lib/content-types";
import type { TaxonomyDef } from "@/lib/types";
import { BlogHero, CategoryNav, Pagination, PostCardItem, formatPostDate, type CardLike } from "./BlogParts";
import { SwitchButton } from "./Icon";
import { socialIconClass } from "@/blocks/common-fields";

type TermCount = { name: string; slug: string; total: number };

/** The first taxonomy on a type drives the category pills and card label. */
export const primaryTaxonomy = (type: ContentType): TaxonomyDef | undefined => (type.taxonomies ?? [])[0];

/** Maps an entry to the card shape, labelling it with its first term. */
export function toCardLike(entry: EntryCard, type: ContentType, termNames: Map<string, string>): CardLike {
  const tax = primaryTaxonomy(type);
  const termSlug = tax ? entry.terms?.[tax.key]?.[0] : undefined;
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    coverImage: entry.coverImage ?? ((entry.data?.image as CardLike["coverImage"]) || null),
    publishedAt: type.supports?.publishDate ? entry.publishedAt : null,
    category: termSlug ? { slug: termSlug, name: termNames.get(termSlug) ?? termSlug } : null,
  };
}

function CardGrid({ type, entries, termNames }: { type: ContentType; entries: EntryCard[]; termNames: Map<string, string> }) {
  return (
    <div className="row">
      {entries.map((e, i) => (
        <div className="col-lg-4 col-md-6" key={e.id}>
          <PostCardItem post={toCardLike(e, type, termNames)} index={i} basePath={archivePath(type)} />
        </div>
      ))}
    </div>
  );
}

export function ArchiveView({
  type,
  entries,
  page,
  pages,
  terms,
  activeTerm,
}: {
  type: ContentType;
  entries: EntryCard[];
  page: number;
  pages: number;
  terms: TermCount[];
  activeTerm?: { name: string; slug: string };
}) {
  const tax = primaryTaxonomy(type);
  const base = archivePath(type);
  const termNames = new Map(terms.map((t) => [t.slug, t.name]));
  const crumbs = activeTerm
    ? [{ label: "Home", url: "/" }, { label: type.namePlural, url: base }, { label: activeTerm.name }]
    : [{ label: "Home", url: "/" }, { label: type.namePlural }];

  return (
    <>
      <BlogHero
        title={activeTerm ? activeTerm.name : type.archiveTitle || type.namePlural}
        intro={activeTerm ? undefined : type.archiveIntro || undefined}
        breadcrumb={crumbs}
      />
      <div className="tp-blog-area pt-140 pb-90">
        <div className="container">
          {tax && <CategoryNav categories={terms} active={activeTerm?.slug} basePath={base} taxonomySlug={tax.slug} />}
          {entries.length === 0 ? (
            <p className="fs-20 tp-text-grey-1 pb-100">Nothing published here yet. Please check back soon.</p>
          ) : (
            <CardGrid type={type} entries={entries} termNames={termNames} />
          )}
          <Pagination
            page={page}
            pages={pages}
            basePath={activeTerm && tax ? `${base}/${tax.slug}/${activeTerm.slug}` : base}
          />
        </div>
      </div>
    </>
  );
}

export function EntryView({
  type,
  entry,
  related,
  url,
  terms,
}: {
  type: ContentType;
  entry: EntryDetail;
  related: EntryCard[];
  url: string;
  terms: TermCount[];
}) {
  const s = type.supports ?? { body: false, excerpt: false, coverImage: false, author: false, publishDate: false, seo: true };
  const base = archivePath(type);
  const termNames = new Map(terms.map((t) => [t.slug, t.name]));
  const card = toCardLike(entry, type, termNames);
  const share = [
    { platform: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { platform: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { platform: "whatsapp", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${entry.title} ${url}`)}` },
  ];
  const crumbs = [
    { label: "Home", url: "/" },
    ...(type.hasArchive ? [{ label: type.namePlural, url: base }] : [{ label: type.namePlural }]),
    { label: card.category?.name ?? entry.title },
  ];
  const summary = entry.excerpt || (entry.data?.shortDescription as string) || "";

  return (
    <>
      <BlogHero title={entry.title} intro={s.body ? undefined : summary || undefined} breadcrumb={crumbs} />
      <div className="tp-blog-details-area pt-90 pb-90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="tp-postbox-wrapper mb-50">
                {(s.publishDate || s.author || card.category) && (
                  <div className="tp-blog-details-link-wrap mb-25">
                    <div className="tp-blog-details-dates mr-20 mb-10">
                      {card.category && <span>{card.category.name}</span>}
                      {s.publishDate && entry.publishedAt && (
                        <>
                          {card.category && <span className="borders"></span>}
                          <span>{formatPostDate(entry.publishedAt)}</span>
                        </>
                      )}
                      {s.body && entry.readMinutes > 0 && (
                        <>
                          <span className="borders"></span>
                          <span>{entry.readMinutes} min read</span>
                        </>
                      )}
                      {s.author && entry.authorName && (
                        <>
                          <span className="borders"></span>
                          <span>By {entry.authorName}</span>
                        </>
                      )}
                    </div>
                    <div className="tp-blog-details-link mb-10">
                      {share.map((x) => (
                        <a key={x.platform} href={x.href} target="_blank" rel="noopener" aria-label={`Share on ${x.platform}`}>
                          <i className={socialIconClass(x.platform)}></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {card.coverImage?.url && (
                  <div className="ed-post-cover mb-50">
                    <img className="w-100" src={card.coverImage.url} alt={card.coverImage.alt || entry.title} />
                  </div>
                )}
                {s.body && entry.body ? (
                  <div className="tp-blog-details-content ed-post-body" dangerouslySetInnerHTML={{ __html: entry.body }} />
                ) : (
                  summary && <p className="fs-20 lh-160-per">{summary}</p>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="ed-related pt-70">
              <h2 className="tp-section-title fs-50 fs-lg-40 fw-700 text-uppercase mb-50">More {type.namePlural}</h2>
              <CardGrid type={type} entries={related} termNames={termNames} />
            </div>
          )}

          {type.hasArchive && (
            <div className="text-center pb-40">
              <SwitchButton
                href={base}
                label={`All ${type.namePlural}`}
                className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export { entryPath };

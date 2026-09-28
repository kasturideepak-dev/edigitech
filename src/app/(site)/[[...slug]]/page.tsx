import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { RenderSections } from "@/blocks/render";
import { findRedirect, getPublishedPage, normalizeSlug, pagePath } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, buildJsonLd, buildMetadata } from "@/lib/seo";
import { resolveContentRoute, type ContentRoute } from "@/lib/route";
import { archivePath, entryPath, getEntry, getTerm, listEntries, listTermsWithCounts } from "@/lib/content-types";
import { ArchiveView, EntryView, primaryTaxonomy } from "@/components/site/ContentViews";
import { emptySeo, type PageContent } from "@/lib/types";

// Rendered on first request, then cached until the content is republished.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/[[...slug]]">;

const slugFrom = async (params: Props["params"]) => {
  const { slug } = await params;
  return (slug ?? []).map((s) => decodeURIComponent(s)).join("/");
};

const pageNumber = async (searchParams: Props["searchParams"]) => {
  const sp = await searchParams;
  return Math.max(1, Number(typeof sp.page === "string" ? sp.page : 1) || 1);
};

/** Wraps SEO fields so content-type routes reuse the page metadata builder. */
const asContent = (seo: PageContent["seo"] | null | undefined, description = ""): PageContent => ({
  sections: [],
  seo: { ...emptySeo(), ...(seo ?? {}), metaDescription: seo?.metaDescription || description },
});

/** Resolution order: CMS page → content type route. Pages win a collision. */
async function resolve(slug: string) {
  const page = await getPublishedPage(slug);
  if (page) return { page, route: null as ContentRoute | null };
  return { page: null, route: slug ? await resolveContentRoute(slug) : null };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = normalizeSlug(await slugFrom(params));
  const [{ page, route }, settings] = await Promise.all([resolve(slug), getSettings()]);

  if (page) {
    return buildMetadata({ title: page.title, path: pagePath(page.slug), content: page.content, settings, isHome: page.isHome });
  }

  if (route?.kind === "entry") {
    const found = await getEntry(route.type, route.slug);
    if (!found) return { title: "Page not found", robots: { index: false } };
    const { entry } = found;
    return buildMetadata({
      title: entry.title,
      path: entryPath(route.type, entry.slug),
      content: asContent(entry.seo, entry.excerpt || String(entry.data?.shortDescription ?? "")),
      settings,
    });
  }

  if (route?.kind === "archive") {
    const n = await pageNumber(searchParams);
    return buildMetadata({
      title: route.type.archiveTitle || route.type.namePlural,
      path: archivePath(route.type),
      content: asContent(null, route.type.archiveIntro),
      settings,
      // Deeper listing pages are thin duplicates of page 1.
      forceNoindex: n > 1,
    });
  }

  if (route?.kind === "term") {
    const term = await getTerm(route.type, route.taxonomy.key, route.termSlug);
    if (!term) return { title: "Page not found", robots: { index: false } };
    return buildMetadata({
      title: `${term.name} | ${route.type.namePlural}`,
      path: `${archivePath(route.type)}/${route.taxonomy.slug}/${term.slug}`,
      content: asContent(term.seo, term.description),
      settings,
    });
  }

  return { title: "Page not found", robots: { index: false } };
}

export default async function CmsPage({ params, searchParams }: Props) {
  const raw = await slugFrom(params);
  const slug = normalizeSlug(raw);
  const { page, route } = await resolve(slug);

  // ---- CMS page
  if (page) {
    // The homepage is only served at "/".
    if (page.isHome && slug) permanentRedirect("/");
    const settings = await getSettings();
    const jsonLd = buildJsonLd({ title: page.title, path: pagePath(page.slug), content: page.content, settings, isHome: page.isHome });
    return (
      <>
        {jsonLd.map((json, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
        ))}
        <RenderSections sections={page.content.sections} ctx={{ settings }} />
      </>
    );
  }

  // ---- Content type: archive
  if (route?.kind === "archive") {
    const n = await pageNumber(searchParams);
    const tax = primaryTaxonomy(route.type);
    const [{ entries, pages }, terms] = await Promise.all([
      listEntries({ type: route.type, page: n }),
      tax ? listTermsWithCounts(route.type, tax.key) : Promise.resolve([]),
    ]);
    return <ArchiveView type={route.type} entries={entries} page={n} pages={pages} terms={terms} />;
  }

  // ---- Content type: taxonomy term archive
  if (route?.kind === "term") {
    const term = await getTerm(route.type, route.taxonomy.key, route.termSlug);
    if (term) {
      const n = await pageNumber(searchParams);
      const [{ entries, pages }, terms] = await Promise.all([
        listEntries({ type: route.type, page: n, taxonomy: route.taxonomy.key, term: term.slug }),
        listTermsWithCounts(route.type, route.taxonomy.key),
      ]);
      return (
        <ArchiveView
          type={route.type}
          entries={entries}
          page={n}
          pages={pages}
          terms={terms}
          activeTerm={{ name: term.name, slug: term.slug }}
        />
      );
    }
  }

  // ---- Content type: single entry
  if (route?.kind === "entry") {
    const found = await getEntry(route.type, route.slug);
    if (found) {
      const tax = primaryTaxonomy(route.type);
      const terms = tax ? await listTermsWithCounts(route.type, tax.key) : [];
      const url = absoluteUrl(entryPath(route.type, found.entry.slug));
      return <EntryView type={route.type} entry={found.entry} related={found.related} url={url} terms={terms} />;
    }
  }

  // ---- Nothing matched: honour redirects (e.g. an old /blog/* after the prefix was renamed)
  const hit = await findRedirect(`/${raw}`.toLowerCase());
  if (hit) {
    if (hit.statusCode === 301 || hit.statusCode === 308) permanentRedirect(hit.toPath);
    redirect(hit.toPath);
  }
  notFound();
}

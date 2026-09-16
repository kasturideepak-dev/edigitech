import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { RenderSections } from "@/blocks/render";
import { findRedirect, getPublishedPage, normalizeSlug, pagePath } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { buildJsonLd, buildMetadata } from "@/lib/seo";

// Pages are rendered on first request, then cached until they are republished.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/[[...slug]]">;

const slugFrom = async (params: Props["params"]) => {
  const { slug } = await params;
  return (slug ?? []).map((s) => decodeURIComponent(s)).join("/");
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await slugFrom(params);
  const [page, settings] = await Promise.all([getPublishedPage(normalizeSlug(slug)), getSettings()]);
  if (!page) return { title: "Page not found", robots: { index: false } };
  return buildMetadata({
    title: page.title,
    path: pagePath(page.slug),
    content: page.content,
    settings,
    isHome: page.isHome,
  });
}

export default async function CmsPage({ params }: Props) {
  const raw = await slugFrom(params);
  const slug = normalizeSlug(raw);
  const page = await getPublishedPage(slug);

  if (!page) {
    const hit = await findRedirect(`/${raw}`.toLowerCase());
    if (hit) {
      if (hit.statusCode === 301 || hit.statusCode === 308) permanentRedirect(hit.toPath);
      redirect(hit.toPath);
    }
    notFound();
  }

  // The homepage is only served at "/".
  if (page.isHome && slug) permanentRedirect("/");

  const settings = await getSettings();
  const jsonLd = buildJsonLd({
    title: page.title,
    path: pagePath(page.slug),
    content: page.content,
    settings,
    isHome: page.isHome,
  });

  return (
    <>
      {jsonLd.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <RenderSections sections={page.content.sections} ctx={{ settings }} />
    </>
  );
}

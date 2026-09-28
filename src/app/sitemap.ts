import type { MetadataRoute } from "next";
import { listPublishedForSitemap, pagePath } from "@/lib/pages";
import { getContentTypes, listEntriesForSitemap } from "@/lib/content-types";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rows, entries, types] = await Promise.all([listPublishedForSitemap(), listEntriesForSitemap(), getContentTypes()]);

  const pageEntries: MetadataRoute.Sitemap = rows
    .filter((r) => !r.published?.seo?.noindex && !r.published?.seo?.canonical)
    .map((r) => ({
      url: absoluteUrl(pagePath(r.isHome ? "" : r.slug)),
      lastModified: r.updatedAt,
      changeFrequency: r.isHome ? ("weekly" as const) : ("monthly" as const),
      priority: r.isHome ? 1 : 0.8,
    }));

  // Listing pages only for types that have one and actually contain something.
  const withEntries = new Set(entries.map((e) => e.typeSlug));
  const archives: MetadataRoute.Sitemap = types
    .filter((t) => t.hasArchive && withEntries.has(t.slug))
    .map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }));

  const entryUrls: MetadataRoute.Sitemap = entries.map((e) => ({
    url: absoluteUrl(`/${e.typeSlug}/${e.slug}`),
    lastModified: e.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pageEntries, ...archives, ...entryUrls];
}

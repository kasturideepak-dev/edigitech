import type { MetadataRoute } from "next";
import { listPublishedForSitemap, pagePath } from "@/lib/pages";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await listPublishedForSitemap();
  return rows
    .filter((r) => !r.published?.seo?.noindex && !r.published?.seo?.canonical)
    .map((r) => ({
      url: absoluteUrl(pagePath(r.isHome ? "" : r.slug)),
      lastModified: r.updatedAt,
      changeFrequency: r.isHome ? "weekly" : "monthly",
      priority: r.isHome ? 1 : 0.8,
    }));
}

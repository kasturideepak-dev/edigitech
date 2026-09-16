import type { MetadataRoute } from "next";
import { listPublishedForSitemap, pagePath } from "@/lib/pages";
import { listPublishedPostsForSitemap } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rows, posts] = await Promise.all([listPublishedForSitemap(), listPublishedPostsForSitemap()]);
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const blogIndex: MetadataRoute.Sitemap = posts.length
    ? [{ url: absoluteUrl("/blog"), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
    : [];
  return [
    ...blogIndex,
    ...postEntries,
    ...rows
    .filter((r) => !r.published?.seo?.noindex && !r.published?.seo?.canonical)
    .map((r) => ({
      url: absoluteUrl(pagePath(r.isHome ? "" : r.slug)),
      lastModified: r.updatedAt,
      changeFrequency: r.isHome ? ("weekly" as const) : ("monthly" as const),
      priority: r.isHome ? 1 : 0.8,
    })),
  ];
}

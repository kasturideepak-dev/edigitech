import type { MetadataRoute } from "next";
import { loadSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await loadSettings();
  if (!settings.seo.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/preview"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

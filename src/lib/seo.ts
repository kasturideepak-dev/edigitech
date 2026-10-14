import type { Metadata } from "next";
import type { PageContent, Section } from "./types";
import type { SiteSettings } from "./settings-schema";
import { plain } from "@/components/site/Text";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Set NEXT_PUBLIC_NOINDEX=true on any environment that is not the live site.
 *
 * The staging build was serving `index, follow` with a canonical pointing at
 * the staging host, so a crawl before go-live could have put the staging URL
 * in the index competing with the real one. This is an env flag rather than
 * the `allowIndexing` setting because it belongs to the environment, not the
 * content — nobody has to remember to flip it back, they just don't set it in
 * production. proxy.ts sends a matching X-Robots-Tag so non-HTML is covered.
 */
export const isNoindexEnv = () => process.env.NEXT_PUBLIC_NOINDEX === "true";

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`);

/** First meaningful text on the page, used when no meta description is set. */
function fallbackDescription(sections: Section[]) {
  for (const s of sections) {
    if (!s.visible) continue;
    const d = s.data as Record<string, unknown>;
    for (const key of ["subtitle", "statement", "text", "intro"]) {
      const v = d[key];
      if (typeof v === "string" && v.trim().length > 40) return plain(v).slice(0, 160);
    }
  }
  return "";
}

export function buildMetadata(opts: {
  title: string;
  path: string;
  content: PageContent;
  settings: SiteSettings;
  isHome?: boolean;
  forceNoindex?: boolean;
}): Metadata {
  const { content, settings, path } = opts;
  const seo = content.seo;
  const s = settings.seo;
  const rawTitle = seo.metaTitle || opts.title || s.defaultTitle;
  // Don't append the site name twice.
  const hasBrand = rawTitle.toLowerCase().includes(settings.general.siteName.toLowerCase());
  const title = hasBrand || !s.titleTemplate.includes("%s") ? rawTitle : s.titleTemplate.replace("%s", rawTitle);
  const description = seo.metaDescription || fallbackDescription(content.sections) || s.defaultDescription;
  const canonical = seo.canonical ? absoluteUrl(seo.canonical) : absoluteUrl(path);
  const ogImage = seo.ogImage?.url || s.defaultOgImage?.url;
  const noindexEnv = isNoindexEnv();
  const index = s.allowIndexing && !seo.noindex && !opts.forceNoindex && !noindexEnv;

  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    // No `keywords`: the meta keywords tag has been ignored by every major
    // engine for years, and publishing the target term invites scraping by
    // competitors. focusKeyword stays, it just drives the editor, not a tag.
    alternates: { canonical },
    robots: { index, follow: s.allowIndexing && !seo.nofollow && !opts.forceNoindex && !noindexEnv },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: settings.general.siteName,
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: ogImage ? [{ url: absoluteUrl(ogImage) }] : undefined,
      locale: "en_IN",
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: ogImage ? [absoluteUrl(ogImage)] : undefined,
    },
    icons: settings.general.favicon?.url ? { icon: settings.general.favicon.url } : undefined,
    verification: {
      google: s.googleVerification || undefined,
      other: s.bingVerification ? { "msvalidate.01": s.bingVerification } : undefined,
    },
  };
}

export function buildJsonLd(opts: { title: string; path: string; content: PageContent; settings: SiteSettings; isHome?: boolean }) {
  const { settings, content, path } = opts;
  const g = settings.general;
  const url = absoluteUrl(path);
  const orgId = `${siteUrl()}/#organization`;
  const graph: Record<string, unknown>[] = [];

  if (opts.isHome) {
    const sameAs = (g.socials ?? []).map((x) => x.url).filter(Boolean);
    graph.push({
      "@type": settings.seo.orgType || "Organization",
      "@id": orgId,
      name: g.siteName,
      legalName: settings.seo.orgLegalName || undefined,
      url: siteUrl(),
      logo: g.logo?.url ? absoluteUrl(g.logo.url) : undefined,
      image: g.logo?.url ? absoluteUrl(g.logo.url) : undefined,
      foundingDate: settings.seo.orgFoundingYear || undefined,
      email: g.email || undefined,
      telephone: g.phone || undefined,
      address: g.address ? { "@type": "PostalAddress", streetAddress: g.address, addressCountry: "IN" } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    });
    graph.push({
      "@type": "WebSite",
      "@id": `${siteUrl()}/#website`,
      url: siteUrl(),
      name: g.siteName,
      publisher: { "@id": orgId },
    });
  }

  graph.push({
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: content.seo.metaTitle || opts.title,
    description: content.seo.metaDescription || undefined,
    isPartOf: { "@id": `${siteUrl()}/#website` },
    about: { "@id": orgId },
  });

  // The page sells "schema markup included by default", so it should carry its
  // own. Built from the rendered FAQ blocks, so the markup can never drift
  // from what a visitor actually reads — which is what Google penalises.
  const faqs = content.sections
    .filter((s) => s.visible !== false && s.type === "faq")
    .flatMap((s) => ((s.data as { items?: { question?: string; answer?: string }[] }).items ?? []))
    .filter((i) => i.question?.trim() && i.answer?.trim());

  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((i) => ({
        "@type": "Question",
        name: plain(i.question),
        acceptedAnswer: { "@type": "Answer", text: plain(i.answer) },
      })),
    });
  }

  if (!opts.isHome) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
        { "@type": "ListItem", position: 2, name: opts.title, item: url },
      ],
    });
  }

  const blocks: string[] = [JSON.stringify({ "@context": "https://schema.org", "@graph": graph })];
  const custom = content.seo.customSchema?.trim();
  if (custom) {
    try {
      blocks.push(JSON.stringify(JSON.parse(custom)));
    } catch {
      // Invalid JSON is flagged in the editor; skip it on the site.
    }
  }
  // Escape "<" so content can never close the script tag.
  return blocks.map((b) => b.replace(/</g, "\\u003c"));
}

import "server-only";
import { unstable_cache } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages, redirects } from "@/db/schema";

export const PAGES_TAG = "pages";
export const pageTag = (slug: string) => `page:${slug || "home"}`;

/** Normalizes a URL path/slug to the stored form: lowercase, no leading/trailing slashes. */
export function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/[^a-z0-9/\-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/-{2,}/g, "-")
    .replace(/(^[/-]+)|([/-]+$)/g, "");
}

export const pagePath = (slug: string) => (slug ? `/${slug}` : "/");

export function slugify(text: string) {
  return normalizeSlug(text.replace(/\//g, " ").replace(/&/g, " and "));
}

/** Published page for visitors (cached until the page is republished). */
export function getPublishedPage(slug: string) {
  return unstable_cache(
    async () => {
      const where = slug
        ? and(eq(pages.slug, slug), eq(pages.status, "published"), isNull(pages.deletedAt))
        : and(eq(pages.isHome, true), eq(pages.status, "published"), isNull(pages.deletedAt));
      const [row] = await db.select().from(pages).where(where).limit(1);
      if (!row || !row.published) return null;
      return {
        id: row.id,
        title: row.title,
        slug: row.isHome ? "" : row.slug,
        pageType: row.pageType,
        isHome: row.isHome,
        content: row.published,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        updatedAt: row.updatedAt.toISOString(),
      };
    },
    ["published-page", slug],
    { tags: [PAGES_TAG, pageTag(slug)] },
  )();
}

export async function findRedirect(path: string) {
  const [row] = await db.select().from(redirects).where(eq(redirects.fromPath, path)).limit(1);
  if (row) {
    // Fire-and-forget hit counter.
    db.update(redirects)
      .set({ hits: row.hits + 1 })
      .where(eq(redirects.id, row.id))
      .catch(() => {});
  }
  return row ?? null;
}

export async function listPublishedForSitemap() {
  return db
    .select({ slug: pages.slug, isHome: pages.isHome, updatedAt: pages.updatedAt, published: pages.published })
    .from(pages)
    .where(and(eq(pages.status, "published"), isNull(pages.deletedAt)));
}

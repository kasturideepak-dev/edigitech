import "server-only";
import { getContentTypes } from "./content-types";
import type { ContentType } from "./content-types";
import type { TaxonomyDef } from "./types";

/**
 * A URL that belongs to a content type rather than a CMS page.
 * Every prefix here comes from the database, so the client can rename
 * /blog to /insights without touching code.
 */
export type ContentRoute =
  | { kind: "archive"; type: ContentType; page: number }
  | { kind: "entry"; type: ContentType; slug: string }
  | { kind: "term"; type: ContentType; taxonomy: TaxonomyDef; termSlug: string; page: number };

/**
 * Pagination lives in the path (/blog/page/2) rather than a ?page= query, so the
 * catch-all never reads searchParams. Reading them would opt the whole route out
 * of static rendering, which matters when the site has hundreds of landing pages.
 * Returns the remaining segments plus the page number.
 */
function splitPage(segments: string[]): { rest: string[]; page: number } | null {
  if (segments.length >= 2 && segments[segments.length - 2] === "page") {
    const n = Number(segments[segments.length - 1]);
    if (!Number.isInteger(n) || n < 2) return null; // page 1 is the bare URL
    return { rest: segments.slice(0, -2), page: n };
  }
  return { rest: segments, page: 1 };
}

/**
 * Resolves a normalized slug path against the content types.
 * Returns null when the path isn't one of theirs — CMS pages are matched first
 * by the caller, so a page always wins a collision.
 */
export async function resolveContentRoute(slug: string): Promise<ContentRoute | null> {
  const all = slug.split("/").filter(Boolean);
  if (!all.length) return null;

  const types = await getContentTypes();
  const type = types.find((t) => t.slug === all[0]);
  if (!type) return null;

  const split = splitPage(all);
  if (!split) return null;
  const { rest: segments, page } = split;

  // /blog  and  /blog/page/2
  if (segments.length === 1) {
    return type.hasArchive ? { kind: "archive", type, page } : null;
  }

  // /blog/category/seo-tips  and  /blog/category/seo-tips/page/2
  if (segments.length === 3) {
    const taxonomy = (type.taxonomies ?? []).find((x) => x.slug === segments[1]);
    return taxonomy ? { kind: "term", type, taxonomy, termSlug: segments[2], page } : null;
  }

  // /blog/my-post — entries are never paginated
  if (segments.length === 2 && page === 1) {
    return { kind: "entry", type, slug: segments[1] };
  }

  return null;
}

/**
 * URL prefixes that a CMS page may not use, because a content type owns them.
 * Combined with the static RESERVED list when validating page slugs.
 */
export async function reservedTypePrefixes(): Promise<string[]> {
  const types = await getContentTypes();
  return types.map((t) => t.slug);
}

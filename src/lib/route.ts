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
  | { kind: "archive"; type: ContentType }
  | { kind: "entry"; type: ContentType; slug: string }
  | { kind: "term"; type: ContentType; taxonomy: TaxonomyDef; termSlug: string };

/**
 * Resolves a normalized slug path against the content types.
 * Returns null when the path isn't one of theirs — CMS pages are matched first
 * by the caller, so a page always wins a collision.
 */
export async function resolveContentRoute(slug: string): Promise<ContentRoute | null> {
  const segments = slug.split("/").filter(Boolean);
  if (!segments.length) return null;

  const types = await getContentTypes();
  const type = types.find((t) => t.slug === segments[0]);
  if (!type) return null;

  // /blog
  if (segments.length === 1) {
    return type.hasArchive ? { kind: "archive", type } : null;
  }

  // /blog/category/seo-tips
  if (segments.length === 3) {
    const taxonomy = (type.taxonomies ?? []).find((x) => x.slug === segments[1]);
    return taxonomy ? { kind: "term", type, taxonomy, termSlug: segments[2] } : null;
  }

  // /blog/my-post
  if (segments.length === 2) {
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

import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, count, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { contentEntries, contentTerms, contentTypes } from "@/db/schema";
import type { ContentType, ContentEntry, ContentTerm } from "@/db/schema";
import type { EntryData, EntryTerms, SeoFields } from "./types";

export const TYPES_TAG = "content-types";
export const entriesTag = (typeKey: string) => `entries:${typeKey}`;
export const entryTag = (typeKey: string, slug: string) => `entry:${typeKey}:${slug}`;

export type { ContentType, ContentEntry, ContentTerm };

/** Card-shaped entry used by archives, blocks and related lists. */
export type EntryCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  data: EntryData;
  terms: EntryTerms;
  publishedAt: string | null;
  readMinutes: number;
  authorName: string;
};

export type EntryDetail = EntryCard & { body: string; seo: SeoFields; updatedAt: string };

const liveEntries = () => and(eq(contentEntries.status, "published"), isNull(contentEntries.deletedAt));

const cardColumns = {
  id: contentEntries.id,
  title: contentEntries.title,
  slug: contentEntries.slug,
  excerpt: contentEntries.excerpt,
  coverImage: contentEntries.coverImage,
  data: contentEntries.data,
  terms: contentEntries.terms,
  publishedAt: contentEntries.publishedAt,
  readMinutes: contentEntries.readMinutes,
  authorName: contentEntries.authorName,
};

type CardRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  data: EntryData;
  terms: EntryTerms;
  publishedAt: Date | null;
  readMinutes: number;
  authorName: string;
};

const toCard = (r: CardRow): EntryCard => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  excerpt: r.excerpt,
  coverImage: r.coverImage,
  data: r.data ?? {},
  terms: r.terms ?? {},
  publishedAt: r.publishedAt?.toISOString() ?? null,
  readMinutes: r.readMinutes,
  authorName: r.authorName,
});

// ---------------------------------------------------------------- types

/** All active content types, ordered for the sidebar. Cached until a type changes. */
export const getContentTypes = unstable_cache(
  async (): Promise<ContentType[]> =>
    db.select().from(contentTypes).where(eq(contentTypes.active, true)).orderBy(asc(contentTypes.sortOrder)),
  ["content-types"],
  { tags: [TYPES_TAG] },
);

/** Every type including inactive ones — for the admin. */
export async function listAllTypes(): Promise<ContentType[]> {
  return db.select().from(contentTypes).orderBy(asc(contentTypes.sortOrder));
}

/** Resolves a URL prefix to its type. Used by the catch-all router. */
export async function getTypeBySlug(slug: string): Promise<ContentType | null> {
  const types = await getContentTypes();
  return types.find((t) => t.slug === slug) ?? null;
}

export async function getTypeByKey(key: string): Promise<ContentType | null> {
  const types = await getContentTypes();
  return types.find((t) => t.key === key) ?? null;
}

export async function getTypeById(id: number): Promise<ContentType | null> {
  const [row] = await db.select().from(contentTypes).where(eq(contentTypes.id, id)).limit(1);
  return row ?? null;
}

/** URL for an entry of a type, honouring the type's editable prefix. */
export const entryPath = (type: { slug: string }, entrySlug: string) => `/${type.slug}/${entrySlug}`;
export const archivePath = (type: { slug: string }) => `/${type.slug}`;
export const termPath = (type: { slug: string }, taxonomySlug: string, termSlug: string) =>
  `/${type.slug}/${taxonomySlug}/${termSlug}`;

// ---------------------------------------------------------------- entries

/**
 * Published entries for an archive, newest first.
 * `term` filters by taxonomy using jsonb containment (GIN-indexed).
 */
export function listEntries({
  type,
  page = 1,
  perPage,
  taxonomy,
  term,
}: {
  type: ContentType;
  page?: number;
  perPage?: number;
  taxonomy?: string;
  term?: string;
}) {
  const limit = perPage ?? type.perPage;
  return unstable_cache(
    async () => {
      const base = and(eq(contentEntries.typeId, type.id), liveEntries());
      const where =
        taxonomy && term
          ? and(base, sql`${contentEntries.terms} -> ${taxonomy} @> ${JSON.stringify([term])}::jsonb`)
          : base;
      const [rows, [totals]] = await Promise.all([
        db
          .select(cardColumns)
          .from(contentEntries)
          .where(where)
          .orderBy(asc(contentEntries.sortOrder), desc(contentEntries.publishedAt), desc(contentEntries.id))
          .limit(limit)
          .offset((page - 1) * limit),
        db.select({ total: count() }).from(contentEntries).where(where),
      ]);
      const total = totals?.total ?? 0;
      return { entries: rows.map(toCard), total, pages: Math.max(1, Math.ceil(total / limit)) };
    },
    ["entries-list", type.key, String(page), String(limit), taxonomy ?? "-", term ?? "-"],
    { tags: [entriesTag(type.key)] },
  )();
}

/** Newest entries of a type — used by content-bound blocks. */
export function latestEntries(type: ContentType, limit = 3) {
  return unstable_cache(
    async () => {
      const rows = await db
        .select(cardColumns)
        .from(contentEntries)
        .where(and(eq(contentEntries.typeId, type.id), liveEntries()))
        .orderBy(asc(contentEntries.sortOrder), desc(contentEntries.publishedAt), desc(contentEntries.id))
        .limit(limit);
      return rows.map(toCard);
    },
    ["entries-latest", type.key, String(limit)],
    { tags: [entriesTag(type.key)] },
  )();
}

export function getEntry(type: ContentType, slug: string) {
  return unstable_cache(
    async (): Promise<{ entry: EntryDetail; related: EntryCard[] } | null> => {
      const [row] = await db
        .select({ ...cardColumns, body: contentEntries.body, seo: contentEntries.seo, updatedAt: contentEntries.updatedAt })
        .from(contentEntries)
        .where(and(eq(contentEntries.typeId, type.id), eq(contentEntries.slug, slug), liveEntries()))
        .limit(1);
      if (!row) return null;

      const related = await db
        .select(cardColumns)
        .from(contentEntries)
        .where(and(eq(contentEntries.typeId, type.id), liveEntries(), ne(contentEntries.id, row.id)))
        .orderBy(desc(contentEntries.publishedAt))
        .limit(3);

      return {
        entry: {
          ...toCard(row),
          body: row.body,
          seo: row.seo,
          updatedAt: row.updatedAt.toISOString(),
        },
        related: related.map(toCard),
      };
    },
    ["entry", type.key, slug],
    { tags: [entriesTag(type.key), entryTag(type.key, slug)] },
  )();
}

// ---------------------------------------------------------------- taxonomy terms

/** Terms of one taxonomy with their published entry counts (empty ones dropped). */
export function listTermsWithCounts(type: ContentType, taxonomy: string) {
  return unstable_cache(
    async () => {
      const terms = await db
        .select()
        .from(contentTerms)
        .where(and(eq(contentTerms.typeId, type.id), eq(contentTerms.taxonomy, taxonomy)))
        .orderBy(asc(contentTerms.sortOrder), asc(contentTerms.name));
      const counts = await Promise.all(
        terms.map(async (t) => {
          const [row] = await db
            .select({ total: count() })
            .from(contentEntries)
            .where(
              and(
                eq(contentEntries.typeId, type.id),
                liveEntries(),
                sql`${contentEntries.terms} -> ${taxonomy} @> ${JSON.stringify([t.slug])}::jsonb`,
              ),
            );
          return { name: t.name, slug: t.slug, total: row?.total ?? 0 };
        }),
      );
      return counts.filter((c) => c.total > 0);
    },
    ["terms-counts", type.key, taxonomy],
    { tags: [entriesTag(type.key), TYPES_TAG] },
  )();
}

export async function getTerm(type: ContentType, taxonomy: string, slug: string) {
  const [row] = await db
    .select()
    .from(contentTerms)
    .where(and(eq(contentTerms.typeId, type.id), eq(contentTerms.taxonomy, taxonomy), eq(contentTerms.slug, slug)))
    .limit(1);
  return row ?? null;
}

export async function listTerms(typeId: number, taxonomy?: string) {
  const where = taxonomy
    ? and(eq(contentTerms.typeId, typeId), eq(contentTerms.taxonomy, taxonomy))
    : eq(contentTerms.typeId, typeId);
  return db.select().from(contentTerms).where(where).orderBy(asc(contentTerms.sortOrder), asc(contentTerms.name));
}

// ---------------------------------------------------------------- sitemap

/** Every published entry with its type prefix, for sitemap.xml. */
export async function listEntriesForSitemap() {
  const rows = await db
    .select({
      slug: contentEntries.slug,
      updatedAt: contentEntries.updatedAt,
      seo: contentEntries.seo,
      typeSlug: contentTypes.slug,
      hasArchive: contentTypes.hasArchive,
    })
    .from(contentEntries)
    .innerJoin(contentTypes, eq(contentEntries.typeId, contentTypes.id))
    .where(and(liveEntries(), eq(contentTypes.active, true)));
  return rows.filter((r) => !r.seo?.noindex && !r.seo?.canonical);
}

/** Rough reading time from the editor's HTML. */
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatEntryDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

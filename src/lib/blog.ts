import "server-only";
import { unstable_cache } from "next/cache";
import { and, count, desc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import type { SeoFields } from "./types";

export const POSTS_TAG = "posts";
export const postTag = (slug: string) => `post:${slug}`;
export const POSTS_PER_PAGE = 9;

export type PostCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  category: { name: string; slug: string } | null;
  publishedAt: string | null;
  readMinutes: number;
};

export type PostDetail = PostCard & { body: string; authorName: string; seo: SeoFields; updatedAt: string };

const live = () => and(eq(posts.status, "published"), isNull(posts.deletedAt));

const cardColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  publishedAt: posts.publishedAt,
  readMinutes: posts.readMinutes,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

type CardRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  publishedAt: Date | null;
  readMinutes: number;
  categoryName: string | null;
  categorySlug: string | null;
};

const toCard = (r: CardRow): PostCard => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  excerpt: r.excerpt,
  coverImage: r.coverImage,
  category: r.categoryName && r.categorySlug ? { name: r.categoryName, slug: r.categorySlug } : null,
  publishedAt: r.publishedAt?.toISOString() ?? null,
  readMinutes: r.readMinutes,
});

/** Published posts for the blog listing, newest first. */
export function listPosts({ page = 1, categorySlug }: { page?: number; categorySlug?: string } = {}) {
  return unstable_cache(
    async () => {
      const where = categorySlug ? and(live(), eq(categories.slug, categorySlug)) : live();
      const [rows, [{ total }]] = await Promise.all([
        db
          .select(cardColumns)
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .where(where)
          .orderBy(desc(posts.publishedAt), desc(posts.id))
          .limit(POSTS_PER_PAGE)
          .offset((page - 1) * POSTS_PER_PAGE),
        db.select({ total: count() }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(where),
      ]);
      return { posts: rows.map(toCard), total, pages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)) };
    },
    ["blog-list", String(page), categorySlug ?? "all"],
    { tags: [POSTS_TAG] },
  )();
}

/** Newest posts, used by the homepage blog section. */
export function latestPosts(limit = 3) {
  return unstable_cache(
    async () => {
      const rows = await db
        .select(cardColumns)
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(live())
        .orderBy(desc(posts.publishedAt), desc(posts.id))
        .limit(limit);
      return rows.map(toCard);
    },
    ["blog-latest", String(limit)],
    { tags: [POSTS_TAG] },
  )();
}

export function getPost(slug: string) {
  return unstable_cache(
    async (): Promise<{ post: PostDetail; related: PostCard[] } | null> => {
      const [row] = await db
        .select({
          ...cardColumns,
          body: posts.body,
          authorName: posts.authorName,
          seo: posts.seo,
          updatedAt: posts.updatedAt,
          categoryId: posts.categoryId,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(and(live(), eq(posts.slug, slug)))
        .limit(1);
      if (!row) return null;

      const relatedRows = await db
        .select(cardColumns)
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(
          row.categoryId
            ? and(live(), eq(posts.categoryId, row.categoryId), ne(posts.id, row.id))
            : and(live(), ne(posts.id, row.id)),
        )
        .orderBy(desc(posts.publishedAt))
        .limit(3);

      return {
        post: {
          ...toCard(row),
          body: row.body,
          authorName: row.authorName,
          seo: row.seo,
          updatedAt: row.updatedAt.toISOString(),
        },
        related: relatedRows.map(toCard),
      };
    },
    ["blog-post", slug],
    { tags: [POSTS_TAG, postTag(slug)] },
  )();
}

export function listCategoriesWithCounts() {
  return unstable_cache(
    async () => {
      const rows = await db
        .select({ name: categories.name, slug: categories.slug, total: count(posts.id) })
        .from(categories)
        .leftJoin(posts, and(eq(posts.categoryId, categories.id), eq(posts.status, "published"), isNull(posts.deletedAt)))
        .groupBy(categories.id, categories.name, categories.slug)
        .orderBy(categories.name);
      return rows.filter((r) => r.total > 0);
    },
    ["blog-categories"],
    { tags: [POSTS_TAG] },
  )();
}

export async function getCategory(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function listPublishedPostsForSitemap() {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt, publishedAt: posts.publishedAt })
    .from(posts)
    .where(live());
}

/** Rough reading time from the editor's HTML. */
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatPostDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

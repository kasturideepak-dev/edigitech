"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import { assertUser, can } from "@/lib/auth";
import { POSTS_TAG, postTag, readingMinutes } from "@/lib/blog";
import { normalizeSlug } from "@/lib/pages";
import { emptySeo, type SeoFields } from "@/lib/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function run<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

function invalidate(...slugs: string[]) {
  updateTag(POSTS_TAG);
  for (const s of slugs) {
    updateTag(postTag(s));
    revalidatePath(`/blog/${s}`);
  }
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export type PostInput = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  body: string;
  categoryId: number | null;
  authorName: string;
  publishedAt: string | null;
  seo: SeoFields;
};

async function checkSlug(slug: string, id?: number) {
  if (!slug) throw new Error("URL slug is required.");
  const [clash] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(id ? and(eq(posts.slug, slug), ne(posts.id, id)) : eq(posts.slug, slug))
    .limit(1);
  if (clash) throw new Error(`Another post already uses “/blog/${slug}”.`);
}

export async function savePostAction(input: PostInput, opts: { publish?: boolean; unpublish?: boolean } = {}) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    if (opts.publish && !can(user.role, "pages.publish")) throw new Error("You don't have permission to publish.");
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    const slug = normalizeSlug(input.slug || title);
    await checkSlug(slug, input.id);

    const values = {
      title,
      slug,
      excerpt: input.excerpt.slice(0, 400),
      coverImage: input.coverImage,
      body: input.body,
      categoryId: input.categoryId,
      authorName: (input.authorName || user.name).slice(0, 120),
      authorId: user.id,
      readMinutes: readingMinutes(input.body),
      seo: { ...emptySeo(), ...input.seo },
      ...(opts.publish
        ? { status: "published" as const, publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date() }
        : opts.unpublish
          ? { status: "draft" as const }
          : {}),
    };

    let id = input.id;
    if (id) {
      const [existing] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, id)).limit(1);
      if (!existing) throw new Error("Post not found.");
      await db.update(posts).set(values).where(eq(posts.id, id));
      invalidate(slug, existing.slug);
    } else {
      const [res] = await db.insert(posts).values({ ...values, status: opts.publish ? "published" : "draft" });
      id = res.insertId;
      invalidate(slug);
    }
    return { id, slug, published: !!opts.publish };
  });
}

export async function deletePostAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const [row] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, id)).limit(1);
    if (!row) throw new Error("Post not found.");
    await db.update(posts).set({ deletedAt: new Date(), status: "draft" }).where(eq(posts.id, id));
    invalidate(row.slug);
    return {};
  });
}

export async function restorePostAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    await db.update(posts).set({ deletedAt: null }).where(eq(posts.id, id));
    invalidate();
    return {};
  });
}

export async function deletePostForeverAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const [row] = await db.select({ deletedAt: posts.deletedAt }).from(posts).where(eq(posts.id, id)).limit(1);
    if (!row?.deletedAt) throw new Error("Move the post to trash first.");
    await db.delete(posts).where(eq(posts.id, id));
    invalidate();
    return {};
  });
}

export async function saveCategoryAction(input: { id?: number; name: string; slug: string; description: string }) {
  return run(async () => {
    await assertUser("pages.edit");
    const name = input.name.trim();
    if (!name) throw new Error("Name is required.");
    const slug = normalizeSlug(input.slug || name);
    const [clash] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(input.id ? and(eq(categories.slug, slug), ne(categories.id, input.id)) : eq(categories.slug, slug))
      .limit(1);
    if (clash) throw new Error("Another category already uses that URL.");
    const values = { name, slug, description: input.description.slice(0, 300) };
    if (input.id) await db.update(categories).set(values).where(eq(categories.id, input.id));
    else await db.insert(categories).values(values);
    invalidate();
    revalidatePath(`/blog/category/${slug}`);
    return {};
  });
}

export async function deleteCategoryAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const [used] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.categoryId, id), isNull(posts.deletedAt)))
      .limit(1);
    if (used) throw new Error("This category still has posts. Move them to another category first.");
    await db.delete(categories).where(eq(categories.id, id));
    invalidate();
    return {};
  });
}

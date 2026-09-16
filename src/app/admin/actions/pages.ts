"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { pageRevisions, pages, redirects } from "@/db/schema";
import { assertUser, can } from "@/lib/auth";
import { PAGES_TAG, normalizeSlug, pagePath, pageTag } from "@/lib/pages";
import type { PageContent } from "@/lib/types";
import { buildContentFromTemplate, newSectionId } from "@/templates";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const RESERVED = ["admin", "uploads", "preview", "api", "sitemap.xml", "robots.txt", "_next", "assets", "css"];
const MAX_REVISIONS = 30;

async function run<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

async function validateSlug(slug: string, pageId?: number) {
  if (!slug) throw new Error("URL slug is required.");
  if (RESERVED.includes(slug.split("/")[0])) throw new Error(`“/${slug}” is reserved. Choose another URL.`);
  const where = pageId ? and(eq(pages.slug, slug), ne(pages.id, pageId)) : eq(pages.slug, slug);
  const [clash] = await db.select({ id: pages.id }).from(pages).where(where).limit(1);
  if (clash) throw new Error(`Another page already uses “/${slug}”.`);
}

function invalidate(...slugs: string[]) {
  updateTag(PAGES_TAG);
  for (const s of slugs) {
    updateTag(pageTag(s));
    revalidatePath(pagePath(s));
  }
  revalidatePath("/sitemap.xml");
}

async function snapshot(pageId: number, title: string, content: PageContent, note: string, userId: number) {
  await db.insert(pageRevisions).values({ pageId, title, content, note, userId });
  // Keep only the latest revisions per page.
  const old = await db
    .select({ id: pageRevisions.id })
    .from(pageRevisions)
    .where(eq(pageRevisions.pageId, pageId))
    .orderBy(desc(pageRevisions.id))
    .offset(MAX_REVISIONS)
    .limit(1000);
  for (const r of old) await db.delete(pageRevisions).where(eq(pageRevisions.id, r.id));
}

async function getPage(id: number) {
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!page) throw new Error("Page not found.");
  return page;
}

const liveSlug = (p: { isHome: boolean; slug: string }) => (p.isHome ? "" : p.slug);

export async function createPageAction(input: { title: string; slug: string; pageType: string; template: string }) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    const slug = normalizeSlug(input.slug || title);
    await validateSlug(slug);
    const content = buildContentFromTemplate(input.template, title);
    const [res] = await db.insert(pages).values({
      title,
      slug,
      pageType: input.pageType,
      template: input.template,
      status: "draft",
      draft: content,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return { id: res.insertId };
  });
}

export type SavePageInput = {
  id: number;
  title: string;
  slug: string;
  pageType: string;
  content: PageContent;
};

export async function savePageAction(input: SavePageInput, opts: { publish?: boolean } = {}) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    if (opts.publish && !can(user.role, "pages.publish")) throw new Error("You don't have permission to publish.");
    const page = await getPage(input.id);
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");

    const slug = page.isHome ? page.slug : normalizeSlug(input.slug);
    if (!page.isHome) await validateSlug(slug, page.id);

    // SEO users may only change SEO fields.
    const content: PageContent =
      user.role === "seo" ? { ...page.draft, seo: input.content.seo } : input.content;

    const now = new Date();
    const publishing = !!opts.publish;
    await db
      .update(pages)
      .set({
        title,
        slug,
        pageType: page.isHome ? "home" : input.pageType,
        draft: content,
        updatedBy: user.id,
        ...(publishing
          ? { published: content, status: "published" as const, hasUnpublishedChanges: false, publishedAt: now }
          : { hasUnpublishedChanges: true }),
      })
      .where(eq(pages.id, page.id));

    // Changing the URL of a live page: keep old links working with a 301.
    if (page.status === "published" && !page.isHome && slug !== page.slug) {
      await db
        .insert(redirects)
        .values({ fromPath: `/${page.slug}`, toPath: `/${slug}`, statusCode: 301, note: "Auto: page URL changed" })
        .onDuplicateKeyUpdate({ set: { toPath: `/${slug}` } });
      await db.delete(redirects).where(eq(redirects.fromPath, `/${slug}`));
    }

    if (publishing) {
      await snapshot(page.id, title, content, "Published", user.id);
      invalidate(liveSlug({ isHome: page.isHome, slug }), liveSlug(page));
    } else if (page.status === "published" && slug !== page.slug) {
      invalidate(liveSlug(page));
    }
    return { savedAt: now.toISOString(), published: publishing };
  });
}

export async function unpublishPageAction(id: number) {
  return run(async () => {
    await assertUser("pages.publish");
    const page = await getPage(id);
    if (page.isHome) throw new Error("The homepage can't be unpublished.");
    await db.update(pages).set({ status: "draft", hasUnpublishedChanges: true }).where(eq(pages.id, id));
    invalidate(liveSlug(page));
    return {};
  });
}

export async function discardChangesAction(id: number) {
  return run(async () => {
    await assertUser("pages.edit");
    const page = await getPage(id);
    if (!page.published) throw new Error("This page has never been published.");
    await db.update(pages).set({ draft: page.published, hasUnpublishedChanges: false }).where(eq(pages.id, id));
    return {};
  });
}

export async function duplicatePageAction(id: number) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    const page = await getPage(id);
    let slug = `${page.isHome ? "home" : page.slug}-copy`;
    for (let i = 2; ; i++) {
      const [clash] = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).limit(1);
      if (!clash) break;
      slug = `${page.isHome ? "home" : page.slug}-copy-${i}`;
    }
    const draft: PageContent = {
      ...page.draft,
      sections: page.draft.sections.map((s) => ({ ...s, id: newSectionId() })),
    };
    const [res] = await db.insert(pages).values({
      title: `${page.title} (Copy)`,
      slug,
      pageType: page.isHome ? "generic" : page.pageType,
      template: page.template,
      status: "draft",
      draft,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return { id: res.insertId };
  });
}

export async function trashPageAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const page = await getPage(id);
    if (page.isHome) throw new Error("The homepage can't be deleted. Set another page as homepage first.");
    await db.update(pages).set({ deletedAt: new Date(), status: "draft" }).where(eq(pages.id, id));
    invalidate(liveSlug(page));
    return {};
  });
}

export async function restorePageAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    await db.update(pages).set({ deletedAt: null, hasUnpublishedChanges: true }).where(eq(pages.id, id));
    return {};
  });
}

export async function deletePageForeverAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const page = await getPage(id);
    if (!page.deletedAt) throw new Error("Move the page to trash first.");
    await db.delete(pageRevisions).where(eq(pageRevisions.pageId, id));
    await db.delete(pages).where(eq(pages.id, id));
    return {};
  });
}

export async function setHomePageAction(id: number) {
  return run(async () => {
    await assertUser("settings.manage");
    const page = await getPage(id);
    if (page.status !== "published") throw new Error("Publish the page before making it the homepage.");
    const [oldHome] = await db.select().from(pages).where(eq(pages.isHome, true)).limit(1);
    await db.update(pages).set({ isHome: false }).where(eq(pages.isHome, true));
    await db.update(pages).set({ isHome: true, pageType: "home" }).where(eq(pages.id, id));
    invalidate("", page.slug, ...(oldHome ? [oldHome.slug] : []));
    return {};
  });
}

export async function listRevisionsAction(pageId: number) {
  return run(async () => {
    await assertUser("pages.edit");
    const rows = await db
      .select({ id: pageRevisions.id, note: pageRevisions.note, createdAt: pageRevisions.createdAt, title: pageRevisions.title })
      .from(pageRevisions)
      .where(eq(pageRevisions.pageId, pageId))
      .orderBy(desc(pageRevisions.id))
      .limit(MAX_REVISIONS);
    return { revisions: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) };
  });
}

/** Loads a revision into the draft (it still needs to be published). */
export async function restoreRevisionAction(pageId: number, revisionId: number) {
  return run(async () => {
    await assertUser("pages.edit");
    const [rev] = await db
      .select()
      .from(pageRevisions)
      .where(and(eq(pageRevisions.id, revisionId), eq(pageRevisions.pageId, pageId)))
      .limit(1);
    if (!rev) throw new Error("Revision not found.");
    await db
      .update(pages)
      .set({ draft: rev.content, title: rev.title, hasUnpublishedChanges: true })
      .where(eq(pages.id, pageId));
    return { content: rev.content, title: rev.title };
  });
}

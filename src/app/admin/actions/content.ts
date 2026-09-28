"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { contentEntries, contentTerms, contentTypes, pages, redirects } from "@/db/schema";
import { assertUser, can } from "@/lib/auth";
import { TYPES_TAG, entriesTag, entryTag, readingMinutes } from "@/lib/content-types";
import { normalizeSlug } from "@/lib/pages";
import { isStaticReserved } from "@/lib/reserved";
import {
  defaultSupports,
  emptySeo,
  type ContentTypeSupports,
  type EntryData,
  type EntryTerms,
  type Field,
  type ImageValue,
  type SeoFields,
  type TaxonomyDef,
} from "@/lib/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function run<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/** Single URL segment: lowercase letters, numbers, hyphens. */
const segment = (s: string) => normalizeSlug(s.replace(/\//g, "-"));

async function getType(id: number) {
  const [t] = await db.select().from(contentTypes).where(eq(contentTypes.id, id)).limit(1);
  if (!t) throw new Error("Content type not found.");
  return t;
}

function invalidateType(typeKey: string, typeSlug: string, ...entrySlugs: string[]) {
  updateTag(entriesTag(typeKey));
  for (const s of entrySlugs) {
    updateTag(entryTag(typeKey, s));
    revalidatePath(`/${typeSlug}/${s}`);
  }
  revalidatePath(`/${typeSlug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

/** Adds/refreshes a 301 and removes any redirect that would now shadow the new URL. */
async function addRedirect(from: string, to: string, note: string) {
  if (from === to) return;
  await db
    .insert(redirects)
    .values({ fromPath: from, toPath: to, statusCode: 301, note })
    .onConflictDoUpdate({ target: redirects.fromPath, set: { toPath: to, note } });
  await db.delete(redirects).where(eq(redirects.fromPath, to));
}

// =================================================================== entries

export type EntryInput = {
  id?: number;
  typeId: number;
  title: string;
  slug: string;
  data: EntryData;
  terms: EntryTerms;
  seo: SeoFields;
  excerpt: string;
  body: string;
  coverImage: ImageValue | null;
  authorName: string;
  publishedAt: string | null;
  sortOrder: number;
};

export async function saveEntryAction(input: EntryInput, opts: { publish?: boolean; unpublish?: boolean } = {}) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    if ((opts.publish || opts.unpublish) && !can(user.role, "pages.publish"))
      throw new Error("You don't have permission to publish.");
    const type = await getType(input.typeId);
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    const slug = segment(input.slug || title);
    if (!slug) throw new Error("URL slug is required.");

    const [clash] = await db
      .select({ id: contentEntries.id })
      .from(contentEntries)
      .where(
        input.id
          ? and(eq(contentEntries.typeId, type.id), eq(contentEntries.slug, slug), ne(contentEntries.id, input.id))
          : and(eq(contentEntries.typeId, type.id), eq(contentEntries.slug, slug)),
      )
      .limit(1);
    if (clash) throw new Error(`Another ${type.name.toLowerCase()} already uses “/${type.slug}/${slug}”.`);

    const values = {
      title: title.slice(0, 220),
      slug,
      data: input.data ?? {},
      terms: input.terms ?? {},
      seo: { ...emptySeo(), ...input.seo },
      excerpt: (input.excerpt ?? "").slice(0, 400),
      body: input.body ?? "",
      coverImage: input.coverImage,
      authorName: (input.authorName || user.name).slice(0, 120),
      readMinutes: type.supports?.body ? readingMinutes(input.body ?? "") : 0,
      sortOrder: Number(input.sortOrder) || 0,
      updatedBy: user.id,
      ...(opts.publish
        ? { status: "published" as const, publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date() }
        : opts.unpublish
          ? { status: "draft" as const }
          : {}),
    };

    if (input.id) {
      const [existing] = await db.select().from(contentEntries).where(eq(contentEntries.id, input.id)).limit(1);
      if (!existing || existing.typeId !== type.id) throw new Error("Entry not found.");
      const slugChanged = existing.slug !== slug;
      await db
        .update(contentEntries)
        // A hand-edited slug is locked so bulk tools never overwrite it.
        .set({ ...values, ...(slugChanged ? { slugLocked: true } : {}) })
        .where(eq(contentEntries.id, existing.id));
      if (slugChanged && existing.status === "published") {
        await addRedirect(`/${type.slug}/${existing.slug}`, `/${type.slug}/${slug}`, "Auto: entry URL changed");
      }
      invalidateType(type.key, type.slug, slug, existing.slug);
      return { id: existing.id, slug, published: !!opts.publish };
    }

    const [res] = await db
      .insert(contentEntries)
      .values({
        ...values,
        typeId: type.id,
        status: opts.publish ? "published" : "draft",
        authorId: user.id,
        createdBy: user.id,
        // Typed by hand at creation → treat as deliberate.
        slugLocked: !!input.slug,
      })
      .returning({ id: contentEntries.id });
    invalidateType(type.key, type.slug, slug);
    return { id: res.id, slug, published: !!opts.publish };
  });
}

async function entryWithType(id: number) {
  const [row] = await db
    .select({ entry: contentEntries, type: contentTypes })
    .from(contentEntries)
    .innerJoin(contentTypes, eq(contentEntries.typeId, contentTypes.id))
    .where(eq(contentEntries.id, id))
    .limit(1);
  if (!row) throw new Error("Entry not found.");
  return row;
}

export async function trashEntryAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const { entry, type } = await entryWithType(id);
    await db.update(contentEntries).set({ deletedAt: new Date(), status: "draft" }).where(eq(contentEntries.id, id));
    invalidateType(type.key, type.slug, entry.slug);
    return {};
  });
}

export async function restoreEntryAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const { type } = await entryWithType(id);
    await db.update(contentEntries).set({ deletedAt: null }).where(eq(contentEntries.id, id));
    invalidateType(type.key, type.slug);
    return {};
  });
}

export async function deleteEntryForeverAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const { entry, type } = await entryWithType(id);
    if (!entry.deletedAt) throw new Error("Move it to trash first.");
    await db.delete(contentEntries).where(eq(contentEntries.id, id));
    invalidateType(type.key, type.slug);
    return {};
  });
}

export async function duplicateEntryAction(id: number) {
  return run(async () => {
    const user = await assertUser("pages.edit");
    const { entry, type } = await entryWithType(id);
    let slug = `${entry.slug}-copy`;
    for (let i = 2; ; i++) {
      const [c] = await db
        .select({ id: contentEntries.id })
        .from(contentEntries)
        .where(and(eq(contentEntries.typeId, type.id), eq(contentEntries.slug, slug)))
        .limit(1);
      if (!c) break;
      slug = `${entry.slug}-copy-${i}`;
    }
    const [res] = await db
      .insert(contentEntries)
      .values({
        typeId: entry.typeId,
        title: `${entry.title} (Copy)`,
        slug,
        data: entry.data,
        terms: entry.terms,
        seo: entry.seo,
        excerpt: entry.excerpt,
        body: entry.body,
        coverImage: entry.coverImage,
        authorName: entry.authorName,
        sortOrder: entry.sortOrder,
        status: "draft",
        authorId: user.id,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: contentEntries.id });
    return { id: res.id };
  });
}

// =================================================================== taxonomy terms

export async function saveTermAction(input: {
  id?: number;
  typeId: number;
  taxonomy: string;
  name: string;
  slug: string;
  description: string;
}) {
  return run(async () => {
    await assertUser("pages.edit");
    const type = await getType(input.typeId);
    const tax = (type.taxonomies ?? []).find((t) => t.key === input.taxonomy);
    if (!tax) throw new Error("Unknown taxonomy.");
    const name = input.name.trim();
    if (!name) throw new Error("Name is required.");
    const slug = segment(input.slug || name);
    const scope = and(eq(contentTerms.typeId, type.id), eq(contentTerms.taxonomy, tax.key), eq(contentTerms.slug, slug));
    const [clash] = await db
      .select({ id: contentTerms.id })
      .from(contentTerms)
      .where(input.id ? and(scope, ne(contentTerms.id, input.id)) : scope)
      .limit(1);
    if (clash) throw new Error(`Another ${tax.name.toLowerCase()} already uses that URL.`);
    const values = { name: name.slice(0, 120), slug, description: input.description.slice(0, 300) };

    if (input.id) {
      const [old] = await db.select().from(contentTerms).where(eq(contentTerms.id, input.id)).limit(1);
      if (!old) throw new Error("Term not found.");
      await db.update(contentTerms).set(values).where(eq(contentTerms.id, input.id));
      if (old.slug !== slug) {
        // Re-point entries that referenced the old term slug.
        await db.execute(sql`
          update content_entries
          set terms = jsonb_set(terms, ${`{${tax.key}}`}::text[],
            coalesce((select jsonb_agg(case when v = ${JSON.stringify(old.slug)}::jsonb then ${JSON.stringify(slug)}::jsonb else v end)
                      from jsonb_array_elements(terms -> ${tax.key}) v), '[]'::jsonb))
          where type_id = ${type.id} and terms -> ${tax.key} @> ${JSON.stringify([old.slug])}::jsonb`);
        await addRedirect(`/${type.slug}/${tax.slug}/${old.slug}`, `/${type.slug}/${tax.slug}/${slug}`, "Auto: term URL changed");
      }
    } else {
      await db.insert(contentTerms).values({ ...values, typeId: type.id, taxonomy: tax.key, seo: emptySeo() });
    }
    invalidateType(type.key, type.slug);
    updateTag(TYPES_TAG);
    return {};
  });
}

export async function deleteTermAction(id: number) {
  return run(async () => {
    await assertUser("pages.delete");
    const [term] = await db.select().from(contentTerms).where(eq(contentTerms.id, id)).limit(1);
    if (!term) throw new Error("Term not found.");
    const [used] = await db
      .select({ total: count() })
      .from(contentEntries)
      .where(
        and(
          eq(contentEntries.typeId, term.typeId),
          isNull(contentEntries.deletedAt),
          sql`${contentEntries.terms} -> ${term.taxonomy} @> ${JSON.stringify([term.slug])}::jsonb`,
        ),
      );
    if ((used?.total ?? 0) > 0) throw new Error(`Still used by ${used.total} entr${used.total === 1 ? "y" : "ies"}. Reassign them first.`);
    await db.delete(contentTerms).where(eq(contentTerms.id, id));
    const type = await getType(term.typeId);
    invalidateType(type.key, type.slug);
    updateTag(TYPES_TAG);
    return {};
  });
}

// =================================================================== content types

export type ContentTypeInput = {
  id?: number;
  key: string;
  name: string;
  namePlural: string;
  slug: string;
  description: string;
  icon: string;
  hasArchive: boolean;
  archiveTitle: string;
  archiveIntro: string;
  perPage: number;
  fields: Field[];
  taxonomies: TaxonomyDef[];
  supports: ContentTypeSupports;
  active: boolean;
};

/** Field names must be unique, non-empty identifiers — entries store values under them. */
function validateFields(fields: Field[], path = "") {
  const seen = new Set<string>();
  for (const f of fields) {
    if (!f.name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.name))
      throw new Error(`Field “${f.label || "(unnamed)"}”${path} needs a key made of letters, numbers or _ (starting with a letter).`);
    if (seen.has(f.name)) throw new Error(`Two fields${path} share the key “${f.name}”.`);
    seen.add(f.name);
    if (!f.label?.trim()) throw new Error(`Field “${f.name}”${path} needs a label.`);
    if (f.type === "select" && !f.options?.length) throw new Error(`Dropdown “${f.label}” needs at least one option.`);
    if ((f.type === "group" || f.type === "list") && f.fields) validateFields(f.fields, ` inside “${f.label}”`);
  }
}

export async function saveContentTypeAction(input: ContentTypeInput) {
  return run(async () => {
    await assertUser("types.manage");
    const name = input.name.trim();
    const namePlural = input.namePlural.trim() || `${name}s`;
    if (!name) throw new Error("Name is required.");
    const slug = segment(input.slug || namePlural);
    if (!slug) throw new Error("URL prefix is required.");
    if (isStaticReserved(slug)) throw new Error(`“/${slug}” is reserved by the system.`);

    const [pageClash] = await db
      .select({ slug: pages.slug })
      .from(pages)
      .where(and(isNull(pages.deletedAt), sql`split_part(${pages.slug}, '/', 1) = ${slug}`))
      .limit(1);
    if (pageClash) throw new Error(`A page already lives at “/${pageClash.slug}”. Pick another prefix or move that page.`);

    const [typeClash] = await db
      .select({ id: contentTypes.id, name: contentTypes.namePlural })
      .from(contentTypes)
      .where(input.id ? and(eq(contentTypes.slug, slug), ne(contentTypes.id, input.id)) : eq(contentTypes.slug, slug))
      .limit(1);
    if (typeClash) throw new Error(`“/${slug}” is already used by ${typeClash.name}.`);

    validateFields(input.fields ?? []);
    const taxonomies = (input.taxonomies ?? []).map((t) => ({
      ...t,
      key: t.key || segment(t.name).replace(/-/g, "_"),
      slug: segment(t.slug || t.name),
    }));
    const taxKeys = new Set<string>();
    for (const t of taxonomies) {
      if (!t.name.trim() || !t.slug) throw new Error("Each taxonomy needs a name and URL segment.");
      if (taxKeys.has(t.key)) throw new Error(`Two taxonomies share the key “${t.key}”.`);
      taxKeys.add(t.key);
    }

    const values = {
      name: name.slice(0, 80),
      namePlural: namePlural.slice(0, 80),
      slug,
      description: (input.description ?? "").slice(0, 300),
      icon: input.icon || "FileText",
      hasArchive: !!input.hasArchive,
      archiveTitle: (input.archiveTitle ?? "").slice(0, 200),
      archiveIntro: input.archiveIntro ?? "",
      perPage: Math.min(60, Math.max(1, Number(input.perPage) || 9)),
      fields: input.fields ?? [],
      taxonomies,
      supports: { ...defaultSupports(), ...input.supports },
      active: input.active !== false,
    };

    if (input.id) {
      const old = await getType(input.id);
      await db.update(contentTypes).set(values).where(eq(contentTypes.id, old.id));

      let redirected = 0;
      if (old.slug !== slug) {
        // Every live URL under the old prefix keeps working via a 301 — rankings survive the rename.
        await addRedirect(`/${old.slug}`, `/${slug}`, `Auto: ${old.namePlural} prefix changed`);
        const live = await db
          .select({ slug: contentEntries.slug })
          .from(contentEntries)
          .where(and(eq(contentEntries.typeId, old.id), eq(contentEntries.status, "published"), isNull(contentEntries.deletedAt)));
        for (const e of live) {
          await addRedirect(`/${old.slug}/${e.slug}`, `/${slug}/${e.slug}`, `Auto: ${old.namePlural} prefix changed`);
        }
        const terms = await db.select().from(contentTerms).where(eq(contentTerms.typeId, old.id));
        for (const t of terms) {
          const tax = taxonomies.find((x) => x.key === t.taxonomy);
          const oldTax = (old.taxonomies ?? []).find((x) => x.key === t.taxonomy);
          if (tax && oldTax) await addRedirect(`/${old.slug}/${oldTax.slug}/${t.slug}`, `/${slug}/${tax.slug}/${t.slug}`, "Auto: prefix changed");
        }
        redirected = live.length + 1;
        revalidatePath(`/${old.slug}`, "layout");
      }
      updateTag(TYPES_TAG);
      invalidateType(old.key, slug);
      return { id: old.id, key: old.key, slug, redirected };
    }

    const key = segment(input.key || name).replace(/-/g, "_");
    if (!key) throw new Error("Key is required.");
    const [keyClash] = await db.select({ id: contentTypes.id }).from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
    if (keyClash) throw new Error(`The key “${key}” is taken.`);
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${contentTypes.sortOrder}), 0)` }).from(contentTypes);
    const [res] = await db
      .insert(contentTypes)
      .values({ ...values, key, isSystem: false, sortOrder: Number(max) + 10 })
      .returning({ id: contentTypes.id });
    updateTag(TYPES_TAG);
    return { id: res.id, key, slug, redirected: 0 };
  });
}

export async function deleteContentTypeAction(id: number) {
  return run(async () => {
    await assertUser("types.manage");
    const type = await getType(id);
    if (type.isSystem) throw new Error(`${type.namePlural} is built in and can't be deleted. You can rename it or hide it instead.`);
    const [{ total }] = await db.select({ total: count() }).from(contentEntries).where(eq(contentEntries.typeId, id));
    if (total > 0) throw new Error(`Delete its ${total} entr${total === 1 ? "y" : "ies"} first.`);
    await db.delete(contentTerms).where(eq(contentTerms.typeId, id));
    await db.delete(contentTypes).where(eq(contentTypes.id, id));
    updateTag(TYPES_TAG);
    return {};
  });
}

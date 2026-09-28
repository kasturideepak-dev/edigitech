import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contentEntries, contentTerms, contentTypes, pages } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { defaultSupports, emptySeo } from "@/lib/types";
import { EntryEditor, emptyEntry, type EditableEntry } from "@/components/admin/EntryEditor";

type Props = PageProps<"/admin/content/[type]/[id]">;

async function load(key: string) {
  const [type] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  return type ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type: key, id } = await params;
  if (id === "new") return { title: "New entry" };
  const [row] = await db.select({ title: contentEntries.title }).from(contentEntries).where(eq(contentEntries.id, Number(id))).limit(1);
  return { title: row ? `Edit: ${row.title}` : `Edit ${key}` };
}

export default async function EditEntryPage({ params }: Props) {
  const user = await requireUser("pages.edit");
  const { type: key, id } = await params;
  const type = await load(key);
  if (!type) notFound();

  let entry: EditableEntry;
  if (id === "new") {
    entry = emptyEntry(user.name);
  } else {
    const [row] = await db
      .select()
      .from(contentEntries)
      .where(and(eq(contentEntries.id, Number(id)), eq(contentEntries.typeId, type.id)))
      .limit(1);
    if (!row) notFound();
    if (row.deletedAt) redirect(`/admin/content/${type.key}?status=trash`);
    entry = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      slugLocked: row.slugLocked,
      status: row.status,
      data: row.data ?? {},
      terms: row.terms ?? {},
      seo: { ...emptySeo(), ...row.seo },
      excerpt: row.excerpt,
      body: row.body,
      coverImage: row.coverImage,
      authorName: row.authorName,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      sortOrder: row.sortOrder,
    };
  }

  const [settings, termRows, allPages] = await Promise.all([
    loadSettings(),
    db
      .select({ taxonomy: contentTerms.taxonomy, slug: contentTerms.slug, name: contentTerms.name })
      .from(contentTerms)
      .where(eq(contentTerms.typeId, type.id))
      .orderBy(asc(contentTerms.sortOrder), asc(contentTerms.name)),
    db.select({ title: pages.title, slug: pages.slug, isHome: pages.isHome }).from(pages).where(isNull(pages.deletedAt)),
  ]);
  const terms: Record<string, { slug: string; name: string }[]> = {};
  for (const t of termRows) (terms[t.taxonomy] ??= []).push({ slug: t.slug, name: t.name });

  return (
    <EntryEditor
      type={{
        id: type.id,
        key: type.key,
        name: type.name,
        slug: type.slug,
        fields: type.fields ?? [],
        taxonomies: type.taxonomies ?? [],
        supports: { ...defaultSupports(), ...type.supports },
      }}
      entry={entry}
      terms={terms}
      canPublish={can(user.role, "pages.publish")}
      siteUrl={siteUrl()}
      siteName={settings.general.siteName}
      linkOptions={allPages.map((p) => ({ label: p.title, url: p.isHome ? "/" : `/${p.slug}` }))}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contentEntries, contentTypes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { defaultSupports } from "@/lib/types";
import { TypeEditor, type EditableType } from "@/components/admin/TypeEditor";

type Props = PageProps<"/admin/types/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === "new") return { title: "New content type" };
  const [t] = await db.select({ n: contentTypes.namePlural }).from(contentTypes).where(eq(contentTypes.id, Number(id))).limit(1);
  return { title: t ? `${t.n} · Content type` : "Content type" };
}

export default async function TypePage({ params }: Props) {
  await requireUser("types.manage");
  const { id } = await params;

  let initial: EditableType;
  if (id === "new") {
    initial = {
      key: "",
      name: "",
      namePlural: "",
      slug: "",
      description: "",
      icon: "FileText",
      hasArchive: true,
      archiveTitle: "",
      archiveIntro: "",
      perPage: 9,
      fields: [],
      taxonomies: [],
      supports: { ...defaultSupports(), excerpt: true, coverImage: true },
      active: true,
      isSystem: false,
      entryCount: 0,
      publishedCount: 0,
    };
  } else {
    const [t] = await db.select().from(contentTypes).where(eq(contentTypes.id, Number(id))).limit(1);
    if (!t) notFound();
    const [[all], [live]] = await Promise.all([
      db.select({ n: count() }).from(contentEntries).where(eq(contentEntries.typeId, t.id)),
      db
        .select({ n: count() })
        .from(contentEntries)
        .where(and(eq(contentEntries.typeId, t.id), eq(contentEntries.status, "published"), isNull(contentEntries.deletedAt))),
    ]);
    initial = {
      id: t.id,
      key: t.key,
      name: t.name,
      namePlural: t.namePlural,
      slug: t.slug,
      description: t.description,
      icon: t.icon,
      hasArchive: t.hasArchive,
      archiveTitle: t.archiveTitle,
      archiveIntro: t.archiveIntro,
      perPage: t.perPage,
      fields: t.fields ?? [],
      taxonomies: t.taxonomies ?? [],
      supports: { ...defaultSupports(), ...t.supports },
      active: t.active,
      isSystem: t.isSystem,
      entryCount: all?.n ?? 0,
      publishedCount: live?.n ?? 0,
    };
  }

  return <TypeEditor initial={initial} />;
}

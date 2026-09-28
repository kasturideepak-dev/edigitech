import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, ilike, isNotNull, isNull } from "drizzle-orm";
import { Plus, Settings2, Tags } from "lucide-react";
import { db } from "@/db";
import { contentEntries, contentTerms, contentTypes } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { Button, PageHeader } from "@/components/admin/ui";
import { EntriesTable } from "./EntriesTable";

async function loadType(key: string) {
  const [type] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  return type ?? null;
}

export async function generateMetadata({ params }: PageProps<"/admin/content/[type]">): Promise<Metadata> {
  const type = await loadType((await params).type);
  return { title: type?.namePlural ?? "Content" };
}

export default async function EntriesPage({ params, searchParams }: PageProps<"/admin/content/[type]">) {
  const user = await requireUser("pages.edit");
  const type = await loadType((await params).type);
  if (!type) notFound();

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const trash = status === "trash";

  const conds = [eq(contentEntries.typeId, type.id), trash ? isNotNull(contentEntries.deletedAt) : isNull(contentEntries.deletedAt)];
  if (q) conds.push(ilike(contentEntries.title, `%${q}%`));
  if (status === "published" || status === "draft") conds.push(eq(contentEntries.status, status));

  const tax = (type.taxonomies ?? [])[0];
  const [rows, terms] = await Promise.all([
    db
      .select({
        id: contentEntries.id,
        title: contentEntries.title,
        slug: contentEntries.slug,
        slugLocked: contentEntries.slugLocked,
        status: contentEntries.status,
        terms: contentEntries.terms,
        publishedAt: contentEntries.publishedAt,
        updatedAt: contentEntries.updatedAt,
      })
      .from(contentEntries)
      .where(and(...conds))
      .orderBy(asc(contentEntries.sortOrder), desc(contentEntries.updatedAt))
      .limit(500),
    tax
      ? db
          .select({ slug: contentTerms.slug, name: contentTerms.name })
          .from(contentTerms)
          .where(and(eq(contentTerms.typeId, type.id), eq(contentTerms.taxonomy, tax.key)))
      : Promise.resolve([]),
  ]);
  const termNames = Object.fromEntries(terms.map((t) => [t.slug, t.name]));

  return (
    <>
      <PageHeader
        title={type.namePlural}
        description={
          <>
            {type.description || `Manage your ${type.namePlural.toLowerCase()}.`}{" "}
            <span className="font-mono text-xs text-zinc-400">
              /{type.slug}
              {type.hasArchive ? "" : "/…"}
            </span>
          </>
        }
        actions={
          <>
            {can(user.role, "types.manage") && (
              <Link href={`/admin/types/${type.id}`}>
                <Button>
                  <Settings2 className="size-4" /> Type settings
                </Button>
              </Link>
            )}
            {(type.taxonomies ?? []).map((t) => (
              <Link key={t.key} href={`/admin/content/${type.key}/terms?taxonomy=${t.key}`}>
                <Button>
                  <Tags className="size-4" /> {t.namePlural}
                </Button>
              </Link>
            ))}
            <Link href={`/admin/content/${type.key}/new`}>
              <Button variant="primary">
                <Plus className="size-4" /> New {type.name.toLowerCase()}
              </Button>
            </Link>
          </>
        }
      />
      <EntriesTable
        type={{ key: type.key, slug: type.slug, name: type.name, namePlural: type.namePlural, taxonomyName: tax?.name ?? null, taxonomyKey: tax?.key ?? null }}
        rows={rows.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          slugLocked: r.slugLocked,
          status: r.status,
          termLabel: tax ? (r.terms?.[tax.key] ?? []).map((s) => termNames[s] ?? s).join(", ") : "",
          publishedAt: r.publishedAt?.toISOString() ?? null,
          updatedAt: r.updatedAt.toISOString(),
        }))}
        filters={{ q, status }}
        canDelete={can(user.role, "pages.delete")}
      />
    </>
  );
}

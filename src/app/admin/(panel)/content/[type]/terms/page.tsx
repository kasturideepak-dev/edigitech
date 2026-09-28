import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { contentEntries, contentTerms, contentTypes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Button, PageHeader } from "@/components/admin/ui";
import { TermsManager } from "./TermsManager";

export const metadata: Metadata = { title: "Taxonomy" };

export default async function TermsPage({ params, searchParams }: PageProps<"/admin/content/[type]/terms">) {
  await requireUser("pages.edit");
  const { type: key } = await params;
  const sp = await searchParams;
  const [type] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  if (!type) notFound();
  const taxonomies = type.taxonomies ?? [];
  const tax = taxonomies.find((t) => t.key === sp.taxonomy) ?? taxonomies[0];
  if (!tax) notFound();

  const terms = await db
    .select()
    .from(contentTerms)
    .where(and(eq(contentTerms.typeId, type.id), eq(contentTerms.taxonomy, tax.key)))
    .orderBy(asc(contentTerms.sortOrder), asc(contentTerms.name));

  const rows = await Promise.all(
    terms.map(async (t) => {
      const [c] = await db
        .select({ total: count() })
        .from(contentEntries)
        .where(
          and(
            eq(contentEntries.typeId, type.id),
            isNull(contentEntries.deletedAt),
            sql`${contentEntries.terms} -> ${tax.key} @> ${JSON.stringify([t.slug])}::jsonb`,
          ),
        );
      return { id: t.id, name: t.name, slug: t.slug, description: t.description, total: c?.total ?? 0 };
    }),
  );

  return (
    <>
      <PageHeader
        title={`${type.namePlural} · ${tax.namePlural}`}
        description={`Each ${type.name.toLowerCase()} can be filed under ${tax.multiple ? "several" : "one"} ${tax.name.toLowerCase()}${tax.multiple ? "" : ""}. Each gets its own page.`}
        actions={
          <Link href={`/admin/content/${type.key}`}>
            <Button>
              <ArrowLeft className="size-4" /> Back to {type.namePlural}
            </Button>
          </Link>
        }
      />
      <TermsManager
        rows={rows}
        typeId={type.id}
        prefix={`/${type.slug}/${tax.slug}/`}
        taxonomy={{ key: tax.key, name: tax.name, namePlural: tax.namePlural }}
        entryNoun={type.name.toLowerCase()}
      />
    </>
  );
}

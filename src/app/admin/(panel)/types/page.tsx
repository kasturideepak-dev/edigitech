import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq, isNull, and } from "drizzle-orm";
import { ArrowRight, Plus } from "lucide-react";
import { db } from "@/db";
import { contentEntries, contentTypes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Badge, Button, PageHeader } from "@/components/admin/ui";
import { TypeIcon } from "@/components/admin/type-icons";

export const metadata: Metadata = { title: "Content types" };

export default async function TypesPage() {
  await requireUser("types.manage");
  const types = await db.select().from(contentTypes).orderBy(asc(contentTypes.sortOrder));
  const counts = await db
    .select({ typeId: contentEntries.typeId, n: count() })
    .from(contentEntries)
    .where(and(isNull(contentEntries.deletedAt), eq(contentEntries.status, "published")))
    .groupBy(contentEntries.typeId);
  const live = new Map(counts.map((c) => [c.typeId, c.n]));

  return (
    <>
      <PageHeader
        title="Content types"
        description="The kinds of content on your site. Create your own — with its own fields and URL — without a developer."
        actions={
          <Link href="/admin/types/new">
            <Button variant="primary">
              <Plus className="size-4" /> New content type
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => {
          return (
            <Link
              key={t.id}
              href={`/admin/types/${t.id}`}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <TypeIcon name={t.icon} className="size-5" />
                </span>
                <div className="flex gap-1">
                  {t.isSystem && <Badge tone="blue">Built-in</Badge>}
                  {!t.active && <Badge tone="amber">Hidden</Badge>}
                </div>
              </div>
              <h2 className="font-semibold">{t.namePlural}</h2>
              <p className="font-mono text-xs text-zinc-500">/{t.slug}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-500">{t.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {(t.fields ?? []).length} field{(t.fields ?? []).length === 1 ? "" : "s"} · {live.get(t.id) ?? 0} published
                </span>
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
        <Link
          href="/admin/types/new"
          className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-5 text-sm text-zinc-500 transition hover:border-zinc-500 hover:text-zinc-800"
        >
          <Plus className="size-6" />
          Create a content type
          <span className="text-xs text-zinc-400">e.g. Case Studies, Team, FAQs, Testimonials</span>
        </Link>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { and, desc, eq, isNotNull, isNull, like, or } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { PagesTable } from "./PagesTable";
import { NewPageButton } from "./NewPageButton";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage({ searchParams }: PageProps<"/admin/pages">) {
  const user = await requireUser("pages.edit");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const trash = status === "trash";

  const conds = [trash ? isNotNull(pages.deletedAt) : isNull(pages.deletedAt)];
  if (q) conds.push(or(like(pages.title, `%${q}%`), like(pages.slug, `%${q}%`))!);
  if (type) conds.push(eq(pages.pageType, type));
  if (status === "published" || status === "draft") conds.push(eq(pages.status, status));
  if (status === "pending") conds.push(eq(pages.hasUnpublishedChanges, true));

  const rows = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      pageType: pages.pageType,
      status: pages.status,
      isHome: pages.isHome,
      hasUnpublishedChanges: pages.hasUnpublishedChanges,
      updatedAt: pages.updatedAt,
      deletedAt: pages.deletedAt,
    })
    .from(pages)
    .where(and(...conds))
    .orderBy(desc(pages.isHome), desc(pages.updatedAt))
    .limit(500);

  return (
    <>
      <PageHeader
        title="Pages"
        description="Homepage, service pages, product and location landing pages."
        actions={<NewPageButton autoOpen={sp.new === "1"} />}
      />
      <PagesTable
        rows={rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString(), deletedAt: r.deletedAt?.toISOString() ?? null }))}
        filters={{ q, type, status }}
        canDelete={can(user.role, "pages.delete")}
        canSetHome={can(user.role, "settings.manage")}
      />
    </>
  );
}

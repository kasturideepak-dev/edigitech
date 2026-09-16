import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { PageBuilder } from "@/components/admin/PageBuilder";

export async function generateMetadata({ params }: PageProps<"/admin/pages/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [row] = await db.select({ title: pages.title }).from(pages).where(eq(pages.id, Number(id))).limit(1);
  return { title: row ? `Edit: ${row.title}` : "Edit page" };
}

export default async function EditPage({ params }: PageProps<"/admin/pages/[id]">) {
  const user = await requireUser("pages.edit");
  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, Number(id))).limit(1);
  if (!page) notFound();
  if (page.deletedAt) redirect("/admin/pages?status=trash");

  const [settings, all] = await Promise.all([
    loadSettings(),
    db
      .select({ title: pages.title, slug: pages.slug, isHome: pages.isHome })
      .from(pages)
      .where(and(isNull(pages.deletedAt)))
      .orderBy(asc(pages.title)),
  ]);

  return (
    <PageBuilder
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        pageType: page.pageType,
        template: page.template,
        status: page.status,
        isHome: page.isHome,
        hasUnpublishedChanges: page.hasUnpublishedChanges,
        draft: page.draft,
        updatedAt: page.updatedAt.toISOString(),
      }}
      canPublish={can(user.role, "pages.publish")}
      seoOnly={user.role === "seo"}
      siteUrl={siteUrl()}
      siteName={settings.general.siteName}
      linkOptions={all.map((p) => ({ label: p.title, url: p.isHome ? "/" : `/${p.slug}` }))}
    />
  );
}

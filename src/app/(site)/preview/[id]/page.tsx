import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { RenderSections } from "@/blocks/render";
import { getCurrentUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { pagePath } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

// Draft preview for signed-in editors: renders the working copy, not the published one.
export default async function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, Number(id))).limit(1);
  if (!page) notFound();
  const settings = await loadSettings();

  return (
    <>
      <div className="ed-preview-bar">
        <span>Preview · {page.title} · {page.hasUnpublishedChanges ? "unpublished changes" : "up to date"}</span>
        <a href={`/admin/pages/${page.id}`}>Back to editor</a>
        {page.status === "published" && <a href={pagePath(page.isHome ? "" : page.slug)}>View live</a>}
      </div>
      <RenderSections sections={page.draft.sections} ctx={{ settings }} />
    </>
  );
}

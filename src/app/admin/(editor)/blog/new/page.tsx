import type { Metadata } from "next";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories, pages } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { PostEditor, emptyPost } from "@/components/admin/PostEditor";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const user = await requireUser("pages.edit");
  const [settings, cats, allPages] = await Promise.all([
    loadSettings(),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ title: pages.title, slug: pages.slug, isHome: pages.isHome }).from(pages).where(isNull(pages.deletedAt)),
  ]);
  return (
    <PostEditor
      post={emptyPost(user.name)}
      categories={cats}
      canPublish={can(user.role, "pages.publish")}
      siteUrl={siteUrl()}
      siteName={settings.general.siteName}
      linkOptions={allPages.map((p) => ({ label: p.title, url: p.isHome ? "/" : `/${p.slug}` }))}
    />
  );
}

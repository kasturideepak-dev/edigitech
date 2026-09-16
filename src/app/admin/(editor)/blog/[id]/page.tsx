import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories, pages, posts } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { emptySeo } from "@/lib/types";
import { PostEditor } from "@/components/admin/PostEditor";

export async function generateMetadata({ params }: PageProps<"/admin/blog/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [row] = await db.select({ title: posts.title }).from(posts).where(eq(posts.id, Number(id))).limit(1);
  return { title: row ? `Edit: ${row.title}` : "Edit post" };
}

export default async function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  const user = await requireUser("pages.edit");
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, Number(id))).limit(1);
  if (!post) notFound();
  if (post.deletedAt) redirect("/admin/blog?status=trash");

  const [settings, cats, allPages] = await Promise.all([
    loadSettings(),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ title: pages.title, slug: pages.slug, isHome: pages.isHome }).from(pages).where(isNull(pages.deletedAt)),
  ]);

  return (
    <PostEditor
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        body: post.body,
        categoryId: post.categoryId,
        authorName: post.authorName,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        seo: { ...emptySeo(), ...post.seo },
      }}
      categories={cats}
      canPublish={can(user.role, "pages.publish")}
      siteUrl={siteUrl()}
      siteName={settings.general.siteName}
      linkOptions={allPages.map((p) => ({ label: p.title, url: p.isHome ? "/" : `/${p.slug}` }))}
    />
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, isNotNull, isNull, like } from "drizzle-orm";
import { Plus, Tags } from "lucide-react";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { Button, PageHeader } from "@/components/admin/ui";
import { PostsTable } from "./PostsTable";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage({ searchParams }: PageProps<"/admin/blog">) {
  const user = await requireUser("pages.edit");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const trash = status === "trash";

  const conds = [trash ? isNotNull(posts.deletedAt) : isNull(posts.deletedAt)];
  if (q) conds.push(like(posts.title, `%${q}%`));
  if (status === "published" || status === "draft") conds.push(eq(posts.status, status));

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      authorName: posts.authorName,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(...conds))
    .orderBy(desc(posts.updatedAt))
    .limit(300);

  return (
    <>
      <PageHeader
        title="Blog"
        description="Articles shown at /blog and in the homepage blog section."
        actions={
          <>
            <Link href="/admin/blog/categories">
              <Button>
                <Tags className="size-4" /> Categories
              </Button>
            </Link>
            <Link href="/admin/blog/new">
              <Button variant="primary">
                <Plus className="size-4" /> New post
              </Button>
            </Link>
          </>
        }
      />
      <PostsTable
        rows={rows.map((r) => ({
          ...r,
          publishedAt: r.publishedAt?.toISOString() ?? null,
          updatedAt: r.updatedAt.toISOString(),
        }))}
        filters={{ q, status }}
        canDelete={can(user.role, "pages.delete")}
      />
    </>
  );
}

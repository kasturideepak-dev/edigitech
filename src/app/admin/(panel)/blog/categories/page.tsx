import type { Metadata } from "next";
import { asc, count, eq, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoriesManager } from "./CategoriesManager";

export const metadata: Metadata = { title: "Blog categories" };

export default async function CategoriesPage() {
  await requireUser("pages.edit");
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      total: count(posts.id),
    })
    .from(categories)
    .leftJoin(posts, and(eq(posts.categoryId, categories.id), isNull(posts.deletedAt)))
    .groupBy(categories.id, categories.name, categories.slug, categories.description)
    .orderBy(asc(categories.name));
  return (
    <>
      <PageHeader title="Blog categories" description="Each post can belong to one category. Categories get their own page at /blog/category/…" />
      <CategoriesManager rows={rows} />
    </>
  );
}

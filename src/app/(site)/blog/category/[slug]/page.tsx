import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, listCategoriesWithCounts, listPosts } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { BlogHero, CategoryNav, Pagination, PostCardItem } from "@/components/site/BlogParts";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([getCategory(slug), getSettings()]);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const title = `${category.name} articles | ${settings.general.siteName}`;
  const description = category.description || `Articles about ${category.name} from the ${settings.general.siteName} team.`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(`/blog/category/${slug}`) },
    robots: { index: settings.seo.allowIndexing, follow: settings.seo.allowIndexing },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : 1) || 1);
  const category = await getCategory(slug);
  if (!category) notFound();
  const [{ posts, pages }, categories] = await Promise.all([
    listPosts({ page, categorySlug: slug }),
    listCategoriesWithCounts(),
  ]);

  return (
    <>
      <BlogHero
        title={`${category.name}.`}
        intro={category.description || undefined}
        breadcrumb={[{ label: "Home", url: "/" }, { label: "Blog", url: "/blog" }, { label: category.name }]}
      />
      <div className="tp-blog-area pt-140 pb-90">
        <div className="container">
          <CategoryNav categories={categories} active={slug} />
          {posts.length === 0 ? (
            <p className="fs-20 tp-text-grey-1 pb-100">No articles in this category yet.</p>
          ) : (
            <div className="row">
              {posts.map((p, i) => (
                <div className="col-lg-4 col-md-6" key={p.id}>
                  <PostCardItem post={p} index={i} />
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} basePath={`/blog/category/${slug}`} />
        </div>
      </div>
    </>
  );
}

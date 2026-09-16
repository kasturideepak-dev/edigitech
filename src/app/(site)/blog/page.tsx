import type { Metadata } from "next";
import { listCategoriesWithCounts, listPosts } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { BlogHero, CategoryNav, Pagination, PostCardItem } from "@/components/site/BlogParts";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `Blog | ${settings.general.siteName}`;
  const description =
    "Practical articles on websites, mobile apps, SEO, social media and WhatsApp marketing from the eDigiTech team.";
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl("/blog") },
    robots: { index: settings.seo.allowIndexing, follow: settings.seo.allowIndexing },
    openGraph: { type: "website", url: absoluteUrl("/blog"), title, description, siteName: settings.general.siteName },
  };
}

export default async function BlogIndex({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : 1) || 1);
  const [{ posts, pages }, categories] = await Promise.all([listPosts({ page }), listCategoriesWithCounts()]);

  return (
    <>
      <BlogHero
        title="Latest News & Insights."
        intro="Practical articles on websites, apps, SEO, social media and WhatsApp marketing — written by the team that builds and runs them."
        breadcrumb={[{ label: "Home", url: "/" }, { label: "Blog" }]}
      />
      <div className="tp-blog-area pt-140 pb-90">
        <div className="container">
          <CategoryNav categories={categories} />
          {posts.length === 0 ? (
            <p className="fs-20 tp-text-grey-1 pb-100">No articles published yet. Please check back soon.</p>
          ) : (
            <div className="row">
              {posts.map((p, i) => (
                <div className="col-lg-4 col-md-6" key={p.id}>
                  <PostCardItem post={p} index={i} />
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} basePath="/blog" />
        </div>
      </div>
    </>
  );
}

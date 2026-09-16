import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPostDate, getPost } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { BlogHero, PostCardItem } from "@/components/site/BlogParts";
import { SwitchButton } from "@/components/site/Icon";
import { socialIconClass } from "@/blocks/common-fields";

export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [data, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!data) return { title: "Article not found", robots: { index: false } };
  const { post } = data;
  const title = post.seo.metaTitle || `${post.title} | ${settings.general.siteName}`;
  const description = post.seo.metaDescription || post.excerpt;
  const image = post.seo.ogImage?.url || post.coverImage?.url || settings.seo.defaultOgImage?.url;
  const url = absoluteUrl(`/blog/${post.slug}`);
  const index = settings.seo.allowIndexing && !post.seo.noindex;
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    keywords: post.seo.focusKeyword ? [post.seo.focusKeyword] : undefined,
    alternates: { canonical: post.seo.canonical ? absoluteUrl(post.seo.canonical) : url },
    robots: { index, follow: index && !post.seo.nofollow },
    openGraph: {
      type: "article",
      url,
      title: post.seo.ogTitle || title,
      description: post.seo.ogDescription || description,
      siteName: settings.general.siteName,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.seo.ogTitle || title,
      description: post.seo.ogDescription || description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  const { post, related } = data;
  const settings = await getSettings();
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.coverImage?.url ? absoluteUrl(post.coverImage.url) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt || post.seo.metaDescription || undefined,
        image,
        datePublished: post.publishedAt ?? undefined,
        dateModified: post.updatedAt,
        author: { "@type": post.authorName ? "Person" : "Organization", name: post.authorName || settings.general.siteName },
        publisher: { "@id": `${siteUrl()}/#organization` },
        mainEntityOfPage: url,
        articleSection: post.category?.name,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  const share = [
    { platform: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { platform: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { platform: "whatsapp", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} ${url}`)}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <BlogHero
        title={post.title}
        breadcrumb={[{ label: "Home", url: "/" }, { label: "Blog", url: "/blog" }, { label: post.category?.name ?? "Article" }]}
      />
      <div className="tp-blog-details-area pt-90 pb-90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="tp-postbox-wrapper mb-50">
                <div className="tp-blog-details-link-wrap mb-25">
                  <div className="tp-blog-details-dates mr-20 mb-10">
                    {post.category && <span>{post.category.name}</span>}
                    {post.category && <span className="borders"></span>}
                    <span>{formatPostDate(post.publishedAt)}</span>
                    <span className="borders"></span>
                    <span>{post.readMinutes} min read</span>
                    {post.authorName && (
                      <>
                        <span className="borders"></span>
                        <span>By {post.authorName}</span>
                      </>
                    )}
                  </div>
                  <div className="tp-blog-details-link mb-10">
                    {share.map((s) => (
                      <a key={s.platform} href={s.href} target="_blank" rel="noopener" aria-label={`Share on ${s.platform}`}>
                        <i className={socialIconClass(s.platform)}></i>
                      </a>
                    ))}
                  </div>
                </div>
                {post.coverImage?.url && (
                  <div className="ed-post-cover mb-50">
                    <img className="w-100" src={post.coverImage.url} alt={post.coverImage.alt || post.title} />
                  </div>
                )}
                <div className="tp-blog-details-content ed-post-body" dangerouslySetInnerHTML={{ __html: post.body }} />
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="ed-related pt-70">
              <h2 className="tp-section-title fs-50 fs-lg-40 fw-700 text-uppercase mb-50">Related articles</h2>
              <div className="row">
                {related.map((p, i) => (
                  <div className="col-lg-4 col-md-6" key={p.id}>
                    <PostCardItem post={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pb-40">
            <SwitchButton
              href="/blog"
              label="All Articles"
              className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-theme-primary text-uppercase ls-0 tp-btn-switch-animation tp-ff-heading fw-500"
            />
          </div>
        </div>
      </div>
    </>
  );
}

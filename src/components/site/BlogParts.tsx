import type { PostCard } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";

const FADE_FROM = ["left", "bottom", "right"];

/** Article card used on the blog listing, category pages and related posts. */
export function PostCardItem({ post, index = 0 }: { post: PostCard; index?: number }) {
  return (
    <div
      className="tp-blog-item tp--hover-item mb-60 tp_fade_anim"
      data-delay=".4"
      data-fade-from={FADE_FROM[index % 3]}
      data-ease="bounce"
    >
      <a href={`/blog/${post.slug}`} className="tp-blog-thumb d-block mb-30 p-relative fix d-inline-block">
        <div
          className="tp--hover-img"
          data-displacement="/assets/img/imghover/strip.png"
          data-intensity="0.2"
          data-speedin="1"
          data-speedout="1"
        >
          {post.coverImage?.url ? (
            <img className="w-100" src={post.coverImage.url} alt={post.coverImage.alt || post.title} loading="lazy" />
          ) : (
            <span className="ed-blog-thumb-empty" />
          )}
        </div>
      </a>
      <div className="tp-blog-content text-center">
        <div className="tp-blog-meta mb-15">
          {post.category && <span>{post.category.name}</span>}
          {post.category && post.publishedAt && <span className="borders"></span>}
          {post.publishedAt && <span>{formatPostDate(post.publishedAt)}</span>}
        </div>
        <h3 className="fs-25">
          <a className="underline-black" href={`/blog/${post.slug}`}>
            {post.title}
          </a>
        </h3>
      </div>
    </div>
  );
}

/** Page hero used by the blog listing, category and post pages. */
export function BlogHero({
  title,
  intro,
  breadcrumb,
}: {
  title: string;
  intro?: string;
  breadcrumb: { label: string; url?: string }[];
}) {
  return (
    <div className="tp-service-hero-area tp-service-hero-spacing p-relative z-index-1">
      <div className="container">
        <div className="row pb-45">
          <div className="col-lg-7">
            <div className="tp-service-hero-left p-relative z-index-1 mb-40">
              <h1 className="fs-70 fs-lg-60 fs-xs-40">{title}</h1>
            </div>
          </div>
          {intro && (
            <div className="col-lg-5">
              <div className="tp-service-hero-right mt-135">
                <p className="fs-20 lh-140-per">{intro}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="tp-breadcrumb-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="tp-breadcrumb-list">
                <ul>
                  {breadcrumb.map((b, i) => (
                    <li key={i}>
                      {b.url ? <a href={b.url}>{b.label}</a> : b.label}
                      {i < breadcrumb.length - 1 && <span className="ed-crumb-sep"></span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryNav({
  categories,
  active,
}: {
  categories: { name: string; slug: string; total: number }[];
  active?: string;
}) {
  if (!categories.length) return null;
  return (
    <div className="ed-category-nav mb-50">
      <a className={`ed-category-pill${active ? "" : " is-active"}`} href="/blog">
        All
      </a>
      {categories.map((c) => (
        <a
          key={c.slug}
          className={`ed-category-pill${active === c.slug ? " is-active" : ""}`}
          href={`/blog/category/${c.slug}`}
        >
          {c.name} <span>{c.total}</span>
        </a>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, basePath }: { page: number; pages: number; basePath: string }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  return (
    <nav className="ed-pagination" aria-label="Blog pages">
      {page > 1 && (
        <a className="ed-page-link" href={href(page - 1)}>
          Previous
        </a>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <a key={n} className={`ed-page-link${n === page ? " is-active" : ""}`} href={href(n)} aria-current={n === page ? "page" : undefined}>
          {n}
        </a>
      ))}
      {page < pages && (
        <a className="ed-page-link" href={href(page + 1)}>
          Next
        </a>
      )}
    </nav>
  );
}

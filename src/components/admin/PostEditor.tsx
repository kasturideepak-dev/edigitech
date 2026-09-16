"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Search, Settings2 } from "lucide-react";
import { savePostAction, type PostInput } from "@/app/admin/actions/blog";
import type { SeoFields, PageContent } from "@/lib/types";
import { emptySeo } from "@/lib/types";
import { FieldInput, LinkOptionsContext } from "./fields";
import { RichText } from "./RichText";
import { SeoPanel } from "./SeoPanel";
import { Badge, Button, Input, Label, Select, Textarea, cx, useToast } from "./ui";

export type EditablePost = {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; alt?: string } | null;
  body: string;
  categoryId: number | null;
  authorName: string;
  status: "draft" | "published";
  publishedAt: string | null;
  seo: SeoFields;
};

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function PostEditor({
  post,
  categories,
  canPublish,
  siteUrl,
  siteName,
  linkOptions,
}: {
  post: EditablePost;
  categories: { id: number; name: string }[];
  canPublish: boolean;
  siteUrl: string;
  siteName: string;
  linkOptions: { label: string; url: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState(post);
  const [slugTouched, setSlugTouched] = useState(!!post.slug);
  const [tab, setTab] = useState<"content" | "seo" | "settings">("content");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");

  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) => {
    setP((cur) => ({ ...cur, [k]: v }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useCallback(
    async (publish = false) => {
      setBusy(publish ? "publish" : "save");
      const input: PostInput = {
        id: p.id ?? undefined,
        title: p.title,
        slug: p.slug || toSlug(p.title),
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        body: p.body,
        categoryId: p.categoryId,
        authorName: p.authorName,
        publishedAt: p.publishedAt,
        seo: p.seo,
      };
      const res = await savePostAction(input, { publish });
      setBusy("");
      if (!res.ok) return toast("error", res.error), false;
      setDirty(false);
      toast("success", publish ? "Post published." : "Draft saved.");
      if (!p.id) router.replace(`/admin/blog/${res.id}`);
      else router.refresh();
      setP((cur) => ({ ...cur, id: res.id, slug: res.slug, status: publish ? "published" : cur.status }));
      return true;
    },
    [p, router, toast],
  );

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The SEO panel scores page sections; for a post we hand it the title and body text.
  const seoContent: PageContent = {
    sections: [
      {
        id: "post",
        type: "hero",
        visible: true,
        data: { title: p.title, subtitle: p.excerpt, body: p.body, image: p.coverImage },
      },
    ],
    seo: p.seo,
  };

  return (
    <LinkOptionsContext.Provider value={linkOptions}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5">
          <Link href="/admin/blog" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="All posts">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{p.title || "Untitled post"}</h1>
              {p.status === "published" ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
              {dirty && <span className="text-xs text-amber-600">● Unsaved</span>}
            </div>
            <span className="text-xs text-zinc-500">
              {siteUrl.replace(/^https?:\/\//, "")}/blog/{p.slug || toSlug(p.title) || "…"}
            </span>
          </div>
          {p.status === "published" && p.id && (
            <a href={`/blog/${p.slug}`} target="_blank" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="View live">
              <ExternalLink className="size-5" />
            </a>
          )}
          <Button onClick={() => save(false)} loading={busy === "save"} disabled={!!busy || !p.title.trim()}>
            Save draft
          </Button>
          {canPublish && (
            <Button variant="brand" onClick={() => save(true)} loading={busy === "publish"} disabled={!!busy || !p.title.trim()}>
              {p.status === "published" ? "Update post" : "Publish"}
            </Button>
          )}
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <div className="mb-5 flex gap-1 border-b border-zinc-200 text-sm">
            {(
              [
                ["content", "Content", <FileText key="i" className="size-4" />],
                ["seo", "SEO", <Search key="i" className="size-4" />],
                ["settings", "Settings", <Settings2 key="i" className="size-4" />],
              ] as const
            ).map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cx(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 font-medium",
                  tab === key ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800",
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {tab === "content" && (
            <div className="space-y-5">
              <div>
                <Label required>Title</Label>
                <Input
                  value={p.title}
                  placeholder="How WhatsApp marketing lifts repeat orders"
                  className="h-12 text-lg"
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", toSlug(e.target.value));
                  }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label help="Shown on cards and in search results.">Excerpt</Label>
                  <Textarea rows={3} value={p.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
                </div>
                <FieldInput
                  field={{ type: "image", name: "cover", label: "Cover image", help: "Used on cards and at the top of the post." }}
                  value={p.coverImage}
                  onChange={(v) => set("coverImage", v as EditablePost["coverImage"])}
                />
              </div>
              <div>
                <Label required>Article</Label>
                <RichText value={p.body} onChange={(html) => set("body", html)} />
              </div>
            </div>
          )}

          {tab === "seo" && (
            <SeoPanel
              content={seoContent}
              slug={`blog/${p.slug}`}
              title={p.title}
              siteUrl={siteUrl}
              siteName={siteName}
              onChange={(seo) => set("seo", seo)}
            />
          )}

          {tab === "settings" && (
            <div className="max-w-xl space-y-4">
              <div>
                <Label help="Lowercase letters, numbers and hyphens.">URL</Label>
                <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                  /blog/
                  <input
                    className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none"
                    value={p.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={p.categoryId ?? ""}
                  onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-zinc-500">
                  Manage the list under <Link href="/admin/blog/categories" className="underline">Categories</Link>.
                </p>
              </div>
              <div>
                <Label>Author name</Label>
                <Input value={p.authorName} onChange={(e) => set("authorName", e.target.value)} />
              </div>
              <div>
                <Label help="Leave empty to use the moment you publish.">Publish date</Label>
                <Input
                  type="datetime-local"
                  value={p.publishedAt ? p.publishedAt.slice(0, 16) : ""}
                  onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </LinkOptionsContext.Provider>
  );
}

export const emptyPost = (author: string): EditablePost => ({
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  coverImage: null,
  body: "",
  categoryId: null,
  authorName: author,
  status: "draft",
  publishedAt: null,
  seo: emptySeo(),
});

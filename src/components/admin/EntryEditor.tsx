"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Lock, Search, Settings2, Unlock } from "lucide-react";
import { saveEntryAction, type EntryInput } from "@/app/admin/actions/content";
import type { ContentTypeSupports, EntryData, EntryTerms, Field, ImageValue, PageContent, SeoFields, TaxonomyDef } from "@/lib/types";
import { emptySeo } from "@/lib/types";
import { FieldGroup, FieldInput, LinkOptionsContext } from "./fields";
import { RichText } from "./RichText";
import { SeoPanel } from "./SeoPanel";
import { Badge, Button, Card, Input, Label, Select, Textarea, cx, useToast } from "./ui";

export type EditableEntry = {
  id: number | null;
  title: string;
  slug: string;
  slugLocked: boolean;
  status: "draft" | "published";
  data: EntryData;
  terms: EntryTerms;
  seo: SeoFields;
  excerpt: string;
  body: string;
  coverImage: ImageValue | null;
  authorName: string;
  publishedAt: string | null;
  sortOrder: number;
};

export type EditorType = {
  id: number;
  key: string;
  name: string;
  slug: string;
  fields: Field[];
  taxonomies: TaxonomyDef[];
  supports: ContentTypeSupports;
};

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Pulls readable text out of field values so the SEO checklist can score them. */
function textOf(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(textOf).join(" ");
  if (v && typeof v === "object") return Object.values(v).map(textOf).join(" ");
  return "";
}

export function EntryEditor({
  type,
  entry,
  terms,
  canPublish,
  siteUrl,
  siteName,
  linkOptions,
}: {
  type: EditorType;
  entry: EditableEntry;
  /** taxonomy key → available terms */
  terms: Record<string, { slug: string; name: string }[]>;
  canPublish: boolean;
  siteUrl: string;
  siteName: string;
  linkOptions: { label: string; url: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [e, setE] = useState(entry);
  // New entries follow the title until the slug is edited; existing ones never auto-change.
  const [slugTouched, setSlugTouched] = useState(!!entry.id || entry.slugLocked);
  const [tab, setTab] = useState<"content" | "seo" | "settings">("content");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "unpublish">("");
  const s = type.supports;
  const noun = type.name.toLowerCase();
  const base = `/admin/content/${type.key}`;

  const set = <K extends keyof EditableEntry>(k: K, v: EditableEntry[K]) => {
    setE((cur) => ({ ...cur, [k]: v }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const h = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useCallback(
    async (mode: "save" | "publish" | "unpublish" = "save") => {
      setBusy(mode);
      const input: EntryInput = {
        id: e.id ?? undefined,
        typeId: type.id,
        title: e.title,
        slug: e.slug || toSlug(e.title),
        data: e.data,
        terms: e.terms,
        seo: e.seo,
        excerpt: e.excerpt,
        body: e.body,
        coverImage: e.coverImage,
        authorName: e.authorName,
        publishedAt: e.publishedAt,
        sortOrder: e.sortOrder,
      };
      const res = await saveEntryAction(input, { publish: mode === "publish", unpublish: mode === "unpublish" });
      setBusy("");
      if (!res.ok) return toast("error", res.error), false;
      setDirty(false);
      toast("success", mode === "publish" ? "Published." : mode === "unpublish" ? "Unpublished — now a draft." : "Draft saved.");
      const slugChanged = !!e.id && res.slug !== entry.slug;
      setE((cur) => ({
        ...cur,
        id: res.id,
        slug: res.slug,
        slugLocked: cur.slugLocked || slugChanged,
        status: mode === "publish" ? "published" : mode === "unpublish" ? "draft" : cur.status,
      }));
      if (!e.id) router.replace(`${base}/${res.id}`);
      else router.refresh();
      return true;
    },
    [e, entry.slug, type.id, base, router, toast],
  );

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        saveRef.current("save");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The SEO panel scores page sections; hand it the entry's text.
  const seoContent: PageContent = {
    sections: [
      {
        id: "entry",
        type: "hero",
        visible: true,
        data: { title: e.title, subtitle: e.excerpt, body: `${e.body} ${textOf(e.data)}`, image: e.coverImage ?? e.data?.image },
      },
    ],
    seo: e.seo,
  };

  const setTerm = (tax: TaxonomyDef, slugs: string[]) => set("terms", { ...e.terms, [tax.key]: slugs });
  const liveUrl = `/${type.slug}/${e.slug}`;
  const slugChanged = !!entry.id && e.slug !== entry.slug;

  return (
    <LinkOptionsContext.Provider value={linkOptions}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5">
          <Link href={base} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title={`All ${noun}s`}>
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{e.title || `Untitled ${noun}`}</h1>
              {e.status === "published" ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
              {dirty && <span className="text-xs text-amber-600">● Unsaved</span>}
            </div>
            <span className="text-xs text-zinc-500">
              {siteUrl.replace(/^https?:\/\//, "")}/{type.slug}/{e.slug || toSlug(e.title) || "…"}
            </span>
          </div>
          {e.status === "published" && e.id && (
            <a href={liveUrl} target="_blank" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="View live">
              <ExternalLink className="size-5" />
            </a>
          )}
          {canPublish && e.status === "published" && (
            <Button variant="ghost" onClick={() => save("unpublish")} loading={busy === "unpublish"} disabled={!!busy}>
              Unpublish
            </Button>
          )}
          <Button onClick={() => save("save")} loading={busy === "save"} disabled={!!busy || !e.title.trim()}>
            Save draft
          </Button>
          {canPublish && (
            <Button variant="brand" onClick={() => save("publish")} loading={busy === "publish"} disabled={!!busy || !e.title.trim()}>
              {e.status === "published" ? "Update" : "Publish"}
            </Button>
          )}
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <div className="mb-5 flex gap-1 border-b border-zinc-200 text-sm">
            {(
              [
                ["content", "Content", <FileText key="i" className="size-4" />],
                ...(s.seo ? ([["seo", "SEO", <Search key="i" className="size-4" />]] as const) : []),
                ["settings", "URL & settings", <Settings2 key="i" className="size-4" />],
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
                  value={e.title}
                  className="h-12 text-lg"
                  onChange={(ev) => {
                    set("title", ev.target.value);
                    if (!slugTouched) set("slug", toSlug(ev.target.value));
                  }}
                />
              </div>

              {(s.excerpt || s.coverImage) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.excerpt && (
                    <div>
                      <Label help="Shown on cards and in search results.">Excerpt</Label>
                      <Textarea rows={3} value={e.excerpt} onChange={(ev) => set("excerpt", ev.target.value)} />
                    </div>
                  )}
                  {s.coverImage && (
                    <FieldInput
                      field={{ type: "image", name: "cover", label: "Cover image", help: "Used on cards and at the top of the page." }}
                      value={e.coverImage}
                      onChange={(v) => set("coverImage", v as ImageValue | null)}
                    />
                  )}
                </div>
              )}

              {type.fields.length > 0 && (
                <Card title={`${type.name} details`}>
                  <div className="p-5">
                    <FieldGroup fields={type.fields} value={e.data} onChange={(v) => set("data", v)} />
                  </div>
                </Card>
              )}

              {s.body && (
                <div>
                  <Label>Body</Label>
                  <RichText value={e.body} onChange={(html) => set("body", html)} />
                </div>
              )}
            </div>
          )}

          {tab === "seo" && s.seo && (
            <SeoPanel
              content={seoContent}
              slug={`${type.slug}/${e.slug}`}
              title={e.title}
              siteUrl={siteUrl}
              siteName={siteName}
              onChange={(seo) => set("seo", seo)}
            />
          )}

          {tab === "settings" && (
            <div className="max-w-xl space-y-5">
              <div>
                <Label help="Lowercase letters, numbers and hyphens. The prefix comes from the content type's settings.">URL</Label>
                <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                  /{type.slug}/
                  <input
                    className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none"
                    value={e.slug}
                    onChange={(ev) => {
                      setSlugTouched(true);
                      set("slug", ev.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                  />
                  <span className="px-2" title={e.slugLocked ? "Locked: set by hand" : "Not locked"}>
                    {e.slugLocked || slugChanged ? <Lock className="size-4 text-zinc-500" /> : <Unlock className="size-4 text-zinc-300" />}
                  </span>
                </div>
                {slugChanged && e.status === "published" && (
                  <p className="mt-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                    The old URL <code>/{type.slug}/{entry.slug}</code> will permanently redirect (301) to the new one when you save, so
                    links and rankings carry over.
                  </p>
                )}
                {(e.slugLocked || slugChanged) && (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Hand-set URLs are locked — the landing page generator will never overwrite them.
                  </p>
                )}
              </div>

              {type.taxonomies.map((tax) => {
                const options = terms[tax.key] ?? [];
                const selected = e.terms?.[tax.key] ?? [];
                return (
                  <div key={tax.key}>
                    <Label>{tax.multiple ? tax.namePlural : tax.name}</Label>
                    {tax.multiple ? (
                      <div className="flex flex-wrap gap-2">
                        {options.map((o) => {
                          const on = selected.includes(o.slug);
                          return (
                            <button
                              type="button"
                              key={o.slug}
                              onClick={() => setTerm(tax, on ? selected.filter((x) => x !== o.slug) : [...selected, o.slug])}
                              className={cx(
                                "rounded-full border px-3 py-1 text-xs",
                                on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:border-zinc-500",
                              )}
                            >
                              {o.name}
                            </button>
                          );
                        })}
                        {!options.length && <span className="text-xs text-zinc-500">None created yet.</span>}
                      </div>
                    ) : (
                      <Select value={selected[0] ?? ""} onChange={(ev) => setTerm(tax, ev.target.value ? [ev.target.value] : [])}>
                        <option value="">— None —</option>
                        {options.map((o) => (
                          <option key={o.slug} value={o.slug}>
                            {o.name}
                          </option>
                        ))}
                      </Select>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">
                      Manage the list under{" "}
                      <Link href={`${base}/terms?taxonomy=${tax.key}`} className="underline">
                        {tax.namePlural}
                      </Link>
                      .
                    </p>
                  </div>
                );
              })}

              {s.author && (
                <div>
                  <Label>Author name</Label>
                  <Input value={e.authorName} onChange={(ev) => set("authorName", ev.target.value)} />
                </div>
              )}
              {s.publishDate && (
                <div>
                  <Label help="Leave empty to use the moment you publish.">Publish date</Label>
                  <Input
                    type="datetime-local"
                    value={e.publishedAt ? e.publishedAt.slice(0, 16) : ""}
                    onChange={(ev) => set("publishedAt", ev.target.value ? new Date(ev.target.value).toISOString() : null)}
                  />
                </div>
              )}
              <div>
                <Label help="Lower numbers are listed first. Leave 0 to sort by date.">Sort order</Label>
                <Input type="number" value={e.sortOrder} onChange={(ev) => set("sortOrder", Number(ev.target.value) || 0)} className="w-32" />
              </div>
            </div>
          )}
        </div>
      </div>
    </LinkOptionsContext.Provider>
  );
}

export const emptyEntry = (author: string): EditableEntry => ({
  id: null,
  title: "",
  slug: "",
  slugLocked: false,
  status: "draft",
  data: {},
  terms: {},
  seo: emptySeo(),
  excerpt: "",
  body: "",
  coverImage: null,
  authorName: author,
  publishedAt: null,
  sortOrder: 0,
});

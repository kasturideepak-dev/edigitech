"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Eye, Layers, Link2, Plus, Settings2, Tags, Trash2 } from "lucide-react";
import { deleteContentTypeAction, saveContentTypeAction, type ContentTypeInput } from "@/app/admin/actions/content";
import type { ContentTypeSupports, EntryData, Field, TaxonomyDef } from "@/lib/types";
import { FieldBuilder } from "./FieldBuilder";
import { FieldGroup } from "./fields";
import { TYPE_ICONS, TypeIcon } from "./type-icons";
import { Badge, Button, Card, Input, Label, Textarea, Toggle, cx, useToast } from "./ui";

export type EditableType = ContentTypeInput & { isSystem: boolean; entryCount: number; publishedCount: number };

const seg = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const SUPPORTS: { key: keyof ContentTypeSupports; label: string; help: string }[] = [
  { key: "body", label: "Rich-text body", help: "A full article editor with headings, lists, images and links." },
  { key: "excerpt", label: "Excerpt", help: "A short summary for cards and search results." },
  { key: "coverImage", label: "Cover image", help: "Shown on cards and at the top of the page." },
  { key: "author", label: "Author", help: "Byline shown on the page." },
  { key: "publishDate", label: "Publish date", help: "Shown on cards; entries sort newest first." },
  { key: "seo", label: "SEO panel", help: "Meta title, description, social image and schema per entry." },
];

export function TypeEditor({ initial }: { initial: EditableType }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial.id;
  const [t, setT] = useState<EditableType>(initial);
  const [tab, setTab] = useState<"fields" | "settings" | "taxonomies">(isNew ? "settings" : "fields");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [preview, setPreview] = useState<EntryData>({});
  const savedKeys = (initial.fields ?? []).map((f) => f.name);
  const prefixChanged = !isNew && t.slug !== initial.slug;

  const set = <K extends keyof EditableType>(k: K, v: EditableType[K]) => {
    setT((cur) => ({ ...cur, [k]: v }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save() {
    if (prefixChanged && t.publishedCount > 0) {
      const ok = confirm(
        `Change the URL prefix from /${initial.slug} to /${seg(t.slug)}?\n\n` +
          `All ${t.publishedCount} published ${initial.namePlural.toLowerCase()} will move, and each old URL will permanently redirect (301) to its new one so links and Google rankings carry over.`,
      );
      if (!ok) return;
    }
    setBusy(true);
    const res = await saveContentTypeAction(t);
    setBusy(false);
    if (!res.ok) return toast("error", res.error);
    setDirty(false);
    toast(
      "success",
      res.redirected ? `Saved. ${res.redirected} redirect${res.redirected === 1 ? "" : "s"} created from /${initial.slug}.` : "Content type saved.",
    );
    if (isNew) router.replace(`/admin/types/${res.id}`);
    else {
      setT((cur) => ({ ...cur, slug: res.slug }));
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm(`Delete the “${t.namePlural}” content type? This cannot be undone.`)) return;
    const res = await deleteContentTypeAction(t.id!);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Content type deleted");
    router.push("/admin/types");
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/types" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="All content types">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
          <TypeIcon name={t.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{t.namePlural || "New content type"}</h1>
            {t.isSystem && <Badge tone="blue">Built-in</Badge>}
            {!t.active && <Badge tone="amber">Hidden</Badge>}
            {dirty && <span className="text-xs text-amber-600">● Unsaved</span>}
          </div>
          <p className="font-mono text-xs text-zinc-500">
            /{seg(t.slug) || "…"}/{"{entry}"}
          </p>
        </div>
        {!isNew && (
          <Link href={`/admin/content/${t.key}`}>
            <Button>Open {t.namePlural.toLowerCase()}</Button>
          </Link>
        )}
        <Button variant="brand" onClick={save} loading={busy} disabled={!t.name.trim()}>
          {isNew ? "Create content type" : "Save changes"}
        </Button>
      </div>

      <div className="mb-5 flex gap-1 border-b border-zinc-200 text-sm">
        {(
          [
            ["fields", "Fields", Layers],
            ["settings", "Settings & URL", Settings2],
            ["taxonomies", "Taxonomies", Tags],
          ] as const
        ).map(([key, label, I]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cx(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 font-medium",
              tab === key ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800",
            )}
          >
            <I className="size-4" />
            {label}
            {key === "fields" && <span className="text-xs text-zinc-400">{t.fields.length}</span>}
          </button>
        ))}
      </div>

      {tab === "fields" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-5">
            <Card title="Built-in features">
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {SUPPORTS.map((s) => (
                  <label key={s.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-zinc-400">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-zinc-900"
                      checked={!!t.supports[s.key]}
                      onChange={(e) => set("supports", { ...t.supports, [s.key]: e.target.checked })}
                    />
                    <span>
                      <span className="block text-sm font-medium">{s.label}</span>
                      <span className="block text-xs text-zinc-500">{s.help}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
            <Card title="Custom fields">
              <div className="p-5">
                <p className="mb-4 text-sm text-zinc-500">
                  Design the form for each {t.name.toLowerCase() || "entry"}. Every entry gets a title and URL automatically.
                </p>
                <FieldBuilder fields={t.fields} onChange={(f: Field[]) => set("fields", f)} savedKeys={savedKeys} />
              </div>
            </Card>
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Eye className="size-4" /> Live form preview
                </span>
              }
            >
              <div className="max-h-[75vh] overflow-y-auto p-5">
                <p className="mb-4 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                  This is exactly what editors will see when they add a {t.name.toLowerCase() || "new entry"}. Try it — nothing here is saved.
                </p>
                <div className="mb-4">
                  <Label required>Title</Label>
                  <Input disabled placeholder={`${t.name || "Entry"} title`} />
                </div>
                {t.fields.length ? (
                  <FieldGroup fields={t.fields} value={preview} onChange={setPreview} />
                ) : (
                  <p className="text-sm text-zinc-400">Add fields on the left to see them here.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Names">
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Singular name</Label>
                  <Input
                    value={t.name}
                    placeholder="Case Study"
                    autoFocus={isNew}
                    onChange={(e) => {
                      const name = e.target.value;
                      setT((cur) => ({
                        ...cur,
                        name,
                        ...(isNew ? { namePlural: name ? `${name}s` : "", key: seg(name).replace(/-/g, "_") } : {}),
                        ...(slugTouched ? {} : { slug: seg(name ? `${name}s` : "") }),
                      }));
                      setDirty(true);
                    }}
                  />
                </div>
                <div>
                  <Label required>Plural name</Label>
                  <Input value={t.namePlural} placeholder="Case Studies" onChange={(e) => set("namePlural", e.target.value)} />
                </div>
              </div>
              <div>
                <Label help={isNew ? "Used by blocks and the page generator. Can't be changed later." : "Fixed after creation."}>Key</Label>
                <Input
                  value={t.key}
                  disabled={!isNew}
                  className="font-mono"
                  onChange={(e) => set("key", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={2} value={t.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div>
                <Label>Sidebar icon</Label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TYPE_ICONS).map(([name, I]) => (
                    <button
                      type="button"
                      key={name}
                      title={name}
                      onClick={() => set("icon", name)}
                      className={cx(
                        "flex size-9 items-center justify-center rounded-lg border",
                        t.icon === name ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-400",
                      )}
                    >
                      <I className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={t.active} onChange={(v) => set("active", v)} label="Active (shown in the sidebar and on the website)" />
            </div>
          </Card>

          <div className="space-y-6">
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Link2 className="size-4" /> URL
                </span>
              }
            >
              <div className="space-y-3 p-5">
                <div>
                  <Label required help="Lowercase letters, numbers and hyphens.">URL prefix</Label>
                  <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-3 text-sm text-zinc-500 focus-within:border-zinc-900">
                    /
                    <input
                      className="h-10 w-full bg-transparent px-1 font-mono text-zinc-900 outline-none"
                      value={t.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 px-3 py-2.5 font-mono text-xs text-zinc-600">
                  {t.hasArchive && <div>/{seg(t.slug) || "…"} — listing page</div>}
                  <div>/{seg(t.slug) || "…"}/my-first-entry — each entry</div>
                  {t.taxonomies.map((x) => (
                    <div key={x.key}>
                      /{seg(t.slug) || "…"}/{seg(x.slug || x.name) || "…"}/example — {x.name.toLowerCase()} page
                    </div>
                  ))}
                </div>
                {prefixChanged && (
                  <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>
                      {t.publishedCount > 0 ? (
                        <>
                          Saving moves {t.publishedCount} published {initial.namePlural.toLowerCase()} from <b>/{initial.slug}</b> to{" "}
                          <b>/{seg(t.slug)}</b>. Every old URL gets a permanent 301 redirect automatically, so nothing breaks and rankings
                          carry over.
                        </>
                      ) : (
                        <>Nothing is published yet, so no redirects are needed.</>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Listing page">
              <div className="space-y-4 p-5">
                <Toggle
                  checked={t.hasArchive}
                  onChange={(v) => set("hasArchive", v)}
                  label={`Show a listing page at /${seg(t.slug) || "…"}`}
                />
                {t.hasArchive && (
                  <>
                    <div>
                      <Label>Page heading</Label>
                      <Input value={t.archiveTitle} placeholder={t.namePlural} onChange={(e) => set("archiveTitle", e.target.value)} />
                    </div>
                    <div>
                      <Label>Intro</Label>
                      <Textarea rows={2} value={t.archiveIntro} onChange={(e) => set("archiveIntro", e.target.value)} />
                    </div>
                    <div>
                      <Label>Per page</Label>
                      <Input type="number" min={1} max={60} value={t.perPage} onChange={(e) => set("perPage", Number(e.target.value) || 9)} className="w-28" />
                    </div>
                  </>
                )}
                {!t.hasArchive && (
                  <p className="text-xs text-zinc-500">
                    Useful for data that feeds other pages (like Locations for the landing page generator) rather than being browsed.
                  </p>
                )}
              </div>
            </Card>

            {!isNew && !t.isSystem && (
              <Card title="Danger zone">
                <div className="flex items-center justify-between gap-4 p-5">
                  <p className="text-sm text-zinc-600">
                    {t.entryCount > 0 ? `Delete its ${t.entryCount} entries first.` : "Permanently remove this content type."}
                  </p>
                  <Button variant="danger" onClick={remove} disabled={t.entryCount > 0}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "taxonomies" && (
        <TaxonomyEditor
          prefix={seg(t.slug)}
          value={t.taxonomies}
          onChange={(v) => set("taxonomies", v)}
          existingKeys={(initial.taxonomies ?? []).map((x) => x.key)}
        />
      )}
    </>
  );
}

function TaxonomyEditor({
  prefix,
  value,
  onChange,
  existingKeys,
}: {
  prefix: string;
  value: TaxonomyDef[];
  onChange: (v: TaxonomyDef[]) => void;
  existingKeys: string[];
}) {
  const update = (i: number, patch: Partial<TaxonomyDef>) => onChange(value.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <Card title="Taxonomies">
      <div className="space-y-3 p-5">
        <p className="text-sm text-zinc-500">
          Ways to group entries — like Categories or Tags on a blog. Each group gets its own browsable page.
        </p>
        {value.map((x, i) => {
          const saved = existingKeys.includes(x.key);
          return (
            <div key={i} className="grid gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <div>
                <Label required>Name</Label>
                <Input
                  value={x.name}
                  placeholder="Category"
                  onChange={(e) =>
                    update(i, {
                      name: e.target.value,
                      ...(saved ? {} : { key: seg(e.target.value).replace(/-/g, "_"), slug: seg(e.target.value), namePlural: e.target.value ? `${e.target.value}s` : "" }),
                    })
                  }
                />
              </div>
              <div>
                <Label>Plural</Label>
                <Input value={x.namePlural} onChange={(e) => update(i, { namePlural: e.target.value })} />
              </div>
              <div>
                <Label help={`/${prefix || "…"}/${seg(x.slug) || "…"}/…`}>URL segment</Label>
                <Input value={x.slug} className="font-mono" onChange={(e) => update(i, { slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
              </div>
              <div className="flex items-end gap-3">
                <Toggle checked={!!x.multiple} onChange={(v) => update(i, { multiple: v })} label="Allow several" />
                <button
                  type="button"
                  onClick={() => confirm(`Remove “${x.name}”?`) && onChange(value.filter((_, j) => j !== i))}
                  className="mb-1 rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove taxonomy"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
        <Button size="sm" onClick={() => onChange([...value, { key: "", name: "", namePlural: "", slug: "", multiple: false }])}>
          <Plus className="size-4" /> Add taxonomy
        </Button>
      </div>
    </Card>
  );
}

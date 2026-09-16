"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { createPageAction } from "../../actions/pages";
import { PAGE_TYPES, TEMPLATES, type PageType } from "@/templates";
import { Button, Input, Label, Modal, cx, useToast } from "@/components/admin/ui";

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function NewPageButton({ autoOpen }: { autoOpen?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(!!autoOpen);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pageType, setPageType] = useState<PageType>("service");
  const [template, setTemplate] = useState("landing-basic");
  const [busy, setBusy] = useState(false);

  const templates = TEMPLATES.filter((t) => t.pageTypes.includes(pageType));

  async function create() {
    setBusy(true);
    const res = await createPageAction({ title, slug: slug || toSlug(title), pageType, template });
    setBusy(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Page created");
    router.push(`/admin/pages/${res.id}`);
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New page
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a new page"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={busy} disabled={!title.trim()} onClick={create}>
              Create page
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <Label>1. Page type</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAGE_TYPES.filter((t) => t.value !== "home").map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => {
                    setPageType(t.value);
                    if (!TEMPLATES.find((x) => x.id === template)?.pageTypes.includes(t.value)) setTemplate("blank");
                  }}
                  className={cx(
                    "rounded-lg border px-3 py-2.5 text-left text-sm",
                    pageType === t.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 hover:border-zinc-400",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>2. Page title</Label>
              <Input
                autoFocus
                value={title}
                placeholder={pageType === "location" ? "SEO Services in Pune" : "WhatsApp Marketing"}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(toSlug(e.target.value));
                }}
              />
            </div>
            <div>
              <Label help="Use / for nested URLs, e.g. seo-services/pune">URL</Label>
              <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                /
                <input
                  className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <Label>3. Template</Label>
            <div className="grid gap-2">
              {templates.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cx(
                    "flex items-start gap-3 rounded-lg border p-3 text-left",
                    template === t.id ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400",
                  )}
                >
                  <span
                    className={cx(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      template === t.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300",
                    )}
                  >
                    {template === t.id && <Check className="size-3" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-zinc-500">{t.description}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">The page is created as a draft. You can add, remove and reorder sections afterwards.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction } from "../../../actions/blog";
import { Badge, Button, Card, EmptyState, Input, Label, Modal, Textarea, useToast } from "@/components/admin/ui";

type Row = { id: number; name: string; slug: string; description: string; total: number };
const EMPTY = { name: "", slug: "", description: "" };

const toSlug = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function CategoriesManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await saveCategoryAction({ ...editing, slug: editing.slug || toSlug(editing.name) });
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Category saved");
    setEditing(null);
    router.refresh();
  }

  return (
    <Card
      title={`${rows.length} categor${rows.length === 1 ? "y" : "ies"}`}
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4" /> Add category
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={<Tags className="size-8" />} title="No categories yet">
          Add categories such as “SEO”, “Web Development” or “WhatsApp Marketing”.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-zinc-500">
                  /blog/category/{c.slug}
                  {c.description ? ` · ${c.description}` : ""}
                </p>
              </div>
              <Badge>{c.total} post{c.total === 1 ? "" : "s"}</Badge>
              <button
                type="button"
                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="Edit"
                onClick={() => setEditing({ id: c.id, name: c.name, slug: c.slug, description: c.description })}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
                onClick={async () => {
                  if (!confirm(`Delete category “${c.name}”?`)) return;
                  const res = await deleteCategoryAction(c.id);
                  if (!res.ok) return toast("error", res.error);
                  toast("success", "Category deleted");
                  router.refresh();
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "Add category"}
        size="sm"
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save} disabled={!editing?.name.trim()}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <Label required>Name</Label>
              <Input
                autoFocus
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : toSlug(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>URL</Label>
              <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                /blog/category/
                <input
                  className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                />
              </div>
            </div>
            <div>
              <Label help="Shown on the category page, and used as its meta description.">Description</Label>
              <Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}

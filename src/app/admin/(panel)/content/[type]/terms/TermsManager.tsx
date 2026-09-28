"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { deleteTermAction, saveTermAction } from "@/app/admin/actions/content";
import { Badge, Button, Card, EmptyState, IconAction, Input, Label, Modal, RowActions, Textarea, useToast } from "@/components/admin/ui";

type Row = { id: number; name: string; slug: string; description: string; total: number };
const EMPTY = { name: "", slug: "", description: "" };

const toSlug = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function TermsManager({
  rows,
  typeId,
  prefix,
  taxonomy,
  entryNoun,
}: {
  rows: Row[];
  typeId: number;
  /** e.g. "/blog/category/" — built from the type's and taxonomy's editable slugs */
  prefix: string;
  taxonomy: { key: string; name: string; namePlural: string };
  entryNoun: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);
  const noun = taxonomy.name.toLowerCase();

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await saveTermAction({ ...editing, typeId, taxonomy: taxonomy.key, slug: editing.slug || toSlug(editing.name) });
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", `${taxonomy.name} saved`);
    setEditing(null);
    router.refresh();
  }

  return (
    <Card
      title={`${rows.length} ${rows.length === 1 ? noun : taxonomy.namePlural.toLowerCase()}`}
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4" /> Add {noun}
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={<Tags className="size-8" />} title={`No ${taxonomy.namePlural.toLowerCase()} yet`}>
          Group your {entryNoun}s so visitors can browse them by topic.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-zinc-500">
                  {prefix}
                  {c.slug}
                  {c.description ? ` · ${c.description}` : ""}
                </p>
              </div>
              <Badge>
                {c.total} {entryNoun}
                {c.total === 1 ? "" : "s"}
              </Badge>
              <RowActions>
                <IconAction label="Edit" onClick={() => setEditing({ id: c.id, name: c.name, slug: c.slug, description: c.description })}>
                  <Pencil className="size-4" />
                </IconAction>
                <IconAction label="View" href={c.total > 0 ? `${prefix}${c.slug}` : undefined} newTab disabled={c.total === 0}>
                  <ExternalLink className="size-4" />
                </IconAction>
                <IconAction
                  label={c.total > 0 ? `Reassign its ${entryNoun}s first` : "Delete"}
                  danger
                  disabled={c.total > 0}
                  onClick={async () => {
                    if (!confirm(`Delete “${c.name}”?`)) return;
                    const res = await deleteTermAction(c.id);
                    if (!res.ok) return toast("error", res.error);
                    toast("success", "Deleted");
                    router.refresh();
                  }}
                >
                  <Trash2 className="size-4" />
                </IconAction>
              </RowActions>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${noun}` : `Add ${noun}`}
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
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : toSlug(e.target.value) })}
              />
            </div>
            <div>
              <Label help={editing.id ? "Changing it adds a 301 redirect from the old URL." : undefined}>URL</Label>
              <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                <span className="whitespace-nowrap">{prefix}</span>
                <input
                  className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                />
              </div>
            </div>
            <div>
              <Label help="Shown on its archive page, and used as the meta description.">Description</Label>
              <Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}

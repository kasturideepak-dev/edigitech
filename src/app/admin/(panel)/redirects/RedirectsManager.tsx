"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Shuffle, Trash2 } from "lucide-react";
import { deleteRedirectAction, saveRedirectAction } from "../../actions/redirects";
import { Badge, Button, Card, EmptyState, Input, Label, Modal, Select, useToast } from "@/components/admin/ui";

type Row = { id: number; fromPath: string; toPath: string; statusCode: number; hits: number; note: string };
const EMPTY = { fromPath: "", toPath: "", statusCode: 301, note: "" };

export function RedirectsManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await saveRedirectAction(editing);
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Redirect saved");
    setEditing(null);
    router.refresh();
  }

  return (
    <Card
      title={`${rows.length} redirect${rows.length === 1 ? "" : "s"}`}
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4" /> Add redirect
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={<Shuffle className="size-8" />} title="No redirects yet">
          Redirects are also created automatically when you change a published page’s URL.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">From</th>
                <th className="px-3 py-2.5 font-medium">To</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Hits</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-mono text-xs">
                    {r.fromPath}
                    {r.note && <p className="font-sans text-xs text-zinc-400">{r.note}</p>}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{r.toPath}</td>
                  <td className="px-3 py-3">
                    <Badge tone={r.statusCode === 301 || r.statusCode === 308 ? "green" : "zinc"}>{r.statusCode}</Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-500">{r.hits}</td>
                  <td className="px-3 py-3 text-right">
                    <button type="button" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100" onClick={() => setEditing(r)} aria-label="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                      onClick={async () => {
                        if (!confirm(`Delete redirect ${r.fromPath}?`)) return;
                        await deleteRedirectAction(r.id);
                        toast("success", "Redirect deleted");
                        router.refresh();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit redirect" : "Add redirect"}
        size="sm"
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <Label help="Path on this site, e.g. /old-services">From</Label>
              <Input value={editing.fromPath} onChange={(e) => setEditing({ ...editing, fromPath: e.target.value })} />
            </div>
            <div>
              <Label help="Path (/new-page) or full URL">To</Label>
              <Input value={editing.toPath} onChange={(e) => setEditing({ ...editing, toPath: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={editing.statusCode} onChange={(e) => setEditing({ ...editing, statusCode: Number(e.target.value) })}>
                <option value={301}>301 – Permanent (recommended)</option>
                <option value={302}>302 – Temporary</option>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}

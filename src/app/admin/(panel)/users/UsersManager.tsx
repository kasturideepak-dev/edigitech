"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteUserAction, saveUserAction } from "../../actions/users";
import type { Role } from "@/lib/session";
import { Badge, Button, Card, Input, Label, Modal, Select, Toggle, useToast } from "@/components/admin/ui";

type Row = { id: number; name: string; email: string; role: Role; active: boolean; lastLoginAt: string | null };
type Draft = { id?: number; name: string; email: string; role: Role; active: boolean; password: string };

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", editor: "Editor", seo: "SEO" };

export function UsersManager({ rows, meId }: { rows: Row[]; meId: number }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await saveUserAction(editing);
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "User saved");
    setEditing(null);
    router.refresh();
  }

  return (
    <Card
      title={`${rows.length} user${rows.length === 1 ? "" : "s"}`}
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing({ name: "", email: "", role: "editor", active: true, password: "" })}>
          <Plus className="size-4" /> Add user
        </Button>
      }
    >
      <ul className="divide-y divide-zinc-100">
        {rows.map((u) => (
          <li key={u.id} className="flex items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {u.name} {u.id === meId && <span className="text-xs text-zinc-400">(you)</span>}
              </p>
              <p className="text-xs text-zinc-500">
                {u.email} · last login {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "never"}
              </p>
            </div>
            {!u.active && <Badge tone="red">Disabled</Badge>}
            <Badge tone={u.role === "admin" ? "blue" : "zinc"}>{ROLE_LABEL[u.role]}</Badge>
            <button type="button" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Edit" onClick={() => setEditing({ ...u, password: "" })}>
              <Pencil className="size-4" />
            </button>
            {u.id !== meId && (
              <button
                type="button"
                className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
                onClick={async () => {
                  if (!confirm(`Delete ${u.name}?`)) return;
                  const res = await deleteUserAction(u.id);
                  if (!res.ok) return toast("error", res.error);
                  toast("success", "User deleted");
                  router.refresh();
                }}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit user" : "Add user"}
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
              <Label required>Name</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <Label required>Email</Label>
              <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}>
                <option value="admin">Admin – full access</option>
                <option value="editor">Editor – pages & media</option>
                <option value="seo">SEO – SEO fields & redirects</option>
              </Select>
            </div>
            <div>
              <Label help={editing.id ? "Leave empty to keep the current password." : "At least 8 characters."}>Password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={editing.password}
                onChange={(e) => setEditing({ ...editing, password: e.target.value })}
              />
            </div>
            <Toggle checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} label="Account active" />
          </div>
        )}
      </Modal>
    </Card>
  );
}

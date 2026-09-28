"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, FileText, Lock, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  deleteEntryForeverAction,
  duplicateEntryAction,
  restoreEntryAction,
  trashEntryAction,
} from "@/app/admin/actions/content";
import { Badge, Card, EmptyState, IconAction, Input, RowActions, Select, cx, useToast } from "@/components/admin/ui";

type Row = {
  id: number;
  title: string;
  slug: string;
  slugLocked: boolean;
  status: "draft" | "published";
  termLabel: string;
  publishedAt: string | null;
  updatedAt: string;
};

type TypeInfo = {
  key: string;
  slug: string;
  name: string;
  namePlural: string;
  taxonomyName: string | null;
  taxonomyKey: string | null;
};

export function EntriesTable({
  type,
  rows,
  filters,
  canDelete,
}: {
  type: TypeInfo;
  rows: Row[];
  filters: { q: string; status: string };
  canDelete: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState(filters.q);
  const [pending, start] = useTransition();
  const trash = filters.status === "trash";
  const base = `/admin/content/${type.key}`;
  const noun = type.name.toLowerCase();

  const setFilter = (key: string, value: string) => {
    const sp = new URLSearchParams({ ...filters, [key]: value });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    router.push(`${base}${sp.size ? `?${sp}` : ""}`);
  };

  const act = (fn: () => Promise<{ ok: boolean; error?: string; id?: number }>, msg: string, then?: (id?: number) => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", msg);
        if (then) then(res.id);
        else router.refresh();
      } else toast("error", res.error ?? "Failed");
    });

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-4">
        <form
          className="relative min-w-52 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("q", q);
          }}
        >
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-zinc-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${type.namePlural.toLowerCase()}…`} className="pl-8" />
        </form>
        <Select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="trash">Trash</option>
        </Select>
        <span className="text-xs text-zinc-500">
          {rows.length} {rows.length === 1 ? noun : type.namePlural.toLowerCase()}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<FileText className="size-8" />} title={trash ? "Trash is empty" : `No ${type.namePlural.toLowerCase()} yet`}>
          {!trash && `Create your first ${noun} with the “New ${noun}” button.`}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className={cx("w-full text-sm", pending && "opacity-60")}>
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Title</th>
                {type.taxonomyName && <th className="px-3 py-2.5 font-medium">{type.taxonomyName}</th>}
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Updated</th>
                <th className="w-40 px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/70">
                  <td className="px-5 py-3">
                    {trash ? (
                      <span className="font-medium">{r.title}</span>
                    ) : (
                      <a href={`${base}/${r.id}`} className="font-medium hover:underline">
                        {r.title}
                      </a>
                    )}
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      /{type.slug}/{r.slug}
                      {r.slugLocked && (
                        <span title="URL set by hand — bulk tools will never change it">
                          <Lock className="size-3 text-zinc-400" />
                        </span>
                      )}
                    </p>
                  </td>
                  {type.taxonomyName && <td className="px-3 py-3 text-zinc-600">{r.termLabel || "—"}</td>}
                  <td className="px-3 py-3">
                    {trash ? <Badge tone="red">In trash</Badge> : r.status === "published" ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{new Date(r.updatedAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <RowActions>
                      {trash ? (
                        <>
                          <IconAction label="Restore" onClick={() => act(() => restoreEntryAction(r.id), "Restored")}>
                            <RotateCcw className="size-4" />
                          </IconAction>
                          <IconAction
                            label="Delete permanently"
                            danger
                            disabled={!canDelete}
                            onClick={() =>
                              confirm(`Permanently delete “${r.title}”? This cannot be undone.`) &&
                              act(() => deleteEntryForeverAction(r.id), "Deleted permanently")
                            }
                          >
                            <Trash2 className="size-4" />
                          </IconAction>
                        </>
                      ) : (
                        <>
                          <IconAction label="Edit" href={`${base}/${r.id}`}>
                            <Pencil className="size-4" />
                          </IconAction>
                          <IconAction
                            label="Duplicate"
                            onClick={() => act(() => duplicateEntryAction(r.id), "Duplicated as draft", (id) => id && router.push(`${base}/${id}`))}
                          >
                            <Copy className="size-4" />
                          </IconAction>
                          <IconAction
                            label="View live"
                            href={r.status === "published" ? `/${type.slug}/${r.slug}` : undefined}
                            newTab
                            disabled={r.status !== "published"}
                          >
                            <ExternalLink className="size-4" />
                          </IconAction>
                          <IconAction
                            label="Move to trash"
                            danger
                            disabled={!canDelete}
                            onClick={() => confirm(`Move “${r.title}” to trash?`) && act(() => trashEntryAction(r.id), "Moved to trash")}
                          >
                            <Trash2 className="size-4" />
                          </IconAction>
                        </>
                      )}
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

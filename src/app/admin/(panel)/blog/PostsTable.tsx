"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Newspaper, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { deletePostAction, deletePostForeverAction, restorePostAction } from "../../actions/blog";
import { Badge, Card, EmptyState, Input, Select, cx, useToast } from "@/components/admin/ui";

type Row = {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  authorName: string;
  categoryName: string | null;
};

export function PostsTable({
  rows,
  filters,
  canDelete,
}: {
  rows: Row[];
  filters: { q: string; status: string };
  canDelete: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState(filters.q);
  const [pending, start] = useTransition();
  const trash = filters.status === "trash";

  const setFilter = (key: string, value: string) => {
    const sp = new URLSearchParams({ ...filters, [key]: value });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    router.push(`/admin/blog${sp.size ? `?${sp}` : ""}`);
  };

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", msg);
        router.refresh();
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="pl-8" />
        </form>
        <Select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="trash">Trash</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Newspaper className="size-8" />} title={trash ? "Trash is empty" : "No posts yet"}>
          {!trash && "Write your first article with the “New post” button."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className={cx("w-full text-sm", pending && "opacity-60")}>
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Title</th>
                <th className="px-3 py-2.5 font-medium">Category</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="w-28 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/70">
                  <td className="px-5 py-3">
                    {trash ? (
                      <span className="font-medium">{p.title}</span>
                    ) : (
                      <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                    )}
                    <p className="text-xs text-zinc-500">
                      /blog/{p.slug} · {p.authorName}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{p.categoryName ?? "—"}</td>
                  <td className="px-3 py-3">
                    {trash ? <Badge tone="red">In trash</Badge> : p.status === "published" ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-zinc-500">
                    {new Date(p.publishedAt ?? p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {trash ? (
                      <>
                        <button
                          type="button"
                          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                          title="Restore"
                          onClick={() => act(() => restorePostAction(p.id), "Post restored")}
                        >
                          <RotateCcw className="size-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete permanently"
                            onClick={() =>
                              confirm(`Permanently delete “${p.title}”? This cannot be undone.`) &&
                              act(() => deletePostForeverAction(p.id), "Post deleted permanently")
                            }
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href={`/admin/blog/${p.id}`} className="inline-block rounded p-1.5 text-zinc-500 hover:bg-zinc-100" title="Edit">
                          <Pencil className="size-4" />
                        </Link>
                        {p.status === "published" && (
                          <a
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            className="inline-block rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                            title="View live"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                            title="Move to trash"
                            onClick={() => confirm(`Move “${p.title}” to trash?`) && act(() => deletePostAction(p.id), "Post moved to trash")}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </>
                    )}
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

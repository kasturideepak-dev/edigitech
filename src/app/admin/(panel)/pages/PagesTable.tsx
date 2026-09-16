"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Copy, ExternalLink, Home, MoreHorizontal, Pencil, RotateCcw, Search, Trash2, FileText } from "lucide-react";
import {
  deletePageForeverAction,
  duplicatePageAction,
  restorePageAction,
  setHomePageAction,
  trashPageAction,
} from "../../actions/pages";
import { PAGE_TYPES, pageTypeLabel } from "@/templates";
import { Badge, Card, EmptyState, Input, Select, cx, useToast } from "@/components/admin/ui";

type Row = {
  id: number;
  title: string;
  slug: string;
  pageType: string;
  status: "draft" | "published";
  isHome: boolean;
  hasUnpublishedChanges: boolean;
  updatedAt: string;
  deletedAt: string | null;
};

export function PagesTable({
  rows,
  filters,
  canDelete,
  canSetHome,
}: {
  rows: Row[];
  filters: { q: string; type: string; status: string };
  canDelete: boolean;
  canSetHome: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState(filters.q);
  // The table scrolls horizontally, which would clip a normally positioned dropdown,
  // so the row menu is positioned against the viewport instead.
  const [menu, setMenu] = useState<{ id: number; top: number; right: number } | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);
  const [pending, start] = useTransition();
  const trash = filters.status === "trash";

  const setFilter = (key: string, value: string) => {
    const sp = new URLSearchParams({ ...filters, [key]: value });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    router.push(`/admin/pages${sp.size ? `?${sp}` : ""}`);
  };

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const res = await fn();
      setMenu(null);
      if (res.ok) {
        toast("success", success);
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or URL…" className="pl-8" />
        </form>
        <Select value={filters.type} onChange={(e) => setFilter("type", e.target.value)} className="w-48">
          <option value="">All page types</option>
          {PAGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Changes pending</option>
          <option value="trash">Trash</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<FileText className="size-8" />} title={trash ? "Trash is empty" : "No pages found"}>
          {!trash && "Create a page with the “New page” button."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className={cx("w-full text-sm", pending && "opacity-60")}>
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Title</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Updated</th>
                <th className="w-12 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((p) => {
                const path = p.isHome ? "/" : `/${p.slug}`;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70">
                    <td className="px-5 py-3">
                      {trash ? (
                        <span className="font-medium">{p.title}</span>
                      ) : (
                        <Link href={`/admin/pages/${p.id}`} className="font-medium hover:underline">
                          {p.title}
                        </Link>
                      )}
                      {p.isHome && (
                        <span className="ml-2">
                          <Badge tone="blue">Homepage</Badge>
                        </span>
                      )}
                      <p className="text-xs text-zinc-500">{path}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">{pageTypeLabel(p.pageType)}</td>
                    <td className="px-3 py-3">
                      {trash ? (
                        <Badge tone="red">In trash</Badge>
                      ) : p.status === "published" ? (
                        p.hasUnpublishedChanges ? (
                          <Badge tone="amber">Changes pending</Badge>
                        ) : (
                          <Badge tone="green">Published</Badge>
                        )
                      ) : (
                        <Badge>Draft</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="relative px-3 py-3 text-right">
                      <button
                        type="button"
                        className="rounded p-1 text-zinc-500 hover:bg-zinc-100"
                        onClick={(e) => {
                          if (menu?.id === p.id) return setMenu(null);
                          const r = e.currentTarget.getBoundingClientRect();
                          setMenu({ id: p.id, top: r.bottom + 4, right: window.innerWidth - r.right });
                        }}
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                      {menu?.id === p.id && (
                        <div
                          style={{ position: "fixed", top: menu.top, right: menu.right }}
                          className="z-50 w-52 rounded-lg border border-zinc-200 bg-white py-1 text-left shadow-lg"
                          onMouseLeave={() => setMenu(null)}
                        >
                          {trash ? (
                            <>
                              <Item icon={<RotateCcw className="size-4" />} onClick={() => act(() => restorePageAction(p.id), "Page restored as draft")}>
                                Restore
                              </Item>
                              {canDelete && (
                                <Item
                                  danger
                                  icon={<Trash2 className="size-4" />}
                                  onClick={() =>
                                    confirm(`Permanently delete “${p.title}”? This cannot be undone.`) &&
                                    act(() => deletePageForeverAction(p.id), "Page deleted permanently")
                                  }
                                >
                                  Delete permanently
                                </Item>
                              )}
                            </>
                          ) : (
                            <>
                              <Item icon={<Pencil className="size-4" />} onClick={() => router.push(`/admin/pages/${p.id}`)}>
                                Edit
                              </Item>
                              {p.status === "published" && (
                                <Item icon={<ExternalLink className="size-4" />} onClick={() => window.open(path, "_blank")}>
                                  View live
                                </Item>
                              )}
                              <Item
                                icon={<Copy className="size-4" />}
                                onClick={() =>
                                  start(async () => {
                                    const res = await duplicatePageAction(p.id);
                                    if (res.ok) router.push(`/admin/pages/${res.id}`);
                                    else toast("error", res.error);
                                  })
                                }
                              >
                                Duplicate
                              </Item>
                              {canSetHome && !p.isHome && p.status === "published" && (
                                <Item
                                  icon={<Home className="size-4" />}
                                  onClick={() =>
                                    confirm(`Make “${p.title}” the homepage?`) && act(() => setHomePageAction(p.id), "Homepage updated")
                                  }
                                >
                                  Set as homepage
                                </Item>
                              )}
                              {canDelete && !p.isHome && (
                                <Item
                                  danger
                                  icon={<Trash2 className="size-4" />}
                                  onClick={() =>
                                    confirm(`Move “${p.title}” to trash? It will be unpublished.`) &&
                                    act(() => trashPageAction(p.id), "Page moved to trash")
                                  }
                                >
                                  Move to trash
                                </Item>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Item({ icon, children, onClick, danger }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("flex w-full items-center gap-2 px-3 py-2 text-sm", danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50")}
    >
      {icon}
      {children}
    </button>
  );
}

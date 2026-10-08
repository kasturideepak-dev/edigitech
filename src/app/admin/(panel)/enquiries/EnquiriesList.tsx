"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Inbox, Mail, Phone, RotateCcw, Trash2 } from "lucide-react";
import { deleteEnquiryAction, setEnquiryStatusAction } from "@/app/admin/actions/enquiries";
import { Badge, Card, EmptyState, IconAction, RowActions, Select, cx, useToast } from "@/components/admin/ui";

type Row = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

export function EnquiriesList({ rows, canDelete }: { rows: Row[]; canDelete: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<"active" | "new" | "archived">("active");
  const [open, setOpen] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const visible = rows.filter((r) =>
    filter === "archived" ? r.status === "archived" : filter === "new" ? r.status === "new" : r.status !== "archived",
  );

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", msg);
        router.refresh();
      } else toast("error", res.error ?? "Failed");
    });

  const expand = (r: Row) => {
    setOpen(open === r.id ? null : r.id);
    if (r.status === "new") act(() => setEnquiryStatusAction(r.id, "read"), "Marked as read");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-4">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-48">
          <option value="active">Inbox</option>
          <option value="new">Unread only</option>
          <option value="archived">Archived</option>
        </Select>
        <span className="text-xs text-zinc-500">
          {visible.length} {visible.length === 1 ? "enquiry" : "enquiries"}
          {rows.some((r) => r.status === "new") && ` · ${rows.filter((r) => r.status === "new").length} unread`}
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Inbox className="size-8" />} title={filter === "archived" ? "Nothing archived" : "No enquiries yet"}>
          {filter !== "archived" && "Messages sent through the contact form will appear here."}
        </EmptyState>
      ) : (
        <ul className={cx("divide-y divide-zinc-100", pending && "opacity-60")}>
          {visible.map((r) => (
            <li key={r.id} className={cx("px-5 py-4", r.status === "new" && "bg-amber-50/40")}>
              <div className="flex flex-wrap items-start gap-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => expand(r)}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {r.name}
                    {r.status === "new" && <Badge tone="amber">New</Badge>}
                    {r.subject && <span className="text-xs font-normal text-zinc-500">· {r.subject}</span>}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {r.email}
                    {r.phone && ` · ${r.phone}`}
                    {r.source && ` · from ${r.source}`}
                  </p>
                  {open !== r.id && <p className="mt-1 truncate text-sm text-zinc-600">{r.message}</p>}
                </button>
                <span className="whitespace-nowrap text-xs text-zinc-500">{new Date(r.createdAt).toLocaleString()}</span>
                <RowActions>
                  <IconAction label="Reply by email" href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject || "Your enquiry"}`)}`}>
                    <Mail className="size-4" />
                  </IconAction>
                  {r.phone && (
                    <IconAction label="Call" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>
                      <Phone className="size-4" />
                    </IconAction>
                  )}
                  {r.status === "archived" ? (
                    <IconAction label="Move back to inbox" onClick={() => act(() => setEnquiryStatusAction(r.id, "read"), "Restored")}>
                      <RotateCcw className="size-4" />
                    </IconAction>
                  ) : (
                    <IconAction label="Archive" onClick={() => act(() => setEnquiryStatusAction(r.id, "archived"), "Archived")}>
                      <Archive className="size-4" />
                    </IconAction>
                  )}
                  <IconAction
                    label="Delete"
                    danger
                    disabled={!canDelete}
                    onClick={() => confirm(`Delete the enquiry from ${r.name}? This cannot be undone.`) && act(() => deleteEnquiryAction(r.id), "Deleted")}
                  >
                    <Trash2 className="size-4" />
                  </IconAction>
                </RowActions>
              </div>
              {open === r.id && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">{r.message}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

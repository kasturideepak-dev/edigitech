"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Search, Trash2, Upload, Copy, Check } from "lucide-react";
import {
  deleteMediaAction,
  listMediaAction,
  updateMediaAction,
  uploadMediaAction,
  type MediaItem,
} from "@/app/admin/actions/media";
import { Button, Input, Label, Select, cx, formatBytes, useToast } from "./ui";

type Props = {
  /** Picker mode: clicking an item selects it. */
  onSelect?: (item: MediaItem) => void;
  imagesOnly?: boolean;
};

export function MediaBrowser({ onSelect, imagesOnly }: Props) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [active, setActive] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMediaAction({ search, folder, page, imagesOnly });
      setItems(res.items);
      setPages(res.pages);
      setFolders(res.folders);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Could not load media");
    } finally {
      setLoading(false);
    }
  }, [search, folder, page, imagesOnly, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("folder", uploadFolder);
      list.forEach((f) => fd.append("files", f));
      const res = await uploadMediaAction(fd);
      res.errors.forEach((e) => toast("error", e));
      if (res.items.length) {
        toast("success", `${res.items.length} file${res.items.length > 1 ? "s" : ""} uploaded`);
        setItems((cur) => [...res.items.reverse(), ...cur]);
        if (res.items.length === 1) setActive(res.items[0]);
      }
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-zinc-400" />
            <Input
              placeholder="Search by name or alt text…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={folder}
            onChange={(e) => {
              setFolder(e.target.value);
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
          className={cx(
            "mb-4 flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition",
            dragOver ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white",
          )}
        >
          <Upload className="size-5 text-zinc-400" />
          <p className="flex-1 text-sm text-zinc-600">
            Drag files here or{" "}
            <button type="button" className="font-medium text-zinc-900 underline" onClick={() => fileRef.current?.click()}>
              browse
            </button>
            . JPG/PNG are converted to optimized WebP automatically (max 15 MB).
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Folder</span>
            <Input
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="h-8 w-32"
              list="media-folders"
            />
            <datalist id="media-folders">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
          <Button variant="primary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
            <Upload className="size-3.5" /> Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept={imagesOnly ? "image/*" : "image/*,application/pdf,video/mp4"}
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
        </div>

        {loading && items.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-500">
            <ImageIcon className="mx-auto mb-2 size-8 text-zinc-300" />
            No files yet. Upload your first image above.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
            {items.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setActive(m)}
                onDoubleClick={() => onSelect?.(m)}
                className={cx(
                  "group relative aspect-square overflow-hidden rounded-lg border bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] text-left",
                  active?.id === m.id ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400",
                )}
                title={m.originalName}
              >
                {m.mime.startsWith("image/") ? (
                  <img src={m.url} alt={m.alt} className="size-full object-contain" loading="lazy" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-zinc-500">
                    <FileText className="size-8" />
                    <span className="line-clamp-2 break-all text-center text-[11px]">{m.originalName}</span>
                  </div>
                )}
                {!m.alt && m.mime.startsWith("image/") && (
                  <span className="absolute left-1 top-1 rounded bg-amber-400 px-1 text-[10px] font-semibold text-amber-950">no alt</span>
                )}
              </button>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-zinc-500">
              Page {page} of {pages}
            </span>
            <Button size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 lg:w-72">
        {active ? (
          <MediaDetails
            key={active.id}
            item={active}
            onSelect={onSelect}
            onSaved={(u) => {
              setItems((cur) => cur.map((x) => (x.id === u.id ? u : x)));
              setActive(u);
            }}
            onDeleted={(id) => {
              setItems((cur) => cur.filter((x) => x.id !== id));
              setActive(null);
            }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
            Select a file to see its details{onSelect ? " or double-click to use it" : ""}.
          </div>
        )}
      </aside>
    </div>
  );
}

function MediaDetails({
  item,
  onSelect,
  onSaved,
  onDeleted,
}: {
  item: MediaItem;
  onSelect?: (m: MediaItem) => void;
  onSaved: (m: MediaItem) => void;
  onDeleted: (id: number) => void;
}) {
  const toast = useToast();
  const [alt, setAlt] = useState(item.alt);
  const [title, setTitle] = useState(item.title);
  const [folder, setFolder] = useState(item.folder);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const dirty = alt !== item.alt || title !== item.title || folder !== item.folder;

  async function save() {
    setSaving(true);
    try {
      await updateMediaAction(item.id, { alt, title, folder });
      onSaved({ ...item, alt, title, folder });
      toast("success", "Media details saved");
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this file permanently? Pages still using it will show a broken image.")) return;
    await deleteMediaAction(item.id);
    onDeleted(item.id);
    toast("success", "File deleted");
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 lg:sticky lg:top-4">
      {item.mime.startsWith("image/") && (
        <img src={item.url} alt={item.alt} className="max-h-48 w-full rounded-md bg-zinc-50 object-contain" />
      )}
      <div className="space-y-0.5 text-xs text-zinc-500">
        <p className="truncate font-medium text-zinc-800" title={item.originalName}>
          {item.originalName}
        </p>
        <p>
          {item.mime} · {formatBytes(item.size)}
          {item.width ? ` · ${item.width}×${item.height}` : ""}
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-900"
          onClick={() => {
            navigator.clipboard.writeText(item.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      <div>
        <Label help="Describe the image for Google and screen readers.">Alt text</Label>
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
      </div>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>Folder</Label>
        <Input value={folder} onChange={(e) => setFolder(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {onSelect && (
          <Button variant="brand" onClick={() => onSelect({ ...item, alt, title, folder })}>
            Use this file
          </Button>
        )}
        <Button variant={onSelect ? "secondary" : "primary"} disabled={!dirty} loading={saving} onClick={save}>
          Save
        </Button>
        <Button variant="ghost" onClick={remove} className="text-red-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

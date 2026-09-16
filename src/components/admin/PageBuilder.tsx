"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Clapperboard,
  GalleryHorizontal,
  Hash,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Megaphone,
  MoveHorizontal,
  Newspaper,
  PanelTop,
  Quote,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  History,
  Layers,
  MonitorPlay,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { BLOCKS, BLOCK_MAP, type BlockCategory } from "@/blocks/definitions";
import type { PageContent, Section, SeoFields } from "@/lib/types";
import { PAGE_TYPES, newSectionId } from "@/templates";
import {
  discardChangesAction,
  duplicatePageAction,
  listRevisionsAction,
  restoreRevisionAction,
  savePageAction,
  unpublishPageAction,
} from "@/app/admin/actions/pages";
import { FieldGroup, LinkOptionsContext } from "./fields";
import { ScoreBadge, SeoPanel, seoChecks, seoScore } from "./SeoPanel";
import { Badge, Button, Input, Label, Modal, Select, cx, useToast } from "./ui";

export type BuilderPage = {
  id: number;
  title: string;
  slug: string;
  pageType: string;
  template: string;
  status: "draft" | "published";
  isHome: boolean;
  hasUnpublishedChanges: boolean;
  draft: PageContent;
  updatedAt: string;
};

type Tab = "sections" | "seo" | "settings";

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  BriefcaseBusiness,
  Clapperboard,
  GalleryHorizontal,
  Hash,
  Image: ImageIcon,
  Info,
  LayoutGrid,
  Megaphone,
  MoveHorizontal,
  Newspaper,
  PanelTop,
  Quote,
};

function BlockIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = BLOCK_ICONS[name] ?? Layers;
  return <Cmp className={className} />;
}

export function PageBuilder({
  page,
  canPublish,
  seoOnly,
  siteUrl,
  siteName,
  linkOptions,
}: {
  page: BuilderPage;
  canPublish: boolean;
  seoOnly: boolean;
  siteUrl: string;
  siteName: string;
  linkOptions: { label: string; url: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [pageType, setPageType] = useState(page.pageType);
  const [content, setContent] = useState<PageContent>(page.draft);
  const [status, setStatus] = useState(page.status);
  const [unpublished, setUnpublished] = useState(page.hasUnpublishedChanges);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [tab, setTab] = useState<Tab>(seoOnly ? "seo" : "sections");
  const [selectedId, setSelectedId] = useState<string | null>(page.draft.sections[0]?.id ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const sections = content.sections;
  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const score = useMemo(() => seoScore(seoChecks(content, slug, title)), [content, slug, title]);

  const update = useCallback((fn: (c: PageContent) => PageContent) => {
    setContent((c) => fn(c));
    setDirty(true);
  }, []);
  const setSections = (fn: (s: Section[]) => Section[]) => update((c) => ({ ...c, sections: fn(c.sections) }));
  const patchSection = (id: string, patch: Partial<Section>) =>
    setSections((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = useCallback(
    async (publish = false) => {
      setBusy(publish ? "publish" : "save");
      const res = await savePageAction({ id: page.id, title, slug, pageType, content }, { publish });
      setBusy("");
      if (!res.ok) {
        toast("error", res.error);
        return false;
      }
      setDirty(false);
      if (publish) {
        setStatus("published");
        setUnpublished(false);
        toast("success", "Page published — changes are live.");
      } else {
        setUnpublished(true);
        toast("success", "Draft saved.");
      }
      setPreviewKey((k) => k + 1);
      router.refresh();
      return true;
    },
    [page.id, title, slug, pageType, content, toast, router],
  );

  // Ctrl/Cmd + S saves the draft.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function openPreview() {
    if (dirty && !(await save(false))) return;
    window.open(`/preview/${page.id}`, "_blank");
  }

  function addSection(type: string) {
    const def = BLOCK_MAP[type];
    const s: Section = { id: newSectionId(), type, visible: true, data: def.defaults() };
    setSections((list) => {
      const idx = selectedId ? list.findIndex((x) => x.id === selectedId) : -1;
      const next = [...list];
      next.splice(idx >= 0 ? idx + 1 : next.length, 0, s);
      return next;
    });
    setSelectedId(s.id);
    setPickerOpen(false);
    setTab("sections");
  }

  function duplicateSection(id: string) {
    const copy = { ...structuredClone(sections.find((s) => s.id === id)!), id: newSectionId() };
    copy.label = copy.label ? `${copy.label} (copy)` : undefined;
    setSections((list) => {
      const i = list.findIndex((s) => s.id === id);
      const next = [...list];
      next.splice(i + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  }

  function removeSection(id: string) {
    if (!confirm("Delete this section? You can restore it from history after publishing.")) return;
    const i = sections.findIndex((s) => s.id === id);
    setSections((list) => list.filter((s) => s.id !== id));
    setSelectedId(sections[i + 1]?.id ?? sections[i - 1]?.id ?? null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    setSections((list) => {
      const from = list.findIndex((s) => s.id === e.active.id);
      const to = list.findIndex((s) => s.id === e.over!.id);
      return arrayMove(list, from, to);
    });
  }

  const livePath = page.isHome ? "/" : `/${slug}`;
  const statusBadge =
    status === "published" ? (
      unpublished || dirty ? (
        <Badge tone="amber">Published · changes pending</Badge>
      ) : (
        <Badge tone="green">Published</Badge>
      )
    ) : (
      <Badge>Draft</Badge>
    );

  return (
    <LinkOptionsContext.Provider value={linkOptions}>
      <div className="flex h-screen flex-col">
        {/* Top bar */}
        <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5">
          <Link href="/admin/pages" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="All pages">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{title || "Untitled"}</h1>
              {statusBadge}
              {dirty && <span className="text-xs text-amber-600">● Unsaved</span>}
            </div>
            <a href={status === "published" ? livePath : undefined} target="_blank" className="text-xs text-zinc-500 hover:underline">
              {siteUrl.replace(/^https?:\/\//, "")}
              {livePath}
            </a>
          </div>
          <ScoreBadge score={score} />
          <Button variant="ghost" onClick={() => setLivePreview((v) => !v)} className="hidden xl:inline-flex" title="Toggle live preview">
            <MonitorPlay className="size-4" /> {livePreview ? "Hide preview" : "Live preview"}
          </Button>
          <Button onClick={openPreview}>
            <ExternalLink className="size-4" /> Preview
          </Button>
          <Button onClick={() => save(false)} loading={busy === "save"} disabled={!!busy}>
            Save draft
          </Button>
          {canPublish && (
            <Button variant="brand" onClick={() => save(true)} loading={busy === "publish"} disabled={!!busy}>
              {status === "published" ? "Update live page" : "Publish"}
            </Button>
          )}
          <div className="relative">
            <Button variant="ghost" onClick={() => setMenuOpen((v) => !v)} aria-label="More actions">
              <MoreHorizontal className="size-5" />
            </Button>
            {menuOpen && (
              <div
                className="absolute right-0 top-10 z-30 w-56 rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <MenuItem
                  icon={<History className="size-4" />}
                  onClick={() => {
                    setHistoryOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Version history
                </MenuItem>
                <MenuItem
                  icon={<Copy className="size-4" />}
                  onClick={async () => {
                    const res = await duplicatePageAction(page.id);
                    if (res.ok) router.push(`/admin/pages/${res.id}`);
                    else toast("error", res.error);
                  }}
                >
                  Duplicate page
                </MenuItem>
                {status === "published" && unpublished && (
                  <MenuItem
                    icon={<RotateCcw className="size-4" />}
                    onClick={async () => {
                      if (!confirm("Discard all unpublished changes and go back to the live version?")) return;
                      const res = await discardChangesAction(page.id);
                      if (res.ok) window.location.reload();
                      else toast("error", res.error);
                    }}
                  >
                    Discard unpublished changes
                  </MenuItem>
                )}
                {canPublish && status === "published" && !page.isHome && (
                  <MenuItem
                    icon={<EyeOff className="size-4" />}
                    onClick={async () => {
                      if (!confirm("Unpublish this page? Visitors will get a 404.")) return;
                      const res = await unpublishPageAction(page.id);
                      if (res.ok) {
                        setStatus("draft");
                        toast("success", "Page unpublished");
                        router.refresh();
                      } else toast("error", res.error);
                      setMenuOpen(false);
                    }}
                  >
                    Unpublish
                  </MenuItem>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Left panel */}
          <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200 bg-white">
            <div className="flex border-b border-zinc-200 text-sm">
              {!seoOnly && (
                <TabBtn active={tab === "sections"} onClick={() => setTab("sections")} icon={<Layers className="size-4" />}>
                  Sections
                </TabBtn>
              )}
              <TabBtn active={tab === "seo"} onClick={() => setTab("seo")} icon={<Search className="size-4" />}>
                SEO
              </TabBtn>
              {!seoOnly && (
                <TabBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings2 className="size-4" />}>
                  Page
                </TabBtn>
              )}
            </div>

            {tab === "sections" && (
              <div className="admin-scroll flex-1 overflow-y-auto p-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-1">
                      {sections.map((s, i) => (
                        <SortableRow
                          key={s.id}
                          section={s}
                          index={i}
                          selected={s.id === selectedId}
                          onSelect={() => setSelectedId(s.id)}
                          onToggle={() => patchSection(s.id, { visible: !s.visible })}
                          onDuplicate={() => duplicateSection(s.id)}
                          onDelete={() => removeSection(s.id)}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
                {sections.length === 0 && <p className="px-2 py-6 text-center text-sm text-zinc-500">This page has no sections yet.</p>}
                <Button variant="primary" className="mt-3 w-full" onClick={() => setPickerOpen(true)}>
                  <Plus className="size-4" /> Add section
                </Button>
                <p className="mt-3 px-1 text-[11px] leading-relaxed text-zinc-400">
                  Drag to reorder. New sections are added below the selected one. Press ⌘/Ctrl + S to save.
                </p>
              </div>
            )}

            {tab === "seo" && (
              <div className="admin-scroll flex-1 overflow-y-auto p-4 text-sm text-zinc-600">
                <p>Edit meta tags, social sharing and structured data in the main panel.</p>
                <p className="mt-3">
                  Score: <ScoreBadge score={score} />
                </p>
              </div>
            )}

            {tab === "settings" && (
              <div className="admin-scroll flex-1 space-y-4 overflow-y-auto p-4">
                <div>
                  <Label required>Page title</Label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setDirty(true);
                    }}
                  />
                </div>
                <div>
                  <Label help={page.isHome ? "The homepage is always served at /." : "Lowercase letters, numbers, hyphens and / only."}>
                    URL
                  </Label>
                  <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-2 text-sm text-zinc-500 focus-within:border-zinc-900">
                    /
                    <input
                      className="h-9 w-full bg-transparent px-1 text-zinc-900 outline-none disabled:text-zinc-400"
                      value={page.isHome ? "" : slug}
                      disabled={page.isHome}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                        setDirty(true);
                      }}
                    />
                  </div>
                  {status === "published" && slug !== page.slug && !page.isHome && (
                    <p className="mt-1 text-xs text-amber-600">A 301 redirect from /{page.slug} will be created when you save.</p>
                  )}
                </div>
                <div>
                  <Label>Page type</Label>
                  <Select
                    value={pageType}
                    disabled={page.isHome}
                    onChange={(e) => {
                      setPageType(e.target.value);
                      setDirty(true);
                    }}
                  >
                    {PAGE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500">
                  Template: <span className="font-medium text-zinc-700">{page.template}</span>
                  <br />
                  Last updated: {new Date(page.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </aside>

          {/* Main editor */}
          <main className="admin-scroll min-w-0 flex-1 overflow-y-auto bg-zinc-50">
            <div className="mx-auto max-w-3xl p-6">
              {tab === "seo" ? (
                <SeoPanel
                  content={content}
                  slug={page.isHome ? "" : slug}
                  title={title}
                  siteUrl={siteUrl}
                  siteName={siteName}
                  onChange={(seo: SeoFields) => update((c) => ({ ...c, seo }))}
                />
              ) : selected ? (
                <SectionEditor
                  key={selected.id}
                  section={selected}
                  onChange={(patch) => patchSection(selected.id, patch)}
                />
              ) : (
                <div className="py-24 text-center text-sm text-zinc-500">Select a section on the left to edit its content.</div>
              )}
            </div>
          </main>

          {livePreview && (
            <div className="hidden w-[46%] shrink-0 flex-col border-l border-zinc-200 bg-white xl:flex">
              <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-xs text-zinc-500">
                <span>Preview of last saved draft</span>
                <button type="button" className="hover:text-zinc-900" onClick={() => setPreviewKey((k) => k + 1)}>
                  Reload
                </button>
              </div>
              <iframe key={previewKey} src={`/preview/${page.id}`} className="flex-1" title="Page preview" />
            </div>
          )}
        </div>
      </div>

      <BlockPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addSection} />
      <RevisionHistory
        open={historyOpen}
        pageId={page.id}
        onClose={() => setHistoryOpen(false)}
        onRestored={(c, t) => {
          setContent(c);
          setTitle(t);
          setSelectedId(c.sections[0]?.id ?? null);
          setDirty(false);
          setUnpublished(true);
          setHistoryOpen(false);
          toast("success", "Version restored to draft. Publish to make it live.");
        }}
      />
    </LinkOptionsContext.Provider>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 font-medium",
        active ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function MenuItem({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50">
      {icon}
      {children}
    </button>
  );
}

function SortableRow({
  section,
  index,
  selected,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const def = BLOCK_MAP[section.type];
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "group flex items-center gap-1 rounded-lg border px-1.5 py-1.5 text-sm",
        selected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-300",
        isDragging && "z-10 shadow-lg",
        !section.visible && !selected && "opacity-55",
      )}
    >
      <button type="button" className="cursor-grab touch-none p-0.5 opacity-50 hover:opacity-100" {...attributes} {...listeners} aria-label="Drag to reorder">
        <GripVertical className="size-4" />
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <BlockIcon name={def?.icon ?? "Layers"} className="size-4 shrink-0 opacity-70" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{section.label || def?.name || section.type}</span>
          <span className={cx("block truncate text-[11px]", selected ? "text-zinc-400" : "text-zinc-400")}>
            {index + 1}. {def?.name ?? "Unknown block"}
          </span>
        </span>
      </button>
      <div className={cx("flex items-center", selected ? "" : "opacity-0 group-hover:opacity-100")}>
        <RowBtn label={section.visible ? "Hide section" : "Show section"} onClick={onToggle}>
          {section.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        </RowBtn>
        <RowBtn label="Duplicate" onClick={onDuplicate}>
          <Copy className="size-3.5" />
        </RowBtn>
        <RowBtn label="Delete" onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </RowBtn>
      </div>
      {!section.visible && <EyeOff className={cx("size-3.5 shrink-0", selected ? "hidden" : "group-hover:hidden")} />}
    </li>
  );
}

function RowBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className="rounded p-1 hover:bg-white/15 hover:text-current">
      {children}
    </button>
  );
}

function SectionEditor({ section, onChange }: { section: Section; onChange: (patch: Partial<Section>) => void }) {
  const def = BLOCK_MAP[section.type];
  if (!def) return <p className="text-sm text-red-600">Unknown section type “{section.type}”.</p>;
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 ring-1 ring-zinc-200">
          <BlockIcon name={def.icon} className="size-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{def.name}</h2>
          <p className="text-sm text-zinc-500">{def.description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={section.visible} onChange={(e) => onChange({ visible: e.target.checked })} />
          Visible
        </label>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <FieldGroup fields={def.fields} value={section.data} onChange={(data) => onChange({ data })} />
      </div>

      <details className="rounded-xl border border-zinc-200 bg-white p-5 text-sm">
        <summary className="cursor-pointer font-medium">Advanced</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label help="Only shown in the dashboard.">Admin label</Label>
            <Input value={section.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
          </div>
          <div>
            <Label help="Link to this section with /page#anchor.">Anchor ID</Label>
            <Input
              value={section.anchor ?? ""}
              onChange={(e) => onChange({ anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

const CATEGORIES: BlockCategory[] = ["Hero & Banners", "Content", "Showcase", "Social Proof", "Call to Action"];

function BlockPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (type: string) => void }) {
  const [q, setQ] = useState("");
  const list = BLOCKS.filter((b) => !q || `${b.name} ${b.description}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose} title="Add a section" size="lg">
      <Input autoFocus placeholder="Search sections…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-5" />
      {CATEGORIES.map((cat) => {
        const items = list.filter((b) => b.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{cat}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((b) => (
                <button
                  type="button"
                  key={b.type}
                  onClick={() => onPick(b.type)}
                  className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:border-zinc-900 hover:bg-zinc-50"
                >
                  <BlockIcon name={b.icon} className="mt-0.5 size-5 shrink-0 text-zinc-600" />
                  <span>
                    <span className="block text-sm font-medium">{b.name}</span>
                    <span className="block text-xs text-zinc-500">{b.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

function RevisionHistory({
  open,
  pageId,
  onClose,
  onRestored,
}: {
  open: boolean;
  pageId: number;
  onClose: () => void;
  onRestored: (c: PageContent, title: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Version history" size="sm">
      <p className="mb-4 text-sm text-zinc-500">A version is saved every time the page is published. Restoring loads it into the draft.</p>
      {open && <RevisionList pageId={pageId} onRestored={onRestored} />}
    </Modal>
  );
}

function RevisionList({ pageId, onRestored }: { pageId: number; onRestored: (c: PageContent, title: string) => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<{ id: number; note: string | null; createdAt: string; title: string }[] | null>(null);
  useEffect(() => {
    listRevisionsAction(pageId).then((res) => (res.ok ? setRows(res.revisions) : toast("error", res.error)));
  }, [pageId, toast]);

  if (!rows) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-zinc-500">No published versions yet.</p>;
  return (
    <ul className="divide-y divide-zinc-100">
      {rows.map((r, i) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="text-sm">
            <p className="font-medium">
              {new Date(r.createdAt).toLocaleString()} {i === 0 && <Badge tone="green">Latest</Badge>}
            </p>
            <p className="text-xs text-zinc-500">
              {r.note} · {r.title}
            </p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              if (!confirm("Replace the current draft with this version?")) return;
              const res = await restoreRevisionAction(pageId, r.id);
              if (res.ok) onRestored(res.content, res.title);
              else toast("error", res.error);
            }}
          >
            Restore
          </Button>
        </li>
      ))}
    </ul>
  );
}

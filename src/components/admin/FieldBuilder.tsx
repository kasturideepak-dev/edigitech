"use client";

// Lets the client design a content type's form without a developer. Produces the
// same `Field[]` schema that `FieldGroup` renders, so whatever is built here is
// immediately the editing form for that type's entries.
import { useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Boxes,
  ChevronDown,
  ChevronRight,
  Copy,
  Hash,
  Image as ImageIcon,
  Link2,
  ListChecks,
  MousePointerClick,
  Plus,
  Repeat,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { Field, FieldType } from "@/lib/types";
import { Badge, Button, Input, Label, Modal, Select, Toggle, cx } from "./ui";

type Meta = { label: string; description: string; icon: typeof Type };

export const FIELD_TYPES: Record<FieldType, Meta> = {
  text: { label: "Short text", description: "A single line — names, headings, prices.", icon: Type },
  textarea: { label: "Long text", description: "Paragraphs. New lines and **bold** are kept.", icon: AlignLeft },
  number: { label: "Number", description: "A whole or decimal number.", icon: Hash },
  toggle: { label: "Yes / No", description: "An on/off switch, e.g. “Featured”.", icon: ToggleLeft },
  select: { label: "Dropdown", description: "Pick one option from a list you define.", icon: ListChecks },
  image: { label: "Image", description: "Upload or pick from the media library, with alt text.", icon: ImageIcon },
  link: { label: "Button / link", description: "Button text plus where it goes.", icon: MousePointerClick },
  url: { label: "Web address", description: "A plain URL, e.g. a YouTube video.", icon: Link2 },
  group: { label: "Group", description: "Bundle several fields under one heading.", icon: Boxes },
  list: { label: "Repeater", description: "A list of rows that repeat — FAQs, features, team.", icon: Repeat },
};

const ORDER: FieldType[] = ["text", "textarea", "number", "toggle", "select", "image", "link", "url", "group", "list"];

/** "Client name" → "clientName" */
export const toKey = (label: string) => {
  const words = label
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  const key = words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join("");
  return /^[a-zA-Z]/.test(key) ? key : `f${key}`;
};

function blankField(type: FieldType, taken: string[]): Field {
  const base = FIELD_TYPES[type].label;
  let label = base;
  for (let i = 2; taken.includes(toKey(label)); i++) label = `${base} ${i}`;
  const common = { name: toKey(label), label };
  switch (type) {
    case "select":
      return { ...common, type, options: [{ label: "Option 1", value: "option-1" }] };
    case "group":
    case "list":
      return { ...common, type, fields: [{ type: "text", name: "title", label: "Title" }] } as Field;
    case "textarea":
      return { ...common, type, rows: 3 };
    default:
      return { ...common, type } as Field;
  }
}

export function FieldBuilder({
  fields,
  onChange,
  savedKeys = [],
  depth = 0,
}: {
  fields: Field[];
  onChange: (fields: Field[]) => void;
  /** Keys that already hold data in saved entries — renaming them needs a warning. */
  savedKeys?: string[];
  depth?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);

  const update = (i: number, f: Field) => onChange(fields.map((x, j) => (j === i ? f : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (open === i) setOpen(j);
  };
  const remove = (i: number) => {
    const f = fields[i];
    const warn = savedKeys.includes(f.name)
      ? `Remove “${f.label}”? Existing entries keep their stored value, but it will no longer be shown or editable.`
      : `Remove “${f.label}”?`;
    if (!confirm(warn)) return;
    onChange(fields.filter((_, j) => j !== i));
    setOpen(null);
  };
  const duplicate = (i: number) => {
    const f = fields[i];
    const taken = fields.map((x) => x.name);
    let label = `${f.label} copy`;
    for (let n = 2; taken.includes(toKey(label)); n++) label = `${f.label} copy ${n}`;
    const next = [...fields];
    next.splice(i + 1, 0, { ...structuredClone(f), label, name: toKey(label) } as Field);
    onChange(next);
    setOpen(i + 1);
  };
  const add = (type: FieldType) => {
    onChange([...fields, blankField(type, fields.map((f) => f.name))]);
    setOpen(fields.length);
    setPicking(false);
  };

  return (
    <div className={cx("space-y-2", depth > 0 && "rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 p-3")}>
      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
          No fields yet. Add the first one below.
        </p>
      )}

      {fields.map((f, i) => {
        const meta = FIELD_TYPES[f.type];
        const Icon = meta.icon;
        const expanded = open === i;
        return (
          <div key={i} className={cx("rounded-lg border bg-white", expanded ? "border-zinc-400 shadow-sm" : "border-zinc-200")}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                onClick={() => setOpen(expanded ? null : i)}
              >
                {expanded ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {f.label || <em className="text-zinc-400">Untitled</em>}
                    {f.required && <span className="ml-0.5 text-red-500">*</span>}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-zinc-400">{f.name}</span>
                </span>
              </button>
              <Badge>{meta.label}</Badge>
              {f.type === "list" || f.type === "group" ? (
                <span className="hidden text-xs text-zinc-400 sm:inline">{f.fields?.length ?? 0} inside</span>
              ) : null}
              <div className="flex items-center">
                <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="size-3.5" />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === fields.length - 1}>
                  <ArrowDown className="size-3.5" />
                </IconBtn>
                <IconBtn label="Duplicate" onClick={() => duplicate(i)}>
                  <Copy className="size-3.5" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => remove(i)} danger>
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
            </div>
            {expanded && (
              <div className="border-t border-zinc-100 px-4 py-4">
                <FieldSettings
                  field={f}
                  siblings={fields.filter((_, j) => j !== i).map((x) => x.name)}
                  saved={savedKeys.includes(f.name)}
                  onChange={(nf) => update(i, nf)}
                  depth={depth}
                />
              </div>
            )}
          </div>
        );
      })}

      <Button size="sm" onClick={() => setPicking(true)} className="w-full border-dashed">
        <Plus className="size-4" /> Add field
      </Button>

      <Modal open={picking} onClose={() => setPicking(false)} title="Add a field" size="lg">
        <div className="grid gap-2 sm:grid-cols-2">
          {ORDER.filter((t) => depth < 2 || (t !== "group" && t !== "list")).map((t) => {
            const m = FIELD_TYPES[t];
            const Icon = m.icon;
            return (
              <button
                key={t}
                type="button"
                onClick={() => add(t)}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-left transition hover:border-zinc-900 hover:bg-zinc-50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{m.label}</span>
                  <span className="block text-xs text-zinc-500">{m.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "rounded p-1.5 text-zinc-400 transition disabled:opacity-30",
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-zinc-100 hover:text-zinc-800",
      )}
    >
      {children}
    </button>
  );
}

function FieldSettings({
  field: f,
  siblings,
  saved,
  onChange,
  depth,
}: {
  field: Field;
  siblings: string[];
  saved: boolean;
  onChange: (f: Field) => void;
  depth: number;
}) {
  const [keyTouched, setKeyTouched] = useState(saved || f.name !== toKey(f.label));
  const [originalKey] = useState(f.name);
  const set = (patch: Partial<Field>) => onChange({ ...f, ...patch } as Field);
  const keyClash = siblings.includes(f.name);
  const keyInvalid = !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.name);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label required>Label</Label>
          <Input
            value={f.label}
            autoFocus
            onChange={(e) => set({ label: e.target.value, ...(keyTouched ? {} : { name: toKey(e.target.value) }) })}
          />
        </div>
        <div>
          <Label help="How the value is stored. Letters and numbers, no spaces.">Key</Label>
          <Input
            value={f.name}
            className={cx("font-mono", (keyClash || keyInvalid) && "border-red-400")}
            onChange={(e) => {
              setKeyTouched(true);
              set({ name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") });
            }}
          />
          {keyClash && <p className="mt-1 text-xs text-red-600">Another field already uses this key.</p>}
          {!keyClash && keyInvalid && f.name && <p className="mt-1 text-xs text-red-600">Must start with a letter.</p>}
          {saved && f.name !== originalKey && (
            <p className="mt-1 text-xs text-amber-700">
              Entries saved under “{originalKey}” won&apos;t show in this field after renaming.
            </p>
          )}
        </div>
      </div>

      <div>
        <Label help="Shown under the field to guide whoever fills it in.">Help text</Label>
        <Input value={f.help ?? ""} onChange={(e) => set({ help: e.target.value || undefined })} />
      </div>

      <div className="flex flex-wrap items-end gap-5">
        <div>
          <Label>Width</Label>
          <Select value={f.width ?? "full"} onChange={(e) => set({ width: e.target.value as Field["width"] })} className="w-40">
            <option value="full">Full width</option>
            <option value="half">Half</option>
            <option value="third">One third</option>
          </Select>
        </div>
        {f.type !== "toggle" && f.type !== "group" && (
          <Toggle checked={!!f.required} onChange={(v) => set({ required: v || undefined })} label="Required" />
        )}
      </div>

      {/* ---- type-specific settings ---- */}
      {f.type === "text" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Placeholder</Label>
            <Input value={f.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value || undefined })} />
          </div>
          <div>
            <Label help="Leave empty for no limit.">Max characters</Label>
            <Input
              type="number"
              value={f.maxLength ?? ""}
              onChange={(e) => set({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      )}

      {f.type === "textarea" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Height (rows)</Label>
            <Input type="number" min={2} max={20} value={f.rows ?? 3} onChange={(e) => set({ rows: Number(e.target.value) || 3 })} />
          </div>
          <div>
            <Label>Placeholder</Label>
            <Input value={f.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value || undefined })} />
          </div>
        </div>
      )}

      {f.type === "number" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Minimum</Label>
            <Input type="number" value={f.min ?? ""} onChange={(e) => set({ min: e.target.value === "" ? undefined : Number(e.target.value) })} />
          </div>
          <div>
            <Label>Maximum</Label>
            <Input type="number" value={f.max ?? ""} onChange={(e) => set({ max: e.target.value === "" ? undefined : Number(e.target.value) })} />
          </div>
        </div>
      )}

      {f.type === "url" && (
        <div>
          <Label>Placeholder</Label>
          <Input value={f.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value || undefined })} />
        </div>
      )}

      {f.type === "select" && <OptionsEditor options={f.options} onChange={(options) => set({ options })} />}

      {(f.type === "group" || f.type === "list") && (
        <div className="space-y-3">
          {f.type === "list" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label help="Which inner field names each collapsed row.">Row title from</Label>
                <Select value={f.itemLabel ?? ""} onChange={(e) => set({ itemLabel: e.target.value || undefined })}>
                  <option value="">— Row number —</option>
                  {f.fields
                    .filter((x) => x.type === "text" || x.type === "textarea")
                    .map((x) => (
                      <option key={x.name} value={x.name}>
                        {x.label}
                      </option>
                    ))}
                </Select>
              </div>
              <div>
                <Label>Min rows</Label>
                <Input type="number" min={0} value={f.min ?? ""} onChange={(e) => set({ min: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <Label>Max rows</Label>
                <Input type="number" min={1} value={f.max ?? ""} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
          )}
          <div>
            <Label>{f.type === "list" ? "Fields in each row" : "Fields in this group"}</Label>
            <FieldBuilder fields={f.fields} onChange={(fields) => set({ fields })} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: { label: string; value: string }[];
  onChange: (o: { label: string; value: string }[]) => void;
}) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <div>
      <Label help="Label is what editors see; value is what gets stored.">Options</Label>
      <div className="space-y-2">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={o.label}
              placeholder="Label"
              onChange={(e) =>
                onChange(
                  options.map((x, j) =>
                    j === i ? { label: e.target.value, value: x.value === slug(x.label) ? slug(e.target.value) : x.value } : x,
                  ),
                )
              }
            />
            <Input
              value={o.value}
              placeholder="value"
              className="w-44 font-mono"
              onChange={(e) => onChange(options.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
            />
            <button
              type="button"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              disabled={options.length <= 1}
              className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              aria-label="Remove option"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        <Button
          size="sm"
          onClick={() => onChange([...options, { label: `Option ${options.length + 1}`, value: `option-${options.length + 1}` }])}
        >
          <Plus className="size-3.5" /> Add option
        </Button>
      </div>
    </div>
  );
}

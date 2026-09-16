"use client";

import { createContext, useContext, useId, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  ImagePlus,
  X,
} from "lucide-react";
import type { Field, ImageValue, Link } from "@/lib/types";
import { Button, Input, Label, Modal, Select, Textarea, Toggle, cx } from "./ui";
import { MediaBrowser } from "./MediaBrowser";

type Obj = Record<string, unknown>;

/** Internal pages offered as suggestions in link/URL fields. */
export const LinkOptionsContext = createContext<{ label: string; url: string }[]>([]);

function LinkDatalist({ id }: { id: string }) {
  const options = useContext(LinkOptionsContext);
  return (
    <datalist id={id}>
      <option value="whatsapp">WhatsApp (number from Site Settings)</option>
      {options.map((o) => (
        <option key={o.url} value={o.url}>
          {o.label}
        </option>
      ))}
    </datalist>
  );
}

const widthClass = (w?: Field["width"]) =>
  w === "half" ? "sm:col-span-3" : w === "third" ? "sm:col-span-2" : "sm:col-span-6";

/** Renders a grid of fields bound to an object value. */
export function FieldGroup({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
      {fields.map((f) => (
        <div key={f.name} className={widthClass(f.width)}>
          <FieldInput field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
        </div>
      ))}
    </div>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  switch (field.type) {
    case "text":
      return (
        <>
          <Label required={field.required} help={field.help}>
            {field.label}
          </Label>
          <Input
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
    case "textarea":
      return (
        <>
          <Label required={field.required} help={field.help}>
            {field.label}
          </Label>
          <Textarea
            rows={field.rows ?? 3}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
    case "number":
      return (
        <>
          <Label required={field.required} help={field.help}>
            {field.label}
          </Label>
          <Input
            type="number"
            min={field.min}
            max={field.max}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </>
      );
    case "toggle":
      return (
        <div className="pt-1">
          <Toggle checked={!!value} onChange={onChange} label={field.label} />
          {field.help && <p className="mt-1 text-xs text-zinc-500">{field.help}</p>}
        </div>
      );
    case "select":
      return (
        <>
          <Label required={field.required} help={field.help}>
            {field.label}
          </Label>
          <Select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">— Select —</option>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </>
      );
    case "url":
      return (
        <>
          <Label required={field.required} help={field.help}>
            {field.label}
          </Label>
          <Input
            value={(value as string) ?? ""}
            placeholder={field.placeholder ?? "/page-url or https://…"}
            list={id}
            onChange={(e) => onChange(e.target.value)}
          />
          <LinkDatalist id={id} />
        </>
      );
    case "link":
      return <LinkInput field={field} value={value as Link | undefined} onChange={onChange} />;
    case "image":
      return <ImageInput field={field} value={value as ImageValue | null | undefined} onChange={onChange} />;
    case "group":
      return (
        <fieldset className="rounded-lg border border-zinc-200 p-4">
          <legend className="px-1 text-[13px] font-medium text-zinc-800">{field.label}</legend>
          {field.help && <p className="-mt-1 mb-3 text-xs text-zinc-500">{field.help}</p>}
          <FieldGroup fields={field.fields} value={(value as Obj) ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list":
      return <ListInput field={field} value={(value as Obj[]) ?? []} onChange={onChange} />;
  }
}

function LinkInput({ field, value, onChange }: { field: Field; value?: Link; onChange: (v: unknown) => void }) {
  const id = useId();
  const v: Link = { label: "", url: "", ...(value ?? {}) };
  return (
    <div>
      <Label required={field.required} help={field.help}>
        {field.label}
      </Label>
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Button text" value={v.label} onChange={(e) => onChange({ ...v, label: e.target.value })} />
          <Input placeholder="/page or https://…" list={id} value={v.url} onChange={(e) => onChange({ ...v, url: e.target.value })} />
          <LinkDatalist id={id} />
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <input type="checkbox" checked={!!v.newTab} onChange={(e) => onChange({ ...v, newTab: e.target.checked })} />
          Open in new tab
        </label>
      </div>
    </div>
  );
}

function ImageInput({ field, value, onChange }: { field: Field; value?: ImageValue | null; onChange: (v: unknown) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label required={field.required} help={field.help}>
        {field.label}
      </Label>
      <div className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-[repeating-conic-gradient(#f4f4f5_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] hover:border-zinc-400"
          title="Choose image"
        >
          {value?.url ? (
            <img src={value.url} alt="" className="size-full object-contain" />
          ) : (
            <ImagePlus className="size-6 text-zinc-400" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            placeholder="Alt text (describe the image)"
            value={value?.alt ?? ""}
            disabled={!value?.url}
            onChange={(e) => onChange({ url: value?.url ?? "", alt: e.target.value })}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" onClick={() => setOpen(true)}>
              {value?.url ? "Replace" : "Choose image"}
            </Button>
            {value?.url && (
              <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
                <X className="size-3.5" /> Remove
              </Button>
            )}
            {value?.url && <span className="truncate text-[11px] text-zinc-400">{value.url}</span>}
          </div>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Select image" size="xl">
        <MediaBrowser
          imagesOnly
          onSelect={(m) => {
            onChange({ url: m.url, alt: value?.alt || m.alt });
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function itemTitle(item: Obj, field: Extract<Field, { type: "list" }>, index: number) {
  const key = field.itemLabel;
  const raw = key ? item?.[key] : undefined;
  const text = typeof raw === "string" ? raw.replace(/\*\*/g, "").split("\n")[0] : "";
  return text || `Item ${index + 1}`;
}

function blankItem(fields: Field[]): Obj {
  const o: Obj = {};
  for (const f of fields) {
    if (f.type === "list") o[f.name] = [];
    else if (f.type === "group") o[f.name] = blankItem(f.fields);
    else if (f.type === "toggle") o[f.name] = false;
    else if (f.type === "image") o[f.name] = null;
    else if (f.type === "link") o[f.name] = { label: "", url: "" };
    else if (f.type === "number") o[f.name] = 0;
    else o[f.name] = "";
  }
  return o;
}

function ListInput({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: Obj[]; onChange: (v: unknown) => void }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const items = Array.isArray(value) ? value : [];
  const canAdd = !field.max || items.length < field.max;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
    setOpen(open === from ? to : open);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label help={field.help}>
          {field.label} <span className="font-normal text-zinc-400">({items.length})</span>
        </Label>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm text-zinc-800"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {open === i ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                <span className="truncate">{itemTitle(item, field, i)}</span>
              </button>
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                <ArrowUp className="size-3.5" />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                <ArrowDown className="size-3.5" />
              </IconBtn>
              <IconBtn
                label="Duplicate"
                disabled={!canAdd}
                onClick={() => {
                  const next = [...items];
                  next.splice(i + 1, 0, structuredClone(item));
                  onChange(next);
                }}
              >
                <Copy className="size-3.5" />
              </IconBtn>
              <IconBtn
                label="Remove"
                danger
                disabled={!!field.min && items.length <= field.min}
                onClick={() => {
                  if (!confirm("Remove this item?")) return;
                  onChange(items.filter((_, j) => j !== i));
                  setOpen(null);
                }}
              >
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
            {open === i && (
              <div className="border-t border-zinc-100 p-3">
                <FieldGroup
                  fields={field.fields}
                  value={item}
                  onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="mt-1.5"
        disabled={!canAdd}
        onClick={() => {
          onChange([...items, blankItem(field.fields)]);
          setOpen(items.length);
        }}
      >
        <Plus className="size-3.5" /> Add {field.label.toLowerCase().replace(/s$/, "")}
        {field.max ? <span className="text-zinc-400">(max {field.max})</span> : null}
      </Button>
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
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded p-1 text-zinc-500 disabled:opacity-30",
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-zinc-100 hover:text-zinc-900",
      )}
    >
      {children}
    </button>
  );
}

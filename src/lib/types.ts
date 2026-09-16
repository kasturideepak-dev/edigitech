// Shared CMS types (safe to import from client and server code).

export type Link = { label: string; url: string; newTab?: boolean };

/** Image value stored in section data: a URL plus alt text. */
export type ImageValue = { url: string; alt?: string };

export type SeoFields = {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonical: string;
  noindex: boolean;
  nofollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: ImageValue | null;
  /** Extra JSON-LD pasted by the SEO team (optional). */
  customSchema: string;
};

export type Section = {
  id: string;
  type: string;
  visible: boolean;
  /** Optional HTML id so menus can link to #anchor */
  anchor?: string;
  /** Admin-only label to tell similar sections apart */
  label?: string;
  data: Record<string, unknown>;
};

export type PageContent = {
  sections: Section[];
  seo: SeoFields;
};

// ---------- Field schema used to auto-generate admin forms ----------

type BaseField = {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  /** Layout hint for the admin form grid */
  width?: "full" | "half" | "third";
};

export type Field =
  | (BaseField & { type: "text"; placeholder?: string; maxLength?: number })
  | (BaseField & { type: "textarea"; rows?: number; placeholder?: string })
  | (BaseField & { type: "number"; min?: number; max?: number })
  | (BaseField & { type: "toggle" })
  | (BaseField & { type: "select"; options: { label: string; value: string }[] })
  | (BaseField & { type: "image" })
  | (BaseField & { type: "link" })
  | (BaseField & { type: "url"; placeholder?: string })
  | (BaseField & { type: "group"; fields: Field[] })
  | (BaseField & {
      type: "list";
      fields: Field[];
      /** Sub-field used as the collapsed row title */
      itemLabel?: string;
      min?: number;
      max?: number;
    });

export type FieldType = Field["type"];

export const emptySeo = (): SeoFields => ({
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonical: "",
  noindex: false,
  nofollow: false,
  ogTitle: "",
  ogDescription: "",
  ogImage: null,
  customSchema: "",
});

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

// ---------- Content types (blog posts, products, locations, anything the client invents) ----------

/** A taxonomy on a content type, e.g. "category" on posts → /blog/category/<term>. */
export type TaxonomyDef = {
  /** Stable key used in entry.terms, e.g. "category". */
  key: string;
  name: string;
  namePlural: string;
  /** URL segment, e.g. "category" → /blog/category/seo-tips. Editable. */
  slug: string;
  /** Allow an entry to hold more than one term (tags) vs exactly one (category). */
  multiple?: boolean;
};

/** Optional built-in capabilities a content type can switch on, beyond its custom fields. */
export type ContentTypeSupports = {
  /** Rich-text body edited with the TipTap editor. */
  body: boolean;
  excerpt: boolean;
  coverImage: boolean;
  author: boolean;
  publishDate: boolean;
  seo: boolean;
};

export const defaultSupports = (): ContentTypeSupports => ({
  body: false,
  excerpt: false,
  coverImage: false,
  author: false,
  publishDate: false,
  seo: true,
});

/** Entry field values, shaped by its type's `fields`. */
export type EntryData = Record<string, unknown>;

/** taxonomy key → selected term slugs */
export type EntryTerms = Record<string, string[]>;

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

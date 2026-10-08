import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  ContentTypeSupports,
  EntryData,
  EntryTerms,
  Field,
  ImageValue,
  PageContent,
  SeoFields,
  TaxonomyDef,
} from "@/lib/types";

// Postgres stores JSON natively as jsonb, so no driver-side string handling is needed.
// `$type<T>()` keeps the TypeScript shape without affecting the column definition.
const json = <T>(name: string) => jsonb(name).$type<T>();

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    // Postgres has no ON UPDATE; Drizzle stamps this on every update it issues.
    .$onUpdate(() => new Date());

export const userRole = pgEnum("user_role", ["admin", "editor", "seo"]);
export const contentStatus = pgEnum("content_status", ["draft", "published"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 100 }).notNull(),
    role: userRole("role").notNull().default("editor"),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    // Path without leading slash, e.g. "whatsapp-marketing" or "seo-services/pune". Empty for the homepage.
    slug: varchar("slug", { length: 190 }).notNull(),
    pageType: varchar("page_type", { length: 40 }).notNull().default("generic"),
    template: varchar("template", { length: 60 }).notNull().default("blank"),
    status: contentStatus("status").notNull().default("draft"),
    isHome: boolean("is_home").notNull().default(false),
    // Working copy edited in the builder; `published` is what visitors see.
    draft: json<PageContent>("draft").notNull(),
    published: json<PageContent>("published"),
    hasUnpublishedChanges: boolean("has_unpublished_changes").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("pages_slug_uq").on(t.slug), index("pages_type_idx").on(t.pageType)],
);

export const pageRevisions = pgTable(
  "page_revisions",
  {
    id: serial("id").primaryKey(),
    pageId: integer("page_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: json<PageContent>("content").notNull(),
    note: varchar("note", { length: 190 }),
    userId: integer("user_id"),
    createdAt: createdAt(),
  },
  (t) => [index("rev_page_idx").on(t.pageId)],
);

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    // Public URL path, e.g. /uploads/2026/09/hero-banner.webp
    url: varchar("url", { length: 300 }).notNull(),
    fileName: varchar("file_name", { length: 200 }).notNull(),
    originalName: varchar("original_name", { length: 200 }).notNull(),
    mime: varchar("mime", { length: 80 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: varchar("alt", { length: 250 }).notNull().default(""),
    title: varchar("title", { length: 200 }).notNull().default(""),
    folder: varchar("folder", { length: 80 }).notNull().default("general"),
    uploadedBy: integer("uploaded_by"),
    createdAt: createdAt(),
  },
  (t) => [index("media_folder_idx").on(t.folder)],
);

export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: json<unknown>("value").notNull(),
  updatedAt: updatedAt(),
});

export const redirects = pgTable(
  "redirects",
  {
    id: serial("id").primaryKey(),
    fromPath: varchar("from_path", { length: 250 }).notNull(),
    toPath: varchar("to_path", { length: 500 }).notNull(),
    statusCode: integer("status_code").notNull().default(301),
    hits: integer("hits").notNull().default(0),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("redirects_from_uq").on(t.fromPath)],
);

export type User = typeof users.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;

// ---------------------------------------------------------------------------
// Content types: the client defines these from the dashboard. Blog posts,
// products, locations and anything else are all rows in `content_types`, with
// their entries in `content_entries`. Every URL prefix is editable.
// ---------------------------------------------------------------------------

export const contentTypeKind = pgEnum("content_type_kind", ["collection", "singleton"]);

export const contentTypes = pgTable(
  "content_types",
  {
    id: serial("id").primaryKey(),
    /** Stable identifier used in code and block Source fields, e.g. "post", "product". */
    key: varchar("key", { length: 60 }).notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    namePlural: varchar("name_plural", { length: 80 }).notNull(),
    /** URL prefix without slashes, e.g. "blog" → /blog/<entry>. Editable; changes create 301s. */
    slug: varchar("slug", { length: 80 }).notNull(),
    kind: contentTypeKind("kind").notNull().default("collection"),
    description: varchar("description", { length: 300 }).notNull().default(""),
    /** lucide-react icon name for the sidebar */
    icon: varchar("icon", { length: 40 }).notNull().default("FileText"),
    hasArchive: boolean("has_archive").notNull().default(true),
    archiveTitle: varchar("archive_title", { length: 200 }).notNull().default(""),
    archiveIntro: text("archive_intro").notNull().default(""),
    perPage: integer("per_page").notNull().default(9),
    /** The client-built form schema for this type's entries. */
    fields: json<Field[]>("fields").notNull(),
    taxonomies: json<TaxonomyDef[]>("taxonomies").notNull(),
    supports: json<ContentTypeSupports>("supports").notNull(),
    /** Built-in types (post, product, location) can be renamed but not deleted. */
    isSystem: boolean("is_system").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("content_types_key_uq").on(t.key), uniqueIndex("content_types_slug_uq").on(t.slug)],
);

export const contentEntries = pgTable(
  "content_entries",
  {
    id: serial("id").primaryKey(),
    typeId: integer("type_id").notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 190 }).notNull(),
    /** Set when the slug is edited by hand, so bulk tools never overwrite it. */
    slugLocked: boolean("slug_locked").notNull().default(false),
    status: contentStatus("status").notNull().default("draft"),
    /** Field values, shaped by the type's `fields`. */
    data: json<EntryData>("data").notNull(),
    /** taxonomy key → term slugs. Queried with jsonb containment (GIN index below). */
    terms: json<EntryTerms>("terms").notNull(),
    seo: json<SeoFields>("seo").notNull(),
    /** Optional built-ins, enabled per type via `supports`. */
    excerpt: varchar("excerpt", { length: 400 }).notNull().default(""),
    body: text("body").notNull().default(""),
    coverImage: json<ImageValue | null>("cover_image"),
    authorId: integer("author_id"),
    authorName: varchar("author_name", { length: 120 }).notNull().default(""),
    readMinutes: integer("read_minutes").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Slugs are unique per type, so /blog/pune and /locations/pune can coexist.
    uniqueIndex("entries_type_slug_uq").on(t.typeId, t.slug),
    index("entries_type_status_idx").on(t.typeId, t.status),
    index("entries_terms_gin").using("gin", t.terms),
  ],
);

export const contentTerms = pgTable(
  "content_terms",
  {
    id: serial("id").primaryKey(),
    typeId: integer("type_id").notNull(),
    /** Matches a TaxonomyDef.key on the parent type, e.g. "category". */
    taxonomy: varchar("taxonomy", { length: 60 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: varchar("description", { length: 300 }).notNull().default(""),
    seo: json<SeoFields>("seo").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("terms_type_tax_slug_uq").on(t.typeId, t.taxonomy, t.slug),
    index("terms_type_idx").on(t.typeId),
  ],
);

export type ContentType = typeof contentTypes.$inferSelect;
export type ContentEntry = typeof contentEntries.$inferSelect;
export type ContentTerm = typeof contentTerms.$inferSelect;

export const enquiryStatus = pgEnum("enquiry_status", ["new", "read", "archived"]);

/** Contact form submissions. Stored here so nothing is lost if email delivery fails. */
export const enquiries = pgTable(
  "enquiries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    subject: varchar("subject", { length: 200 }).notNull().default(""),
    message: text("message").notNull(),
    /** Page the form was submitted from. */
    source: varchar("source", { length: 250 }).notNull().default(""),
    status: enquiryStatus("status").notNull().default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("enquiries_status_idx").on(t.status), index("enquiries_created_idx").on(t.createdAt)],
);

export type Enquiry = typeof enquiries.$inferSelect;

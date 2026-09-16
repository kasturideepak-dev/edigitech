import {
  customType,
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import type { PageContent } from "@/lib/types";

// JSON column that also works on MariaDB (Hostinger), where JSON is stored as LONGTEXT
// and returned to the driver as a string.
const json = <T>(name: string) =>
  customType<{ data: T; driverData: string | T }>({
    dataType: () => "json",
    toDriver: (value) => JSON.stringify(value),
    fromDriver: (value) => (typeof value === "string" ? (JSON.parse(value) as T) : value),
  })(name);

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 100 }).notNull(),
    role: mysqlEnum("role", ["admin", "editor", "seo"]).notNull().default("editor"),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    // Path without leading slash, e.g. "whatsapp-marketing" or "seo-services/pune". Empty for the homepage.
    slug: varchar("slug", { length: 190 }).notNull(),
    pageType: varchar("page_type", { length: 40 }).notNull().default("generic"),
    template: varchar("template", { length: 60 }).notNull().default("blank"),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    isHome: boolean("is_home").notNull().default(false),
    // Working copy edited in the builder; `published` is what visitors see.
    draft: json<PageContent>("draft").notNull(),
    published: json<PageContent>("published"),
    hasUnpublishedChanges: boolean("has_unpublished_changes").notNull().default(true),
    publishedAt: timestamp("published_at"),
    deletedAt: timestamp("deleted_at"),
    createdBy: int("created_by"),
    updatedBy: int("updated_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex("pages_slug_uq").on(t.slug), index("pages_type_idx").on(t.pageType)],
);

export const pageRevisions = mysqlTable(
  "page_revisions",
  {
    id: int("id").autoincrement().primaryKey(),
    pageId: int("page_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: json<PageContent>("content").notNull(),
    note: varchar("note", { length: 190 }),
    userId: int("user_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("rev_page_idx").on(t.pageId)],
);

export const media = mysqlTable(
  "media",
  {
    id: int("id").autoincrement().primaryKey(),
    // Public URL path, e.g. /uploads/2026/09/hero-banner.webp
    url: varchar("url", { length: 300 }).notNull(),
    fileName: varchar("file_name", { length: 200 }).notNull(),
    originalName: varchar("original_name", { length: 200 }).notNull(),
    mime: varchar("mime", { length: 80 }).notNull(),
    size: int("size").notNull(),
    width: int("width"),
    height: int("height"),
    alt: varchar("alt", { length: 250 }).notNull().default(""),
    title: varchar("title", { length: 200 }).notNull().default(""),
    folder: varchar("folder", { length: 80 }).notNull().default("general"),
    uploadedBy: int("uploaded_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("media_folder_idx").on(t.folder)],
);

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: json<unknown>("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const redirects = mysqlTable(
  "redirects",
  {
    id: int("id").autoincrement().primaryKey(),
    fromPath: varchar("from_path", { length: 250 }).notNull(),
    toPath: varchar("to_path", { length: 500 }).notNull(),
    statusCode: int("status_code").notNull().default(301),
    hits: int("hits").notNull().default(0),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("redirects_from_uq").on(t.fromPath)],
);

export type User = typeof users.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;

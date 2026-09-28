CREATE TYPE "public"."content_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."content_type_kind" AS ENUM('collection', 'singleton');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'seo');--> statement-breakpoint
CREATE TABLE "content_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer NOT NULL,
	"title" varchar(220) NOT NULL,
	"slug" varchar(190) NOT NULL,
	"slug_locked" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"data" jsonb NOT NULL,
	"terms" jsonb NOT NULL,
	"seo" jsonb NOT NULL,
	"excerpt" varchar(400) DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"cover_image" jsonb,
	"author_id" integer,
	"author_name" varchar(120) DEFAULT '' NOT NULL,
	"read_minutes" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer NOT NULL,
	"taxonomy" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"description" varchar(300) DEFAULT '' NOT NULL,
	"seo" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(60) NOT NULL,
	"name" varchar(80) NOT NULL,
	"name_plural" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"kind" "content_type_kind" DEFAULT 'collection' NOT NULL,
	"description" varchar(300) DEFAULT '' NOT NULL,
	"icon" varchar(40) DEFAULT 'FileText' NOT NULL,
	"has_archive" boolean DEFAULT true NOT NULL,
	"archive_title" varchar(200) DEFAULT '' NOT NULL,
	"archive_intro" text DEFAULT '' NOT NULL,
	"per_page" integer DEFAULT 9 NOT NULL,
	"fields" jsonb NOT NULL,
	"taxonomies" jsonb NOT NULL,
	"supports" jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(300) NOT NULL,
	"file_name" varchar(200) NOT NULL,
	"original_name" varchar(200) NOT NULL,
	"mime" varchar(80) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" varchar(250) DEFAULT '' NOT NULL,
	"title" varchar(200) DEFAULT '' NOT NULL,
	"folder" varchar(80) DEFAULT 'general' NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" jsonb NOT NULL,
	"note" varchar(190),
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(190) NOT NULL,
	"page_type" varchar(40) DEFAULT 'generic' NOT NULL,
	"template" varchar(60) DEFAULT 'blank' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"is_home" boolean DEFAULT false NOT NULL,
	"draft" jsonb NOT NULL,
	"published" jsonb,
	"has_unpublished_changes" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_path" varchar(250) NOT NULL,
	"to_path" varchar(500) NOT NULL,
	"status_code" integer DEFAULT 301 NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(190) NOT NULL,
	"password_hash" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "entries_type_slug_uq" ON "content_entries" USING btree ("type_id","slug");--> statement-breakpoint
CREATE INDEX "entries_type_status_idx" ON "content_entries" USING btree ("type_id","status");--> statement-breakpoint
CREATE INDEX "entries_terms_gin" ON "content_entries" USING gin ("terms");--> statement-breakpoint
CREATE UNIQUE INDEX "terms_type_tax_slug_uq" ON "content_terms" USING btree ("type_id","taxonomy","slug");--> statement-breakpoint
CREATE INDEX "terms_type_idx" ON "content_terms" USING btree ("type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_types_key_uq" ON "content_types" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "content_types_slug_uq" ON "content_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "rev_page_idx" ON "page_revisions" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_slug_uq" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "pages_type_idx" ON "pages" USING btree ("page_type");--> statement-breakpoint
CREATE UNIQUE INDEX "redirects_from_uq" ON "redirects" USING btree ("from_path");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(190) NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"subject" varchar(200) DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"source" varchar(250) DEFAULT '' NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");
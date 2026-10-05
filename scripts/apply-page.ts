// Applies section content to an existing page from a JSON file.
//
// Each section in the file is merged over its block's defaults, so you only
// specify the fields you care about. Useful for building out a page's content
// repeatably instead of clicking through the dashboard.
//
// Usage:
//   npx tsx scripts/apply-page.ts about-us about.json            # saves as draft
//   npx tsx scripts/apply-page.ts about-us about.json --publish  # draft + live
//
// File shape:
//   {
//     "title": "optional page title",
//     "seo": { "metaTitle": "...", "metaDescription": "..." },
//     "sections": [ { "type": "hero", "label": "...", "data": { ... } } ]
//   }
import "dotenv/config";
import fs from "node:fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { pgConnection, pgSsl } from "../src/db/connection";
import { BLOCK_MAP } from "../src/blocks/definitions";
import { newSectionId } from "../src/templates";
import { emptySeo, type PageContent, type Section } from "../src/lib/types";

type InputSection = { type: string; label?: string; anchor?: string; visible?: boolean; data?: Record<string, unknown> };

async function main() {
  const [slugArg, file] = process.argv.slice(2);
  const publish = process.argv.includes("--publish");
  if (!slugArg || !file) throw new Error("Usage: tsx scripts/apply-page.ts <slug> <file.json> [--publish]");

  const input = JSON.parse(fs.readFileSync(file, "utf8")) as {
    title?: string;
    seo?: Partial<PageContent["seo"]>;
    sections: InputSection[];
  };

  const sections: Section[] = input.sections.map((s) => {
    const def = BLOCK_MAP[s.type];
    if (!def) throw new Error(`Unknown block type "${s.type}". Available: ${Object.keys(BLOCK_MAP).join(", ")}`);
    return {
      id: newSectionId(),
      type: s.type,
      visible: s.visible !== false,
      ...(s.label ? { label: s.label } : {}),
      ...(s.anchor ? { anchor: s.anchor } : {}),
      // Defaults first so unspecified fields stay valid for the editor.
      data: { ...def.defaults(), ...(s.data ?? {}) },
    };
  });

  const conn = pgConnection();
  const client =
    conn.kind === "url"
      ? postgres(conn.url, { max: 1, ssl: pgSsl() })
      : postgres({
          host: conn.host,
          port: conn.port,
          database: conn.database,
          username: conn.username,
          password: conn.password,
          max: 1,
          ssl: pgSsl(),
        });
  const db = drizzle(client, { schema });

  const slug = slugArg.replace(/^\/+|\/+$/g, "");
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1);
  if (!page) throw new Error(`No page with slug "${slug}".`);

  const content: PageContent = {
    sections,
    seo: { ...emptySeo(), ...page.draft.seo, ...(input.seo ?? {}) },
  };

  await db
    .update(schema.pages)
    .set({
      ...(input.title ? { title: input.title.slice(0, 200) } : {}),
      draft: content,
      ...(publish
        ? { published: content, status: "published" as const, hasUnpublishedChanges: false, publishedAt: new Date() }
        : { hasUnpublishedChanges: true }),
    })
    .where(eq(schema.pages.id, page.id));

  console.log(`✔ /${slug}: ${sections.length} sections ${publish ? "published" : "saved as draft"}`);
  console.log(`  ${sections.map((s) => s.type).join(", ")}`);
  await client.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

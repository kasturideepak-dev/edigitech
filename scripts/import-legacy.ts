// Recreates the legacy site's URLs as CMS pages so nothing that ranks is lost.
//
// The old site served .php URLs (/seo-services-india.php). next.config.ts already
// redirects those to their clean equivalents, but the clean URL still has to exist
// or visitors land on a 404. This creates a page per legacy URL, carrying over the
// original <title>, meta description and <h1>.
//
// Usage:
//   npx tsx scripts/import-legacy.ts legacy-pages.json            # create as drafts
//   npx tsx scripts/import-legacy.ts legacy-pages.json --publish  # create and publish
//
// Input: [{ "slug": "seo-services-india", "title": "...", "desc": "...", "h1": "..." }]
// Existing slugs are left alone, so it is safe to re-run.
import "dotenv/config";
import fs from "node:fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { pgConnection, pgSsl } from "../src/db/connection";
import { buildContentFromTemplate } from "../src/templates";
import { emptySeo } from "../src/lib/types";

type Legacy = { slug: string; title?: string; desc?: string; h1?: string };

async function main() {
  const file = process.argv[2];
  const publish = process.argv.includes("--publish");
  if (!file) throw new Error("Usage: tsx scripts/import-legacy.ts <file.json> [--publish]");

  const rows: Legacy[] = JSON.parse(fs.readFileSync(file, "utf8"));
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

  const [admin] = await db.select().from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  let created = 0;
  let skipped = 0;

  for (const r of rows) {
    const slug = (r.slug ?? "").trim().replace(/^\/+|\/+$/g, "");
    if (!slug) continue;

    const [existing] = await db.select({ id: schema.pages.id }).from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1);
    if (existing) {
      console.log(`• /${slug} exists - skipped`);
      skipped++;
      continue;
    }

    const heading = r.h1?.trim() || r.title?.trim() || slug;
    const content = buildContentFromTemplate("landing-basic", heading);
    // Carry the legacy hero copy and SEO across so the page isn't an empty shell.
    const hero = content.sections.find((s) => s.type === "hero");
    if (hero) {
      hero.data = { ...hero.data, title: heading, subtitle: r.desc?.trim() || "" };
    }
    content.seo = {
      ...emptySeo(),
      metaTitle: r.title?.trim() || heading,
      metaDescription: r.desc?.trim() || "",
    };

    const now = new Date();
    await db.insert(schema.pages).values({
      title: heading.slice(0, 200),
      slug,
      pageType: "service",
      template: "landing-basic",
      status: publish ? "published" : "draft",
      draft: content,
      ...(publish ? { published: content, hasUnpublishedChanges: false, publishedAt: now } : {}),
      createdBy: admin?.id,
      updatedBy: admin?.id,
    });
    console.log(`✔ /${slug}${publish ? " (published)" : " (draft)"}`);
    created++;
  }

  console.log(`\n${created} created, ${skipped} skipped, ${rows.length} total`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

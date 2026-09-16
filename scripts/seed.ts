// Seeds the first admin user, default settings and the homepage.
// Usage: npm run db:seed            (skips anything that already exists)
//        npm run db:seed -- --reset-home   (rebuilds the homepage draft + published copy from the template)
import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { DEFAULT_SETTINGS } from "../src/lib/settings-schema";
import { buildContentFromTemplate } from "../src/templates";

async function main() {
  const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema, mode: "default" });
  const resetHome = process.argv.includes("--reset-home");

  // 1. Admin user
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe@123";
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  let adminId = existing?.id;
  if (!existing) {
    const [res] = await db.insert(schema.users).values({
      name: "Administrator",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });
    adminId = res.insertId;
    console.log(`✔ Admin user created: ${email}`);
  } else {
    console.log(`• Admin user exists: ${email}`);
  }

  // 2. Settings (only missing keys)
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
    if (!row) {
      await db.insert(schema.settings).values({ key, value });
      console.log(`✔ Settings “${key}” created`);
    }
  }

  // 3. Homepage
  const [home] = await db.select().from(schema.pages).where(eq(schema.pages.isHome, true)).limit(1);
  const content = buildContentFromTemplate("home-agency", "Home");
  if (!home) {
    await db.insert(schema.pages).values({
      title: "Home",
      slug: "home",
      pageType: "home",
      template: "home-agency",
      status: "published",
      isHome: true,
      draft: content,
      published: content,
      hasUnpublishedChanges: false,
      publishedAt: new Date(),
      createdBy: adminId,
      updatedBy: adminId,
    });
    console.log("✔ Homepage created and published");
  } else if (resetHome) {
    await db
      .update(schema.pages)
      .set({ draft: content, published: content, hasUnpublishedChanges: false, publishedAt: new Date() })
      .where(eq(schema.pages.id, home.id));
    console.log("✔ Homepage reset from template");
  } else {
    console.log("• Homepage exists (use --reset-home to rebuild it)");
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

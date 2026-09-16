import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { redirects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { RedirectsManager } from "./RedirectsManager";

export const metadata: Metadata = { title: "Redirects" };

export default async function RedirectsPage() {
  await requireUser("redirects.manage");
  const rows = await db.select().from(redirects).orderBy(desc(redirects.id));
  return (
    <>
      <PageHeader
        title="Redirects"
        description="Send old URLs to new ones. Use 301 for permanent moves so Google transfers rankings. Old .php URLs already redirect automatically."
      />
      <RedirectsManager
        rows={rows.map((r) => ({ id: r.id, fromPath: r.fromPath, toPath: r.toPath, statusCode: r.statusCode, hits: r.hits, note: r.note ?? "" }))}
      />
    </>
  );
}

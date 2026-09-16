import type { Metadata } from "next";
import { and, asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsEditor } from "./SettingsEditor";

export const metadata: Metadata = { title: "Site Settings" };

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const user = await requireUser("seo.manage");
  const { tab } = await searchParams;
  const [settings, all] = await Promise.all([
    loadSettings(),
    db.select({ title: pages.title, slug: pages.slug, isHome: pages.isHome }).from(pages).where(and(isNull(pages.deletedAt))).orderBy(asc(pages.title)),
  ]);
  const allowed = can(user.role, "settings.manage") ? null : ["seo"];
  return (
    <>
      <PageHeader title="Site Settings" description="Global content used on every page: brand, menu, footer, SEO defaults and tracking." />
      <SettingsEditor
        initial={settings}
        initialTab={typeof tab === "string" ? tab : undefined}
        allowedTabs={allowed}
        linkOptions={all.map((p) => ({ label: p.title, url: p.isHome ? "/" : `/${p.slug}` }))}
      />
    </>
  );
}

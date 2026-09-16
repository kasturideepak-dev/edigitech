import Link from "next/link";
import { count, desc, eq, isNull, and } from "drizzle-orm";
import { FileText, Image as ImageIcon, PenLine, Shuffle, AlertTriangle } from "lucide-react";
import { db } from "@/db";
import { media, pages, redirects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { pageTypeLabel } from "@/templates";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const live = and(isNull(pages.deletedAt));
  const [[{ total }], [{ published }], [{ pending }], [{ files }], [{ redirectCount }], recent] = await Promise.all([
    db.select({ total: count() }).from(pages).where(live),
    db.select({ published: count() }).from(pages).where(and(live, eq(pages.status, "published"))),
    db.select({ pending: count() }).from(pages).where(and(live, eq(pages.hasUnpublishedChanges, true))),
    db.select({ files: count() }).from(media),
    db.select({ redirectCount: count() }).from(redirects),
    db
      .select({ id: pages.id, title: pages.title, slug: pages.slug, status: pages.status, pageType: pages.pageType, isHome: pages.isHome, updatedAt: pages.updatedAt, hasUnpublishedChanges: pages.hasUnpublishedChanges })
      .from(pages)
      .where(live)
      .orderBy(desc(pages.updatedAt))
      .limit(6),
  ]);

  const stats = [
    { label: "Pages", value: total, sub: `${published} published`, icon: FileText, href: "/admin/pages" },
    { label: "Pending changes", value: pending, sub: "drafts not yet live", icon: PenLine, href: "/admin/pages?status=pending" },
    { label: "Media files", value: files, sub: "in the library", icon: ImageIcon, href: "/admin/media" },
    { label: "Redirects", value: redirectCount, sub: "active rules", icon: Shuffle, href: "/admin/redirects" },
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Manage pages, media and SEO for eDigiTech." />
      {denied && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4" /> You don’t have access to that section.
        </div>
      )}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-sm">{s.label}</span>
              <s.icon className="size-4" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs text-zinc-500">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Recently edited" className="lg:col-span-2" actions={<Link href="/admin/pages" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">View all</Link>}>
          <ul className="divide-y divide-zinc-100">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/pages/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-zinc-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.title} {p.isHome && <Badge tone="blue">Homepage</Badge>}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {pageTypeLabel(p.pageType)} · /{p.isHome ? "" : p.slug} · {p.updatedAt.toLocaleString()}
                    </p>
                  </div>
                  {p.status === "published" ? (
                    p.hasUnpublishedChanges ? <Badge tone="amber">Changes pending</Badge> : <Badge tone="green">Published</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Quick actions">
          <div className="space-y-2 p-5 text-sm">
            <Link className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-zinc-900" href="/admin/pages?new=1">
              <span className="font-medium">Create a landing page</span>
              <span className="block text-xs text-zinc-500">Service, product, WhatsApp or location page</span>
            </Link>
            <Link className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-zinc-900" href="/admin/media">
              <span className="font-medium">Upload images</span>
              <span className="block text-xs text-zinc-500">Auto-optimized to WebP</span>
            </Link>
            <Link className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-zinc-900" href="/admin/settings">
              <span className="font-medium">Edit header, footer & contact</span>
              <span className="block text-xs text-zinc-500">Menu, WhatsApp number, social links</span>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}

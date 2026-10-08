import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentTypes } from "@/db/schema";
import { requireUser, can } from "@/lib/auth";
import { Sidebar, type NavGroup } from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  // Read directly (not the public cache) so a new or renamed type shows up immediately.
  const types = await db
    .select({ key: contentTypes.key, namePlural: contentTypes.namePlural, icon: contentTypes.icon })
    .from(contentTypes)
    .where(eq(contentTypes.active, true))
    .orderBy(asc(contentTypes.sortOrder));

  const groups: NavGroup[] = [
    {
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/pages", label: "Pages", icon: "pages" },
        ...types.map((t) => ({ href: `/admin/content/${t.key}`, label: t.namePlural, icon: "type", typeIcon: t.icon })),
        { href: "/admin/media", label: "Media Library", icon: "media", show: can(user.role, "media.manage") },
        { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries" },
      ],
    },
    {
      title: "Configuration",
      items: [
        { href: "/admin/types", label: "Content Types", icon: "types", show: can(user.role, "types.manage") },
        {
          href: "/admin/settings",
          label: "Site Settings",
          icon: "settings",
          show: can(user.role, "settings.manage") || can(user.role, "seo.manage"),
        },
        { href: "/admin/redirects", label: "Redirects", icon: "redirects", show: can(user.role, "redirects.manage") },
        { href: "/admin/users", label: "Users", icon: "users", show: can(user.role, "users.manage") },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar groups={groups} user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

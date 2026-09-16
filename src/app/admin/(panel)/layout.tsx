import { requireUser, can } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  const nav = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/pages", label: "Pages", icon: "pages" },
    { href: "/admin/blog", label: "Blog", icon: "blog" },
    { href: "/admin/media", label: "Media Library", icon: "media", show: can(user.role, "media.manage") },
    { href: "/admin/settings", label: "Site Settings", icon: "settings", show: can(user.role, "settings.manage") || can(user.role, "seo.manage") },
    { href: "/admin/redirects", label: "Redirects", icon: "redirects", show: can(user.role, "redirects.manage") },
    { href: "/admin/users", label: "Users", icon: "users", show: can(user.role, "users.manage") },
  ].filter((n) => n.show !== false);

  return (
    <div className="flex min-h-screen">
      <Sidebar nav={nav} user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

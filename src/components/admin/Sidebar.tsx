"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shuffle,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions/auth";
import { cx } from "./ui";

const ICONS = {
  dashboard: LayoutDashboard,
  pages: FileText,
  media: ImageIcon,
  settings: Settings,
  redirects: Shuffle,
  users: Users,
};

type NavItem = { href: string; label: string; icon: string };

export function Sidebar({ nav, user }: { nav: NavItem[]; user: { name: string; email: string; role: string } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 rounded-lg bg-zinc-900 p-2 text-white lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-950 text-zinc-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-bold text-white">e</span>
            <span className="font-semibold text-white">eDigiTech CMS</span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => {
            const Icon = ICONS[n.icon as keyof typeof ICONS] ?? FileText;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(n.href) ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className={cx("size-4", isActive(n.href) && "text-brand")} />
                {n.label}
              </Link>
            );
          })}
          <a
            href="/"
            target="_blank"
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="size-4" /> View website
          </a>
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/admin/account" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
            <UserCircle className="size-8 text-zinc-500" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{user.name}</span>
              <span className="block truncate text-xs capitalize text-zinc-500">{user.role}</span>
            </span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

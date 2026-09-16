import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { UsersManager } from "./UsersManager";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireUser("users.manage");
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastLoginAt: users.lastLoginAt })
    .from(users)
    .orderBy(asc(users.name));
  return (
    <>
      <PageHeader title="Users" description="Admins manage everything. Editors create and publish pages. SEO users edit SEO fields and redirects." />
      <UsersManager meId={me.id} rows={rows.map((r) => ({ ...r, lastLoginAt: r.lastLoginAt?.toISOString() ?? null }))} />
    </>
  );
}

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE, SESSION_DAYS, type Role, signSession, verifySession } from "./session";

export type { Role };

export async function createSession(user: { id: number; role: Role; name: string }) {
  const token = await signSession({ uid: user.id, role: user.role, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Current logged-in user (verified against the DB so disabled users lose access). */
export const getCurrentUser = cache(async () => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active })
    .from(users)
    .where(eq(users.id, session.uid))
    .limit(1);
  if (!user || !user.active) return null;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** What each role may do. */
export const PERMISSIONS = {
  "pages.edit": ["admin", "editor", "seo"],
  "pages.publish": ["admin", "editor"],
  "pages.delete": ["admin", "editor"],
  "media.manage": ["admin", "editor", "seo"],
  "settings.manage": ["admin"],
  "seo.manage": ["admin", "seo", "editor"],
  "redirects.manage": ["admin", "seo"],
  "users.manage": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export const can = (role: Role, perm: Permission) => (PERMISSIONS[perm] as readonly Role[]).includes(role);

/** Use in admin pages: redirects to login when signed out. */
export async function requireUser(perm?: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (perm && !can(user.role, perm)) redirect("/admin?denied=1");
  return user;
}

/** Use in server actions / route handlers: throws instead of redirecting. */
export async function assertUser(perm?: Permission) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (perm && !can(user.role, perm)) throw new Error("You don't have permission to do that");
  return user;
}

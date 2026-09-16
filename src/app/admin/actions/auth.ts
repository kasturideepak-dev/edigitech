"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertUser, createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;

// Simple in-memory throttle against password guessing (per email, per server process).
const attempts = new Map<string, { count: number; until: number }>();

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const a = attempts.get(email);
  if (a && a.count >= 5 && a.until > Date.now()) {
    return { error: "Too many failed attempts. Try again in a few minutes." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    const count = (a && a.until > Date.now() ? a.count : 0) + 1;
    attempts.set(email, { count, until: Date.now() + 10 * 60 * 1000 });
    return { error: "Invalid email or password." };
  }
  attempts.delete(email);

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession({ id: user.id, role: user.role, name: user.name });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await assertUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };
  const [user] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: "Current password is incorrect." };
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(users.id, me.id));
  return { ok: "Password updated." };
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await assertUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  await db.update(users).set({ name: name.slice(0, 120) }).where(eq(users.id, me.id));
  return { ok: "Profile updated." };
}

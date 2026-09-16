"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertUser, type Role } from "@/lib/auth";

const ROLES: Role[] = ["admin", "editor", "seo"];

export async function saveUserAction(input: {
  id?: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  password?: string;
}) {
  try {
    const me = await assertUser("users.manage");
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a name and a valid email.");
    if (!ROLES.includes(input.role)) throw new Error("Invalid role.");
    if (input.password && input.password.length < 8) throw new Error("Password must be at least 8 characters.");

    const [clash] = await db
      .select({ id: users.id })
      .from(users)
      .where(input.id ? and(eq(users.email, email), ne(users.id, input.id)) : eq(users.email, email))
      .limit(1);
    if (clash) throw new Error("Another user already has that email.");

    if (input.id) {
      if (input.id === me.id && (input.role !== "admin" || !input.active)) {
        throw new Error("You can't remove your own admin access.");
      }
      await db
        .update(users)
        .set({
          name,
          email,
          role: input.role,
          active: input.active,
          ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
        })
        .where(eq(users.id, input.id));
    } else {
      if (!input.password) throw new Error("Set a password for the new user.");
      await db.insert(users).values({
        name,
        email,
        role: input.role,
        active: input.active,
        passwordHash: await bcrypt.hash(input.password, 12),
      });
    }
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Could not save user" };
  }
}

export async function deleteUserAction(id: number) {
  try {
    const me = await assertUser("users.manage");
    if (id === me.id) throw new Error("You can't delete your own account.");
    const [{ admins }] = await db.select({ admins: count() }).from(users).where(and(eq(users.role, "admin"), ne(users.id, id)));
    if (admins === 0) throw new Error("At least one admin must remain.");
    await db.delete(users).where(eq(users.id, id));
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Could not delete user" };
  }
}

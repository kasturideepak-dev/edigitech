"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { redirects } from "@/db/schema";
import { assertUser } from "@/lib/auth";

const cleanFrom = (p: string) => {
  let v = p.trim().replace(/^https?:\/\/[^/]+/i, "");
  if (!v.startsWith("/")) v = `/${v}`;
  return v.replace(/\/+$/, "").toLowerCase() || "/";
};

export async function saveRedirectAction(input: { id?: number; fromPath: string; toPath: string; statusCode: number; note?: string }) {
  try {
    await assertUser("redirects.manage");
    const fromPath = cleanFrom(input.fromPath);
    const toPath = input.toPath.trim();
    if (fromPath === "/") throw new Error("You can't redirect the homepage.");
    if (!toPath) throw new Error("Destination is required.");
    if (fromPath === toPath) throw new Error("Source and destination are the same.");
    const statusCode = [301, 302, 307, 308].includes(input.statusCode) ? input.statusCode : 301;
    const values = { fromPath, toPath, statusCode, note: input.note ?? null };
    if (input.id) await db.update(redirects).set(values).where(eq(redirects.id, input.id));
    else await db.insert(redirects).values(values);
    revalidatePath(fromPath);
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save";
    return { ok: false as const, error: msg.includes("Duplicate") ? "A redirect for that source URL already exists." : msg };
  }
}

export async function deleteRedirectAction(id: number) {
  await assertUser("redirects.manage");
  await db.delete(redirects).where(eq(redirects.id, id));
  return { ok: true as const };
}

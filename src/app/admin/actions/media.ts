"use server";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { assertUser } from "@/lib/auth";
import { deleteUploadFile, saveUpload } from "@/lib/media";

export type MediaItem = {
  id: number;
  url: string;
  originalName: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  title: string;
  folder: string;
  createdAt: string;
};

const toItem = (m: typeof media.$inferSelect): MediaItem => ({
  id: m.id,
  url: m.url,
  originalName: m.originalName,
  mime: m.mime,
  size: m.size,
  width: m.width,
  height: m.height,
  alt: m.alt,
  title: m.title,
  folder: m.folder,
  createdAt: m.createdAt.toISOString(),
});

const PAGE_SIZE = 40;

export async function listMediaAction(opts: { search?: string; folder?: string; page?: number; imagesOnly?: boolean }) {
  await assertUser("media.manage");
  const conds = [];
  if (opts.search) {
    const q = `%${opts.search}%`;
    conds.push(or(like(media.originalName, q), like(media.alt, q), like(media.title, q)));
  }
  if (opts.folder) conds.push(eq(media.folder, opts.folder));
  if (opts.imagesOnly) conds.push(like(media.mime, "image/%"));
  const where = conds.length ? and(...conds) : undefined;
  const page = Math.max(1, opts.page ?? 1);
  const [rows, [{ total }], folders] = await Promise.all([
    db
      .select()
      .from(media)
      .where(where)
      .orderBy(desc(media.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(media).where(where),
    db.selectDistinct({ folder: media.folder }).from(media),
  ]);
  return {
    items: rows.map(toItem),
    total,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    folders: folders.map((f) => f.folder).sort(),
  };
}

export async function uploadMediaAction(formData: FormData) {
  const user = await assertUser("media.manage");
  const folder = String(formData.get("folder") || "general").trim().slice(0, 80) || "general";
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: number[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      const res = await saveUpload(file, { folder, userId: user.id });
      uploaded.push(res.id);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : `${file.name}: upload failed`);
    }
  }
  const items = uploaded.length
    ? (await db.select().from(media).where(or(...uploaded.map((id) => eq(media.id, id))))).map(toItem)
    : [];
  return { items, errors };
}

export async function updateMediaAction(id: number, data: { alt: string; title: string; folder: string }) {
  await assertUser("media.manage");
  await db
    .update(media)
    .set({
      alt: data.alt.slice(0, 250),
      title: data.title.slice(0, 200),
      folder: data.folder.trim().slice(0, 80) || "general",
    })
    .where(eq(media.id, id));
  return { ok: true };
}

export async function deleteMediaAction(id: number) {
  await assertUser("media.manage");
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return { ok: true };
  await deleteUploadFile(row.url);
  await db.delete(media).where(eq(media.id, id));
  return { ok: true };
}

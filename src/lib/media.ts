import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";
import { db } from "@/db";
import { media } from "@/db/schema";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_WIDTH = 2400;

const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"]);
const PASSTHROUGH: Record<string, string> = {
  "image/svg+xml": ".svg",
  "image/gif": ".gif",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
};
export const ACCEPTED_TYPES = [...RASTER, ...Object.keys(PASSTHROUGH)];

let warnedAboutUploadDir = false;

export function uploadRoot() {
  // UPLOAD_DIR deliberately points outside the project (so redeploys can't delete media),
  // so this path can't be statically traced. Opt out rather than bundle the whole project.
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "./storage/uploads");
  // Uploads stored inside the app folder are destroyed by a redeploy, while their
  // database rows survive — leaving silently broken images. Warn loudly in production.
  if (process.env.NODE_ENV === "production" && !warnedAboutUploadDir && root.startsWith(process.cwd() + path.sep)) {
    warnedAboutUploadDir = true;
    console.warn(
      `[media] UPLOAD_DIR resolves to ${root}, which is inside the app directory.\n` +
        `        A redeploy will delete uploaded files while their database rows remain,\n` +
        `        leaving broken images. Set UPLOAD_DIR to an absolute path outside the app,\n` +
        `        e.g. /home/<user>/edigitech-uploads, and move the existing files there.`,
    );
  }
  return root;
}

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};
export const mimeFor = (file: string) => MIME_BY_EXT[path.extname(file).toLowerCase()] ?? "application/octet-stream";

function baseName(original: string) {
  const name = path
    .parse(original)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return name || "file";
}

/** Saves an uploaded file (optimizing raster images to WebP) and records it in the media table. */
export async function saveUpload(file: File, opts: { folder?: string; alt?: string; userId?: number }) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: file is larger than 15 MB`);
  const type = file.type || mimeFor(file.name);
  if (!ACCEPTED_TYPES.includes(type)) throw new Error(`${file.name}: file type ${type || "unknown"} is not allowed`);

  const now = new Date();
  const sub = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  const dir = path.join(/*turbopackIgnore: true*/ uploadRoot(), sub);
  await fs.mkdir(dir, { recursive: true });

  const input = Buffer.from(await file.arrayBuffer());
  const stem = `${baseName(file.name)}-${crypto.randomBytes(3).toString("hex")}`;
  let output: Buffer;
  let ext: string;
  let mime: string;
  let width: number | null = null;
  let height: number | null = null;

  if (RASTER.has(type)) {
    const pipeline = sharp(input, { failOn: "error" }).rotate();
    const meta = await pipeline.metadata();
    const img = (meta.width ?? 0) > MAX_WIDTH ? pipeline.resize({ width: MAX_WIDTH }) : pipeline;
    // Keep PNG transparency-friendly quality for logos; WebP supports alpha.
    const { data, info } = await img.webp({ quality: type === "image/png" ? 90 : 82 }).toBuffer({ resolveWithObject: true });
    output = data;
    ext = ".webp";
    mime = "image/webp";
    width = info.width;
    height = info.height;
  } else {
    output = input;
    ext = PASSTHROUGH[type];
    mime = type;
  }

  const fileName = `${stem}${ext}`;
  await fs.writeFile(path.join(dir, fileName), output);
  const url = `/uploads/${sub.split(path.sep).join("/")}/${fileName}`;

  const [res] = await db.insert(media).values({
    url,
    fileName,
    originalName: file.name.slice(0, 200),
    mime,
    size: output.length,
    width,
    height,
    alt: (opts.alt ?? "").slice(0, 250),
    title: path.parse(file.name).name.slice(0, 200),
    folder: opts.folder || "general",
    uploadedBy: opts.userId ?? null,
  }).returning({ id: media.id });
  return { id: res.id, url, width, height, mime, size: output.length };
}

export async function deleteUploadFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const rel = url.slice("/uploads/".length);
  const full = path.resolve(/*turbopackIgnore: true*/ uploadRoot(), rel);
  if (!full.startsWith(uploadRoot() + path.sep)) return;
  await fs.rm(full, { force: true });
}

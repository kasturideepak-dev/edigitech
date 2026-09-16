import path from "node:path";
import fs from "node:fs/promises";
import { mimeFor, uploadRoot } from "@/lib/media";

// Serves files from UPLOAD_DIR. Next.js only serves /public files that existed at build
// time, so uploads added from the dashboard are streamed through this route instead.
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const root = uploadRoot();
  const full = path.resolve(root, ...parts);
  if (!full.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const [stat, data] = await Promise.all([fs.stat(full), fs.readFile(full)]);
    const mime = mimeFor(full);
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Content-Length": String(stat.size),
      // File names are unique per upload, so they can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };
    if (mime === "image/svg+xml") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";
    return new Response(new Uint8Array(data), { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

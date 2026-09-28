/**
 * Cache-busting version for the licensed template assets in /public/assets.
 *
 * Those files are served with a 30-day Cache-Control header. That header is
 * applied by next.config.ts to every response under /assets/, including 404s —
 * so if the assets are ever missing (they are gitignored and uploaded
 * separately), browsers cache the failure for 30 days and the site stays
 * unstyled for those visitors long after the files are in place.
 *
 * Appending ?v= to every asset URL gives us a way out: bump the version and all
 * clients fetch fresh URLs immediately.
 *
 * Set NEXT_PUBLIC_ASSET_VERSION at build time (e.g. to a deploy timestamp) to
 * invalidate caches on demand.
 */
export const ASSET_VERSION = process.env.NEXT_PUBLIC_ASSET_VERSION || "1";

/** Adds the cache-busting version to a /assets/... path. */
export const asset = (path: string) => `${path}${path.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;

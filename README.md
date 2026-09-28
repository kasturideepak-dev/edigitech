# eDigiTech Website + CMS

Next.js 16 site built on the Aleric template (light theme) with a custom CMS dashboard at `/admin`.

## What's inside

| Area | Where |
|---|---|
| Public site (any CMS page by URL) | `src/app/(site)/[[...slug]]/page.tsx` |
| Header / footer / preloader | `src/components/site/SiteChrome.tsx` |
| Section blocks (fields + defaults) | `src/blocks/definitions.ts` |
| Section blocks (template markup) | `src/blocks/components/*.tsx` |
| Page templates (Homepage, Landing, Blank) | `src/templates/` |
| Global settings schema | `src/lib/settings-schema.ts` |
| Blog (listing, post, category) | `src/app/(site)/blog/**`, `src/lib/blog.ts` |
| Dashboard | `src/app/admin/**` |
| Database schema (PostgreSQL) | `src/db/schema.ts`, SQL in `drizzle/` |
| Template CSS/JS/images (licensed, **not in Git**) | `public/assets/` |
| eDigiTech CSS additions | `public/css/edigitech.css` |

### CMS features
- **Pages**: create by page type (Service, Product/WhatsApp, Location SEO, Generic) and template; draft → preview → publish; unpublish; duplicate; trash/restore; set homepage; version history (restore any published version).
- **Section builder**: add from the block library, drag to reorder, show/hide, duplicate, delete, anchor IDs, live preview panel, ⌘/Ctrl+S to save.
- **Auto-generated forms**: text, textarea (new line = `<br>`, `**bold**`), number, toggle, select, link (text + URL + new tab), image (media picker + alt text), groups and repeatable lists.
- **Blog**: posts with a rich-text editor (headings, lists, quotes, code, links, images from the Media Library), cover image, excerpt, category, author, publish date, draft/publish, trash/restore, and the same SEO panel as pages. Public pages at `/blog`, `/blog/<post>` and `/blog/category/<category>` with paging, related posts, share links, reading time, BlogPosting + Breadcrumb schema and sitemap entries. The homepage blog section shows the latest posts automatically (or a manual selection).
- **Media library**: drag-and-drop upload, automatic WebP conversion and resizing (max 2400px), alt text, folders, search.
- **SEO per page**: meta title/description, focus keyword, canonical, noindex/nofollow, Open Graph image, custom JSON-LD, Google preview and SEO checklist score. Organization, WebSite, WebPage and Breadcrumb schema are added automatically. `sitemap.xml` and `robots.txt` are generated.
- **Redirects**: 301/302 manager with hit counts. A 301 is added automatically when a live page's URL changes. Old `*.php` URLs redirect to clean URLs.
- **Site settings**: logo, favicon, preloader text, contact info, WhatsApp number (use the link value `whatsapp` anywhere), floating WhatsApp button, social links, menu with dropdowns, header button, footer, SEO defaults, GA4 / GTM / Meta Pixel, custom head/body code.
- **Users & roles**: Admin (everything), Editor (pages, media, publish), SEO (SEO fields, redirects).
- **Caching**: published pages are cached and refreshed instantly on publish.

### Adding a new section type
1. Add its fields and defaults to `src/blocks/definitions.ts`.
2. Create its component in `src/blocks/components/` using the template's HTML/classes.
3. Register the component in `src/blocks/render.tsx`.

The dashboard form and block picker update automatically.

## Local development

```bash
cp .env.example .env        # then edit values
npm install
npm run db:push             # create tables
npm run db:seed             # admin user + settings + homepage
npm run dev                 # http://localhost:3000  (dashboard: /admin)
```

`npm run db:seed -- --reset-home` rebuilds the homepage from `src/templates/home.ts`.

> **iCloud Desktop note:** this folder is inside an iCloud-synced Desktop. `node_modules` and `.next` are
> kept in `node_modules.nosync` / `.next.nosync` (symlinked) so iCloud doesn't evict them. Turbopack doesn't
> treat `node_modules.nosync` as a dependency folder, so run the dev server with `npm run dev -- --webpack`.
> After `npm install`, move the new `node_modules` folder back into `node_modules.nosync` and recreate the symlink.
> Moving the project out of iCloud avoids all of this.

## Deploying (OVIPanel / any Node host)

### Server requirements (verified against the installed packages)

| Requirement | Minimum | Why |
|---|---|---|
| **Node.js** | **20.9 LTS** (22 LTS fine) | `next@16` and `sharp` both declare `engines.node >= 20.9.0`. Next.js 16 dropped Node 18; Node 16 is end-of-life (Sept 2023) and **cannot run this app** — `npm install` fails on engines and the build will not start. |
| **PostgreSQL** | **14** | Audited: the CMS only uses `jsonb`, GIN indexes, `@>`, `jsonb_set`/`jsonb_agg`/`jsonb_array_elements`, `ON CONFLICT`, `serial`, `timestamptz` — all available in 14. Nothing requires 15+. |
| npm install scripts | allowed | `sharp` needs its native binary for image uploads/WebP conversion. If the host blocks postinstall scripts, uploads will fail. |

If the host only offers Node 16/18, ask them to provision Node 20 or 22, or install it per-account with `nvm` and point the app's start command at that binary. Do not downgrade Next.js: the last release supporting Node 16 is 13.x, which this codebase is not built on.


1. **Database**: create a PostgreSQL database and user in the hosting panel.
   Either import the SQL file in `drizzle/` via the panel's DB tool, or run `npm run db:push` over SSH (step 6).

   > **Check first:** confirm the plan actually offers PostgreSQL — many shared panels ship MySQL/MariaDB only.
   > If it doesn't, point `DATABASE_URL` at managed Postgres (Neon or Supabase, free tier); no code change is needed.
2. **Create the app**: hPanel → *Websites → Add website → Node.js Apps*, then connect the GitHub repo (or upload a ZIP of this `web` folder without `node_modules`/`.next`).
   - Node version: 20 or newer
   - Build command: `npm run build`
   - Start command: `npm run start`
3. **Environment variables** (from `.env.example`):
   - `DATABASE_URL` = `postgres://USER:PASSWORD@localhost:5432/DBNAME`
   - `DATABASE_SSL` = `false` for a local Postgres on the same server; omit it for managed Postgres (TLS required)
   - `NEXT_PUBLIC_ASSET_VERSION` = any string (e.g. a deploy timestamp). Change it and rebuild to force browsers to re-fetch `/assets/*`.
   - `AUTH_SECRET` = long random string (`openssl rand -base64 48`)
   - `NEXT_PUBLIC_SITE_URL` = `https://www.yourdomain.com`
   - `UPLOAD_DIR` = an absolute path **outside** the app folder, e.g. `/home/uXXXXXXXX/edigitech-uploads`, so uploads survive redeploys
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (only used by the seed script)
4. Deploy (build + start).
5. **Upload the template assets** (licensed, kept out of Git). Copy the local `public/assets`
   folder to `public/assets` in the app directory on the server, e.g.

   ```bash
   rsync -az --delete public/assets/ USER@SERVER:apps/edigitech/public/assets/
   ```

   Then **rebuild** — Next.js only serves `public/` files that existed when the build ran.

   > **Important:** upload the assets *before* the site is first visited. `/assets/*` is served with a
   > 30-day `Cache-Control`, and that header is applied to 404s too — so any browser that loads the site
   > while the assets are missing caches the failures for 30 days and keeps showing an unstyled page.
   > If that happens, bump `NEXT_PUBLIC_ASSET_VERSION` (see below) and rebuild; every asset URL changes
   > and clients fetch fresh copies immediately.
6. **First-time setup over SSH** (hPanel → *Advanced → SSH Access*), in the app directory:
   ```bash
   npm run db:push     # skip if you imported the SQL file
   npm run db:seed
   ```
7. Sign in at `https://yourdomain.com/admin` and **change the admin password** under *My account*.
8. Add the site in Google Search Console and submit `https://yourdomain.com/sitemap.xml`.

## Content still to confirm
Values marked `[X]` or `[confirm]` in the homepage are placeholders from the content doc:
project/client counts, years of experience, Google Partner / ISO claims, client quotes, portfolio projects and real images.

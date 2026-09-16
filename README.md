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
| Dashboard | `src/app/admin/**` |
| Database schema (MySQL/MariaDB) | `src/db/schema.ts`, SQL in `drizzle/` |
| Template CSS/JS/images (licensed, **not in Git**) | `public/assets/` |
| eDigiTech CSS additions | `public/css/edigitech.css` |

### CMS features
- **Pages**: create by page type (Service, Product/WhatsApp, Location SEO, Generic) and template; draft → preview → publish; unpublish; duplicate; trash/restore; set homepage; version history (restore any published version).
- **Section builder**: add from the block library, drag to reorder, show/hide, duplicate, delete, anchor IDs, live preview panel, ⌘/Ctrl+S to save.
- **Auto-generated forms**: text, textarea (new line = `<br>`, `**bold**`), number, toggle, select, link (text + URL + new tab), image (media picker + alt text), groups and repeatable lists.
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

## Deploying to Hostinger (Business plan, Node.js Web App)

1. **Database**: in hPanel → *Databases → MySQL Databases*, create a database and user.
   Either import `drizzle/0000_init.sql` in phpMyAdmin, or run `npm run db:push` over SSH (step 6).
2. **Create the app**: hPanel → *Websites → Add website → Node.js Apps*, then connect the GitHub repo (or upload a ZIP of this `web` folder without `node_modules`/`.next`).
   - Node version: 20 or newer
   - Build command: `npm run build`
   - Start command: `npm run start`
3. **Environment variables** (from `.env.example`):
   - `DATABASE_URL` = `mysql://USER:PASSWORD@localhost:3306/DBNAME`
   - `AUTH_SECRET` = long random string (`openssl rand -base64 48`)
   - `NEXT_PUBLIC_SITE_URL` = `https://www.yourdomain.com`
   - `UPLOAD_DIR` = an absolute path **outside** the app folder, e.g. `/home/uXXXXXXXX/edigitech-uploads`, so uploads survive redeploys
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (only used by the seed script)
4. Deploy (build + start).
5. **Upload the template assets** (they are licensed and kept out of Git): copy the local `web/public/assets`
   folder to `public/assets` in the app directory on the server, using the hPanel File Manager or SFTP.
   Without it the site renders without styling. Repeat only if the theme files change.
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

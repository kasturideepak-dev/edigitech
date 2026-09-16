"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { PageContent, SeoFields } from "@/lib/types";
import { FieldInput } from "./fields";
import { Input, Label, Textarea, Toggle, cx } from "./ui";

type Check = { level: "good" | "warn" | "bad"; text: string };

function lengthCheck(label: string, len: number, min: number, max: number): Check {
  if (len === 0) return { level: "bad", text: `${label} is empty.` };
  if (len < min) return { level: "warn", text: `${label} is short (${len} chars, aim for ${min}–${max}).` };
  if (len > max) return { level: "warn", text: `${label} is long (${len} chars, may be cut off after ${max}).` };
  return { level: "good", text: `${label} length is good (${len} chars).` };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9#]+/g, " ").trim();

function collectImages(value: unknown, out: { url: string; alt?: string }[]) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach((v) => collectImages(v, out));
  const o = value as Record<string, unknown>;
  if (typeof o.url === "string" && "alt" in o && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(o.url)) {
    out.push({ url: o.url, alt: o.alt as string });
  }
  Object.values(o).forEach((v) => collectImages(v, out));
}

export function seoChecks(content: PageContent, slug: string, title: string): Check[] {
  const seo = content.seo;
  const metaTitle = seo.metaTitle || title;
  const checks: Check[] = [
    lengthCheck("Meta title", metaTitle.length, 30, 60),
    lengthCheck("Meta description", seo.metaDescription.length, 70, 160),
  ];
  const visible = content.sections.filter((s) => s.visible);
  const hero = visible.find((s) => s.type === "hero");
  if (!hero) checks.push({ level: "warn", text: "No hero section — the page may be missing an H1 heading." });

  const kw = norm(seo.focusKeyword);
  if (!kw) {
    checks.push({ level: "warn", text: "Set a focus keyword to get keyword checks." });
  } else {
    const has = (s: string) => norm(s).includes(kw);
    const firstWord = kw.split(" ")[0];
    checks.push(
      has(metaTitle)
        ? { level: "good", text: "Focus keyword appears in the meta title." }
        : { level: "bad", text: "Focus keyword is missing from the meta title." },
      has(seo.metaDescription)
        ? { level: "good", text: "Focus keyword appears in the meta description." }
        : { level: "warn", text: "Focus keyword is missing from the meta description." },
      norm(slug.replace(/[-/]/g, " ")).includes(firstWord)
        ? { level: "good", text: "URL contains the focus keyword." }
        : { level: "warn", text: "URL doesn't contain the focus keyword." },
    );
    if (hero) {
      const h1 = `${hero.data.titlePrefix ?? ""} ${hero.data.title ?? ""}`;
      checks.push(
        has(String(h1))
          ? { level: "good", text: "Focus keyword appears in the H1 headline." }
          : { level: "warn", text: "Focus keyword is missing from the H1 headline." },
      );
    }
  }

  const images: { url: string; alt?: string }[] = [];
  visible.forEach((s) => collectImages(s.data, images));
  const missing = images.filter((i) => !i.alt?.trim()).length;
  checks.push(
    missing
      ? { level: "warn", text: `${missing} image${missing > 1 ? "s are" : " is"} missing alt text.` }
      : { level: "good", text: "All images have alt text." },
  );
  if (seo.noindex) checks.push({ level: "bad", text: "Page is set to noindex — it won't appear in Google." });
  if (seo.customSchema.trim()) {
    try {
      JSON.parse(seo.customSchema);
      checks.push({ level: "good", text: "Custom schema is valid JSON." });
    } catch {
      checks.push({ level: "bad", text: "Custom schema is not valid JSON (it will be ignored)." });
    }
  }
  return checks;
}

export function seoScore(checks: Check[]) {
  const pts = checks.reduce((a, c) => a + (c.level === "good" ? 2 : c.level === "warn" ? 1 : 0), 0);
  return Math.round((pts / (checks.length * 2)) * 100);
}

export function SeoPanel({
  content,
  onChange,
  slug,
  title,
  siteUrl,
  siteName,
}: {
  content: PageContent;
  onChange: (seo: SeoFields) => void;
  slug: string;
  title: string;
  siteUrl: string;
  siteName: string;
}) {
  const seo = content.seo;
  const set = <K extends keyof SeoFields>(k: K, v: SeoFields[K]) => onChange({ ...seo, [k]: v });
  const checks = seoChecks(content, slug, title);
  const score = seoScore(checks);
  const shownTitle = seo.metaTitle || `${title} | ${siteName}`;
  const url = `${siteUrl.replace(/^https?:\/\//, "")}${slug ? ` › ${slug.split("/").join(" › ")}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Google preview</p>
        <p className="truncate text-xs text-zinc-600">{url}</p>
        <p className="truncate text-lg leading-snug text-[#1a0dab]">{shownTitle}</p>
        <p className="line-clamp-2 text-[13px] text-zinc-600">
          {seo.metaDescription || "Add a meta description to control the text Google shows here."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label help="The main search phrase this page should rank for.">Focus keyword</Label>
          <Input value={seo.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label help={`${(seo.metaTitle || "").length}/60 characters. Leave empty to use the page title.`}>Meta title</Label>
          <Input value={seo.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label help={`${seo.metaDescription.length}/160 characters.`}>Meta description</Label>
          <Textarea rows={3} value={seo.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label help="Only set this if another URL is the original version of this content.">Canonical URL</Label>
          <Input value={seo.canonical} placeholder="Leave empty for this page's own URL" onChange={(e) => set("canonical", e.target.value)} />
        </div>
        <Toggle checked={seo.noindex} onChange={(v) => set("noindex", v)} label="Hide from search engines (noindex)" />
        <Toggle checked={seo.nofollow} onChange={(v) => set("nofollow", v)} label="Don't follow links (nofollow)" />
      </div>

      <div className="space-y-4 border-t border-zinc-200 pt-5">
        <p className="text-sm font-semibold">Social sharing</p>
        <div>
          <Label>Share title</Label>
          <Input value={seo.ogTitle} placeholder="Defaults to meta title" onChange={(e) => set("ogTitle", e.target.value)} />
        </div>
        <div>
          <Label>Share description</Label>
          <Textarea rows={2} value={seo.ogDescription} placeholder="Defaults to meta description" onChange={(e) => set("ogDescription", e.target.value)} />
        </div>
        <FieldInput
          field={{ type: "image", name: "ogImage", label: "Share image (1200×630)" }}
          value={seo.ogImage}
          onChange={(v) => set("ogImage", v as SeoFields["ogImage"])}
        />
      </div>

      <div className="space-y-2 border-t border-zinc-200 pt-5">
        <Label help="Organization, WebPage and Breadcrumb schema are added automatically. Paste extra JSON-LD here (e.g. FAQPage, Service).">
          Custom structured data (JSON-LD)
        </Label>
        <Textarea
          rows={6}
          className="font-mono text-xs"
          value={seo.customSchema}
          placeholder='{"@context":"https://schema.org","@type":"Service", ...}'
          onChange={(e) => set("customSchema", e.target.value)}
        />
      </div>

      <div className="border-t border-zinc-200 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">SEO checklist</p>
          <ScoreBadge score={score} />
        </div>
        <ul className="space-y-1.5">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
              {c.level === "good" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : c.level === "warn" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
              )}
              {c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cx(
        "rounded-full px-2 py-0.5 text-xs font-semibold",
        score >= 80 ? "bg-emerald-100 text-emerald-800" : score >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800",
      )}
    >
      SEO {score}
    </span>
  );
}

import type { ImageValue, Link } from "@/lib/types";
import type { SiteSettings } from "@/lib/settings-schema";

export type BlockContext = { settings: SiteSettings };

export type BlockProps<T> = { data: T; ctx: BlockContext; anchor?: string };

/**
 * Turns an editor-entered URL into a real href.
 * The special value `whatsapp` (or `{whatsapp}`) links to the WhatsApp number in Site Settings.
 */
export function resolveUrl(url: string | undefined | null, ctx: BlockContext): string {
  const u = (url ?? "").trim();
  if (!u) return "#";
  if (u === "whatsapp" || u === "{whatsapp}") return whatsappUrl(ctx.settings);
  return u;
}

export function whatsappUrl(settings: SiteSettings) {
  const num = (settings.general.whatsappNumber || "").replace(/[^\d]/g, "");
  if (!num) return "#";
  const text = settings.general.whatsappMessage ? `?text=${encodeURIComponent(settings.general.whatsappMessage)}` : "";
  return `https://wa.me/${num}${text}`;
}

export const hasLink = (l?: Partial<Link> | null): l is Link => !!l && !!l.label && !!l.label.trim();

export const isExternal = (href: string) => /^https?:\/\//.test(href) || href.startsWith("https://wa.me");

export const linkProps = (l: Partial<Link> | undefined, ctx: BlockContext) => {
  const href = resolveUrl(l?.url, ctx);
  return {
    href,
    newTab: !!l?.newTab || href.startsWith("https://wa.me"),
  };
};

export const src = (i?: ImageValue | null) => (i && i.url ? i.url : undefined);
export const alt = (i?: ImageValue | null, fallback = "") => (i?.alt || fallback).trim();

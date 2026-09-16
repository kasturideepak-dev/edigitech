// Page types and page templates (starting section layouts). Client-safe.
import { BLOCK_MAP } from "@/blocks/definitions";
import { emptySeo, type PageContent, type Section } from "@/lib/types";
import { homeSections, homeSeo } from "./home";

export const PAGE_TYPES = [
  { value: "home", label: "Homepage" },
  { value: "service", label: "Service" },
  { value: "product", label: "Product (WhatsApp, Software…)" },
  { value: "location", label: "Location SEO" },
  { value: "generic", label: "Generic" },
] as const;

export type PageType = (typeof PAGE_TYPES)[number]["value"];

export const pageTypeLabel = (v: string) => PAGE_TYPES.find((t) => t.value === v)?.label ?? v;

type TemplateDef = {
  id: string;
  name: string;
  description: string;
  pageTypes: PageType[];
  /** Section types (with default data) or full sections with preset data. */
  sections: () => Omit<Section, "id">[];
  seo?: () => Partial<PageContent["seo"]>;
};

const block = (type: string, overrides: Record<string, unknown> = {}): Omit<Section, "id"> => ({
  type,
  visible: true,
  data: { ...BLOCK_MAP[type].defaults(), ...overrides },
});

export const TEMPLATES: TemplateDef[] = [
  {
    id: "home-agency",
    name: "Homepage – Digital Agency",
    description: "The Aleric agency homepage layout filled with eDigiTech content.",
    pageTypes: ["home", "service", "product", "location", "generic"],
    sections: homeSections,
    seo: homeSeo,
  },
  {
    id: "landing-basic",
    name: "Landing Page – Basic",
    description: "Hero, about, services, counters, testimonials and call to action.",
    pageTypes: ["service", "product", "location", "generic"],
    sections: () => [
      block("hero"),
      block("about"),
      block("services"),
      block("counters"),
      block("testimonials"),
      block("cta"),
    ],
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty page and add sections yourself.",
    pageTypes: ["home", "service", "product", "location", "generic"],
    sections: () => [],
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);

export const newSectionId = () => Math.random().toString(36).slice(2, 10);

export function buildContentFromTemplate(templateId: string, title: string): PageContent {
  const tpl = getTemplate(templateId) ?? TEMPLATES[TEMPLATES.length - 1];
  return {
    sections: tpl.sections().map((s) => ({ ...s, id: newSectionId() })),
    seo: { ...emptySeo(), metaTitle: title, ...(tpl.seo?.() ?? {}) },
  };
}

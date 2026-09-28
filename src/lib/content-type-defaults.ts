// Built-in content types seeded on first run. The client can rename them, change
// their URL slug and add/remove fields from the dashboard — they just can't be
// deleted, because blocks and the page generator reference them by `key`.
// Client-safe: no server-only imports.
import { defaultSupports, type ContentTypeSupports, type Field, type TaxonomyDef } from "./types";

export type ContentTypeSeed = {
  key: string;
  name: string;
  namePlural: string;
  /** URL prefix, editable later from the dashboard. */
  slug: string;
  description: string;
  icon: string;
  hasArchive: boolean;
  archiveTitle: string;
  archiveIntro: string;
  perPage: number;
  fields: Field[];
  taxonomies: TaxonomyDef[];
  supports: ContentTypeSupports;
  sortOrder: number;
};

export const BUILT_IN_TYPES: ContentTypeSeed[] = [
  {
    key: "post",
    name: "Blog Post",
    namePlural: "Blog Posts",
    slug: "blog",
    description: "Articles and guides. Shown at /blog and in the homepage blog section.",
    icon: "Newspaper",
    hasArchive: true,
    archiveTitle: "Insights & Guides",
    archiveIntro: "Practical advice on web development, digital marketing and AI automation.",
    perPage: 9,
    // Posts are covered by the built-in supports below, so they need no custom fields.
    fields: [],
    taxonomies: [
      { key: "category", name: "Category", namePlural: "Categories", slug: "category", multiple: false },
    ],
    supports: { ...defaultSupports(), body: true, excerpt: true, coverImage: true, author: true, publishDate: true },
    sortOrder: 10,
  },
  {
    key: "product",
    name: "Service",
    namePlural: "Services",
    slug: "services",
    description: "What eDigiTech sells. Drives the services blocks and the landing page generator.",
    icon: "Package",
    hasArchive: true,
    archiveTitle: "Our Services",
    archiveIntro: "End-to-end digital solutions for every business need.",
    perPage: 12,
    fields: [
      {
        type: "textarea",
        name: "shortDescription",
        label: "Short description",
        rows: 3,
        help: "One or two sentences, used on cards and in generated landing pages.",
      },
      { type: "text", name: "icon", label: "Icon name", width: "half", help: "A lucide-react icon name, e.g. Globe." },
      { type: "image", name: "image", label: "Card image", width: "half" },
      {
        type: "list",
        name: "features",
        label: "Key points",
        itemLabel: "text",
        fields: [{ type: "text", name: "text", label: "Point" }],
      },
      { type: "text", name: "startingPrice", label: "Starting price", width: "half", help: "Optional, e.g. ₹9,999" },
      { type: "toggle", name: "featured", label: "Featured service", width: "half" },
    ],
    taxonomies: [],
    supports: { ...defaultSupports(), body: true, excerpt: true, coverImage: true },
    sortOrder: 20,
  },
  {
    key: "location",
    name: "Location",
    namePlural: "Locations",
    slug: "locations",
    description:
      "Cities and countries used to generate landing pages. The fields here are what make each generated page genuinely different.",
    icon: "MapPin",
    hasArchive: false,
    archiveTitle: "",
    archiveIntro: "",
    perPage: 24,
    fields: [
      {
        type: "select",
        name: "kind",
        label: "Type",
        width: "half",
        options: [
          { label: "City", value: "city" },
          { label: "Country", value: "country" },
        ],
      },
      { type: "text", name: "country", label: "Country", width: "half", required: true },
      { type: "text", name: "state", label: "State / region", width: "half" },
      { type: "text", name: "countryCode", label: "Country code", width: "half", help: "e.g. IN, AE, GB" },
      {
        type: "textarea",
        name: "intro",
        label: "Local intro paragraph",
        rows: 5,
        required: true,
        help: "Write something only true of this place — an office, a landmark, real client numbers. This is what keeps generated pages out of Google's scaled-content penalties.",
      },
      {
        type: "list",
        name: "areas",
        label: "Areas served",
        itemLabel: "name",
        help: "Neighbourhoods or nearby towns, e.g. Hinjewadi, Kharadi, Baner.",
        fields: [{ type: "text", name: "name", label: "Area" }],
      },
      { type: "text", name: "localPhone", label: "Local phone", width: "half" },
      { type: "text", name: "localAddress", label: "Local address", width: "half" },
      { type: "textarea", name: "mapEmbed", label: "Google Maps embed", rows: 3 },
      { type: "image", name: "image", label: "Location image" },
      {
        type: "list",
        name: "testimonials",
        label: "Local testimonials",
        itemLabel: "name",
        help: "Quotes from clients in this location. Shown on that location's landing pages.",
        fields: [
          { type: "textarea", name: "quote", label: "Quote", rows: 3 },
          { type: "text", name: "name", label: "Client name", width: "half" },
          { type: "text", name: "designation", label: "Designation", width: "half" },
        ],
      },
    ],
    taxonomies: [],
    supports: { ...defaultSupports(), seo: true },
    sortOrder: 30,
  },
];

export const builtInType = (key: string) => BUILT_IN_TYPES.find((t) => t.key === key);

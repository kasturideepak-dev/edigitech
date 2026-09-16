// Global site settings: types, admin form fields and defaults (client-safe).
import type { Field, ImageValue, Link } from "./types";
import { socialsField } from "@/blocks/common-fields";

type Social = { platform: string; url: string };
type MenuLink = { label: string; url: string };
type MenuItem = {
  label: string;
  url: string;
  /** Simple dropdown */
  children?: MenuLink[];
  /** Mega menu: grouped columns (takes precedence over children) */
  columns?: { title: string; links: MenuLink[] }[];
  /** Optional promo image shown as the last mega menu column */
  megaImage?: ImageValue | null;
};
type FooterColumn = { title: string; links: MenuLink[] };

export type SiteSettings = {
  general: {
    siteName: string;
    tagline: string;
    logo: ImageValue | null;
    logoWhite: ImageValue | null;
    favicon: ImageValue | null;
    showPreloader: boolean;
    preloaderText: string;
    phone: string;
    email: string;
    address: string;
    whatsappNumber: string;
    whatsappMessage: string;
    showWhatsappButton: boolean;
    socials: Social[];
  };
  header: {
    menu: MenuItem[];
    cta: Link;
    showSearch: boolean;
    offcanvasTitle: string;
    offcanvasText: string;
    offcanvasGallery: { image: ImageValue | null }[];
  };
  footer: {
    ctaEyebrow: string;
    ctaTitle: string;
    ctaUrl: string;
    button: Link;
    aboutText: string;
    columns: FooterColumn[];
    offices: { title: string; address: string; url: string }[];
    showNewsletter: boolean;
    newsletterTitle: string;
    copyright: string;
    menu: Link[];
  };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: ImageValue | null;
    allowIndexing: boolean;
    orgType: string;
    orgLegalName: string;
    orgFoundingYear: string;
    googleVerification: string;
    bingVerification: string;
  };
  scripts: {
    gaId: string;
    gtmId: string;
    metaPixelId: string;
    headCode: string;
    bodyCode: string;
  };
};

export type SettingsKey = keyof SiteSettings;

export const SETTINGS_TABS: { key: SettingsKey; label: string; description: string; fields: Field[] }[] = [
  {
    key: "general",
    label: "General",
    description: "Brand, contact details and WhatsApp.",
    fields: [
      { type: "text", name: "siteName", label: "Site name", width: "half", required: true },
      { type: "text", name: "tagline", label: "Tagline", width: "half" },
      { type: "image", name: "logo", label: "Logo (dark, for light backgrounds)", width: "third" },
      { type: "image", name: "logoWhite", label: "Logo (white, for footer)", width: "third" },
      { type: "image", name: "favicon", label: "Favicon (square PNG)", width: "third" },
      { type: "toggle", name: "showPreloader", label: "Show page preloader", width: "half" },
      { type: "text", name: "preloaderText", label: "Preloader letters", width: "half", maxLength: 12 },
      { type: "text", name: "phone", label: "Phone", width: "third" },
      { type: "text", name: "email", label: "Email", width: "third" },
      { type: "text", name: "address", label: "Address", width: "third" },
      {
        type: "text",
        name: "whatsappNumber",
        label: "WhatsApp number",
        width: "half",
        help: "With country code, e.g. 919876543210. Use the link value “whatsapp” anywhere to link here.",
      },
      { type: "text", name: "whatsappMessage", label: "WhatsApp pre-filled message", width: "half" },
      { type: "toggle", name: "showWhatsappButton", label: "Show floating WhatsApp button" },
      socialsField(),
    ],
  },
  {
    key: "header",
    label: "Header & Menu",
    description: "Main navigation, header button and side panel.",
    fields: [
      {
        type: "list",
        name: "menu",
        label: "Main menu",
        itemLabel: "label",
        fields: [
          { type: "text", name: "label", label: "Label", width: "half" },
          { type: "url", name: "url", label: "Link", width: "half" },
          {
            type: "list",
            name: "children",
            label: "Dropdown items",
            help: "Simple dropdown. Leave empty if you use mega menu columns below.",
            itemLabel: "label",
            fields: [
              { type: "text", name: "label", label: "Label", width: "half" },
              { type: "url", name: "url", label: "Link", width: "half" },
            ],
          },
          { type: "image", name: "megaImage", label: "Mega menu promo image (optional)", help: "Shown as a tall image in the last column, e.g. 660×980." },
          {
            type: "list",
            name: "columns",
            label: "Mega menu columns",
            help: "Grouped columns shown in a wide dropdown (max 4). Overrides the simple dropdown.",
            itemLabel: "title",
            max: 5,
            fields: [
              { type: "text", name: "title", label: "Column title" },
              {
                type: "list",
                name: "links",
                label: "Links",
                itemLabel: "label",
                fields: [
                  { type: "text", name: "label", label: "Label", width: "half" },
                  { type: "url", name: "url", label: "Link", width: "half" },
                ],
              },
            ],
          },
        ],
      },
      { type: "link", name: "cta", label: "Header button", width: "half" },
      { type: "toggle", name: "showSearch", label: "Show search icon", width: "half" },
      { type: "text", name: "offcanvasTitle", label: "Side panel title", width: "half" },
      { type: "textarea", name: "offcanvasText", label: "Side panel text", rows: 2, width: "half" },
      {
        type: "list",
        name: "offcanvasGallery",
        label: "Side panel gallery",
        max: 4,
        fields: [{ type: "image", name: "image", label: "Image" }],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer call to action, offices, newsletter and bottom links.",
    fields: [
      { type: "text", name: "ctaEyebrow", label: "CTA small text", width: "half" },
      { type: "text", name: "ctaTitle", label: "CTA big text", width: "half" },
      { type: "url", name: "ctaUrl", label: "CTA link", width: "half" },
      { type: "link", name: "button", label: "Round button", width: "half" },
      { type: "textarea", name: "aboutText", label: "About text (under logo)", rows: 3 },
      {
        type: "list",
        name: "columns",
        label: "Link columns",
        itemLabel: "title",
        max: 3,
        fields: [
          { type: "text", name: "title", label: "Column title" },
          {
            type: "list",
            name: "links",
            label: "Links",
            itemLabel: "label",
            fields: [
              { type: "text", name: "label", label: "Label", width: "half" },
              { type: "url", name: "url", label: "Link", width: "half" },
            ],
          },
        ],
      },
      {
        type: "list",
        name: "offices",
        label: "Offices / addresses",
        itemLabel: "title",
        max: 3,
        fields: [
          { type: "text", name: "title", label: "Title (city)", width: "half" },
          { type: "url", name: "url", label: "Map link", width: "half" },
          { type: "textarea", name: "address", label: "Address", rows: 3 },
        ],
      },
      { type: "toggle", name: "showNewsletter", label: "Show newsletter box", width: "half" },
      { type: "text", name: "newsletterTitle", label: "Newsletter title", width: "half" },
      { type: "text", name: "copyright", label: "Copyright text", help: "Use {year} for the current year." },
      {
        type: "list",
        name: "menu",
        label: "Bottom links",
        itemLabel: "label",
        fields: [
          { type: "text", name: "label", label: "Label", width: "half" },
          { type: "url", name: "url", label: "Link", width: "half" },
        ],
      },
    ],
  },
  {
    key: "seo",
    label: "SEO Defaults",
    description: "Fallback meta tags, organization schema and verification codes.",
    fields: [
      {
        type: "text",
        name: "titleTemplate",
        label: "Title template",
        width: "half",
        help: "%s is replaced by the page's meta title.",
      },
      { type: "text", name: "defaultTitle", label: "Default title", width: "half" },
      { type: "textarea", name: "defaultDescription", label: "Default meta description", rows: 2 },
      { type: "image", name: "defaultOgImage", label: "Default social share image (1200×630)" },
      {
        type: "toggle",
        name: "allowIndexing",
        label: "Allow search engines to index the site",
        help: "Turn off on staging sites.",
      },
      {
        type: "select",
        name: "orgType",
        label: "Organization schema type",
        width: "third",
        options: [
          { label: "Organization", value: "Organization" },
          { label: "LocalBusiness", value: "LocalBusiness" },
          { label: "ProfessionalService", value: "ProfessionalService" },
        ],
      },
      { type: "text", name: "orgLegalName", label: "Legal name", width: "third" },
      { type: "text", name: "orgFoundingYear", label: "Founding year", width: "third" },
      { type: "text", name: "googleVerification", label: "Google Search Console code", width: "half" },
      { type: "text", name: "bingVerification", label: "Bing Webmaster code", width: "half" },
    ],
  },
  {
    key: "scripts",
    label: "Tracking & Scripts",
    description: "Analytics IDs and custom code.",
    fields: [
      { type: "text", name: "gaId", label: "Google Analytics 4 ID", width: "third", placeholder: "G-XXXXXXX" },
      { type: "text", name: "gtmId", label: "Google Tag Manager ID", width: "third", placeholder: "GTM-XXXXXX" },
      { type: "text", name: "metaPixelId", label: "Meta Pixel ID", width: "third" },
      { type: "textarea", name: "headCode", label: "Custom code in <head>", rows: 5 },
      { type: "textarea", name: "bodyCode", label: "Custom code before </body>", rows: 5 },
    ],
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: "eDigiTech",
    tagline: "Web Development & Digital Marketing Company",
    logo: { url: "/images/brand/edigitech-logo.png", alt: "eDigiTech – make IT happen" },
    logoWhite: { url: "/images/brand/edigitech-logo-white.png", alt: "eDigiTech – make IT happen" },
    favicon: { url: "/images/brand/edigitech-favicon.png", alt: "eDigiTech" },
    showPreloader: true,
    preloaderText: "eDigiTech",
    phone: "",
    email: "",
    address: "",
    whatsappNumber: "",
    whatsappMessage: "Hi eDigiTech, I'd like to know more about your services.",
    showWhatsappButton: true,
    socials: [],
  },
  header: {
    menu: [
      { label: "Home", url: "/" },
      { label: "About Us", url: "/about-us" },
      {
        label: "Services",
        url: "/web-app-development-india",
        children: [
          { label: "Web & App Development", url: "/web-app-development-india" },
          { label: "Digital Marketing", url: "/digital-marketing-services-india" },
          { label: "WhatsApp Marketing", url: "/whatsapp-marketing" },
        ],
      },
      { label: "Contact", url: "/contact-us" },
    ],
    cta: { label: "Let’s Talk", url: "/contact-us" },
    showSearch: false,
    offcanvasTitle: "Hello There!",
    offcanvasText: "Websites, apps, cloud and digital marketing — one team for every digital need.",
    offcanvasGallery: [],
  },
  footer: {
    ctaEyebrow: "Ready to Start a Project?",
    ctaTitle: "Let’s Talk",
    ctaUrl: "/contact-us",
    button: { label: "Start the Journey", url: "/contact-us" },
    aboutText: "Technology and digital marketing partner for growing businesses across India and beyond.",
    columns: [],
    offices: [],
    showNewsletter: false,
    newsletterTitle: "Newsletter",
    copyright: "Copyright {year} eDigiTech. All Rights Reserved.",
    menu: [
      { label: "About Us", url: "/about-us" },
      { label: "Contact", url: "/contact-us" },
    ],
  },
  seo: {
    titleTemplate: "%s | eDigiTech",
    defaultTitle: "eDigiTech – Web Development & Digital Marketing Company in India",
    defaultDescription:
      "eDigiTech builds websites, mobile apps and enterprise software, and grows businesses with SEO, social media and WhatsApp marketing.",
    defaultOgImage: null,
    allowIndexing: true,
    orgType: "Organization",
    orgLegalName: "",
    orgFoundingYear: "",
    googleVerification: "",
    bingVerification: "",
  },
  scripts: { gaId: "", gtmId: "", metaPixelId: "", headCode: "", bodyCode: "" },
};

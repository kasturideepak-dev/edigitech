// Block definitions: admin form fields + default data for each section type.
// Client-safe (no React components here) – renderers live in ./render.tsx.
import type { Field } from "@/lib/types";
import { TEXT_HELP, eyebrowField, socialsField } from "./common-fields";

export type BlockCategory = "Hero & Banners" | "Content" | "Showcase" | "Social Proof" | "Call to Action";

export type BlockDefinition = {
  type: string;
  name: string;
  description: string;
  category: BlockCategory;
  /** lucide-react icon name used in the admin block picker */
  icon: string;
  fields: Field[];
  defaults: () => Record<string, unknown>;
};

const img = (url: string, alt = "") => ({ url, alt });

const linkField = (name: string, label: string, width: "full" | "half" = "half"): Field => ({
  type: "link",
  name,
  label,
  width,
});

export const BLOCKS: BlockDefinition[] = [
  // ------------------------------------------------------------------ HERO
  {
    type: "hero",
    name: "Hero – Agency",
    description: "Large headline, stats, two buttons, side text and a wide image with a highlight box.",
    category: "Hero & Banners",
    icon: "PanelTop",
    fields: [
      { type: "text", name: "titlePrefix", label: "Headline prefix (small italic word)", width: "half" },
      { type: "textarea", name: "title", label: "Headline", rows: 3, required: true, help: TEXT_HELP },
      { type: "textarea", name: "subtitle", label: "Sub-headline", rows: 3 },
      {
        type: "list",
        name: "stats",
        label: "Stat badges",
        itemLabel: "label",
        max: 4,
        fields: [
          { type: "text", name: "value", label: "Value (bold)", width: "half" },
          { type: "text", name: "label", label: "Label", width: "half" },
        ],
      },
      { type: "image", name: "avatar", label: "Customer avatars image", width: "half" },
      linkField("primaryCta", "Primary button"),
      linkField("secondaryCta", "Secondary button"),
      { type: "url", name: "videoUrl", label: "Video URL (YouTube)", width: "half", help: "Leave empty to hide the play button." },
      { type: "textarea", name: "videoText", label: "Text next to play button", rows: 2, width: "half" },
      { type: "textarea", name: "sideText", label: "Right side text", rows: 3, width: "half", help: TEXT_HELP },
      { type: "text", name: "socialLabel", label: "Social label", width: "half", help: "Shown beside the vertical social icons." },
      { ...socialsField("socials", "Social links (leave empty to use Site Settings)"), width: "full" },
      { type: "image", name: "image", label: "Wide banner image", required: true },
      {
        type: "group",
        name: "highlight",
        label: "Highlight box (dark box beside the image)",
        fields: [
          { type: "text", name: "eyebrow", label: "Small text", width: "half" },
          { type: "text", name: "title", label: "Title", width: "half" },
          { type: "url", name: "url", label: "Link", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      titlePrefix: "We’re",
      title: "Your Headline\nGoes Here.",
      subtitle: "A short supporting sentence that explains what you offer.",
      stats: [{ value: "100+", label: "Projects Delivered" }],
      avatar: null,
      primaryCta: { label: "Get a Free Consultation", url: "/contact-us" },
      secondaryCta: { label: "Chat on WhatsApp", url: "", newTab: true },
      videoUrl: "",
      videoText: "",
      sideText: "Creative &\nAesthetics\nDesign.",
      socialLabel: "Follow",
      socials: [],
      image: img("/assets/img/hero/thumb.jpg"),
      highlight: { eyebrow: "We Recently Launched", title: "Project name", url: "" },
    }),
  },

  // ------------------------------------------------------------------ ABOUT
  {
    type: "about",
    name: "About / Who We Are",
    description: "Eyebrow, bold intro statement, supporting line, experience counter, two images and a round button.",
    category: "Content",
    icon: "Info",
    fields: [
      eyebrowField,
      { type: "textarea", name: "statement", label: "Bold intro statement", rows: 3, required: true },
      { type: "textarea", name: "text", label: "Supporting line", rows: 3 },
      { type: "text", name: "counterValue", label: "Counter value", width: "third" },
      { type: "text", name: "counterSuffix", label: "Counter suffix", width: "third" },
      { type: "textarea", name: "counterLabel", label: "Counter label", rows: 2, width: "third", help: TEXT_HELP },
      { type: "image", name: "image1", label: "Small image", width: "half" },
      { type: "image", name: "image2", label: "Large image", width: "half" },
      linkField("button", "Round button", "full"),
    ],
    defaults: () => ({
      eyebrow: "Who We Are",
      statement: "A bold statement about your company.",
      text: "A supporting line that adds detail.",
      counterValue: "10",
      counterSuffix: "+",
      counterLabel: "Years of\nExperience",
      image1: img("/assets/img/about/thumb.jpg"),
      image2: img("/assets/img/about/thumb-2.jpg"),
      button: { label: "Know More About Us", url: "/about-us" },
    }),
  },

  // ------------------------------------------------------------------ LOGOS
  {
    type: "brands",
    name: "Client Logo Slider",
    description: "Trust line with an auto-scrolling strip of client logos.",
    category: "Social Proof",
    icon: "GalleryHorizontal",
    fields: [
      { type: "text", name: "title", label: "Trust line" },
      {
        type: "list",
        name: "logos",
        label: "Logos",
        itemLabel: "name",
        fields: [
          { type: "image", name: "image", label: "Logo", width: "half" },
          { type: "text", name: "name", label: "Client name", width: "half" },
          { type: "url", name: "url", label: "Link (optional)", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      title: "Trusted by growing businesses",
      logos: ["logo", "logo-2", "logo-3", "logo-4", "logo-5"].map((f, i) => ({
        image: img(`/assets/img/brands/${f}.png`, `Client ${i + 1}`),
        name: `Client ${i + 1}`,
        url: "",
      })),
    }),
  },

  // ------------------------------------------------------------------ SERVICES
  {
    type: "services",
    name: "Services Grid",
    description: "Section title with columns of service links (3 or 4 columns).",
    category: "Content",
    icon: "LayoutGrid",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading", width: "half", required: true },
      { type: "textarea", name: "intro", label: "Intro copy", rows: 3 },
      {
        type: "list",
        name: "columns",
        label: "Service columns",
        itemLabel: "title",
        max: 4,
        fields: [
          { type: "text", name: "title", label: "Column title", width: "half" },
          { type: "url", name: "url", label: "Column link (optional)", width: "half" },
          {
            type: "list",
            name: "items",
            label: "Services",
            itemLabel: "label",
            fields: [
              { type: "text", name: "label", label: "Service", width: "half" },
              { type: "url", name: "url", label: "Link", width: "half" },
            ],
          },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "Smart Solutions",
      title: "Our Services",
      intro: "Describe the services you deliver.",
      columns: [
        { title: "Column 1", url: "", items: [{ label: "Service", url: "" }] },
        { title: "Column 2", url: "", items: [{ label: "Service", url: "" }] },
        { title: "Column 3", url: "", items: [{ label: "Service", url: "" }] },
      ],
    }),
  },

  // ------------------------------------------------------------------ VIDEO BANNER
  {
    type: "videoBanner",
    name: "Video / CTA Banner",
    description: "Full-width parallax image with a dark text box, play button and optional button.",
    category: "Hero & Banners",
    icon: "Clapperboard",
    fields: [
      { type: "textarea", name: "text", label: "Statement", rows: 3, required: true },
      { type: "image", name: "image", label: "Background image" },
      { type: "url", name: "videoUrl", label: "Video URL (YouTube)", width: "half" },
      { type: "textarea", name: "videoText", label: "Text next to play button", rows: 2, width: "half", help: TEXT_HELP },
      linkField("button", "Button (optional)", "full"),
    ],
    defaults: () => ({
      text: "We empower brands to scale, innovate, and thrive.",
      image: img("/assets/img/video/thumb.jpg"),
      videoUrl: "",
      videoText: "",
      button: { label: "", url: "" },
    }),
  },

  // ------------------------------------------------------------------ PORTFOLIO
  {
    type: "portfolio",
    name: "Portfolio / Work Grid",
    description: "Large heading with a staggered grid of projects and a “View All” button.",
    category: "Showcase",
    icon: "BriefcaseBusiness",
    fields: [
      { type: "text", name: "title", label: "Heading", width: "half", required: true },
      { type: "textarea", name: "intro", label: "Intro copy", rows: 3 },
      {
        type: "list",
        name: "tags",
        label: "Tags under intro",
        itemLabel: "text",
        fields: [{ type: "text", name: "text", label: "Tag" }],
      },
      {
        type: "list",
        name: "projects",
        label: "Projects",
        itemLabel: "title",
        fields: [
          { type: "image", name: "image", label: "Thumbnail" },
          { type: "text", name: "title", label: "Project name", width: "half" },
          { type: "url", name: "url", label: "Link", width: "half" },
          { type: "text", name: "category", label: "Service category", width: "half" },
          { type: "text", name: "year", label: "Year", width: "half" },
        ],
      },
      linkField("button", "Button", "full"),
    ],
    defaults: () => ({
      title: "Work",
      intro: "A short intro about your work.",
      tags: [],
      projects: [1, 2, 3, 4, 5].map((n) => ({
        image: img(`/assets/img/portfolio/thumb${n === 1 ? "" : `-${n}`}.jpg`),
        title: `Project ${n}`,
        url: "",
        category: "Website Development",
        year: String(new Date().getFullYear()),
      })),
      button: { label: "View All Work", url: "" },
    }),
  },

  // ------------------------------------------------------------------ COUNTERS
  {
    type: "counters",
    name: "Counters",
    description: "Row of animated numbers with labels.",
    category: "Social Proof",
    icon: "Hash",
    fields: [
      {
        type: "list",
        name: "items",
        label: "Counters",
        itemLabel: "label",
        max: 6,
        fields: [
          { type: "number", name: "value", label: "Number", width: "third" },
          { type: "text", name: "suffix", label: "Suffix (K, +, %)", width: "third" },
          { type: "text", name: "label", label: "Label", width: "third" },
        ],
      },
    ],
    defaults: () => ({
      items: [
        { value: 100, suffix: "+", label: "Projects Delivered" },
        { value: 50, suffix: "+", label: "Happy Clients" },
        { value: 10, suffix: "+", label: "Years of Experience" },
        { value: 98, suffix: "%", label: "Client Retention" },
      ],
    }),
  },

  // ------------------------------------------------------------------ AWARDS / TRUST
  {
    type: "trust",
    name: "Trust / Awards List",
    description: "Dark section with a statement and a list of recognitions or credibility markers.",
    category: "Social Proof",
    icon: "Award",
    fields: [
      eyebrowField,
      { type: "textarea", name: "leftText", label: "Left text", rows: 3, width: "half", help: TEXT_HELP },
      { type: "textarea", name: "title", label: "Heading", rows: 2, required: true },
      { type: "text", name: "column1", label: "List header – left", width: "half" },
      { type: "text", name: "column2", label: "List header – right", width: "half" },
      {
        type: "list",
        name: "items",
        label: "Items",
        itemLabel: "title",
        fields: [
          { type: "image", name: "icon", label: "Icon image (optional)", width: "half" },
          { type: "text", name: "emoji", label: "…or emoji icon", width: "half" },
          { type: "text", name: "title", label: "Title", width: "half" },
          { type: "text", name: "meta", label: "Right value (year / note)", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "Our Achievement",
      leftText: "Add a short supporting statement.",
      title: "Recognized for delivering results.",
      column1: "Recognition",
      column2: "",
      items: [
        { icon: img("/assets/img/awards/icon.png"), emoji: "", title: "Award name", meta: "2025" },
      ],
    }),
  },

  // ------------------------------------------------------------------ TEXT SLIDER
  {
    type: "textSlider",
    name: "Scrolling Text Strip",
    description: "Colored strip with continuously scrolling keyword pairs.",
    category: "Content",
    icon: "MoveHorizontal",
    fields: [
      {
        type: "list",
        name: "items",
        label: "Keyword pairs",
        itemLabel: "left",
        fields: [
          { type: "text", name: "left", label: "First word", width: "half" },
          { type: "text", name: "right", label: "Second word", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      items: [
        { left: "Design", right: "Development" },
        { left: "SEO", right: "Marketing" },
        { left: "Cloud", right: "Hosting" },
      ],
    }),
  },

  // ------------------------------------------------------------------ TESTIMONIALS
  {
    type: "testimonials",
    name: "Testimonials Slider",
    description: "Heading, counter, video thumbnail and a slider of client quotes.",
    category: "Social Proof",
    icon: "Quote",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading", width: "half", required: true },
      { type: "textarea", name: "intro", label: "Intro copy", rows: 3, help: TEXT_HELP },
      { type: "text", name: "counterValue", label: "Counter value", width: "half" },
      { type: "text", name: "counterLabel", label: "Counter label", width: "half" },
      { type: "image", name: "image", label: "Video thumbnail", width: "half" },
      { type: "url", name: "videoUrl", label: "Video URL (YouTube)", width: "half" },
      { type: "image", name: "image2", label: "Side image", width: "half" },
      {
        type: "list",
        name: "items",
        label: "Quotes",
        itemLabel: "name",
        fields: [
          { type: "textarea", name: "quote", label: "Quote", rows: 3 },
          { type: "text", name: "name", label: "Client name", width: "half" },
          { type: "text", name: "designation", label: "Designation / Company", width: "half" },
          { type: "text", name: "service", label: "Service tag (optional)", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "What They’re Saying",
      title: "Testimonials",
      intro: "What our clients say about working with us.",
      counterValue: "100+",
      counterLabel: "Happy Clients",
      image: img("/assets/img/testimonial/thumb.jpg"),
      videoUrl: "",
      image2: img("/assets/img/testimonial/thumb-2.jpg"),
      items: [{ quote: "Client quote goes here.", name: "Client Name", designation: "Designation, Company", service: "" }],
    }),
  },

  // ------------------------------------------------------------------ IMAGE BANNER
  {
    type: "imageBanner",
    name: "Parallax Image Banner",
    description: "Full-width image strip with a slow parallax effect.",
    category: "Hero & Banners",
    icon: "Image",
    fields: [{ type: "image", name: "image", label: "Image", required: true }],
    defaults: () => ({ image: img("/assets/img/banner/thumb.jpg") }),
  },

  // ------------------------------------------------------------------ BLOG
  {
    type: "blog",
    name: "Blog / Articles",
    description: "Heading with three article cards.",
    category: "Content",
    icon: "Newspaper",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading", width: "half" },
      { type: "textarea", name: "intro", label: "Intro copy", rows: 3, help: TEXT_HELP },
      {
        type: "select",
        name: "source",
        label: "Articles to show",
        width: "half",
        help: "“Latest posts” keeps this section up to date automatically.",
        options: [
          { label: "Latest posts from the blog", value: "latest" },
          { label: "Chosen manually", value: "manual" },
        ],
      },
      { type: "number", name: "count", label: "How many (latest posts)", width: "half", min: 1, max: 6 },
      {
        type: "list",
        name: "posts",
        help: "Only used when “Chosen manually” is selected.",
        label: "Articles",
        itemLabel: "title",
        max: 6,
        fields: [
          { type: "image", name: "image", label: "Image" },
          { type: "text", name: "title", label: "Title", width: "half" },
          { type: "url", name: "url", label: "Link", width: "half" },
          { type: "text", name: "category", label: "Category", width: "half" },
          { type: "text", name: "date", label: "Date", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "Latest Insights",
      title: "From Our Blog",
      intro: "Tips and insights from our team.",
      source: "latest",
      count: 3,
      posts: [1, 2, 3].map((n) => ({
        image: img(`/assets/img/blog/thumb${n === 1 ? "" : `-${n}`}.jpg`),
        title: `Article title ${n}`,
        url: "",
        category: "Digital Marketing",
        date: "",
      })),
    }),
  },

  // ------------------------------------------------------------------ CTA
  {
    type: "cta",
    name: "Call to Action Banner",
    description: "Centered heading, supporting line and two buttons.",
    category: "Call to Action",
    icon: "Megaphone",
    fields: [
      eyebrowField,
      {
        type: "select",
        name: "theme",
        label: "Background",
        width: "half",
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "Brand color", value: "primary" },
        ],
      },
      { type: "textarea", name: "title", label: "Heading", rows: 2, required: true, help: TEXT_HELP },
      { type: "textarea", name: "text", label: "Supporting line", rows: 2 },
      linkField("primaryCta", "Primary button"),
      linkField("secondaryCta", "Secondary button"),
    ],
    defaults: () => ({
      eyebrow: "",
      theme: "dark",
      title: "Ready to get started?",
      text: "Tell us about your goals.",
      primaryCta: { label: "Let’s Talk", url: "/contact-us" },
      secondaryCta: { label: "", url: "" },
    }),
  },

  // ------------------------------------------------------------------ FAQ
  {
    type: "faq",
    name: "FAQ Accordion",
    description: "Common questions in an expandable accordion. Good for SEO and for cutting repeat enquiries.",
    category: "Content",
    icon: "HelpCircle",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading" },
      {
        type: "list",
        name: "items",
        label: "Questions",
        itemLabel: "question",
        fields: [
          { type: "text", name: "question", label: "Question", required: true },
          { type: "textarea", name: "answer", label: "Answer", rows: 4, help: TEXT_HELP },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "General Questions",
      title: "Frequently Asked Questions",
      items: [{ question: "Your question here?", answer: "The answer." }],
    }),
  },

  // ------------------------------------------------------------------ RICH TEXT
  {
    type: "richText",
    name: "Rich Text",
    description: "A written section — heading, intro and optional titled columns. Good for About, Terms and Privacy pages.",
    category: "Content",
    icon: "AlignLeft",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading" },
      { type: "textarea", name: "intro", label: "Intro paragraph", rows: 4, help: TEXT_HELP },
      {
        type: "list",
        name: "items",
        label: "Columns",
        itemLabel: "title",
        max: 4,
        help: "Optional. Use for things like Vision / Mission / Values.",
        fields: [
          { type: "text", name: "title", label: "Title" },
          { type: "textarea", name: "body", label: "Text", rows: 4, help: TEXT_HELP },
        ],
      },
    ],
    defaults: () => ({ eyebrow: "", title: "Section heading", intro: "Your text here.", items: [] }),
  },

  // ------------------------------------------------------------------ TEAM
  {
    type: "team",
    name: "Team Members",
    description: "People cards with photo, name, role and a short bio.",
    category: "Social Proof",
    icon: "Users",
    fields: [
      eyebrowField,
      { type: "text", name: "title", label: "Heading" },
      { type: "textarea", name: "intro", label: "Intro", rows: 3, help: TEXT_HELP },
      {
        type: "list",
        name: "members",
        label: "People",
        itemLabel: "name",
        fields: [
          { type: "image", name: "photo", label: "Photo" },
          { type: "text", name: "name", label: "Name", width: "half", required: true },
          { type: "text", name: "role", label: "Role", width: "half" },
          { type: "textarea", name: "bio", label: "Short bio", rows: 4, help: TEXT_HELP },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: "Our Team",
      title: "Meet the team",
      intro: "",
      members: [{ photo: null, name: "Name", role: "Role", bio: "" }],
    }),
  },

  // ------------------------------------------------------------------ FEATURE
  {
    type: "feature",
    name: "Image + Panel",
    description: "Half image, half colour panel with a heading, text and a tick list. Alternate the image side to build a sequence.",
    category: "Content",
    icon: "Columns2",
    fields: [
      { type: "image", name: "image", label: "Image", required: true },
      {
        type: "select",
        name: "imageSide",
        label: "Image on",
        width: "half",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      {
        type: "select",
        name: "theme",
        label: "Panel colour",
        width: "half",
        options: [
          { label: "Dark", value: "dark" },
          { label: "White", value: "light" },
        ],
      },
      { type: "text", name: "title", label: "Heading" },
      { type: "textarea", name: "text", label: "Text", rows: 4, help: TEXT_HELP },
      {
        type: "list",
        name: "points",
        label: "Tick list",
        itemLabel: "label",
        fields: [{ type: "text", name: "label", label: "Point" }],
      },
      linkField("button", "Button", "full"),
    ],
    defaults: () => ({
      image: img("/images/home/digital-agency-team-meeting.webp"),
      imageSide: "left",
      theme: "dark",
      title: "Section heading",
      text: "A short supporting paragraph.",
      points: [{ label: "First point" }],
      button: { label: "", url: "" },
    }),
  },

  // ------------------------------------------------------------------ PAGE HEADER
  {
    type: "pageHeader",
    name: "Page Header",
    description: "Inner-page heading with supporting text beside it. Use at the top of contact, service and info pages.",
    category: "Hero & Banners",
    icon: "Heading1",
    fields: [
      { type: "text", name: "title", label: "Heading", required: true },
      { type: "textarea", name: "intro", label: "Supporting text", rows: 3, help: TEXT_HELP },
      { type: "toggle", name: "shape", label: "Show the decorative squiggle" },
    ],
    defaults: () => ({ title: "Page heading", intro: "", shape: true }),
  },

  // ------------------------------------------------------------------ CONTACT
  {
    type: "contact",
    name: "Contact Form + Map",
    description: "Google map beside a contact form. Submissions are saved and listed under Enquiries — nothing depends on email delivery.",
    category: "Call to Action",
    icon: "Mail",
    fields: [
      {
        type: "textarea",
        name: "mapEmbed",
        label: "Google Maps embed",
        rows: 3,
        help: "Google Maps → Share → Embed a map → copy the whole <iframe>, or just its src URL. Leave empty to hide the map.",
      },
      { type: "text", name: "formTitle", label: "Form heading", width: "half" },
      { type: "text", name: "buttonLabel", label: "Button text", width: "half" },
      {
        type: "list",
        name: "subjects",
        label: "“I’m interested in” options",
        itemLabel: "label",
        help: "Leave empty for a free-text box instead of a dropdown.",
        fields: [{ type: "text", name: "label", label: "Option" }],
      },
      { type: "textarea", name: "successMessage", label: "Thank-you message", rows: 2 },
    ],
    defaults: () => ({
      mapEmbed: "",
      formTitle: "Send a Message",
      buttonLabel: "Send Message",
      successMessage: "",
      subjects: [],
    }),
  },

  // ------------------------------------------------------------------ OFFICES
  {
    type: "offices",
    name: "Office Locations",
    description: "Location cards with photo, address, email and phone, with an optional textured note above them.",
    category: "Content",
    icon: "Building2",
    fields: [
      { type: "textarea", name: "note", label: "Note above the cards", rows: 2, help: "Shown in the template's textured panel. Leave empty to hide it." },
      { type: "image", name: "noteBackground", label: "Note texture", help: "Defaults to the template's contact shape." },
      {
        type: "list",
        name: "items",
        label: "Locations",
        itemLabel: "title",
        fields: [
          { type: "image", name: "image", label: "Photo" },
          { type: "text", name: "title", label: "Location name", width: "half", required: true },
          { type: "text", name: "address", label: "Address", width: "half" },
          { type: "text", name: "email", label: "Email", width: "half" },
          { type: "text", name: "phone", label: "Phone", width: "half" },
          { type: "url", name: "mapUrl", label: "Google Maps link", width: "half" },
          { type: "text", name: "buttonLabel", label: "Button text", width: "half" },
        ],
      },
    ],
    defaults: () => ({
      note: "",
      noteBackground: null,
      items: [{ image: null, title: "Office", address: "", email: "", phone: "", mapUrl: "", buttonLabel: "View Location" }],
    }),
  },

  // ------------------------------------------------------------------ ABOUT (MODERN)
  {
    type: "aboutModern",
    name: "About – Statement, Tabs & Card",
    description: "The template's about-modern layout: a large statement, a photo with an experience counter, tabbed copy, and a second photo carrying a highlight card.",
    category: "Content",
    icon: "Layers",
    fields: [
      { type: "textarea", name: "statement", label: "Opening statement", rows: 4, required: true, help: TEXT_HELP },
      { type: "image", name: "image", label: "Left photo", width: "half" },
      { type: "image", name: "image2", label: "Right photo", width: "half" },
      { type: "text", name: "counterValue", label: "Counter", width: "third" },
      { type: "text", name: "counterSuffix", label: "Suffix", width: "third" },
      { type: "textarea", name: "counterLabel", label: "Counter label", rows: 2, width: "third", help: TEXT_HELP },
      {
        type: "list",
        name: "tabs",
        label: "Tabs",
        itemLabel: "title",
        max: 4,
        fields: [
          { type: "text", name: "title", label: "Tab title", required: true },
          { type: "textarea", name: "body", label: "Text", rows: 5, help: TEXT_HELP },
          linkField("button", "Button", "full"),
        ],
      },
      {
        type: "image",
        name: "cardImage",
        label: "Card image",
        width: "half",
        help: "Graphic across the top of the highlight card. Its edges should match the card colour — the card pulls its text up 20px onto the image.",
      },
      { type: "text", name: "cardTitle", label: "Card title", width: "half" },
      {
        type: "list",
        name: "cardPoints",
        label: "Card tick list",
        itemLabel: "label",
        fields: [{ type: "text", name: "label", label: "Point" }],
      },
      linkField("cardButton", "Card button", "full"),
      { type: "toggle", name: "shape", label: "Show the squiggle under the tabs", width: "half" },
    ],
    defaults: () => ({
      statement: "A short, bold statement about the company.",
      image: img("/assets/img/about/cst/thumb.jpg"),
      image2: img("/assets/img/about/cst/thumb-2.jpg"),
      counterValue: "10",
      counterSuffix: "+",
      counterLabel: "Years of\nExperience",
      tabs: [{ title: "Our Story", body: "Tell your story here.", button: { label: "", url: "" } }],
      cardImage: img("/images/brand/about-card-waves.png"),
      cardTitle: "Data-driven insights",
      cardPoints: [{ label: "First point" }],
      cardButton: { label: "", url: "" },
      shape: true,
    }),
  },
];

export const BLOCK_MAP: Record<string, BlockDefinition> = Object.fromEntries(BLOCKS.map((b) => [b.type, b]));

export const getBlock = (type: string) => BLOCK_MAP[type];

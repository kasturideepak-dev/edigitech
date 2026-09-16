// eDigiTech homepage content, mapped from “Home- page.docx” onto the Aleric template sections.
// Where the doc offers options, Option A is used. [X] values are placeholders to confirm.
// Photos in /public/images/home are free Pexels images (pexels.com/license).
import type { PageContent, Section } from "@/lib/types";

const img = (url: string, alt = "") => ({ url, alt });

export const homeSections = (): Omit<Section, "id">[] => [
  // Section 1 — Hero
  {
    type: "hero",
    visible: true,
    label: "Hero",
    data: {
      titlePrefix: "India’s #1",
      title: "Web Development &\nDigital Marketing\nCompany.",
      subtitle:
        "eDigiTech helps businesses launch, scale, and grow online — through custom websites, mobile apps, enterprise software, cloud hosting, and full-service digital marketing including SEO, social media, and WhatsApp campaigns.",
      stats: [
        { value: "[X]+", label: "Projects Delivered" },
        { value: "[X]+", label: "Happy Clients" },
        { value: "Pan-India", label: "+ Global Reach" },
      ],
      avatar: null,
      primaryCta: { label: "Get a Free Consultation", url: "/contact-us" },
      secondaryCta: { label: "💬 Chat on WhatsApp", url: "whatsapp", newTab: true },
      videoUrl: "",
      videoText: "",
      sideText: "Websites,\nApps &\nGrowth.",
      socialLabel: "Follow",
      socials: [],
      image: img("/images/home/web-development-team-office.webp", "eDigiTech web development team working together in a modern tech office"),
      highlight: {
        eyebrow: "From Code to Campaigns",
        title: "WhatsApp Marketing",
        url: "/whatsapp-marketing",
      },
    },
  },
  // Section 2 — About / Who We Are
  {
    type: "about",
    visible: true,
    label: "Who We Are",
    data: {
      eyebrow: "Who We Are",
      statement:
        "eDigiTech is a full-stack technology and digital marketing partner helping Indian businesses build, launch, and grow online — from a single landing page to a complete enterprise software ecosystem.",
      text: "We specialize in leveraging modern web technologies, cloud platforms, and data-driven marketing to help businesses achieve measurable growth — whether that's a hospital management system, a D2C e-commerce store, or a WhatsApp marketing campaign reaching customers across 25+ countries.",
      counterValue: "[X]",
      counterSuffix: "+",
      counterLabel: "Years of\nExperience",
      image1: img("/images/home/developer-coding-laptop.webp", "Developer writing code on a laptop"),
      image2: img("/images/home/digital-agency-team-meeting.webp", "Digital marketing and development team collaborating in a meeting"),
      button: { label: "Know More About Us", url: "/about-us" },
    },
  },
  // Client logo strip (template section kept for trust)
  {
    type: "brands",
    visible: true,
    label: "Client logos",
    data: {
      title: "Trusted by Businesses Across India & 25+ Countries",
      logos: ["logo", "logo-2", "logo-3", "logo-4", "logo-5"].map((f, i) => ({
        image: img(`/assets/img/brands/${f}.png`, `Client logo ${i + 1}`),
        name: `Client ${i + 1}`,
        url: "",
      })),
    },
  },
  // Section 3 — Our Capabilities (4 columns)
  {
    type: "services",
    visible: true,
    label: "Our Services",
    data: {
      eyebrow: "Our Capabilities",
      title: "Our Services",
      intro:
        "We specialize in delivering end-to-end technology and marketing solutions — from the first line of code to the last click on a campaign.",
      columns: [
        {
          title: "Web & App Development",
          url: "/web-app-development-india",
          items: [
            { label: "Website Development", url: "/website-development" },
            { label: "eCommerce Development", url: "/ecommerce-development" },
            { label: "Mobile App Development", url: "/mobile-app-development" },
            { label: "Enterprise Software Solutions", url: "/enterprise-software-solutions" },
          ],
        },
        {
          title: "Cloud & IT Infrastructure",
          url: "",
          items: [
            { label: "Cloud Hosting Services", url: "/cloud-hosting-services" },
            { label: "Business Email Services", url: "/business-email-services" },
            { label: "IT & Cloud Solutions", url: "/it-cloud-solutions" },
            { label: "AI & Automation Solutions", url: "/ai-automation-solutions" },
          ],
        },
        {
          title: "Digital Marketing",
          url: "/digital-marketing-services-india",
          items: [
            { label: "SEO Services India", url: "/seo-services-india" },
            { label: "Social Media Marketing", url: "/social-media-marketing" },
            { label: "WhatsApp Marketing", url: "/whatsapp-marketing" },
            { label: "WhatsApp Business API", url: "/whatsapp-business-api" },
          ],
        },
        {
          title: "Business Software Solutions",
          url: "",
          items: [
            { label: "Hospital Management Software", url: "/hospital-management-software" },
            { label: "Transport Management Software", url: "/transport-management-software" },
            { label: "GST Billing & Inventory Software", url: "/gst-billing-inventory-software" },
            { label: "HR & Payroll Software", url: "/hr-payroll-software" },
            { label: "HR & Recruitment Solutions", url: "/hr-recruitment-solutions" },
          ],
        },
      ],
    },
  },
  // Video / CTA banner below the service columns
  {
    type: "videoBanner",
    visible: true,
    label: "Video banner",
    data: {
      text: "We help businesses scale with technology that works as hard as they do.",
      image: img("/images/home/developers-reviewing-code.webp", "Developers reviewing website code on a large screen"),
      videoUrl: "",
      videoText: "Watch How\nWe Work",
      button: { label: "Talk to Our Team", url: "/contact-us" },
    },
  },
  // Section 5 — Our Work
  {
    type: "portfolio",
    visible: true,
    label: "Our Work",
    data: {
      title: "Our Work",
      intro:
        "We take pride in delivering solutions that are innovative, functional, and built to drive real business results — for clients across industries and geographies.",
      tags: [{ text: "Web" }, { text: "Apps" }, { text: "Marketing" }],
      projects: [
        ["Project Name", "Website Development", "website-development-project"],
        ["Project Name", "eCommerce Development", "ecommerce-development-project"],
        ["Project Name", "Mobile App Development", "mobile-app-development-project"],
        ["Project Name", "Enterprise / Business Software", "business-software-development"],
        ["Project Name", "WhatsApp Marketing Campaign", "whatsapp-marketing-campaign"],
      ].map(([title, category, file]) => ({
        // Stock placeholders (Pexels) — replace with real client project screenshots.
        image: img(`/images/home/${file}.webp`, `${category} project by eDigiTech`),
        title,
        url: "",
        category,
        year: "2025",
      })),
      button: { label: "View All Work", url: "/about-us" },
    },
  },
  {
    type: "counters",
    visible: false,
    label: "Counters (enable once numbers are confirmed)",
    data: {
      items: [
        { value: 0, suffix: "+", label: "Projects Delivered" },
        { value: 0, suffix: "+", label: "Happy Clients" },
        { value: 25, suffix: "+", label: "Countries Reached" },
        { value: 0, suffix: "+", label: "Years of Experience" },
      ],
    },
  },
  // Section 6 — Why Businesses Trust Us
  {
    type: "trust",
    visible: true,
    label: "Why Businesses Trust Us",
    data: {
      eyebrow: "Why Businesses Trust Us",
      leftText: "Reliable delivery,\ntransparent communication\nand support that\nstays with you.",
      title: "Recognized for Reliable Delivery, Not Just Big Promises",
      column1: "Credibility",
      column2: "",
      items: [
        { icon: null, emoji: "🏆", title: "Google Partner [confirm]", meta: "" },
        { icon: null, emoji: "🔒", title: "ISO Certified [confirm]", meta: "" },
        { icon: null, emoji: "🌐", title: "PAN-India + 25+ Country Delivery", meta: "" },
        { icon: null, emoji: "📞", title: "Dedicated WhatsApp Support", meta: "" },
      ],
    },
  },
  {
    type: "textSlider",
    visible: true,
    label: "Scrolling keywords",
    data: {
      items: [
        { left: "Websites", right: "Apps" },
        { left: "SEO", right: "Social Media" },
        { left: "WhatsApp", right: "Marketing" },
        { left: "Cloud", right: "Hosting" },
        { left: "AI", right: "Automation" },
      ],
    },
  },
  // Section 7 — Testimonials
  {
    type: "testimonials",
    visible: true,
    label: "Testimonials",
    data: {
      eyebrow: "What They’re Saying",
      title: "Client Feedback",
      intro: "Client Feedback That\nSpeaks for Itself.",
      counterValue: "[X]+",
      counterLabel: "Happy Clients",
      image: img("/images/home/client-consultation-meeting.webp", "Client consultation meeting with the eDigiTech team"),
      videoUrl: "",
      image2: img("/images/home/project-discussion-team.webp", "Team discussing a client project"),
      items: [
        {
          quote: "[Client quote about the website revamp delivered by eDigiTech.]",
          name: "[Client Name]",
          designation: "[Designation, Company]",
          service: "Web Development",
        },
        {
          quote: "[Client quote about SEO ranking growth.]",
          name: "[Client Name]",
          designation: "[Designation, Company]",
          service: "SEO",
        },
        {
          quote: "[Client quote about WhatsApp campaign ROI.]",
          name: "[Client Name]",
          designation: "[Designation, Company]",
          service: "WhatsApp Marketing",
        },
      ],
    },
  },
  {
    type: "imageBanner",
    visible: true,
    label: "Image banner",
    data: { image: img("/images/home/digital-team-at-work.webp", "Team members working on computers in the eDigiTech office") },
  },
  {
    type: "blog",
    visible: false,
    label: "Blog (hidden until articles exist)",
    data: {
      eyebrow: "Latest Insights",
      title: "From Our Blog",
      intro: "Practical tips on websites, SEO and\nWhatsApp marketing from our team.",
      posts: ["seo-analytics-dashboard", "digital-marketing-strategy-whiteboard", "online-shopping-ecommerce"].map((file, i) => ({
        image: img(`/images/home/${file}.webp`),
        title: `Article title ${i + 1}`,
        url: "",
        category: "Digital Marketing",
        date: "",
      })),
    },
  },
  // Section 8 — Final CTA
  {
    type: "cta",
    visible: true,
    label: "Final CTA",
    data: {
      eyebrow: "Let’s Talk",
      theme: "primary",
      title: "Ready to Grow Your\nBusiness Online?",
      text: "Let's talk about your website, app, or marketing goals — no obligation, just a straight conversation.",
      primaryCta: { label: "Let’s Talk", url: "/contact-us" },
      secondaryCta: { label: "💬 WhatsApp Us", url: "whatsapp", newTab: true },
    },
  },
];

export const homeSeo = (): Partial<PageContent["seo"]> => ({
  metaTitle: "Web Development & Digital Marketing Company in India | eDigiTech",
  metaDescription:
    "eDigiTech builds websites, mobile apps & enterprise software and grows businesses with SEO, social media & WhatsApp marketing. Get a free consultation.",
  focusKeyword: "web development and digital marketing company in India",
  ogImage: img("/images/home/web-development-team-office.webp", "eDigiTech web development team"),
});

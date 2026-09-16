import type { Field } from "@/lib/types";

export const SOCIAL_PLATFORMS = [
  { label: "Facebook", value: "facebook", icon: "fa-brands fa-facebook-f" },
  { label: "Instagram", value: "instagram", icon: "fa-brands fa-instagram" },
  { label: "LinkedIn", value: "linkedin", icon: "fa-brands fa-linkedin-in" },
  { label: "X (Twitter)", value: "x", icon: "fa-brands fa-twitter" },
  { label: "YouTube", value: "youtube", icon: "fa-brands fa-youtube" },
  { label: "WhatsApp", value: "whatsapp", icon: "fa-brands fa-whatsapp" },
  { label: "Pinterest", value: "pinterest", icon: "fa-brands fa-pinterest-p" },
  { label: "Dribbble", value: "dribbble", icon: "fa-brands fa-dribbble" },
  { label: "Behance", value: "behance", icon: "fa-brands fa-behance" },
] as const;

export const socialIconClass = (platform: string) =>
  SOCIAL_PLATFORMS.find((p) => p.value === platform)?.icon ?? "fa-solid fa-link";

export const socialsField = (name = "socials", label = "Social links"): Field => ({
  type: "list",
  name,
  label,
  itemLabel: "platform",
  fields: [
    {
      type: "select",
      name: "platform",
      label: "Platform",
      width: "half",
      options: SOCIAL_PLATFORMS.map(({ label, value }) => ({ label, value })),
    },
    { type: "url", name: "url", label: "Profile URL", width: "half" },
  ],
});

export const eyebrowField: Field = {
  type: "text",
  name: "eyebrow",
  label: "Eyebrow tag",
  help: "Small label shown above the section (e.g. “Who We Are”).",
  width: "half",
};

export const TEXT_HELP = "New line = line break. Wrap words in **double asterisks** to make them bold.";

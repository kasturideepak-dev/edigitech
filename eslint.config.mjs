import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local folders kept out of iCloud sync, template vendor files and uploads.
    ".next.nosync/**",
    "node_modules.nosync/**",
    "public/assets/**",
    "storage/**",
  ]),
  {
    // The public site renders the template's own markup and CMS image URLs as-is.
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    // Public pages use plain <a> links on purpose: every visit is a full page load so the
    // template's jQuery/GSAP scripts initialise cleanly.
    files: ["src/components/site/**", "src/blocks/**", "src/app/(site)/**"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
]);

export default eslintConfig;

"use client";

import { useEffect } from "react";

// The Aleric template's scripts, in the same order as the original HTML.
const SCRIPTS = [
  "vendor/jquery.js",
  "bootstrap-bundle.js",
  "plugin.js",
  "three.js",
  "hover-effect.umd.js",
  "split-type.js",
  "swiper-bundle.js",
  "swiper-gl.js",
  "effect-slicer.js",
  "magnific-popup.js",
  "nice-select.js",
  "purecounter.js",
  "isotope-pkgd.js",
  "imagesloaded-pkgd.js",
  "backtop.js",
  "slider-init.js",
  "main.js",
  "tp-cursor.js",
].map((f) => `/assets/js/${f}`);

declare global {
  interface Window {
    __templateScriptsLoaded?: boolean;
  }
}

/**
 * Loads the template's jQuery/GSAP scripts after React hydration so their DOM changes
 * (SplitType, smooth scroll, sliders) never conflict with hydration. The scripts start on
 * DOMContentLoaded / window.load, which already fired, so we replay those events once.
 * Public-site links are plain <a> tags, so every page view is a fresh document.
 */
export default function TemplateScripts() {
  useEffect(() => {
    if (window.__templateScriptsLoaded) return;
    window.__templateScriptsLoaded = true;

    (async () => {
      for (const src of SCRIPTS) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = () => resolve(); // one broken script shouldn't block the rest
          document.body.appendChild(s);
        });
      }
      document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
      window.dispatchEvent(new Event("load"));
    })();
  }, []);

  return null;
}

import type { Viewport } from "next";
import { getSettings } from "@/lib/settings";
import TemplateScripts from "@/components/site/TemplateScripts";
import TrackingScripts from "@/components/site/TrackingScripts";
import { BackToTop, FloatingActions, Footer, Header, Offcanvas, Preloader, SearchOverlay } from "@/components/site/SiteChrome";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const STYLES = [
  "/assets/css/bootstrap.css",
  "/assets/css/swiper-bundle.css",
  "/assets/css/magnific-popup.css",
  "/assets/css/font-awesome-pro.css",
  "/assets/css/spacing.css",
  "/assets/css/main.css",
  "/css/edigitech.css",
];

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <html lang="en" className="no-js">
      <head>
        {STYLES.map((href) => (
          // Template CSS is served as-is from /public so its relative font/image URLs keep working.
          <link key={href} rel="stylesheet" href={href} precedence="default" />
        ))}
      </head>
      <body className="tp-magic-cursor loaded">
        <TrackingScripts settings={settings} />
        <Preloader settings={settings} />
        <div id="magic-cursor" className="cursor-black-bg">
          <div id="ball"></div>
        </div>
        <BackToTop />
        <SearchOverlay settings={settings} />
        <Offcanvas settings={settings} />
        <Header settings={settings} />
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <main>{children}</main>
            <Footer settings={settings} />
          </div>
        </div>
        <FloatingActions settings={settings} />
        <TemplateScripts />
      </body>
    </html>
  );
}

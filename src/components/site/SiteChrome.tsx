import type { SiteSettings } from "@/lib/settings-schema";
import { socialIconClass } from "@/blocks/common-fields";
import { resolveUrl, whatsappUrl, type BlockContext } from "@/blocks/components/shared";
import { Icon, RoundedButton, SwitchButton } from "./Icon";
import { Text } from "./Text";

type Props = { settings: SiteSettings };

export function Preloader({ settings }: Props) {
  if (!settings.general.showPreloader) return null;
  const letters = Array.from(settings.general.preloaderText || settings.general.siteName);
  return (
    <div className="loader-wrap">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path id="svg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"></path>
      </svg>
      <div className="loader-wrap-heading">
        <div className="load-text">
          {letters.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BackToTop() {
  return (
    <div className="scrollToTop">
      <div className="arrowUp">
        <i className="fa-light fa-arrow-up"></i>
      </div>
      <div className="water">
        <svg viewBox="0 0 560 20" className="water_wave water_wave_back">
          <use xlinkHref="#wave"></use>
        </svg>
        <svg viewBox="0 0 560 20" className="water_wave water_wave_front">
          <use xlinkHref="#wave"></use>
        </svg>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 560 20"
          style={{ display: "none" }}
        >
          <symbol id="wave">
            <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z" fill="#"></path>
            <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z" fill="#"></path>
            <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z" fill="#"></path>
            <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z" fill="#"></path>
          </symbol>
        </svg>
      </div>
    </div>
  );
}

function Logo({ settings, white }: Props & { white?: boolean }) {
  const logo = (white ? settings.general.logoWhite : settings.general.logo) ?? settings.general.logo;
  return (
    <a href="/">
      {logo?.url ? (
        <img data-width={white ? "170" : "180"} src={logo.url} alt={logo.alt || settings.general.siteName} />
      ) : (
        <span className={`ed-text-logo${white ? " ed-text-logo-white" : ""}`}>{settings.general.siteName}</span>
      )}
    </a>
  );
}

export function SearchOverlay({ settings }: Props) {
  if (!settings.header.showSearch) return null;
  return (
    <>
      <div className="tp-search-body-overlay"></div>
      <div className="tp-search-form-toggle">
        <div className="container">
          <div className="row mb-70">
            <div className="col-lg-12">
              <div className="tp-search-top d-flex justify-content-between align-items-center">
                <div className="cm-search-logo">
                  <Logo settings={settings} />
                </div>
                <button className="tp-search-close" aria-label="Close search">
                  <i className="fa-light fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="tp-search-form">
                <form action="/" method="get">
                  <div className="tp-search-form-input">
                    <input type="text" name="s" placeholder="What are you looking for?" required />
                    <span className="tp-search-focus-border"></span>
                    <button className="tp-search-form-icon" type="submit" aria-label="Search">
                      <i className="fa-sharp fa-regular fa-magnifying-glass"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Offcanvas({ settings }: Props) {
  const { general: g, header: h } = settings;
  const gallery = (h.offcanvasGallery ?? []).filter((x) => x.image?.url);
  const socials = (g.socials ?? []).filter((s) => s.url);
  return (
    <>
      <div className="tp-offcanvas-area">
        <div className="tp-offcanvas">
          <div className="tp-offcanvas-top d-flex align-items-center justify-content-between">
            <div className="tp-offcanvas-logo">
              <Logo settings={settings} />
            </div>
            <div className="tp-offcanvas-close-btn">
              <button className="close-btn" aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>
          </div>
          <div className="tp-offcanvas-content d-none d-xl-block">
            {h.offcanvasTitle && <h3 className="tp-offcanvas-title">{h.offcanvasTitle}</h3>}
            {h.offcanvasText && <p>{h.offcanvasText}</p>}
          </div>
          <div className="tp-offcanvas-menu d-xl-none">
            <nav></nav>
          </div>
          {gallery.length > 0 && (
            <div className="tp-offcanvas-gallery d-none d-xl-block">
              <div className="row gx-2">
                {gallery.map((x, i) => (
                  <div className="col-md-3 col-3" key={i}>
                    <div className="tp-offcanvas-gallery-img fix">
                      <a className="popup-image" href={x.image!.url}>
                        <img src={x.image!.url} alt={x.image!.alt || ""} loading="lazy" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(g.phone || g.email || g.address) && (
            <div className="tp-offcanvas-contact">
              <h3 className="tp-offcanvas-title sm">Information</h3>
              <ul>
                {g.phone && (
                  <li>
                    <a href={`tel:${g.phone.replace(/[^\d+]/g, "")}`}>{g.phone}</a>
                  </li>
                )}
                {g.email && (
                  <li>
                    <a href={`mailto:${g.email}`}>{g.email}</a>
                  </li>
                )}
                {g.address && (
                  <li>
                    <span>{g.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          {socials.length > 0 && (
            <div className="tp-offcanvas-social">
              <h3 className="tp-offcanvas-title sm">Follow Us</h3>
              <ul>
                {socials.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener" aria-label={s.platform}>
                      <i className={socialIconClass(s.platform)}></i>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="body-overlay"></div>
    </>
  );
}

export function Header({ settings }: Props) {
  const ctx: BlockContext = { settings };
  const { header } = settings;
  return (
    <header>
      <div
        id="header-sticky"
        className="tp-header-area pre-header sticky-white-bg tp-header-blur header-transparent tp-header-lg-spacing"
      >
        <div className="container-fluid container-1800">
          <div className="row align-items-center">
            <div className="col-xl-3 col-6">
              <div className="tp-header-logo">
                <Logo settings={settings} />
              </div>
            </div>
            <div className="col-xl-6 d-none d-xl-block">
              <div className="tp-main-menu tp-header-dropdown dropdown-white-bg d-flex justify-content-center">
                <nav className="tp-mobile-menu-active">
                  <ul>
                    {header.menu.map((item, i) => {
                      const columns = (item.columns ?? []).filter((c) => (c.links ?? []).length || c.title);
                      const children = (item.children ?? []).filter((c) => c.label);
                      const hasDrop = columns.length > 0 || children.length > 0;
                      const megaImage = item.megaImage?.url ? item.megaImage : null;
                      // Bootstrap widths: the promo image takes the last 2 of 12 columns.
                      const linkSpan = megaImage ? 10 : 12;
                      const colClass = `col-xl-${Math.max(2, Math.floor(linkSpan / Math.max(columns.length, 1)))}`;
                      return (
                        <li key={i} className={columns.length ? "has-dropdown p-inherit" : children.length ? "has-dropdown" : undefined}>
                          <a href={resolveUrl(item.url, ctx)}>
                            {item.label}
                            {hasDrop && (
                              <span>
                                <Icon name="caret" />
                              </span>
                            )}
                          </a>
                          {columns.length > 0 ? (
                            <div className="tp-megamenu-wrapper mega-menu megamenu-white-bg">
                              <div className="row gx-0">
                                {columns.map((col, j) => (
                                  <div className={colClass} key={j}>
                                    <div className="tp-megamenu-list">
                                      <h4 className="tp-megamenu-title">{col.title}</h4>
                                      <ul>
                                        {(col.links ?? []).map((l, k) => (
                                          <li key={k}>
                                            <a href={resolveUrl(l.url, ctx)}>{l.label}</a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                ))}
                                {megaImage && (
                                  <div className="col-xl-2 d-none d-xxl-block">
                                    <div className="tp-megamenu-list">
                                      <div className="tp-megamenu-thumb">
                                        <img src={megaImage.url} alt={megaImage.alt || ""} loading="lazy" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : children.length > 0 ? (
                            <ul className="tp-submenu submenu">
                              {children.map((c, j) => (
                                <li key={j}>
                                  <a href={resolveUrl(c.url, ctx)}>{c.label}</a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
            <div className="col-xl-3 col-6">
              <div className="tp-header-right d-flex align-items-center justify-content-end">
                {header.showSearch && (
                  <div className="tp-header-search">
                    <button className="tp-header-search-btn tp-search-click" aria-label="Search">
                      <Icon name="search" />
                    </button>
                  </div>
                )}
                {header.cta?.label && (
                  <div className="tp-header-btn tp-header-btn-spacing d-none d-md-inline-block ml-20">
                    <SwitchButton
                      href={resolveUrl(header.cta.url, ctx)}
                      label={header.cta.label}
                      newTab={header.cta.newTab}
                      className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-common-black text-uppercase ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white tp-ff-heading fw-500"
                    />
                  </div>
                )}
                <button className="tp-menu-bar tp-header-sidebar-btn ml-20 d-xl-none" aria-label="Open menu">
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ settings }: Props) {
  const ctx: BlockContext = { settings };
  const { footer: f, general: g } = settings;
  const socials = (g.socials ?? []).filter((s) => s.url);
  const offices = (f.offices ?? []).filter((o) => o.title || o.address);
  const columns = (f.columns ?? []).filter((c) => c.title || (c.links ?? []).length);
  const widgets = columns.length + offices.length;
  const columnClass = widgets >= 3 ? "col-lg-4 col-md-4 col-sm-6" : widgets === 2 ? "col-lg-6 col-md-6 col-sm-6" : "col-lg-12";
  const officeCol = columnClass;
  return (
    <footer>
      <div className="tp-footer-area tp-bg-common-black p-relative z-index-1 pt-105">
        <span className="tp-footer-shape">
          <Icon name="footerShape" />
        </span>
        <div className="tp-footer-top pb-30">
          <div className="container">
            <div className="row align-items-end">
              <div className="col-lg-9">
                <div className="tp-footer-top-social-wrap mb-30">
                  {f.ctaEyebrow && (
                    <span className="tp-footer-top-subtitle tp-text-theme-primary fw-500 fs-18 tp-ff-heading tp_fade_anim" data-delay=".3">
                      {f.ctaEyebrow} <Icon name="heroTitleSm" className="ml-20" />
                    </span>
                  )}
                  {f.ctaTitle && (
                    <h2 className="tp-footer-top-title tp-text-common-white text-uppercase fw-500 rotate-text-anim">
                      <a href={resolveUrl(f.ctaUrl, ctx)}>{f.ctaTitle}</a>
                    </h2>
                  )}
                  {socials.length > 0 && (
                    <div className="tp-footer-social tp_fade_anim" data-delay=".4" data-fade-from="bottom" data-ease="bounce">
                      <ul>
                        {socials.map((s, i) => (
                          <li key={i}>
                            <a href={s.url} target="_blank" rel="noopener">
                              <i className={socialIconClass(s.platform)}></i>
                              {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-3">
                {f.button?.label && (
                  <div
                    className="tp-rounded-btn-wrap tp-footer-btn text-lg-end mb-40 tp_fade_anim"
                    data-delay=".5"
                    data-fade-from="top"
                    data-ease="bounce"
                  >
                    <RoundedButton href={resolveUrl(f.button.url, ctx)} label={f.button.label} newTab={f.button.newTab} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="tp-footer-main pt-45 pb-50">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6">
                <div className="tp-footer-widget mb-45 tp_fade_anim" data-delay=".3">
                  <div className="tp-footer-logo mb-25">
                    <Logo settings={settings} white />
                  </div>
                  <p className="fw-500 fs-18 tp-text-grey-2 lh-28">
                    <Text value={f.aboutText} />
                  </p>
                  {(g.phone || g.email) && (
                    <p className="fw-500 fs-18 lh-28 ed-footer-contact">
                      {g.phone && (
                        <a className="tp-text-grey-2 hover-text-white" href={`tel:${g.phone.replace(/[^\d+]/g, "")}`}>
                          {g.phone}
                        </a>
                      )}
                      {g.phone && g.email && <br />}
                      {g.email && (
                        <a className="tp-text-grey-2 hover-text-white" href={`mailto:${g.email}`}>
                          {g.email}
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-7">
                <div className="row">
                  {columns.map((col, i) => (
                    <div className={columnClass} key={`c${i}`}>
                      <div className="tp-footer-widget mb-60 tp_fade_anim" data-delay={`.${4 + i * 2}`}>
                        <h3 className="tp-footer-widget-title tp-ff-heading fs-25 mb-15 text-uppercase tp-text-common-white">{col.title}</h3>
                        <ul className="ed-footer-links">
                          {(col.links ?? []).map((l, j) => (
                            <li key={j}>
                              <a className="fw-500 fs-18 tp-text-grey-2 lh-28 hover-text-white" href={resolveUrl(l.url, ctx)}>
                                {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {offices.map((o, i) => (
                    <div className={officeCol} key={`o${i}`}>
                      <div className="tp-footer-widget mb-60 tp_fade_anim" data-delay={`.${5 + i * 2}`}>
                        <h3 className="tp-footer-widget-title tp-ff-heading fs-25 mb-15 text-uppercase tp-text-common-white">{o.title}</h3>
                        <a
                          className="fw-500 fs-18 tp-text-grey-2 lh-28 hover-text-white"
                          href={o.url || "#"}
                          {...(o.url ? { target: "_blank", rel: "noopener" } : {})}
                        >
                          <Text value={o.address} />
                        </a>
                      </div>
                    </div>
                  ))}
                  {f.showNewsletter && (
                    <div className="col-lg-12">
                      <div className="tp-footer-widget-form mb-60 tp_fade_anim" data-delay=".9">
                        <h3 className="tp-footer-widget-title tp-ff-heading fs-25 mb-25 text-uppercase tp-text-common-white">
                          {f.newsletterTitle}
                        </h3>
                        <form className="p-relative" action="#">
                          <input className="tp-input" type="email" placeholder="Enter Email Address" aria-label="Email address" />
                          <button className="tp-button" type="submit" aria-label="Subscribe">
                            <Icon name="send" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tp-footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="tp-footer-copyright">
                  <p className="mb-0 tp-text-grey-2">
                    <span>
                      <Icon name="copyright" />
                    </span>{" "}
                    {(f.copyright || "").replace("{year}", String(new Date().getFullYear()))}
                  </p>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="tp-footer-menu">
                  <ul>
                    {(f.menu ?? []).map((l, i) => (
                      <li key={i}>
                        <a href={resolveUrl(l.url, ctx)}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton({ settings }: Props) {
  if (!settings.general.showWhatsappButton || !settings.general.whatsappNumber) return null;
  return (
    <a className="ed-whatsapp-float" href={whatsappUrl(settings)} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <i className="fa-brands fa-whatsapp"></i>
    </a>
  );
}

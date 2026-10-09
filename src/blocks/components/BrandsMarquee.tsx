"use client";

import { useEffect, useRef } from "react";
import type { ImageValue } from "@/lib/types";
import { src } from "./shared";

type Logo = { image?: ImageValue; name?: string; url?: string };

type Tween = { kill: () => void; pause: () => void; play: () => void };
type Gsap = {
  set: (target: Element, vars: Record<string, unknown>) => void;
  to: (target: Element, vars: Record<string, unknown>) => Tween;
};

declare global {
  interface Window {
    gsap?: Gsap;
  }
}

/**
 * Seamless logo marquee driven by GSAP.
 *
 * The track holds the logo list repeated end to end, and the tween slides it by
 * exactly one set's width before repeating — so the join never shows. Cells are
 * a fixed share of the container (a fifth on desktop), which is what fixes the
 * count per view and what makes the set width predictable.
 *
 * Deliberately not using the template's `.tp-brand-slide-active` class: its
 * slider-init.js would claim the element as a Swiper and fight this tween.
 *
 * GSAP arrives with the template bundle after hydration, so we poll briefly for
 * it; if it never shows, a CSS keyframe fallback keeps the row moving rather
 * than stranding it on the first five logos.
 */
export default function BrandsMarquee({ logos, pxPerSecond = 55 }: { logos: Logo[]; pxPerSecond?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Enough repeats that one set always overruns the viewport, so the loop has
  // something to slide into. Five cells per view => one set spans n/5 screens.
  const copies = Math.max(2, Math.ceil(10 / Math.max(1, logos.length)));

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tween: Tween | undefined;
    let observer: ResizeObserver | undefined;
    let poll: number | undefined;
    let giveUp: number | undefined;
    let stopped = false;

    const enter = () => tween?.pause();
    const leave = () => tween?.play();

    const run = (gsap: Gsap) => {
      const build = () => {
        tween?.kill();
        gsap.set(track, { x: 0 });
        const setWidth = track.scrollWidth / copies;
        if (!setWidth) return;
        tween = gsap.to(track, {
          x: -setWidth,
          duration: setWidth / pxPerSecond,
          ease: "none",
          repeat: -1,
        });
      };

      build();
      // Cell widths are percentages, so a resize changes the set width.
      observer = new ResizeObserver(build);
      observer.observe(viewport);
      viewport.addEventListener("mouseenter", enter);
      viewport.addEventListener("mouseleave", leave);
    };

    if (window.gsap) {
      run(window.gsap);
    } else {
      poll = window.setInterval(() => {
        if (window.gsap) {
          window.clearInterval(poll);
          window.clearTimeout(giveUp);
          if (!stopped) run(window.gsap);
        }
      }, 120);
      giveUp = window.setTimeout(() => {
        window.clearInterval(poll);
        track.classList.add("ed-brand-track-css");
      }, 6000);
    }

    return () => {
      stopped = true;
      window.clearInterval(poll);
      window.clearTimeout(giveUp);
      observer?.disconnect();
      viewport.removeEventListener("mouseenter", enter);
      viewport.removeEventListener("mouseleave", leave);
      tween?.kill();
    };
  }, [copies, pxPerSecond, logos.length]);

  return (
    <div className="ed-brand-marquee" ref={viewportRef}>
      <div className="ed-brand-track" ref={trackRef} style={{ "--ed-brand-sets": copies } as React.CSSProperties}>
        {Array.from({ length: copies }).flatMap((_, c) =>
          logos.map((l, i) => {
            const img = (
              <img src={src(l.image)} alt={c === 0 ? l.image?.alt || l.name || "" : ""} loading="lazy" draggable={false} />
            );
            return (
              // Only the first set is read out; the repeats are decoration.
              <div className="ed-brand-cell" key={`${c}-${i}`} {...(c > 0 ? { "aria-hidden": true } : {})}>
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noopener" tabIndex={c > 0 ? -1 : undefined}>
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

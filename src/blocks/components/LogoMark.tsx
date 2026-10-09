"use client";

import { useEffect, useRef } from "react";

/**
 * The brand mark on the hero's dark panel, animated.
 *
 * The entrance is a CSS keyframe on the inner span rather than a tween: GSAP
 * arrives with the template bundle a beat after hydration, so driving the
 * intro from JS would either flash the mark at full opacity first or hide it
 * until the bundle lands. CSS runs on the first paint and needs no JS at all.
 *
 * GSAP then floats the outer span once it is available. Keeping the two on
 * separate elements means the keyframe's transform and the tween's never
 * fight over the same property.
 */
export default function LogoMark({ src, alt, size = 100 }: { src: string; alt: string; size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tween: { kill: () => void } | undefined;
    let poll: number | undefined;
    let giveUp: number | undefined;
    let stopped = false;

    const run = (gsap: NonNullable<Window["gsap"]>) => {
      if (stopped) return;
      // Starts after the entrance keyframe has played out.
      tween = gsap.to(el, {
        y: -9,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    };

    if (window.gsap) {
      run(window.gsap);
    } else {
      poll = window.setInterval(() => {
        if (window.gsap) {
          window.clearInterval(poll);
          window.clearTimeout(giveUp);
          run(window.gsap);
        }
      }, 120);
      giveUp = window.setTimeout(() => window.clearInterval(poll), 6000);
    }

    return () => {
      stopped = true;
      window.clearInterval(poll);
      window.clearTimeout(giveUp);
      tween?.kill();
    };
  }, []);

  return (
    <span className="ed-logo-mark d-inline-block mb-55" ref={ref}>
      <span className="ed-logo-mark-in">
        <img src={src} alt={alt} width={size} height={size} />
      </span>
    </span>
  );
}

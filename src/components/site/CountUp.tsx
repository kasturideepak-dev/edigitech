"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up to the figure when it scrolls into view.
 *
 * The markup already carried purecounter attributes, but purecounter is
 * initialised on DOMContentLoaded — before this React content exists — so the
 * numbers simply appeared at their final value and never animated.
 *
 * The server renders the final number, so it is correct before any JS runs.
 * Zeroing happens only once GSAP is in hand, and a watchdog restores the real
 * figure if the scroll trigger never fires: a counter stuck on 0 would be
 * worse than one that never animates.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(value)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const final = value.toLocaleString("en-IN");
    let tween: { kill: () => void } | undefined;
    let poll: number | undefined;
    let done = false;

    const settle = () => {
      if (done) return;
      done = true;
      el.textContent = final;
    };

    // IntersectionObserver rather than ScrollTrigger: the template loads
    // ScrollTrigger but never registers it with GSAP, so a `scrollTrigger` key
    // in the vars is read as another property to tween — which is what briefly
    // rendered these figures as "NaN".
    const run = () => {
      if (!window.gsap || done) return;
      const counter = { n: 0 };
      el.textContent = "0";
      tween = window.gsap.to(counter, {
        n: value,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          const n = Math.round(counter.n);
          el.textContent = Number.isFinite(n) ? n.toLocaleString("en-IN") : final;
        },
        onComplete: settle,
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (window.gsap) return run();
        // GSAP ships with the template bundle and may still be in flight.
        poll = window.setInterval(() => {
          if (window.gsap) {
            window.clearInterval(poll);
            run();
          }
        }, 120);
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    // Never leave a counter sitting on 0 because the tween stalled.
    const watchdog = window.setTimeout(settle, 9000);

    return () => {
      io.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(watchdog);
      tween?.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-IN")}
    </span>
  );
}

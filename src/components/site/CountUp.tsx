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

    const start = () => {
      if (!window.gsap) return false;
      const counter = { n: 0 };
      el.textContent = "0";
      tween = window.gsap.to(counter, {
        n: value,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(counter.n).toLocaleString("en-IN");
        },
        onComplete: settle,
      } as Record<string, unknown>);
      return true;
    };

    if (!start()) {
      poll = window.setInterval(() => {
        if (start()) window.clearInterval(poll);
      }, 120);
    }
    const watchdog = window.setTimeout(settle, 9000);

    return () => {
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

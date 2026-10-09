"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Which descendants stagger in. Defaults to the wrapper's own children. */
  selector?: string;
  y?: number;
  stagger?: number;
  className?: string;
  /** Kept because Bootstrap's accordion points `data-bs-parent` at this id. */
  id?: string;
};

/**
 * Scroll-triggered stagger that cannot swallow its content.
 *
 * The template's own `tp_fade_anim` sets opacity 0 in CSS and relies on
 * ScrollTrigger to put it back — and when the trigger never fires (as it
 * doesn't inside an absolutely-positioned overlay) the copy is simply gone.
 * This arms the hidden state from JS *after* mount, so server-rendered and
 * no-JS output is always visible, and a watchdog disarms it if the animation
 * has not run. Worst case the content appears without motion.
 */
export default function Reveal({ children, selector, y = 28, stagger = 0.1, className, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = selector ? Array.from(host.querySelectorAll<HTMLElement>(selector)) : Array.from(host.children) as HTMLElement[];
    if (!targets.length) return;

    let tween: { kill: () => void } | undefined;
    let poll: number | undefined;
    let disarmed = false;

    const disarm = () => {
      if (disarmed) return;
      disarmed = true;
      host.classList.remove("ed-reveal-armed");
      targets.forEach((t) => {
        t.style.removeProperty("opacity");
        t.style.removeProperty("transform");
      });
    };

    host.classList.add("ed-reveal-armed");

    const run = (gsap: NonNullable<Window["gsap"]>) => {
      tween = gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger,
        ease: "power2.out",
        scrollTrigger: { trigger: host, start: "top 88%", once: true },
        onStart: () => host.classList.remove("ed-reveal-armed"),
        onComplete: disarm,
      } as Record<string, unknown>);
    };

    const start = () => {
      if (window.gsap) {
        // Seed the from-state inline so removing the class mid-tween can't flash it.
        targets.forEach((t) => {
          t.style.opacity = "0";
          t.style.transform = `translateY(${y}px)`;
        });
        run(window.gsap);
        return true;
      }
      return false;
    };

    if (!start()) {
      poll = window.setInterval(() => {
        if (start()) window.clearInterval(poll);
      }, 120);
    }
    // If GSAP never arrives, or the trigger never fires, show the content anyway.
    const watchdog = window.setTimeout(disarm, 7000);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(watchdog);
      tween?.kill();
      disarm();
    };
  }, [selector, y, stagger]);

  return (
    <div className={className} id={id} ref={ref}>
      {children}
    </div>
  );
}

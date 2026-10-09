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

    // IntersectionObserver rather than ScrollTrigger: the template loads
    // ScrollTrigger but never registers it as a GSAP plugin, so a
    // `scrollTrigger` key in the vars is treated as a property to tween.
    const run = () => {
      if (!window.gsap || disarmed) return;
      // Seed the from-state inline so dropping the class can't flash it.
      targets.forEach((t) => {
        t.style.opacity = "0";
        t.style.transform = `translateY(${y}px)`;
      });
      host.classList.remove("ed-reveal-armed");
      tween = window.gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger,
        ease: "power2.out",
        onComplete: disarm,
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (window.gsap) return run();
        poll = window.setInterval(() => {
          if (window.gsap) {
            window.clearInterval(poll);
            run();
          }
        }, 120);
      },
      { threshold: 0.12 },
    );
    io.observe(host);

    // If GSAP never arrives, or the tween stalls, show the content anyway.
    const watchdog = window.setTimeout(disarm, 7000);

    return () => {
      io.disconnect();
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

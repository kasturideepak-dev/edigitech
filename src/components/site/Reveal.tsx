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
    let watchdog: number | undefined;
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

    // Only hide ahead of time when the section is still below the fold. If it
    // is already on screen there is nothing to reveal, and hiding it would
    // just blink. This also means the hidden state is never applied to
    // something the visitor is currently reading.
    const belowFold = host.getBoundingClientRect().top > window.innerHeight;
    if (belowFold) host.classList.add("ed-reveal-armed");

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
      // Started here, not at mount: a mount-time timer expires while the
      // visitor is still reading further up the page, and then the reveal is
      // marked done before it ever had a chance to run.
      watchdog = window.setTimeout(disarm, 4000);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (window.gsap) return run();
        // GSAP ships with the template bundle and may still be in flight. If
        // it never turns up the content is already hidden, so this needs its
        // own deadline rather than polling forever.
        poll = window.setInterval(() => {
          if (window.gsap) {
            window.clearInterval(poll);
            run();
          }
        }, 120);
        watchdog = window.setTimeout(() => {
          window.clearInterval(poll);
          disarm();
        }, 4000);
      },
      { threshold: 0.12 },
    );
    io.observe(host);

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

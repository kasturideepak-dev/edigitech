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
 * Scroll-triggered stagger that cannot leave its content hidden.
 *
 * Nothing is hidden up front. The content is visible from the server render
 * onward, and the from-state is written inline only in the same tick as the
 * tween that undoes it — so there is no window in which something must fire
 * for the page to be readable.
 *
 * That is deliberate. The template's `tp_fade_anim` hides in CSS and trusts
 * ScrollTrigger to restore it, and it has already stranded copy at opacity 0
 * on this site. An earlier version of this component repeated the mistake in
 * a smaller way: it pre-hid below-the-fold sections and relied on an observer
 * to reveal them, and when the observer did not fire the content stayed
 * invisible. The price of doing it this way is that a section already on
 * screen dips for one frame before animating. That is the right trade.
 */
export default function Reveal({ children, selector, y = 28, stagger = 0.1, className, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = selector
      ? Array.from(host.querySelectorAll<HTMLElement>(selector))
      : (Array.from(host.children) as HTMLElement[]);
    if (!targets.length) return;

    let tween: { kill: () => void } | undefined;
    let poll: number | undefined;
    let watchdog: number | undefined;
    let cleared = false;

    const clear = () => {
      if (cleared) return;
      cleared = true;
      // Kill first, or this cleanup is overwritten by the next frame of the
      // animation it is rescuing.
      tween?.kill();
      targets.forEach((t) => {
        t.style.removeProperty("opacity");
        t.style.removeProperty("transform");
      });
    };

    const run = () => {
      if (!window.gsap || cleared) return;
      targets.forEach((t) => {
        t.style.opacity = "0";
        t.style.transform = `translateY(${y}px)`;
      });
      tween = window.gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger,
        ease: "power2.out",
        onComplete: clear,
      });
      // Only now is there anything to recover from.
      watchdog = window.setTimeout(clear, 4000);
    };

    // IntersectionObserver rather than ScrollTrigger: the template loads
    // ScrollTrigger but never registers it as a GSAP plugin, so a
    // `scrollTrigger` key in the vars is read as a property to tween.
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
        window.setTimeout(() => window.clearInterval(poll), 4000);
      },
      { threshold: 0.12 },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(watchdog);
      clear();
    };
  }, [selector, y, stagger]);

  return (
    <div className={className} id={id} ref={ref}>
      {children}
    </div>
  );
}

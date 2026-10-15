"use client";

import { useEffect, useRef } from "react";

/**
 * Settles an image from slightly over-scaled to its resting size as it comes
 * into view, so a card's photo arrives with the card rather than sitting flat.
 *
 * Chosen for its failure mode: the tween is created at the moment the element
 * is seen, and if it stalls the image is left marginally zoomed — still fully
 * visible. Nothing here can hide its own content, which is the rule the rest
 * of the motion on this site follows.
 */
export default function ZoomIn({
  children,
  from = 1.12,
  duration = 1.1,
  className,
}: {
  children: React.ReactNode;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current;
    const target = host?.firstElementChild as HTMLElement | null;
    if (!host || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tween: { kill: () => void } | undefined;
    let poll: number | undefined;
    let done = false;

    const run = () => {
      if (!window.gsap || done) return;
      done = true;
      tween = window.gsap.fromTo(
        target,
        { scale: from },
        { scale: 1, duration, ease: "power2.out", clearProps: "transform" },
      );
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
        window.setTimeout(() => window.clearInterval(poll), 4000);
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      window.clearInterval(poll);
      tween?.kill();
    };
  }, [from, duration]);

  return (
    <span className={className} ref={ref}>
      {children}
    </span>
  );
}

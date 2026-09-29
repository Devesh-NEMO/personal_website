"use client";

import { useEffect, useRef } from "react";

import { motion } from "@/lib/constants";

/**
 * A 4px accent bar pinned to the bottom edge of the navbar that fills as the
 * page is scrolled.
 *
 * Driven with `transform: scaleX()` rather than `width`, because scale is
 * composited on the GPU: the fill never triggers layout or paint, and a
 * fractional width on a 3px-border design would otherwise shimmer. The
 * element is always 100% of the navbar's width, so nothing can shift.
 *
 * Updates are coalesced into one rAF callback per frame, and the listener is
 * registered as `passive` so scrolling is never blocked.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const paint = () => {
      frame = 0;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      // A page shorter than the viewport has nothing to scroll through.
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      bar.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Late-loading images and fonts change the page height, which would leave
    // the bar permanently short. Re-measure whenever the body resizes.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0"
      style={{ height: motion.progressHeight }}
    >
      <div
        ref={barRef}
        className="size-full origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

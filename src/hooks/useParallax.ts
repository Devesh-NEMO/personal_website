"use client";

import { useEffect, type RefObject } from "react";

/**
 * Largest vertical drift, in px, a shape may accumulate.
 *
 * Without a clamp, a shape with `parallax: 0.34` would be 2000px from where it
 * started by the bottom of a long page — off screen entirely, having quietly
 * stopped existing. Capping keeps every shape visible for the whole scroll,
 * which is also what makes the effect read as depth rather than as shapes
 * leaving.
 */
const MAX_OFFSET = 180;

/**
 * Scroll parallax for the background shapes.
 *
 * Each shape carries `data-parallax`, a fraction of its size to drift per 1000px
 * scrolled, and this writes `translate3d` to it. Three decisions keep it cheap:
 *
 *  - **The transform is written to a wrapper, not the shape itself.** The inner
 *    element owns the CSS float/rotate keyframes, so the two never contend for
 *    the same property.
 *  - **No React state.** The loop touches `element.style` directly, so scrolling
 *    produces zero re-renders. `ScrollProgress` already establishes that
 *    pattern for the same reason.
 *  - **One rAF per frame, and only when the scroll position actually moved.**
 *    Coalesced exactly like the progress bar, so a fast flick writes at most one
 *    style update per frame no matter how many `scroll` events fire.
 *
 * Pauses when the tab is hidden, and does not run at all under reduced motion.
 *
 * The visual effect is optional decoration, so if the observer is unavailable
 * this simply never runs and the shapes sit at their resting positions.
 */
export function useParallax(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !enabled) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    ).map((el) => ({ el, speed: Number(el.dataset.parallax) || 0 }));

    if (nodes.length === 0) return;

    let frame = 0;
    let lastY = Number.NaN;

    const paint = () => {
      frame = 0;

      const y = window.scrollY;
      // Nothing moved, so nothing to write. Guards the idle case, where a
      // stray resize or a returning tab would otherwise repaint for no reason.
      if (y === lastY) return;
      lastY = y;

      for (const { el, speed } of nodes) {
        const offset = Math.max(
          -MAX_OFFSET,
          Math.min(MAX_OFFSET, y * speed),
        );
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Paint once so the shapes start from the right place if the page is
    // restored mid-scroll, rather than snapping from 0 on first wheel.
    paint();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);

      // Hand the shapes back at their resting positions so a later mount — or a
      // reduced-motion toggle — does not inherit a stale inline transform.
      for (const { el } of nodes) el.style.removeProperty("transform");
    };
  }, [containerRef, enabled]);
}
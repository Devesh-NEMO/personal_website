"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { motion } from "@/lib/constants";

/**
 * Momentum scrolling for wheel input.
 *
 * The page had no scroll jank to fix — no blur filters, no scroll-triggered
 * layout, one one-shot animation, and everything animated is transform or
 * opacity. What native scrolling lacks is *inertia*: a trackpad flick stops as
 * soon as the OS decides it has. This adds that, by easing the scroll position
 * toward the wheel's target rather than jumping to it.
 *
 * Deliberate non-goals, each of which would be a bug if reversed:
 *
 *  - **Touch is left alone.** Phones and tablets already have OS-level momentum
 *    with real physics, and intercepting it with JS reliably feels *worse*. This
 *    component does not even initialise on a coarse pointer, so a phone pays
 *    nothing for it and keeps the browser's own scrolling byte for byte.
 *  - **Anchors are left alone.** Lenis's `anchors` option calls `scrollTo` from
 *    a click handler without calling `preventDefault()`, so Next.js `<Link>`
 *    would scroll to the same hash at the same time. Both `anchors` and the
 *    `lenis.css` import are therefore omitted: in-page navigation keeps using
 *    `scroll-behavior: smooth` in globals.css, and Lenis writes the scroll
 *    position with `behavior: "instant"`, so the two never fight over a frame.
 *  - **The navbar stays `position: sticky`.** Lenis scrolls the real window
 *    rather than transforming a wrapper, which is what keeps sticky positioning,
 *    the IntersectionObserver reveals and the progress bar all working unchanged.
 *    The mobile menu's scroll lock is the one thing that needs to reach in, and
 *    it does so through the `window.__lenis` handle set below.
 */
export function SmoothScroll() {
  useEffect(() => {
    // `(hover: hover) and (pointer: fine)` is the "has a precise pointer" test:
    // true for a mouse or trackpad, false for phones and most tablets. A hybrid
    // touchscreen laptop passes, which is correct — it has a trackpad.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const lenis = new Lenis({
      /** See `motion.scrollLerp`. */
      lerp: motion.scrollLerp,
      /**
       * Honest reading pace. Anything above 1 silently scrolls further per
       * notch, which is a behaviour change rather than a smoothness one.
       */
      wheelMultiplier: 1,
      /**
       * Lenis drives its own animation loop, so there is no rAF to wire up here,
       * and `destroy()` below cancels it.
       */
      autoRaf: true,
      /**
       * Built-in (and the default, but stated because it matters): when
       * `prefers-reduced-motion` is set, Lenis forces lerp to 1 so scrolling
       * tracks the input 1:1, and programmatic scrolls become instant. It reads
       * the media query live, so toggling the OS setting takes effect without a
       * reload.
       */
      respectReducedMotion: true,
    });

    /*
     * Published so the mobile menu's scroll lock can pause the loop. Lenis is
     * the only thing on the page that scrolls outside the browser's own
     * machinery, so `overflow: hidden` alone does not lock the page while it is
     * running — it has to be told to stop.
     */
    window.__lenis = lenis;

    return () => {
      window.__lenis = null;
      lenis.destroy();
    };
  }, []);

  // Lenis attaches to the window and wraps nothing, so there is no element to
  // render — this is a behaviour, not layout.
  return null;
}
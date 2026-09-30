"use client";

import { useEffect, useRef } from "react";

import { usePageVisible } from "@/hooks/usePageVisible";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * How far the glow chases the pointer each frame, as a fraction of the gap.
 * Below 1 it eases toward the cursor instead of tracking it exactly, which is
 * what produces the trail. 0.12 is slow enough to read as a glow rather than a
 * second cursor.
 */
const EASE = 0.12;

/**
 * Diameter of the glow in px. Kept in step with `.deco-glow` in globals.css,
 * which is what actually paints it — and with the divide-by-two below, so the
 * glow is centred on the pointer rather than hanging off its top-left corner.
 */
const SIZE = 300;

/**
 * A soft accent-coloured glow that trails the pointer.
 *
 * Desktop only, and the one piece of the background layer that needs the pointer
 * at all. It writes `transform` on a single fixed element inside its own rAF
 * loop, with no React state, so moving the mouse never re-renders anything.
 *
 * Three guards keep it from being a liability:
 *
 *  - **`(hover: hover) and (pointer: fine)`** gates construction. A touch device
 *    never builds it: there is no hovering pointer to follow, and a fake touch
 *    point that appears and vanishes on tap looks like a glitch.
 *  - **Reduced motion skips it entirely** — not just its easing, the element.
 *    A glow that trails a third of a second behind your cursor is exactly the
 *    kind of unrequested movement the preference is about.
 *  - **The loop stops when the tab is hidden**, so it does not keep asking for
 *    frames while nobody is looking.
 *
 * `aria-hidden` rather than merely transparent: it is decoration, and this keeps
 * it out of a screen reader's element list entirely.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    let frame = 0;
    // Starts centred on the pointer's origin rather than at 0,0, so the first
    // painted frame after a pointermove is already in the right place instead
    // of streaking in from the top-left corner.
    let targetX = -SIZE;
    let targetY = -SIZE;
    let easedX = targetX;
    let easedY = targetY;

    const tick = () => {
      easedX += (targetX - easedX) * EASE;
      easedY += (targetY - easedY) * EASE;

      glow.style.transform = `translate3d(${easedX.toFixed(1)}px, ${easedY.toFixed(1)}px, 0)`;

      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX - SIZE / 2;
      targetY = event.clientY - SIZE / 2;
    };

    const onEnter = (event: PointerEvent) => {
      onMove(event);
      glow.dataset.visible = "true";
    };

    const onLeave = () => {
      glow.dataset.visible = "false";
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerenter", onEnter, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    glow.dataset.visible = "false";
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <div ref={glowRef} className="deco-glow" data-visible="false" aria-hidden="true" />;
}

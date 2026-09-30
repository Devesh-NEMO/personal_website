"use client";

import { useEffect } from "react";

/**
 * Page-scroll lock, ref-counted.
 *
 * Two things have to be neutralised, and the obvious one is not enough:
 *
 *  1. **Native scrolling.** `overflow: hidden` on <html> does it, and unlike
 *     `position: fixed` on <body> it leaves the scroll offset alone, so the page
 *     comes back exactly where the reader left it.
 *  2. **Lenis.** It `preventDefault`s every wheel event and drives the position
 *     from its own animation loop, so it keeps scrolling a page the browser
 *     thinks is locked. `stop()` short-circuits that loop, and `start()` resumes
 *     rather than re-creates it.
 *
 * `touch-action: none` covers iOS, where `overflow: hidden` on <html> alone does
 * not stop the page moving under a finger.
 *
 * The ref-count is module state rather than a boolean so two overlapping locks
 * (a menu opening while something else is also open) cannot unlock each other.
 */
let lockCount = 0;

function lock() {
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }

  lockCount = 1;

  const root = document.documentElement;

  /*
   * Hiding the scrollbar narrows the viewport by its width, which reflows every
   * full-width element on the page. Padding by the same amount keeps the
   * layout exactly where it was. Zero on macOS, where scrollbars are overlays.
   */
  const scrollbar = window.innerWidth - root.clientWidth;

  root.style.setProperty("overflow", "hidden");
  root.style.setProperty("touch-action", "none");
  if (scrollbar > 0) {
    root.style.setProperty("padding-right", `${scrollbar}px`);
  }

  window.__lenis?.stop();
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const root = document.documentElement;

  root.style.removeProperty("overflow");
  root.style.removeProperty("touch-action");
  root.style.removeProperty("padding-right");

  window.__lenis?.start();
}

/**
 * Freezes page scrolling for as long as `locked` is true.
 *
 * Always releases on unmount, so a menu that is torn down while open — a route
 * change, say — cannot leave the page permanently unscrollable.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lock();
    return unlock;
  }, [locked]);
}

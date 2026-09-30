import type Lenis from "lenis";

/**
 * The running momentum scroller, published by `SmoothScroll`.
 *
 * `useLockBodyScroll` needs to pause it: Lenis `preventDefault`s the wheel and
 * writes the scroll position from its own animation loop, so `overflow: hidden`
 * on <html> does not stop it. Declared here rather than in a cast inside the
 * hook so both sides of the handoff are type-checked.
 */
declare global {
  interface Window {
    __lenis: Lenis | null;
  }
}

export {};

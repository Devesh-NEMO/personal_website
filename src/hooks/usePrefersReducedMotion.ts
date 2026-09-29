"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Re-renders when the OS motion preference changes, unsubscribes on unmount. */
function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};

  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onStoreChange);

  return () => media.removeEventListener("change", onStoreChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/**
 * The server has no way to know the visitor's motion preference, and claiming
 * `false` here would make the first client render disagree with the server
 * HTML. Claiming `true` keeps the initial render identical on both sides —
 * which means nothing is ever hidden on first paint — and React re-renders
 * synchronously during hydration if the real answer is `false`, so the
 * animation state is in place before the browser paints.
 */
const getServerSnapshot = () => true;

/**
 * Live `prefers-reduced-motion` value, safe to read during SSR and hydration.
 *
 * Callers use this to skip hiding content and skip count-ups entirely rather
 * than relying on CSS alone, which keeps the "show content instantly"
 * behaviour correct even mid-animation.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

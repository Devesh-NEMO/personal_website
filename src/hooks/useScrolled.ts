"use client";

import { useSyncExternalStore } from "react";

import { motion } from "@/lib/constants";

/**
 * Whether the page has scrolled far enough to condense the navbar window.
 *
 * A snapshot store rather than `useState` + a scroll listener, because the value
 * only ever has two possible states and reading it must never disagree between
 * the server render and the first client pass — `useSyncExternalStore` is the
 * one hook that guarantees that. It also means the subscription is torn down and
 * re-created by React instead of by hand, so there is no listener to leak when
 * the component unmounts.
 *
 * The scroll listener is `passive` and the work it triggers is a boolean
 * compare, so the page is never blocked by it — and the comparison means a
 * re-render only happens on the frame the threshold is actually crossed, not on
 * every scroll event.
 */
export function useScrolled(threshold: number = motion.navThreshold): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("scroll", onStoreChange, { passive: true });
      return () => window.removeEventListener("scroll", onStoreChange);
    },
    () => window.scrollY > threshold,
    // The server cannot know the scroll position. `false` matches the state the
    // initial HTML is authored in, so hydration has nothing to reconcile.
    () => false,
  );
}

"use client";

import { useSyncExternalStore } from "react";

/** Notifies on tab show/hide. Returns a no-op unsubscribe during SSR. */
function subscribe(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};

  document.addEventListener("visibilitychange", onStoreChange);

  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

const getSnapshot = () => !document.hidden;

/**
 * The server has no `document`, so it cannot know whether the tab is visible.
 * Claiming `true` keeps the first render identical on both sides — and matters
 * more here than for the reduced-motion hook, because the alternative would be
 * server-rendering "paused" and then un-pausing on hydration, which is a
 * visible flash of frozen decoration.
 */
const getServerSnapshot = () => true;

/**
 * Whether the tab is currently visible.
 *
 * Decorative loops should stop while the tab is in the background. A hidden tab
 * paints nothing, but CSS animations and a `requestAnimationFrame` loop keep
 * requesting frames anyway, and a page that never idles is a page that keeps
 * the CPU and the GPU awake for nothing.
 *
 * `useSyncExternalStore` rather than reading `document.hidden` during render,
 * which would disagree between the server and the client on the first pass.
 */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
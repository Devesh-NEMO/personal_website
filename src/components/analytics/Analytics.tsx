"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { isAnalyticsEnabled, track, type TrackProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/types";

/**
 * The Vercel pair, code-split and browser-only.
 *
 * `next/dynamic` with `ssr: false` puts each in its own chunk that is only
 * fetched once something actually renders it. That matters twice over:
 *
 *   - A build configured for **Plausible** should not ship the Vercel SDK at
 *     all. A plain static import would include it in the initial bundle of every
 *     visitor and only skip it at runtime.
 *   - `<SpeedInsights />` reads layout shift from a PerformanceObserver and
 *     `<Analytics />` reads navigation timing, so there is nothing meaningful
 *     for either to do during SSR.
 *
 * `display: undefined` is the correct `ssr: false` fallback: these components
 * render no markup of their own, they only inject a script tag.
 */
const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const VercelSpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

/**
 * =============================================================================
 * ANALYTICS — the client half
 * =============================================================================
 * Two jobs:
 *
 *   1. Render the Vercel tags, when that is the configured provider.
 *   2. Own the single delegated click listener that reports every `data-track`
 *      element on the page.
 *
 * The Plausible script is *not* loaded here. It is one `next/script` in
 * `layout.tsx`, which a Server Component can already emit — putting it in this
 * component would mean shipping a client component to serve a script tag that
 * needed neither state nor an effect.
 *
 * **Why a delegated listener.** The obvious implementation is an `onClick` per
 * link, which means <Projects> and <Contact> become client components to carry
 * two handlers — and those two sections are most of the page's HTML. One
 * listener on `document` reads the same two attributes off the server-rendered
 * markup, costs one closure for the whole page, and covers markup that appears
 * later without any of it knowing analytics exists.
 *
 * The trade is that the contract becomes a data attribute rather than a typed
 * prop, so it is documented in `lib/analytics.ts` and in the README instead of
 * being checked by the compiler. That is worth it for keeping the sections
 * static.
 */
export function Analytics() {
  const enabled = isAnalyticsEnabled();

  useEffect(() => {
    if (!enabled) return;

    /*
     * Capture phase, so a click is still reported when a handler downstream
     * calls `stopPropagation` — and, more concretely, when the click starts a
     * download and the document begins navigating away.
     *
     * `click` rather than `pointerdown`, so a drag that begins on a tracked link
     * and ends somewhere else is not counted as a click on it.
     */
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      /*
       * `closest`, because the visitor almost never clicks the element itself —
       * it is the element inside it that receives the event.
       */
      const element = target.closest<HTMLElement>("[data-track]");
      if (!element) return;

      const eventName = element.dataset.track as AnalyticsEvent | undefined;
      if (!eventName) return;

      let properties: TrackProperties | undefined;

      if (element.dataset.trackProps) {
        try {
          properties = JSON.parse(element.dataset.trackProps) as TrackProperties;
        } catch {
          /*
           * Malformed JSON in an attribute is a content mistake, not something
           * worth surfacing to the visitor. The event still goes out, just
           * without its properties.
           */
          properties = undefined;
        }
      }

      track(eventName, properties);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <VercelAnalytics />
      <VercelSpeedInsights />
    </>
  );
}

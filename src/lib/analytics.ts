import { analytics } from "@/lib/constants";
import type { AnalyticsEvent, AnalyticsProvider } from "@/types";

/**
 * =============================================================================
 * ANALYTICS
 * =============================================================================
 * A single `track()` that reports a custom event to whichever backend is
 * configured, and does nothing at all when there is no backend.
 *
 * Three gates, checked in this order, all of which have to pass:
 *
 *   1. **Production.** `NODE_ENV === "production"`. A dev server reports
 *      nothing, so tuning the site never fills a dashboard with noise and a
 *      preview deploy cannot be mistaken for real traffic.
 *   2. **Enabled.** `NEXT_PUBLIC_ANALYTICS_ENABLED`, for switching tracking off
 *      without a code change. Defaults to on.
 *   3. **A known provider.** Anything that is not `vercel` or `plausible` falls
 *      back to off, so a typo in an environment variable degrades to "no
 *      tracking" rather than throwing at import time.
 *
 * No cookies and no personal data are set by anything here. The payloads are a
 * short event name plus a few strings already visible on the page — which
 * project was clicked, which contact method, which theme. The email address is
 * deliberately *not* sent as a property: `contact_click` reports `email` as the
 * *kind* of action, and the address itself stays in the visitor's clipboard.
 *
 * The Vercel SDK is imported dynamically inside `track` rather than at module
 * scope, so a build configured for Plausible does not ship it.
 */

type EventValue = string | number | boolean | undefined;

/** `process.env.NODE_ENV` is inlined at build time, so this resolves to a constant. */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function resolveProvider(): AnalyticsProvider | null {
  if (!IS_PRODUCTION) return null;
  if (!analytics.enabled) return null;

  return analytics.provider === "vercel" || analytics.provider === "plausible"
    ? analytics.provider
    : null;
}

/**
 * Reports a custom event. A no-op when analytics is off, so call sites need no
 * guards of their own and can stay unconditional.
 *
 * Failures are swallowed on purpose: an analytics error must never surface as a
 * broken site, and a blocked request is not the visitor's problem.
 */
export function track(
  event: AnalyticsEvent,
  properties?: Record<string, EventValue>,
) {
  const provider = resolveProvider();
  if (!provider) return;

  try {
    if (provider === "vercel") {
      void import("@vercel/analytics").then((mod) => mod.track(event, properties));
      return;
    }

    /*
     * The Plausible script tag declares `window.plausible` itself, and its
     * custom-event form is `plausible(name, { props })`.
     */
    const plausible = (
      window as Window & {
        plausible?: (name: string, options?: unknown) => void;
      }
    ).plausible;

    plausible?.(event, { props: properties });
  } catch {
    // Intentionally empty — see the doc comment above.
  }
}

/**
 * Whether anything will actually be reported.
 *
 * Separate from `track` because that is a different question: `track` asks
 * "should this event be sent", this asks "should the provider's script be in the
 * page at all". A build with analytics switched off should contain no script
 * tag, not a script that loads and then discards everything.
 */
export function isAnalyticsEnabled(): boolean {
  return resolveProvider() !== null;
}

/** The props bag carried by `data-track-props`, once parsed. */
export type TrackProperties = Record<string, EventValue>;

/**
 * The data attributes that mark an element as a trackable click target.
 *
 * Read by the one delegated listener in `components/analytics/Analytics.tsx`
 * rather than by an `onClick` on each element. That is what lets every content
 * component on the page stay a Server Component — the alternative is making
 * <Projects> and <Contact> client components for two click handlers.
 *
 *   <a data-track="project_click" data-track-props='{"name":"Churn model"}'>
 *
 * `props` is one JSON string rather than several flat attributes because both
 * providers take a property bag, and one attribute keeps that shape out of the
 * markup everywhere else.
 */
export function trackAttrs(
  event: AnalyticsEvent,
  properties?: TrackProperties,
): { "data-track": AnalyticsEvent; "data-track-props"?: string } {
  return properties && Object.keys(properties).length > 0
    ? { "data-track": event, "data-track-props": JSON.stringify(properties) }
    : { "data-track": event };
}

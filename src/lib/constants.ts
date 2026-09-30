import type { CSSProperties } from "react";
import type { AnalyticsProvider } from "@/types";

/**
 * =============================================================================
 * MOTION CONSTANTS
 * =============================================================================
 * Single source of truth for every animation timing on the site.
 *
 * Two consumers read from this file:
 *
 *   1. React components (Reveal, CountUp, the navbar) apply these values as
 *      inline styles, because they vary per element (stagger delays).
 *   2. `layout.tsx` publishes the same numbers onto <body> as CSS custom
 *      properties, which is how the CSS-driven animations in globals.css stay
 *      in sync with the JS ones. See `motionCssVars` at the bottom.
 *
 * To change how fast or bouncy the whole site feels, edit `motion` here — do
 * not hardcode durations in components.
 */

/** Timing and distance values shared by every animation. */
export const motion = {
  /* --- entrances ------------------------------------------------------------ */

  /** Default entrance duration, in ms. */
  duration: 520,
  /**
   * Decelerating curve: leaves quickly, settles gently. Used for every
   * transform + opacity reveal.
   */
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  /**
   * Springy curve that overshoots past 1. Used where the brief asks for a
   * "pop" or a "bounce" — the hero "talk." block and the contact buttons.
   */
  easeBounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Duration of the small contact-button hover bounce, in ms. */
  bounceDuration: 320,
  /** How far an "up" or "left" entrance travels before arriving, in px. */
  distance: 24,

  /* --- stagger -------------------------------------------------------------- */

  /** Delay added per item in a staggered list (project cards, skill boxes…). */
  stagger: 80,

  /* --- section headings ----------------------------------------------------- */

  /**
   * Delay before the 56x6px accent underline starts growing, measured from the
   * moment the heading itself becomes visible. Chosen so the rule starts
   * growing while the text is still settling rather than after it lands.
   */
  underlineDelay: 220,

  /* --- hero timeline -------------------------------------------------------- */

  /**
   * The hero plays on page load rather than on scroll (it is above the fold),
   * so its offsets are an explicit timeline in ms from first paint.
   */
  hero: {
    eyebrow: 0,
    heading: 90,
    photo: 170,
    intro: 200,
    /** Buttons, and the base delay for the stat tiles below. */
    actions: 290,
    /** The orange "talk." block pops partway through the heading's arrival. */
    highlight: 300,
    /** Duration of the "talk." overshoot-and-settle pop. */
    highlightDuration: 420,
    /** First stat tile; each subsequent tile adds `stagger`. */
    stats: 380,
  },

  /* --- stat tiles ----------------------------------------------------------- */

  /** How long a stat number takes to count up from zero, in ms. */
  countUpDuration: 1200,

  /* --- navbar --------------------------------------------------------------- */

  /** Scroll distance, in px, before the navbar shrinks. */
  navThreshold: 20,
  /** Height shrink and shadow, in ms. */
  navDuration: 300,
  /** Height of the scroll-progress bar, in px. */
  progressHeight: 4,
  /**
   * How long the sliding highlight takes to travel between links, in ms.
   *
   * Set above the 300ms it is grouped with on purpose: the pill crosses the
   * whole capsule, and a faster travel reads as a flicker rather than a slide
   * when the gap is four links wide.
   */
  navIndicatorDuration: 300,
  /**
   * Easing for the sliding highlight.
   *
   * The overshoot past 1 is the point — the pill arrives with a little bounce
   * instead of easing to a halt, which is what makes it feel like a physical
   * object being pushed along a track. Overridden to a plain ease in
   * globals.css under `prefers-reduced-motion`.
   */
  navIndicatorEase: "cubic-bezier(0.3, 1.4, 0.5, 1)",
  /** Mobile panel open/close, in ms. */
  navMenuDuration: 260,

  /* --- smooth scrolling ------------------------------------------------------ */

  /**
   * Interpolation intensity for the momentum scroller (0-1). Lower is smoother
   * and more floaty; higher tracks the wheel more literally. Lenis defaults to
   * 0.1, which is noticeably laggy on a page this short, so this sits just above
   * it: clearly smoothed, still responsive.
   */
  scrollLerp: 0.12,

  /* --- loading splash ------------------------------------------------------- */

  /**
   * Hard ceiling on the splash, in ms.
   *
   * 1.2s is the longest a first-time visitor should wait on decoration. The
   * splash never gates anything — the page underneath is already interactive —
   * so the only thing a longer duration buys is a longer delay before it.
   */
  splashMax: 1200,
  /**
   * How long the exit slide takes, in ms. Runs *after* `splashMax`, so the total
   * time on screen is `splashMax + splashDuration`.
   */
  splashDuration: 320,
  /**
   * The progress bar's discrete values, in %.
   *
   * Deliberately not a smooth fill: the joke is a bar that ticks up like a real
   * job finishing, and an even step every ~120ms is what sells that better than
   * an easing curve would.
   */
  splashSteps: [12, 27, 44, 58, 71, 86, 100],
  /** How long each step is held, in ms. */
  splashStepDuration: 130,

  /* --- command menu ---------------------------------------------------------- */

  /** Dialog open/close, in ms. */
  commandDuration: 180,
  /** Max height of the scrolling result list, in px. */
  commandListMaxHeight: 340,

  /* --- toast ----------------------------------------------------------------- */

  /** How long the "Copied!" toast stays up, in ms. */
  toastDuration: 2000,
  /** Toast fade in/out, in ms. */
  toastDurationFade: 160,
} as const;

/* -----------------------------------------------------------------------------
 * ANALYTICS
 * ------------------------------------------------------------------------ */

/**
 * Analytics runtime configuration.
 *
 * Three independent conditions all have to hold before a single event is
 * reported, and they are checked separately in `lib/analytics.ts`:
 *
 *   1. `enabled`   — the `NEXT_PUBLIC_ANALYTICS_ENABLED` switch, for turning
 *                    tracking off without touching code.
 *   2. production  — `NODE_ENV === "production"`. A dev server never reports,
 *                    so tuning the site never fills a dashboard with noise.
 *   3. a known provider — anything unrecognised falls back to off, so a typo in
 *                    an environment variable degrades to "no tracking" rather
 *                    than throwing at import time.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so changing any of these
 * needs a rebuild rather than a server restart.
 */
export const analytics = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false",
  provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "vercel") as AnalyticsProvider,
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
  plausibleScriptUrl:
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? "https://plausible.io/js/script.js",
} as const;

/* -----------------------------------------------------------------------------
 * OPEN GRAPH IMAGE
 * ------------------------------------------------------------------------ */

/**
 * Social preview card, generated at build time by `app/opengraph-image.tsx`.
 *
 * Sized to the Open Graph standard and rendered by Satori (`next/og`), which
 * supports flexbox and a flat subset of CSS — no grid, no custom fonts unless
 * they are supplied as buffers. Both restrictions are why the card is built the
 * way it is; see the README.
 */
export const ogImage = {
  width: 1200,
  height: 630,
  contentType: "image/png",
  /** Same wording as `profile.ogImage.alt`, so the two cannot disagree. */
  alt: "Devesh Kumar — Data Analyst & Data Scientist. I make data talk.",
  /** Favicon card. Larger than the 16px it is displayed at, for the same reason. */
  iconSize: 64,
} as const;

/* -----------------------------------------------------------------------------
 * OBSERVER SETTINGS
 * -------------------------------------------------------------------------- */

/**
 * Fraction of an element that must be on screen before its entrance fires.
 * 15% is enough that a long element does not start animating while it is still
 * mostly below the fold, but early enough that it feels ready when you reach it.
 */
export const revealThreshold = 0.15;

/* -----------------------------------------------------------------------------
 * CSS CUSTOM PROPERTIES
 * -------------------------------------------------------------------------- */

/**
 * The subset of `motion` that CSS needs, published onto <body> by layout.tsx.
 *
 * This exists so globals.css can stay declarative (it never hardcodes a
 * millisecond) while remaining a single source of truth: changing `duration`
 * here updates both the React transitions and the CSS-driven keyframes.
 */
export const motionCssVars = {
  "--motion-duration": `${motion.duration}ms`,
  "--motion-ease": motion.ease,
  "--motion-distance": `${motion.distance}px`,
  /* Hero "talk." overshoot-and-settle pop. */
  "--motion-pop-duration": `${motion.hero.highlightDuration}ms`,
  "--motion-pop-ease": motion.easeBounce,
  /* Contact button hover bounce. */
  "--motion-bounce-duration": `${motion.bounceDuration}ms`,
  "--motion-bounce-ease": motion.easeBounce,
  /* Navbar: height shrink, the sliding highlight and the mobile panel. */
  "--nav-duration": `${motion.navDuration}ms`,
  "--nav-indicator-duration": `${motion.navIndicatorDuration}ms`,
  "--nav-indicator-ease": motion.navIndicatorEase,
  "--nav-menu-duration": `${motion.navMenuDuration}ms`,
  /* Loading splash: the exit slide and the stepped progress fill. */
  "--splash-duration": `${motion.splashDuration}ms`,
  "--splash-step-duration": `${motion.splashStepDuration}ms`,
  /* Command menu and toast. */
  "--command-duration": `${motion.commandDuration}ms`,
  "--command-list-max-height": `${motion.commandListMaxHeight}px`,
  "--toast-duration": `${motion.toastDuration}ms`,
  "--toast-fade-duration": `${motion.toastDurationFade}ms`,
} as CSSProperties;

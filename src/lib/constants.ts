import type { CSSProperties } from "react";

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

  /** Scroll distance, in px, before the navbar condenses. */
  navThreshold: 20,
  /** Condense transition duration, in ms. */
  navDuration: 300,
  /** Height of the scroll-progress bar, in px. */
  progressHeight: 4,
  /** Duration of the active-link underline, in ms. */
  navLinkDuration: 200,
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
} as CSSProperties;

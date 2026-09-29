"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion, revealThreshold } from "@/lib/constants";

/* See the note in useInView: layout effects let the zero-state be written
   before paint; on the server this is a no-op. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type CountUpProps = {
  /** The full display value, e.g. "40+", "2.4B" or "99.5%". */
  value: string;
  /**
   * Milliseconds to hold at zero before counting. Pass the same value as the
   * parent reveal's delay so the number and the tile arrive together.
   */
  delay?: number;
  className?: string;
};

/** Anything that cannot be counted up: "Open to work", "Available", etc. */
type ParsedValue = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
};

/**
 * Splits a display value into the parts around its number, so "2.4B" animates
 * the 2.4 and leaves the B alone, and "40+" animates the 40 and leaves the +.
 * Returns null when there is no number to count.
 */
function parseValue(value: string): ParsedValue | null {
  const match = /^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([^0-9]*)$/.exec(value.trim());
  if (!match) return null;

  const [, prefix, numeric, suffix] = match;
  const target = Number(numeric);
  if (!Number.isFinite(target)) return null;

  return {
    prefix,
    suffix,
    target,
    decimals: numeric.includes(".") ? numeric.split(".")[1].length : 0,
  };
}

/**
 * Counts a statistic up from zero when it first scrolls into view.
 *
 * Deliberately writes straight to the DOM node inside a rAF loop instead of
 * going through React state: a 1.2s count is ~70 frames, and re-rendering the
 * tree 70 times per tile is wasted work on a page that is mostly server
 * components. The visible <span> is `aria-hidden` and the real value is
 * exposed once through a visually-hidden twin, so a screen reader announces
 * "2.4B" rather than every intermediate number.
 */
export function CountUp({ value, delay = 0, className }: CountUpProps) {
  // Memoised so the effect below is not restarted by a fresh object on every
  // render; `value` is a literal in the data files, so this is effectively a
  // constant for the life of the tile.
  const parsed = useMemo(() => parseValue(value), [value]);
  const { ref, inView, ready } = useInView<HTMLSpanElement>({
    threshold: revealThreshold,
  });
  const reducedMotion = usePrefersReducedMotion();
  const textRef = useRef<HTMLSpanElement | null>(null);

  // One node, two owners: the observer needs it, so does the rAF loop.
  const attach = (node: HTMLSpanElement | null) => {
    ref.current = node;
    textRef.current = node;
  };

  /*
   * This deliberately writes to the DOM rather than to React state: a 1.2s
   * count is ~70 frames, and re-rendering the tree 70 times per tile is wasted
   * work on a page that is otherwise almost entirely server components.
   *
   * Gated on `ready` for the same reason as <Reveal>: the server-rendered text
   * is the final value, and nothing rewrites it until we actually know the
   * element is off-screen. That means a stat tile which is already visible on
   * load keeps its real number, and the count only starts once the tile
   * genuinely scrolls into view.
   */
  const shouldCount = ready && inView && !reducedMotion;

  useEffect(() => {
    const node = textRef.current;
    if (!node || !parsed) return;

    // Reduced motion, no number, or the element has not been measured yet:
    // leave the server-rendered text alone.
    if (reducedMotion || !inView) return;

    let frame = 0;
    const startAt = performance.now() + delay;

    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - startAt) / motion.countUpDuration));
      // Cubic ease-out: fast at first, decelerating to a stop.
      const eased = 1 - (1 - progress) ** 3;
      const current = parsed.target * eased;

      node.textContent =
        progress < 1
          ? `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`
          : value;

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [shouldCount, inView, reducedMotion, delay, value, parsed]);

  // Before the tile is revealed, park the visible number at zero so the count
  // visibly climbs from 0. This runs as a layout effect to avoid a paint of
  // the final value immediately followed by a drop to 0.
  useIsomorphicLayoutEffect(() => {
    const node = textRef.current;
    if (!node || !parsed || !shouldCount || reducedMotion) return;

    node.textContent = `${parsed.prefix}0${parsed.suffix}`;
  }, [shouldCount, reducedMotion, parsed]);

  return (
    <>
      {/* The visible, animating number. */}
      <span ref={attach} aria-hidden={parsed ? "true" : undefined} className={className}>
        {value}
      </span>

      {/* The real value, announced once. Present in the static HTML too, so it
          still works with JavaScript disabled. */}
      {parsed ? <span className="sr-only">{value}</span> : null}
    </>
  );
}

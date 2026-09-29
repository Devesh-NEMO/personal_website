"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { revealThreshold } from "@/lib/constants";

/* useLayoutEffect is what lets the initial viewport check run before paint. On
   the server it is a no-op, so alias it to useEffect to avoid the SSR warning. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type UseInViewOptions = {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
  /**
   * Grows or shrinks the root box before the intersection test. Useful for
   * firing slightly early or late relative to the real viewport edge.
   */
  rootMargin?: string;
};

type UseInViewResult<T extends Element> = {
  /** Attach to the element you want to observe. */
  ref: React.RefObject<T | null>;
  /**
   * Flips to `true` once, and stays `true` for the lifetime of the page.
   * Starts as `true` so nothing is ever hidden before the first real check.
   */
  inView: boolean;
  /**
   * `true` once the component has mounted and run its first synchronous
   * measurement. Consumers that hide content use this to stay visible for the
   * very first paint — the server and the hydration render both report
   * `ready: false`, so they can never disagree and flash.
   */
  ready: boolean;
};

/**
 * One-shot "has this scrolled into view" flag, built on IntersectionObserver.
 *
 * Three deliberate properties:
 *
 *   - **It fires once.** After the first intersection the observer
 *     disconnects, so scrolling back up never re-hides an element.
 *   - **It fails open.** Without IntersectionObserver support the flag is
 *     always `true`, so content is never stranded hidden.
 *   - **It checks the viewport synchronously on mount.** A purely
 *     observer-driven flag starts out `false` and only becomes `true` a frame
 *     or two later. Combined with the reduced-motion re-render that happens at
 *     hydration, that gap is enough for above-the-fold content to render as
 *     "hidden" and fade out before fading back in. Measuring the element's
 *     rect in a layout effect — before the browser paints — means an element
 *     that is already on screen is reported as in-view on the first commit and
 *     simply never animates.
 */
export function useInView<T extends Element = HTMLElement>({
  threshold = revealThreshold,
  rootMargin = "0px",
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T | null>(null);

  // Fails open (and matches the server render) when IntersectionObserver is
  // unavailable: nothing to wait for, so treat everything as already in view.
  const [state, setState] = useState({ inView: true, ready: false });

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setState({ inView: true, ready: true });
      return;
    }

    // Synchronous "is it already on screen" check, so first paint is correct.
    const rect = node.getBoundingClientRect();
    const viewportH =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      0;

    const visibleHeight =
      Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
    const fraction =
      rect.height > 0 ? Math.max(0, visibleHeight) / rect.height : 0;

    if (fraction >= threshold) {
      // On screen at load — mark it in-view and never observe it, so it does
      // not animate (there is nothing to reveal).
      setState({ inView: true, ready: true });
      return;
    }

    // Below the fold at load. Only now do we need the observer, and only now
    // may the consumer hide it.
    setState({ inView: false, ready: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setState((prev) => (prev.inView ? prev : { inView: true, ready: true }));
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, ...state };
}

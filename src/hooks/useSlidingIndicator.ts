"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * =============================================================================
 * THE SLIDING HIGHLIGHT
 * =============================================================================
 * One accent pill that sits behind the nav links and moves between them, so the
 * active section is a single travelling object rather than four links each
 * styling themselves.
 *
 * The position is measured from the DOM and written as inline styles, which
 * sounds like the slow way to do it. The alternatives cannot express "move to
 * wherever this link happens to be after the font loaded and the viewport
 * changed", which is the only version of this that stays correct.
 *
 * Four things it has to get right, all of them invisible until they are wrong:
 *
 *  1. **No slide on first paint.** The pill is positioned by a layout effect
 *     *before* the transition is enabled, and enabling it is a separate state
 *     update. Without the split, the pill visibly flies in from the capsule's
 *     left edge on every page load.
 *  2. **The resting link is a fallback, not a state.** `restingId` is passed in
 *     and only consulted when the reader is not hovering anything, so the pill
 *     follows the active section without `restingId` ever being copied into
 *     state. Copying it would mean the pill could disagree with `active` for a
 *     frame after every hover released.
 *  3. **Re-measure, do not just re-listen.** `resize` events are not enough:
 *     `next/font` swaps the typeface after hydration, which changes every link's
 *     width without resizing the window at all. A `ResizeObserver` on the capsule
 *     and on each link catches both causes in one observer.
 *  4. **Write `transform` and one size, nothing else.** Both are cheap to
 *     animate; `left` and `top` would force a layout on every frame of the slide.
 */
export function useSlidingIndicator({
  axis = "horizontal",
  restingId = null,
}: {
  /** Which way the pill travels. Vertical in the mobile panel. */
  axis?: "horizontal" | "vertical";
  /** Where the pill goes when nothing is hovered or focused — the active section. */
  restingId?: string | null;
} = {}) {
  /** The capsule. Measured, and observed for size changes. */
  const containerRef = useRef<HTMLDivElement>(null);
  /** The pill itself. The only element whose style this hook writes. */
  const pillRef = useRef<HTMLSpanElement>(null);

  /** Which link the reader is pointing at or tabbed to, if any. */
  const [overrideId, setOverrideId] = useState<string | null>(null);
  /**
   * Whether the pill may animate yet. False through the first layout effect, so
   * the initial placement is instant.
   */
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const pill = pillRef.current;
    const container = containerRef.current;
    if (!pill || !container) return;

    const id = overrideId ?? restingId;
    const link = id
      ? container.querySelector<HTMLElement>(`[data-nav-link="${cssEscape(id)}"]`)
      : null;

    const vertical = axis === "vertical";

    if (!link) {
      /*
       * Nothing to rest on: above the first section, or between two of them.
       * Collapse to zero rather than leaving the pill parked on the last link,
       * which would claim a section the reader is not actually in.
       */
      pill.style[vertical ? "height" : "width"] = "0px";
      pill.style.transform = vertical ? "translateY(0)" : "translateX(0)";
      return;
    }

    /*
     * The capsule is `position: relative`, so a link's offset is measured from
     * the pill's own origin already — the capsule's 4px padding included — and
     * no subtraction is needed.
     */
    pill.style[vertical ? "height" : "width"] = `${link[vertical ? "offsetHeight" : "offsetWidth"]}px`;
    pill.style.transform = vertical
      ? `translateY(${link.offsetTop}px)`
      : `translateX(${link.offsetLeft}px)`;
  }, [overrideId, restingId, axis]);

  /*
   * Reposition before paint whenever anything that decides the position changes.
   *
   * `useLayoutEffect` rather than `useEffect` because the pill's resting position
   * has to be right in the very first painted frame. After the first run this is
   * also the effect that makes the pill *slide*: the transition is already on, so
   * writing a new transform animates.
   */
  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /*
     * Forced reflow between the placement above and the switch below. Without it
     * the browser coalesces both into one style recalculation, sees no change
     * between them, and correctly declines to animate — the pill would jump on
     * every page load.
     */
    measure();
    void pillRef.current?.offsetWidth;
    setReady(true);

    const observer = new ResizeObserver(measure);

    // The capsule catches viewport changes; the links catch the webfont swap,
    // which changes their widths without changing the capsule's own.
    observer.observe(container);
    for (const link of container.querySelectorAll("[data-nav-link]")) {
      observer.observe(link);
    }

    /*
     * `document.fonts.ready` resolves after next/font has swapped both faces in.
     * The observers catch that too, but only on the next frame; this closes the
     * gap, so the pill is never briefly measured against the fallback face.
     */
    const fonts = document.fonts as FontFaceSet & { ready?: Promise<unknown> };
    void fonts.ready?.then(measure);

    return () => observer.disconnect();
  }, [measure]);

  return {
    containerRef,
    pillRef,
    /** Attach to the capsule: flips the pill's transition on once it is placed. */
    ready,
    /** Move the pill to this link, or pass null to send it back to `restingId`. */
    setOverrideId,
    overrideId,
  };
}

/**
 * `CSS.escape` where it exists, with a fallback.
 *
 * Ids come from data, so in practice they are plain words — but an id containing
 * a quote or a bracket produces a selector that throws rather than one that
 * misses, and a navbar that throws on load is a much worse failure than one that
 * quietly does not match.
 */
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}

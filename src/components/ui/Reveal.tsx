"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { revealThreshold } from "@/lib/constants";

/** Extra attributes forwarded verbatim to the wrapper element. */
type RevealExtras = {
  /**
   * Opt-in hook for one-off CSS animations. The hero sets `data-hero-pop` to
   * arm the "talk." overshoot in globals.css.
   */
  "data-hero-pop"?: boolean;
  /** Overrides `--reveal-delay` and any other custom property. */
  style?: CSSProperties & Record<`--${string}`, string | number>;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
};

/**
 * The entrance direction, and the transform the element starts from. Defined
 * as CSS in globals.css (see section 8) so the browser can transition the
 * value rather than us writing it to the DOM every frame.
 */
export type RevealDirection =
  /** Slides up into place. The default. */
  | "up"
  /** Slides down into place (for elements below a heading). */
  | "down"
  /**
   * Slides in from the left, with a slight counter-tilt that settles flat.
   * The rotation is part of the "left" direction on purpose — it is what gives
   * the avatar its deliberate, askew arrival.
   */
  | "left"
  /** Mirror of `left`, arriving from the right. */
  | "right"
  /** Fades while growing from 95% to 100%. */
  | "scale"
  /**
   * Grows horizontally from 0, anchored to the left edge. Used by the accent
   * rule under section headings, where a 56px element must not change size.
   */
  | "scaleX"
  /** Pure opacity fade, no movement. */
  | "none";

type RevealProps = {
  children?: ReactNode;
  /**
   * Extra milliseconds to wait after the element scrolls into view. Pass
   * `index * motion.stagger` to stagger a list.
   */
  delay?: number;
  direction?: RevealDirection;
  /** Rendered as the animated wrapper. Defaults to a `div`. */
  as?: ElementType;
  className?: string;
} & RevealExtras;

/**
 * Fades and slides its children into view once, on first scroll.
 *
 * Progressive enhancement, not a gate on the content:
 *
 *   - The server renders **no** hidden state at all, so the HTML that arrives
 *     before hydration — or with JavaScript disabled entirely — is complete and
 *     visible. Nothing flashes, and nothing is ever unreachable.
 *   - `usePrefersReducedMotion` reports `true` during SSR *and* on the
 *     hydration render, so the first painted frame is always the visible one.
 *     React then re-renders synchronously if motion is allowed, which is what
 *     puts the hidden state in place before anything animates.
 *   - The observer disconnects after firing, so scrolling back up never
 *     re-hides anything.
 *
 * Only `transform` and `opacity` are ever animated, so an entrance can never
 * trigger layout and cannot cause CLS.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  as: Tag = "div",
  className,
  style,
  ...extras
}: RevealProps) {
  const { ref, inView, ready } = useInView<HTMLElement>({
    threshold: revealThreshold,
  });
  const reducedMotion = usePrefersReducedMotion();

  const Wrapper = Tag as ElementType;

  /*
   * `pending` requires all three of: mounted and measured (`ready`), the
   * element not yet in view, and the visitor not asking for reduced motion.
   *
   * Gating on `ready` is what guarantees the no-flash contract. Until the
   * layout effect has run, this renders "in" — identical to the server HTML —
   * so the first painted frame is never a hidden section. If the element turns
   * out to be below the fold, the *next* commit sets "pending" and the entrance
   * plays; if it was already on screen it is reported in-view immediately and
   * never animates at all.
   */
  const pending = ready && !inView && !reducedMotion;

  return (
    <Wrapper
      ref={ref}
      data-reveal={pending ? "pending" : "in"}
      data-reveal-from={direction}
      // Read by the `[data-reveal]` transition in globals.css, so per-element
      // stagger delays stay declarative instead of being written inline.
      style={{ "--reveal-delay": `${delay}ms`, ...style }}
      className={cn(className)}
      {...extras}
    >
      {children}
    </Wrapper>
  );
}

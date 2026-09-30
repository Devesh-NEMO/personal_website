"use client";

import Link from "next/link";
import { useCallback } from "react";

import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/types";

/**
 * =============================================================================
 * THE LINK CAPSULE
 * =============================================================================
 * The section links inside one bordered pill, with a single accent capsule that
 * slides between them. Used twice: horizontally in the navbar, and as stacked
 * rows in the mobile panel, so the highlight behaves the same in both.
 *
 * Two states are tracked, and keeping them apart is the point:
 *
 *  - `active` is the section the reader is actually looking at, from
 *    `useActiveSection`. It is the pill's resting place, and it is what
 *    `aria-current` reports.
 *  - The hover/focus override is temporary: while the pointer is on a link the
 *    pill moves there to acknowledge it, and on the way out it returns to
 *    `active`. It never touches `aria-current`, because pointing at a link is not
 *    being in that section.
 *
 * The pill is `aria-hidden` and sits *behind* the links, so nothing about it
 * reaches assistive tech. The only thing that marks the current link is
 * `aria-current="location"`, and the only thing that recolours a link is
 * `data-lit` — which is set from the same `litId` that positions the pill, in the
 * same render. The colour therefore cannot disagree with where the pill is.
 */
export function NavLinks({
  links,
  active,
  orientation = "horizontal",
  className,
  label = "Primary",
}: {
  links: NavLink[];
  /** Currently visible section id, or null. */
  active: string | null;
  /**
   * Which way the pill travels. Horizontal in the navbar; vertical in the mobile
   * panel, where the same component is reused as stacked rows.
   */
  orientation?: "horizontal" | "vertical";
  className?: string;
  /**
   * Accessible name for the `nav` landmark this renders.
   *
   * Both copies carry the same name on purpose. They are never both exposed: the
   * desktop one is `display: none` below `md` and the panel is `inert` while
   * closed, so a screen reader only ever meets one "Primary" navigation.
   */
  label?: string;
}) {
  const { containerRef, pillRef, ready, overrideId, setOverrideId } =
    useSlidingIndicator({
      axis: orientation,
      restingId: active,
    });

  /*
   * Hover and keyboard focus both pull the pill off the active link, and both
   * hand it back on the way out. Storing the id rather than a boolean is what
   * lets the pill sit on a link that is not the active one and still know where
   * to return to.
   */
  const takeOver = useCallback(
    (id: string) => () => setOverrideId(id),
    [setOverrideId],
  );

  const release = useCallback(
    () => setOverrideId(null),
    [setOverrideId],
  );

  const litId = overrideId ?? active;

  return (
    <nav
      ref={containerRef}
      aria-label={label}
      data-ready={ready}
      data-orientation={orientation}
      onPointerLeave={release}
      onBlur={(event) => {
        /*
         * `onBlur` here is React's focusout, which does bubble, so it fires for
         * every link. `relatedTarget` is where focus went: null when it left the
         * document entirely, the next node when it stayed inside. Either way,
         * only hand the pill back once focus has genuinely left.
         */
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          release();
        }
      }}
      className={cn(
        "nav-capsule",
        orientation === "vertical" && "nav-capsule--vertical",
        className,
      )}
    >
      {/*
        The pill. `data-ready` on the capsule is the switch between "placed, do
        not animate" and "animate from here on" — see useSlidingIndicator.
      */}
      <span ref={pillRef} aria-hidden="true" className="nav-pill" />

      <ul className="nav-capsule-list">
        {links.map((link) => {
          const id = link.href.slice(1);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                data-nav-link={id}
                /* "location", not "page": these are anchors within one document,
                   and "page" would tell assistive tech a navigation happened
                   that did not. */
                aria-current={active === id ? "location" : undefined}
                /*
                 * Only a real pointing device gets the hover takeover. On touch,
                 * `pointerenter` fires on tap and nothing ever fires
                 * `pointerleave`, so the pill would stay parked on the tapped
                 * link and ignore the active section for the rest of the visit.
                 */
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse" || event.pointerType === "pen") {
                    takeOver(id)();
                  }
                }}
                /* Focus always wins — a keyboard user tabbing along the capsule
                   should see the pill follow them, and there is no "hover" to
                   worry about on those devices. */
                onFocus={takeOver(id)}
                data-lit={litId === id ? "" : undefined}
                className="nav-pill-link"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

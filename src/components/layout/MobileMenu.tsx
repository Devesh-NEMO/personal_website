"use client";

import { useEffect, useRef } from "react";

import { NavLinks } from "@/components/layout/NavLinks";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import type { NavLink } from "@/types";

/**
 * =============================================================================
 * THE MOBILE PANEL
 * =============================================================================
 * Below `md` the link capsule is replaced by a Menu button, and this panel opens
 * under the bar as a full-width list of stacked rows.
 *
 * It reuses `NavLinks` with `orientation="vertical"` rather than rendering a
 * second list, so the sliding highlight, the hover behaviour and the "text turns
 * white where the pill is" rule are one implementation, not two that can drift.
 *
 * The links are always in the DOM rather than mounted on open, because a panel
 * that appears from nothing has nothing to animate out of. What keeps them
 * unreachable while closed is `inert`, which removes the panel from the tab order
 * and the accessibility tree without touching a single visual property — so the
 * height and opacity transitions still play, in and out.
 *
 * Dismissal is the parent's job (the outside tap and Escape both live in
 * `Navbar.tsx`, where the button that has to regain focus also lives). This
 * component owns the two things that are genuinely local: moving focus in when
 * the panel opens, and keeping it in while it is open.
 */
export function MobileMenu({
  id,
  open,
  links,
  active,
  onNavigate,
}: {
  id: string;
  open: boolean;
  links: NavLink[];
  /** Currently visible section id, for the highlight's resting state. */
  active: string | null;
  /** Called after a link is followed. */
  onNavigate: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(open);

  /*
   * Opening moves focus to the first link, so the next Tab walks the panel rather
   * than jumping out to the footer. `preventScroll` because the panel is inside
   * the sticky header — scrolling to it would move the page for no reason.
   *
   * Closing deliberately does not move focus: the parent decides, and the two
   * dismissals want opposite answers (Escape hands focus back to the button, a
   * link tap leaves it with the section the browser just jumped to).
   */
  useEffect(() => {
    if (!open) return;

    panelRef.current
      ?.querySelector<HTMLElement>("a[href]")
      ?.focus({ preventScroll: true });
  }, [open]);

  /*
   * The trap: Tab off the last link wraps to the first, Shift+Tab off the first
   * wraps to the last.
   *
   * Bound to the panel rather than to `document`, which is what makes this a trap
   * and not merely a wrap-around — the handler only runs for keys pressed inside
   * the menu, and the links are the only focusable things in there.
   */
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = panel.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      id={id}
      ref={panelRef}
      className="nav-panel md:hidden"
      data-open={open}
      inert={!open}
    >
      <div className="nav-panel-inner" onClick={onNavigate}>
        <NavLinks
          links={links}
          active={active}
          orientation="vertical"
          className="nav-capsule--panel"
        />
      </div>
    </div>
  );
}

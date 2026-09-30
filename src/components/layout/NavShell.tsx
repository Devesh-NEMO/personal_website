"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks } from "@/components/layout/NavLinks";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrolled } from "@/hooks/useScrolled";
import type { ProfileNav } from "@/types";

/**
 * =============================================================================
 * THE NAVBAR — behaviour
 * =============================================================================
 * The bar itself: logo, link capsule, theme toggle, and below `md` a Menu button
 * and the panel it opens.
 *
 * Client because all three of its behaviours need state — the active section, the
 * shrink on scroll, and the open/closed panel. Everything it renders is
 * server-rendered anyway; the only cost of the boundary is the bundle, and the
 * logo and the toggle are handed in as finished nodes from `Navbar.tsx` (the
 * server component) so their markup is authored on the server.
 *
 * The only visual values that change here are the capsule's position and the
 * panel's height. Both are CSS transitions driven by the `data-*` attributes set
 * below — nothing in this file writes a style, so a scroll tick costs one React
 * render and zero layout work beyond the attribute change.
 */
export function NavShell({
  profile,
  leading,
  trailing,
}: {
  profile: ProfileNav;
  /** Server-rendered logo link. */
  leading: ReactNode;
  /** Server-rendered theme toggle. */
  trailing: ReactNode;
}) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  const sectionIds = profile.links.map((link) => link.href.slice(1));
  const active = useActiveSection(sectionIds);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = "nav-mobile-menu";

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    /*
     * Handing focus back is only right for the dismissals the reader made
     * deliberately (Escape, the Menu button). On a link tap the browser has
     * already moved the sequential-focus starting point to the section it jumped
     * to, and taking focus back would undo that — the next Tab would jump from
     * the navbar to the top of the page.
     */
    if (returnFocus) menuButtonRef.current?.focus();
  }, []);

  /*
   * Tapping outside closes the panel.
   *
   * `pointerdown` rather than `click`, so a tap that lands outside dismisses the
   * panel without the browser first moving focus to whatever was underneath it.
   * Capture phase, so a tap on the Menu button reaches its own click handler
   * before this one decides the tap was "outside".
   */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  /* Escape closes the panel and returns focus to the button. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close(true);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  /*
   * Widening past `md` reveals the full capsule, which leaves the Menu button and
   * the panel with nothing to do. Closing here rather than merely hiding them is
   * what stops a keyboard user being stranded in a panel they can no longer see.
   */
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) close(false);
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [close]);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      className="nav-bar"
    >
      {/*
        A grid rather than a flex row with `space-between`: the three columns are
        1fr / auto / 1fr, so the capsule is centred on the page whatever the logo
        and the toggle weigh. `space-between` would centre it in the *gap*, which
        shifts sideways the moment the logo and the toggle are different widths.
      */}
      <div className="nav-inner">
        <div className="nav-lead">{leading}</div>

        <NavLinks
          links={profile.links}
          active={active}
          className="hidden md:flex"
        />

        <div className="nav-actions">
          {trailing}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={menuId}
            className="nav-menu-button brutal-border brutal-pill md:hidden"
          >
            {open ? profile.menuCloseLabel : profile.menuLabel}
          </button>
        </div>
      </div>

      <MobileMenu
        id={menuId}
        open={open}
        links={profile.links}
        active={active}
        onNavigate={() => close(false)}
      />

      {/*
        Inside the bar, so it reads as part of its bottom edge and can never
        overlap the content scrolling beneath.
      */}
      <ScrollProgress />
    </header>
  );
}

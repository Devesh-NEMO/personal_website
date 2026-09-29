"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";
import { motion } from "@/lib/constants";
import type { NavLink } from "@/types";

type NavShellProps = {
  /** Plain data, so the section list can be handed to the observer. */
  navLinks: NavLink[];
  /** Server-rendered logo link, passed in so it stays out of the bundle. */
  logo: ReactNode;
  /** Server-rendered theme toggle. */
  trailing: ReactNode;
};

/**
 * The scroll-aware half of the navbar: condenses after 20px of scroll, hosts
 * the progress bar, and underlines the link for the section currently in view.
 *
 * Split out from Navbar so the logo, theme toggle and the link list itself
 * stay server components. This file only owns the behaviour, and the only
 * things crossing the boundary are two already-serialised React nodes and the
 * nav link array.
 */
export function NavShell({ navLinks, logo, trailing }: NavShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(navLinks.map((link) => link.href.slice(1)));

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > motion.navThreshold);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b-[3px] border-fg bg-bg/95 backdrop-blur-sm",
        /* The hard offset shadow only appears once the page is scrolled, so
           the navbar at rest keeps the flat, un-shadowed look it started with. */
        scrolled && "shadow-[0_6px_0_0_var(--shadow-color)]",
      )}
    >
      {/* Top padding absorbs the notch on notched phones; the scrolled state
          tightens both paddings so the bar gets shorter as it condenses. */}
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5",
          "transition-[padding] sm:px-8",
          scrolled
            ? "pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2.5"
            : "pt-[calc(1rem+env(safe-area-inset-top))] pb-4",
        )}
        style={{ transitionDuration: `${motion.navDuration}ms` }}
      >
        {logo}

        {/* Wraps onto a second row on small screens rather than hiding behind a
            hamburger, so every link stays reachable without a disclosure. */}
        <div className="order-3 -mx-1 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
          {navLinks.map((link) => {
            const isActive = active === link.href.slice(1);

            return (
              <Link
                key={link.href}
                href={link.href}
                /* Exposes "you are here" to assistive tech; the underline
                   below is decorative and hidden from it. */
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "brutal-pill relative px-3 py-1.5 text-sm font-bold tracking-tight",
                  "whitespace-nowrap transition-colors hover:bg-accent",
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-0.5 h-[3px] origin-left rounded-full bg-accent",
                    "transition-transform",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ transitionDuration: `${motion.navLinkDuration}ms` }}
                />
              </Link>
            );
          })}
        </div>

        {trailing}
      </nav>

      {/* Sits just above the 3px bottom border, so it reads as part of the
          navbar's edge and can never overlap the content scrolling beneath. */}
      <ScrollProgress />
    </header>
  );
}

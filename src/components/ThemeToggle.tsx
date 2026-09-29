"use client";

import { useEffect } from "react";

/** Mirrors the storage key used by the pre-paint script in layout.tsx. */
const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Dark mode toggle.
 *
 * Deliberately holds no React state. The `dark` class on <html> is the single
 * source of truth: it is set before first paint by the inline script in
 * layout.tsx, and the sun/moon icons swap through the `dark:` variant rather
 * than through a render. That means no useState, no effect-driven setState, no
 * hydration mismatch and no icon flash on load.
 *
 * Precedence, highest first:
 *   1. An explicit choice saved in localStorage
 *   2. The OS `prefers-color-scheme` setting
 */
export function ThemeToggle() {
  // While no explicit choice exists, keep following a live OS theme change.
  // This effect only touches the DOM, so it never triggers a re-render.
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", event.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");

    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Private browsing with storage disabled: the toggle still works for
      // this page view, it just will not be remembered.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="brutal-pill brutal-border grid size-11 shrink-0 place-items-center bg-surface shadow-brutal transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
    >
      {/*
        Both icons and both labels live in the DOM; CSS shows the one that
        matches the active theme. `display:none` content is dropped from the
        accessibility tree, so the button exposes exactly one accessible name.

        Inline SVGs rather than an icon library: two icons do not justify the
        bundle cost, and it keeps the client chunk tiny.
      */}
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>

      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="hidden dark:block"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>

      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="block dark:hidden"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

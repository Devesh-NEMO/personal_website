import Link from "next/link";

import { NavShell } from "@/components/layout/NavShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/data/site";

/**
 * Sticky top navigation.
 *
 * Deliberately zero-JavaScript in its *content*: the links wrap onto a second
 * row on small screens instead of hiding behind a hamburger menu, which keeps
 * them reachable without a disclosure widget.
 *
 * The scroll behaviour (condense, progress bar, active link) lives in
 * NavShell. This file stays a server component and hands it the two nodes
 * that make up the non-interactive furniture.
 */
export function Navbar() {
  return (
    <NavShell
      navLinks={site.navLinks}
      logo={
        <Link
          href="#top"
          className="text-2xl font-black tracking-tighter transition-opacity hover:opacity-70"
        >
          {site.logoText}
        </Link>
      }
      trailing={<ThemeToggle />}
    />
  );
}

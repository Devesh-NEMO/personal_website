import Link from "next/link";

import { NavShell } from "@/components/layout/NavShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { nav } from "@/data/profile";

/**
 * The navbar.
 *
 * A server component that does one job: gather what the navbar shows from
 * `data/profile.ts` and hand it to the client shell. The logo and the theme
 * toggle are plain markup, so they are built here — the toggle is already a
 * client component on its own, and the logo is static either way.
 *
 * See the "Navbar" section of the README to change the links, the logo or the
 * menu button's label.
 */
export function Navbar() {
  return (
    <NavShell
      profile={nav}
      leading={
        <Link href="#top" className="nav-logo">
          {nav.logo}
        </Link>
      }
      trailing={<ThemeToggle />}
    />
  );
}

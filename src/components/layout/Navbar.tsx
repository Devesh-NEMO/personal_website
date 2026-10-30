import Link from "next/link";

import { NavShell } from "@/components/layout/NavShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ProfileNav } from "@/types";

/**
 * The navbar.
 *
 * A server component that does one job: gather what the navbar shows from the
 * content layer (passed in as `profile`) and hand it to the client shell. The
 * logo and the theme toggle are plain markup, so they are built here — the
 * toggle is already a client component on its own, and the logo is static
 * either way.
 *
 * See the "Navbar" section of the README to change the links, the logo or the
 * menu button's label.
 */
export function Navbar({
  profile,
  basePath,
}: {
  profile: ProfileNav;
  /**
   * Prefix for the section links, used on pages that are not the one-pager.
   * Without it, "#about" on /work would look for a section that is not on that
   * document; with it, the same link becomes "/#about" and lands on the home
   * page first.
   */
  basePath?: string;
}) {
  const links = basePath
    ? profile.links.map((link) => ({ ...link, href: `${basePath}${link.href}` }))
    : profile.links;

  return (
    <NavShell
      profile={{ ...profile, links }}
      leading={
        <Link href={basePath ?? "#top"} className="nav-logo">
          {profile.logo}
        </Link>
      }
      trailing={<ThemeToggle />}
    />
  );
}

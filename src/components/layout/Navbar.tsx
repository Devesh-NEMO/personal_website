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
export function Navbar({ profile }: { profile: ProfileNav }) {
  return (
    <NavShell
      profile={profile}
      leading={
        <Link href="#top" className="nav-logo">
          {profile.logo}
        </Link>
      }
      trailing={<ThemeToggle />}
    />
  );
}

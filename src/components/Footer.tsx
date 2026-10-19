import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";
import { trackAttrs } from "@/lib/analytics";
import { motion } from "@/lib/constants";
import type { ActionLink, ProfileNav, SiteLinks } from "@/types";

/**
 * Site footer.
 *
 * Three columns: the brand mark with a one-line description and the
 * back-to-top control, then the in-page sections, then the outbound addresses.
 * A bottom bar carries the copyright and the role.
 *
 * The sections and the addresses are the same data the navbar and the contact
 * section read (passed in from `getSiteContent`), so editing a link in the
 * admin updates all three at once.
 */
export function Footer({ nav, links }: { nav: ProfileNav; links: SiteLinks }) {
  const elsewhere: ActionLink[] = [
    {
      label: "Email",
      href: `mailto:${links.email}`,
      ariaLabel: `Email me at ${links.email}`,
    },
    {
      label: "LinkedIn",
      href: links.linkedin,
      external: true,
      ariaLabel: "LinkedIn profile, opens in a new tab",
    },
    {
      label: "GitHub",
      href: links.github,
      external: true,
      ariaLabel: "GitHub profile, opens in a new tab",
    },
  ];

  // Only offered once a CV has actually been published (see SiteLinks.cv).
  if (links.cv) {
    elsewhere.push({
      label: "CV",
      href: links.cv,
      external: true,
      ariaLabel: "Download CV, opens in a new tab",
    });
  }

  return (
    <footer className="border-t-[3px] border-fg px-5 py-14 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          {/* Brand: the mark, a one-line pitch, and the way back to the top. */}
          <Reveal direction="up" className="flex flex-col items-start gap-4">
            <p className="text-3xl font-black tracking-tight">{nav.logo}</p>

            <p className="max-w-xs text-sm leading-relaxed font-medium tracking-tight opacity-80">
              {site.description}
            </p>

            <a
              href="#top"
              className="brutal-pill brutal-border bg-surface px-4 py-2 text-sm font-extrabold tracking-tight shadow-brutal transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-mint"
            >
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </Reveal>

          {/* The in-page sections, mirrored from the navbar. */}
          <Reveal direction="up" delay={motion.stagger}>
            <nav aria-label="Footer sections">
              <FooterColumnTitle>Explore</FooterColumnTitle>

              <ul className="flex flex-col gap-2.5">
                {nav.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm font-bold tracking-tight transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Where else to find me. */}
          <Reveal direction="up" delay={motion.stagger * 2}>
            <FooterColumnTitle>Elsewhere</FooterColumnTitle>

            <ul className="flex flex-col gap-2.5">
              {elsewhere.map((action) => {
                const method = action.label.toLowerCase();
                return (
                  <li key={action.label}>
                    <a
                      href={action.href}
                      aria-label={action.ariaLabel}
                      {...(action.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      {...trackAttrs("contact_click", { method })}
                      className="group inline-flex items-center gap-1.5 text-sm font-bold tracking-tight transition-colors hover:text-accent"
                    >
                      {action.label}
                      {action.external ? (
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        >
                          ↗
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t-[3px] border-fg pt-6 sm:flex-row sm:items-center">
          <p className="text-sm font-bold tracking-tight">{site.copyright}</p>
          <p className="text-sm font-medium tracking-tight opacity-70">{site.role}</p>
        </div>
      </div>
    </footer>
  );
}

/** The small uppercase heading above each footer list. */
function FooterColumnTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-xs font-extrabold tracking-[0.18em] uppercase opacity-70">
      {children}
    </p>
  );
}

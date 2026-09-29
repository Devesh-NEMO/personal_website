"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids is currently the one the reader is
 * looking at, for the navbar's active-link underline.
 *
 * How it works: a thin horizontal band is carved out of the middle of the
 * viewport (via `rootMargin`) and a section is considered active while it
 * crosses that band. A band rather than "any part visible" is deliberate — if
 * every partially-visible section counted, two links would light up at once
 * during the long Work section.
 *
 * When nothing crosses the band (for example while the reader is in the
 * footer, below the last section) the previous answer is kept, so the last
 * link does not blink off at the bottom of the page.
 */
export function useActiveSection(ids: string[]): string | null {
  // Joined into a string so a fresh array literal on every render does not
  // restart the observer.
  const key = ids.join("|");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = key.split("|").filter(Boolean);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        // Earliest in document order wins when two sections overlap the band.
        const next = sectionIds.find((id) => visible.has(id));
        if (next) setActive(next);
      },
      // The band sits between 45% and 55% of the viewport height.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, [key]);

  return active;
}

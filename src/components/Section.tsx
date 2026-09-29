import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

/**
 * Consistent vertical rhythm and horizontal gutter for every section.
 * `scroll-mt` offsets anchor jumps so the sticky navbar never covers a heading.
 */
export function Section({ id, children, className }: SectionProps) {
  return (
    <section
      id={id}
      /*
       * Vertical padding is deliberately modest. Because every section carries
       * its own top *and* bottom padding, the two compound: at py-28 the gap
       * between two sections was 224px, which read as a hole in the page
       * rather than a break. py-12/16 lands that at ~96/128px, which still
       * separates the sections without leaving the middle of the screen empty.
       */
      className={cn("scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16", className)}
    >
      {/* Max width keeps line length readable on very large displays. */}
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { motion } from "@/lib/constants";

type SectionHeadingProps = {
  children: ReactNode;
  /** Small uppercase kicker above the heading. */
  eyebrow?: string;
  /** Rendered flush right on wide screens. */
  align?: "left" | "center";
  className?: string;
};

/**
 * A section title with the short 56x6px accent underline beneath it.
 * Renders an <h2> so each section keeps a correct heading hierarchy.
 *
 * Two reveals, sequenced: the eyebrow and title rise and fade first, then the
 * accent rule grows from zero width `motion.underlineDelay` later. Growing the
 * rule with `scaleX` rather than animating `width` means the underline never
 * reflows its siblings, so the entrance cannot cause CLS.
 */
export function SectionHeading({
  children,
  eyebrow,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3 sm:mb-12",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Reveal
        as="div"
        className={cn(
          "flex flex-col gap-3",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow ? (
          // Ink rather than accent: orange text on the pastel cards tops out at
          // ~3.2:1 no matter how far it is darkened, so it can never reach the
          // 4.5:1 needed at 14px. The accent still appears in the underline below.
          <p className="text-sm font-extrabold uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          {children}
        </h2>
      </Reveal>

      {/* 56x6px accent rule, defined once in globals.css. */}
      <Reveal
        as="span"
        aria-hidden="true"
        direction="scaleX"
        delay={motion.underlineDelay}
        className={cn("heading-underline", align === "center" && "self-center")}
      />
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { cardSurface } from "@/lib/tone";
import type { CardTone } from "@/types";

type CardProps = {
  children: ReactNode;
  /** Background colour from the palette. */
  tone?: CardTone;
  /** Lifts the card 2px on hover and grows the shadow to match. */
  interactive?: boolean;
  className?: string;
};

/**
 * The core surface primitive: 16px radius, 3px border in the current text
 * colour, and a 6px hard offset shadow with no blur.
 */
export function Card({
  children,
  tone = "mint",
  interactive = false,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        cardSurface(tone),
        interactive &&
          "transition-[transform,box-shadow] duration-150 " +
            "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

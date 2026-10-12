import type { ComponentProps } from "react";

import { controlClasses } from "@/components/admin/Field";
import { cn } from "@/lib/cn";

/**
 * A native select restyled to match Input, with the platform arrow replaced by
 * the same hard-edged chevron used elsewhere on the site.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        className={cn(controlClasses, "cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
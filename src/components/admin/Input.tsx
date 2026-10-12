import type { ComponentProps } from "react";

import { controlClasses } from "@/components/admin/Field";
import { cn } from "@/lib/cn";

/** A single-line text control styled to match the site's brutalist surfaces. */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...props} />;
}
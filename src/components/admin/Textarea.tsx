import type { ComponentProps } from "react";

import { controlClasses } from "@/components/admin/Field";
import { cn } from "@/lib/cn";

/** A multi-line control styled to match Input. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClasses, "min-h-24 resize-y leading-relaxed", className)}
      {...props}
    />
  );
}
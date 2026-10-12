import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Shared styling for every text-like control, so Input, Textarea and Select are
 * pixel-identical: 3px brutal border, a 12px radius, the surface colour, a
 * small hard shadow, and the site-wide focus ring (from globals.css).
 */
export const controlClasses =
  "w-full brutal-border rounded-[12px] bg-surface px-3.5 py-2.5 text-sm font-semibold " +
  "tracking-tight text-fg shadow-[3px_3px_0_var(--shadow-color)] " +
  "placeholder:text-fg/45 disabled:cursor-not-allowed disabled:opacity-60";

type FieldProps = {
  label: string;
  /** Matches the control's `id` so clicking the label focuses it. */
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * A labelled form row: label, optional hint, the control itself, and an error
 * chip. Keeps the label/error markup in one place instead of repeating it in
 * every admin form.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-extrabold tracking-tight"
      >
        {label}
        {required ? (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p className="text-xs leading-relaxed font-medium tracking-tight text-fg/70">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          role="alert"
          className="brutal-pill w-fit bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
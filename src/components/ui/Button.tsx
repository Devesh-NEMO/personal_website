import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { ActionLink } from "@/types";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  /** Native type when this renders as a <button> (e.g. "submit" in a form). */
  type?: "button" | "submit" | "reset";
  /** Disables the button, for form submits that are in flight. */
  disabled?: boolean;
  /** Focuses the button on mount (e.g. a dialog's default action). */
  autoFocus?: boolean;
};

/** Visual styling for a single button variant. */
const variants = {
  // Ink on orange-red: 5.61:1 in both modes, clears WCAG AA at normal size.
  // (Cream on the accent only reached 2.78:1 in dark mode.)
  primary: "bg-accent text-accent-ink hover:bg-mint hover:text-fg",
  secondary: "bg-surface text-fg hover:bg-peach",
} as const;

const base =
  "brutal-pill brutal-border inline-flex items-center justify-center gap-2 " +
  "px-6 py-3 text-base font-extrabold tracking-tight " +
  "shadow-brutal transition-[transform,box-shadow,background-color] duration-150 " +
  "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg " +
  "active:translate-x-0 active:translate-y-0 active:shadow-none";

/**
 * A pill button with a 3px border and a hard offset shadow.
 *
 * Renders an <a> when given an `href` and a <button> otherwise, so the markup
 * always matches the behaviour — no click handler faking a link.
 */
export function Button({
  children,
  variant = "primary",
  className,
  href,
  external = false,
  ariaLabel,
  onClick,
  type = "button",
  disabled = false,
  autoFocus = false,
}: ButtonProps & Partial<Pick<ActionLink, "href" | "external" | "ariaLabel">>) {
  const classes = cn(
    base,
    variants[variant],
    disabled &&
      "cursor-not-allowed opacity-60 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none",
    className,
  );

  if (!href) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        autoFocus={autoFocus}
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  // Mailto and in-page anchors stay in the same tab; anything else opens safely
  // in a new one.
  const isInternal = href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

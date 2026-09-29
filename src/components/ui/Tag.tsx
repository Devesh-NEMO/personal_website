import { cn } from "@/lib/cn";

type TagProps = {
  children: string;
  /** `filled` sits on a coloured card, `outline` lets the card show through. */
  variant?: "filled" | "outline";
  className?: string;
};

/**
 * A pill-shaped tag chip. 999px radius, 3px border, high-weight label.
 *
 * The filled background is fully opaque on purpose. An earlier version used
 * `bg-surface/70`, which composited the white surface over the pastel cards and
 * collapsed the label to 2.03:1.
 */
export function Tag({ children, variant = "outline", className }: TagProps) {
  return (
    <span
      className={cn(
        "brutal-pill brutal-border inline-flex items-center px-3 py-1",
        "text-xs font-bold tracking-tight",
        variant === "filled" ? "bg-surface" : "bg-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/cn";

type AlertProps = {
  tone: "success" | "error";
  children: string;
};

/**
 * Inline form status. Both tones are a bordered pill with ink on a solid fill,
 * so they clear WCAG AA in light and dark mode (unlike coloured text on cream).
 */
export function Alert({ tone, children }: AlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "brutal-border brutal-pill w-fit px-4 py-2 text-sm font-bold tracking-tight",
        tone === "error" ? "bg-accent text-accent-ink" : "bg-mint text-fg",
      )}
    >
      {children}
    </p>
  );
}
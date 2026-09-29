import type { CardTone } from "@/types";

/**
 * Maps a tone name to its background utility.
 *
 * All four tones intentionally share the same foreground (--fg) and border
 * (--fg) colour; only the surface differs. In light mode --fg is near-black on
 * a bright pastel, in dark mode it is cream on a muted pastel, and both pairings
 * clear WCAG AA (>= 4.5:1).
 */
export const toneBackground: Record<CardTone, string> = {
  mint: "bg-mint",
  peach: "bg-peach",
  periwinkle: "bg-periwinkle",
  pink: "bg-pink",
};

/** Ordered palette used when a section cycles colours automatically. */
export const toneOrder: CardTone[] = ["mint", "peach", "periwinkle", "pink"];

/**
 * The base surface classes for a card: 16px radius, 3px border, hard shadow and
 * the tone's background.
 *
 * Exported as a function (rather than duplicated inside <Card>) so a component
 * that must render a card *without* the <Card> wrapper can reuse the exact
 * same styling. StatTile is the reason: its <dt>/<dd> pair has to sit directly
 * inside a single <div> that is itself a direct child of the <dl>, so an extra
 * <Card> div in between would break the definition-list markup that axe checks.
 */
export function cardSurface(tone: CardTone): string {
  return `rounded-card brutal-border shadow-brutal ${toneBackground[tone]}`;
}

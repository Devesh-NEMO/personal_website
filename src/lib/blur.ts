import type { CardTone } from "@/types";

/**
 * Per-tone gradient placeholders for next/image `placeholder="blur"`.
 *
 * These are inline SVG data URLs, not uploads: they cost nothing on the wire
 * and give each image a coloured blur in the tone of the card behind it, so
 * there is no flash of empty grey box while the file loads.
 */
const BLUR_TONES: Record<CardTone, [string, string]> = {
  mint: ["#a8e6cf", "#2f5d4b"],
  peach: ["#ffd3b6", "#6e4a32"],
  periwinkle: ["#aeb9ef", "#3b4270"],
  pink: ["#ffaaa5", "#703b38"],
};

export function blurDataUrl(tone: CardTone): string {
  const [from, to] = BLUR_TONES[tone];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/>` +
    `<stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="8" height="8" fill="url(#g)"/></svg>`;

  // Percent-encoded rather than base64 so it works identically on the server
  // and in the browser, and stays readable in devtools.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

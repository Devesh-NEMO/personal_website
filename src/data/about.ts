/**
 * ============================================================================
 * ABOUT — DECORATIVE FURNITURE
 * ----------------------------------------------------------------------------
 * Deliberately *not* part of the admin-editable content.
 *
 * The bio itself lives in the content layer (MongoDB, with data/site.ts as the
 * static fallback) so it can be rewritten from the admin panel. These are the
 * pieces that dress the collage around that copy — the polaroid caption and
 * the little sticker labels — and nobody needs to edit those mid-week.
 * ============================================================================
 */

export const aboutDecor = {
  /** Written under the photo, polaroid-style. */
  caption: "Devesh, mid-analysis",

  /**
   * The sticker labels under the photo. Each one is drawn in a different
   * palette tone and at a slightly different angle, so the row reads as a set
   * of pasted-on stickers rather than a list.
   */
  stickers: ["Retail", "Product", "Marketing"],
} as const;

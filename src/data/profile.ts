import type { ProfileImages } from "@/types";

/**
 * ============================================================================
 * IMAGES — replace the files in /public/images and the paths below.
 * ============================================================================
 * Recommended dimensions (also listed in the README):
 *   avatar.jpg      400 x 400    square
 *   hero.jpg        600 x 600    square
 *   og-image.png   1200 x 630    Open Graph preview
 *   projects/*.png 1280 x 720    16:9 thumbnails
 *
 * Keep every file under 200 KB. jpg, png and webp are all accepted.
 *
 * `tone` is only used to tint the blur placeholder and the fallback that shows
 * if a file goes missing, so it should match the card the image sits on.
 */
export const profile: ProfileImages = {
  avatar: {
    src: "/images/avatar.jpg",
    alt: "Portrait photo of Devesh Kumar, Data Analyst and Data Scientist",
    width: 400,
    height: 400,
    tone: "periwinkle",
    fallback: "DD",
  },

  heroImage: {
    src: "/images/hero.jpg",
    alt: "Devesh Kumar at work, reviewing a data dashboard on a laptop",
    width: 600,
    height: 600,
    tone: "mint",
    fallback: "DK",
  },

  heroBadge: "Open to work",

  ogImage: {
    src: "/images/og-image.png",
    alt: "Devesh Kumar — Data Analyst & Data Scientist",
    width: 1200,
    height: 630,
  },
};

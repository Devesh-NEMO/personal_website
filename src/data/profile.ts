import type { ProfileImages, ProfileNav } from "@/types";

/**
 * ============================================================================
 * IMAGES — replace the files in /public/images and the paths below.
 * ============================================================================
 * Recommended dimensions (also listed in the README):
 *   avatar.jpg      400 x 400    square
 *   main.jpg        600 x 600    square
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
    src: "/images/about-image.jpg",
    alt: "Devesh Kumar at work, reviewing a data dashboard on a laptop",
    width: 800,
    height: 800,
    tone: "periwinkle",
    fallback: "DK",
  },

  heroImage: {
    src: "/images/main.jpg",
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

/**
 * ============================================================================
 * NAVBAR
 * ============================================================================
 * This is the only file you edit to change what the navbar shows. See the
 * "Navbar" section of the README.
 *
 *   logo        the mark at the left, linked to the top of the page
 *   links       one per in-page section, in order. `href` must match the `id` on
 *               the section it points at — the active-link highlight tracks
 *               whichever section is in view, so a mismatched id gives you a link
 *               that never lights up. `label` is the visible text.
 *   menu labels what the mobile menu button says, and what it announces once the
 *               menu is open
 */
export const nav: ProfileNav = {
  logo: "DK.",

  links: [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],

  /*
   * Both are also the button's accessible name, so keep them short and
   * self-describing — the visible text and what a screen reader announces are
   * the same string. `aria-expanded` already tells assistive tech the state.
   */
  menuLabel: "Menu",
  menuCloseLabel: "Close",
};

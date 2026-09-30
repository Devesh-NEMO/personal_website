import { analytics } from "@/lib/constants";
import type { SiteLinks, SiteProfile } from "@/types";

/**
 * ============================================================================
 * SITE PROFILE — replace the values below with your real details.
 * ============================================================================
 * This is the only file you need to edit for your name, bio, links and the copy
 * on the 404, error and splash screens. Nothing here is hardcoded in a
 * component. (Navigation lives in data/profile.ts, images alongside them, and
 * case studies in data/projects.ts.)
 */

/**
 * The outbound addresses, declared once.
 *
 * Held outside the `site` object on purpose: the contact buttons and the
 * command menu's action group are two different views of the same three links,
 * and deriving both from one record is what keeps a replaced URL from surviving
 * in the one place nobody re-read.
 */
const links: SiteLinks = {
  email: "devesh10607@gmail.com",
  github: "https://github.com/Devesh-NEMO",
  linkedin: "https://www.linkedin.com/in/dk2002/",
  /*
   * Drop a PDF at public/cv.pdf and set this to "/cv.pdf".
   *
   * Left empty on purpose: the command menu reads this to decide whether to
   * offer a Download CV entry at all, so an empty string removes the row rather
   * than rendering a link that 404s.
   */
  cv: "",
};

export const site: SiteProfile = {
  // Absolute origin. Set NEXT_PUBLIC_SITE_URL in .env.local (and in Vercel)
  // so the sitemap, robots.txt and OG image URLs are correct in production.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com",

  title: "Devesh Kumar — Data Analyst & Data Scientist",
  shortTitle: "DK",
  description:
    "Data analyst and data scientist turning messy raw data into clear, decision-ready dashboards, models and stories.",
  role: "Data Analyst · Data Scientist",
  locale: "en_US",

  links,

  hero: {
    eyebrow: "Data Analyst · Data Scientist",
    greeting: "Hi, I'm",
    name: "Devesh Kumar.",
    preHighlight: "I make data",
    highlight: "talk.",
    intro:
      "I clean up messy tables, build models people can trust, and design dashboards that answer the question before it gets asked. Currently turning retail and product data into decisions.",
    primaryAction: { label: "See my work", href: "#work" },
    secondaryAction: { label: "Get in touch", href: "#contact" },
  },

  about: {
    paragraphs: [
      "I'm a data analyst and data scientist with a bias for shipping. Over the last few years I've worked across retail, product and marketing teams — mostly on the unglamorous part of the job: reconciling five exports that disagree, fixing the definitions nobody wrote down, and rebuilding the metrics layer so the numbers finally mean the same thing on Monday as they did on Friday.",
      "The rest is where it gets fun. I model demand, size experiments, and build dashboards that get used daily instead of admired once. I care about clean data contracts, reproducible queries, and charts that a stakeholder can read in five seconds without me in the room to explain them.",
    ],
  },

  /*
   * Built from `links` rather than written out, so the contact section and the
   * command menu can never point at different addresses.
   */
  contact: {
    heading: "Let's make your data talk",
    body: "Have a dataset nobody trusts, a dashboard that needs a rebuild, or a model that's overdue? Tell me about it — I reply within a day or two.",
    actions: [
      {
        label: "Email",
        href: `mailto:${links.email}`,
        external: false,
        ariaLabel: `Email me at ${links.email}`,
      },
      {
        label: "LinkedIn",
        href: links.linkedin,
        external: true,
        ariaLabel: "LinkedIn profile, opens in a new tab",
      },
      {
        label: "GitHub",
        href: links.github,
        external: true,
        ariaLabel: "GitHub profile, opens in a new tab",
      },
    ],
  },

  // Words in the scrolling strip between the hero and the about section.
  // Keep the list long enough to fill the loop — see REPEATS in
  // components/background/Marquee.tsx.
  marquee: {
    items: ["SQL", "PYTHON", "POWER BI", "EXCEL", "STATISTICS"],
    separator: "✦",
  },

  copyright: "© 2026 Devesh Kumar. All rights reserved.",

  /* ==========================================================================
   * 404
   * ======================================================================== */

  notFound: {
    title: "This data point is missing.",
    body: "Looks like this row was dropped during cleaning. Let's get you back to clean data.",
    // "Back to home" leads: a lost visitor wants the way out, not the shop.
    primaryAction: { label: "Back to home", href: "/" },
    secondaryAction: { label: "See my work", href: "/#work" },
    /*
     * Two shapes borrowed from the background set, so the card is dressed from
     * the same parts as the page it replaced. Ids must exist in data/shapes.ts —
     * an unknown id simply renders nothing.
     */
    shapeIds: ["top-plus", "bottom-triangle"],
    table: {
      // Screen readers announce this instead of an unlabelled grid of nonsense.
      caption: "Last known state of the requested row",
      columns: ["page", "status", "value"],
      rows: [["/404", "MISSING", "NULL"]],
    },
  },

  /* ==========================================================================
   * ERROR BOUNDARY
   * ======================================================================== */

  errorPage: {
    title: "Something broke in the pipeline",
    body: "An unexpected error stopped this part of the page from rendering. Retrying usually clears it — if it doesn't, the full error is in the browser console.",
    retryLabel: "Try again",
    homeAction: { label: "Back to home", href: "/" },
  },

  /* ==========================================================================
   * LOADING SPLASH
   * ======================================================================== */

  splash: {
    storageKey: "dk-splash-seen",
    messages: ["loading rows...", "cleaning data...", "ready."],
  },

  /* ==========================================================================
   * COMMAND MENU (Cmd / Ctrl + K)
   * ======================================================================== */

  command: {
    label: "Site search",
    triggerLabel: "Search",
    triggerIconLabel: "Open search",
    placeholder: "Jump to a section or a project…",
    emptyMessage: "No matches. Try a section name or a project.",

    groups: {
      navigate: "Navigate",
      projects: "Projects",
      actions: "Actions",
    },

    actions: {
      toggleTheme: "Toggle dark mode",
      copyEmail: "Copy email",
      downloadCv: "Download CV",
      openGithub: "Open GitHub",
      openLinkedin: "Open LinkedIn",
    },

    hints: {
      email: "to clipboard",
      cv: "PDF",
      github: "new tab",
      linkedin: "new tab",
    },

    shortcuts: {
      move: "↑ ↓ to navigate",
      select: "↵ to select",
      close: "esc to close",
    },
  },

  /* ==========================================================================
   * ANALYTICS
   * ======================================================================== */

  analytics,
};

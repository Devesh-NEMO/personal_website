import type { SiteProfile } from "@/types";

/**
 * ============================================================================
 * SITE PROFILE — replace the values below with your real details.
 * ============================================================================
 * This is the only file you need to edit for your name, bio, navigation and
 * contact links. Nothing here is hardcoded in a component.
 */
export const site: SiteProfile = {
  // Absolute origin. Set NEXT_PUBLIC_SITE_URL in .env.local (and in Vercel)
  // so the sitemap, robots.txt and OG image URLs are correct in production.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com",

  title: "Devesh Kumar — Data Analyst & Data Scientist",
  shortTitle: "DK",
  description:
    "Data analyst and data scientist turning messy raw data into clear, decision-ready dashboards, models and stories.",
  logoText: "DK.",
  role: "Data Analyst · Data Scientist",
  locale: "en_US",

  navLinks: [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],

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

  contact: {
    heading: "Let's make your data talk",
    body: "Have a dataset nobody trusts, a dashboard that needs a rebuild, or a model that's overdue? Tell me about it — I reply within a day or two.",
    actions: [
      {
        label: "Email",
        href: "mailto:devesh10607@gmail.com",
        external: false,
        ariaLabel: "Email me at devesh10607@gmail.com",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/your-handle",
        external: true,
        ariaLabel: "LinkedIn profile, opens in a new tab",
      },
      {
        label: "GitHub",
        href: "https://github.com/Devesh-NEMO",
        external: true,
        ariaLabel: "GitHub profile, opens in a new tab",
      },
    ],
  },

  copyright: "© 2026 Devesh Kumar. All rights reserved.",
};

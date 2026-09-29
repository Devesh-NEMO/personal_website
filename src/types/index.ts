/**
 * Shared TypeScript types.
 *
 * Every content shape used by the site is declared here so the files in
 * /data are type-checked: rename a field in a data file and TypeScript will
 * point at the component that needs updating.
 */

/** The four card colours in the palette. */
export type CardTone = "mint" | "peach" | "periwinkle" | "pink";

/** A link in the sticky navbar. `href` is an in-page anchor id. */
export type NavLink = {
  label: string;
  href: string;
};

/** A hero statistic tile. */
export type Stat = {
  id: string;
  label: string;
  value: string;
  tone: CardTone;
};

/** A single case study in the Work section. */
export type Project = {
  id: string;
  title: string;
  description: string;
  /** Exactly two outcome bullets — the "so what" of the analysis. */
  results: string[];
  tags: string[];
  href: string;
  tone: CardTone;
  /**
   * Optional 16:9 thumbnail shown at the top of the card. Omit the field and
   * the thumbnail area collapses entirely — no reserved gap.
   */
  image?: string;
  /** Describes what the thumbnail shows. Falls back to the project title. */
  imageAlt?: string;
};

/**
 * An image plus everything the layout needs to reserve space for it and to
 * recover gracefully if the file is missing.
 */
export type ImageAsset = {
  src: string;
  alt: string;
  /** Intrinsic pixel size of the source file (see the README for the specs). */
  width: number;
  height: number;
  /** Tints the blur placeholder and the fallback background. */
  tone: CardTone;
  /** Rendered in place of the image if it 404s or fails to decode. */
  fallback: string;
};

/** Every image on the site, in one typed file. */
export type ProfileImages = {
  avatar: ImageAsset;
  heroImage: ImageAsset;
  /** Text for the small sticker badge pinned to the hero photo. */
  heroBadge: string;
  ogImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

/** One of the four skill clusters. */
export type SkillGroup = {
  id: string;
  title: string;
  items: string[];
  tone: CardTone;
};

/** A call-to-action button. Renders an <a> when `href` is present. */
export type ActionLink = {
  label: string;
  href: string;
  /** Opens in a new tab and adds rel="noreferrer noopener". */
  external?: boolean;
  /** Overrides the accessible name when the visible label is not descriptive. */
  ariaLabel?: string;
};

export type HeroContent = {
  eyebrow: string;
  /** "Hi, I'm" */
  greeting: string;
  /** "Devesh Kumar." — keep the trailing period here. */
  name: string;
  /** "I make data" */
  preHighlight: string;
  /** "talk." — rendered inside the rotated orange-red block. */
  highlight: string;
  intro: string;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
};

export type AboutContent = {
  paragraphs: string[];
};

export type ContactContent = {
  heading: string;
  body: string;
  actions: ActionLink[];
};

export type SiteProfile = {
  /** Canonical origin, used for metadata, sitemap and robots.txt. */
  url: string;
  title: string;
  shortTitle: string;
  description: string;
  logoText: string;
  role: string;
  locale: string;
  navLinks: NavLink[];
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  copyright: string;
};

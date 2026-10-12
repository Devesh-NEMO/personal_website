/**
 * Shared TypeScript types.
 *
 * Every content shape used by the site is declared here so the files in
 * /data are type-checked: rename a field in a data file and TypeScript will
 * point at the component that needs updating.
 */

/** The four card colours in the palette. */
export type CardTone = "mint" | "peach" | "periwinkle" | "pink";

/* --- background decoration ------------------------------------------------- */

/**
 * Silhouettes a floating background shape can take.
 *
 * All six are drawn with `border-radius` or `clip-path` on a single element —
 * no images, no canvas, so they stay crisp at any size and cost nothing to load.
 */
export type ShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "plus"
  | "squiggle"
  | "star";

/**
 * Fill colour for a shape. The four card tones plus the orange-red accent, which
 * is reserved for one or two shapes so the background still reads as the same
 * palette rather than an equal mix.
 */
export type ShapeTone = CardTone | "accent";

/**
 * One shape in the floating background layer.
 *
 * Positions are fractions of the viewport (0-1) rather than pixels, so the layer
 * needs no breakpoint-specific coordinates and never overflows horizontally.
 */
export type BackgroundShape = {
  id: string;
  kind: ShapeKind;
  tone: ShapeTone;
  /** Edge length in px. */
  size: number;
  /** Fraction of the viewport width, from the left edge. */
  x: number;
  /** Fraction of the viewport height, from the top edge. */
  y: number;
  /** Starting rotation in degrees. */
  rotate: number;
  /** Seconds for one full float cycle. */
  duration: number;
  /** Seconds before the cycle starts, so the shapes never move in lockstep. */
  delay: number;
  /**
   * Vertical drift per 1000px scrolled, as a fraction of the shape's size.
   * Positive falls with the scroll, negative rises against it.
   */
  parallax: number;
  /**
   * Fill opacity, kept low on purpose: the shapes sit behind body text and the
   * palette has to stay AA regardless of what passes underneath.
   */
  opacity: number;
  /**
   * Omit on roughly half the set. Phones are narrow enough that a shape in the
   * corner of a 390px viewport ends up behind the text, not beside it.
   */
  hideOnMobile?: boolean;
};

/** The scrolling strip between the hero and the about section. */
export type MarqueeContent = {
  /** Words to repeat, in order. */
  items: string[];
  /** Drawn between items, e.g. "✦". */
  separator: string;
};

/** A link in the sticky navbar. `href` is an in-page anchor id. */
export type NavLink = {
  label: string;
  href: string;
};

/* --- navbar ----------------------------------------------------------------- */

/**
 * Everything the navbar shows, in one typed object.
 *
 * Lives in data/profile.ts so changing a link, the logo or the menu label is an
 * edit to data rather than to a component. See the "Navbar" section of the README.
 */
export type ProfileNav = {
  /** The logo mark, linked back to the top of the page. */
  logo: string;
  /**
   * The in-page sections, in the order they should appear. `href` must match the
   * `id` on the section it points at — that is what the active-link highlight
   * tracks, so a mismatched id means a link that never lights up.
   */
  links: NavLink[];
  /** Label on the mobile "Menu" button while the menu is closed. */
  menuLabel: string;
  /** Announced name of the menu button while the menu is open. */
  menuCloseLabel: string;
};

/**
 * =============================================================================
 * SHARED LINKS
 * =============================================================================
 * The handful of outbound addresses the site points at.
 *
 * Declared once, as their own object, because three separate things need them:
 * the contact buttons, the command menu's action group, and the analytics events
 * that report which one was used. Deriving all three from a single record is
 * what stops a placeholder URL surviving in one place after it has been replaced
 * in another.
 */
export type SiteLinks = {
  /** Bare address, no `mailto:` — the command menu copies this verbatim. */
  email: string;
  github: string;
  linkedin: string;
  /**
   * Path to a downloadable CV.
   *
   * Empty means "not published yet", and the command menu's Download CV entry is
   * left out entirely rather than rendered as a link that 404s. Set it to
   * `/cv.pdf` once the file is in `public/`.
   */
  cv: string;
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
  /** Cloudinary public identifier for asset management. */
  imagePublicId?: string;
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
  /** Cloudinary public identifier for asset management. */
  publicId?: string;
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
    publicId?: string;
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

/* --- admin-editable content --------------------------------------------------- */

/**
 * Everything the public home page reads from the admin-editable store
 * (`src/lib/content.ts`). One object per request so the page composes a single
 * `Promise.all` instead of juggling five collections.
 *
 * Mirrors the slices of `SiteProfile` that are editable: hero, about, contact
 * text, the shared links, the marquee strip and the navbar.
 */
export type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  links: SiteLinks;
  marquee: MarqueeContent;
  nav: ProfileNav;
  images: ProfileImages;
};

/** A message sent through the contact form, stored in the `messages` collection. */
export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  /** New messages arrive unread; the admin inbox toggles this. */
  read: boolean;
};

/* --- 404 and error pages ------------------------------------------------------ */

/**
 * One row of the decorative "query result" table on the 404 page.
 *
 * Columns and rows are typed separately so the two cannot drift in length, and
 * so the component never has to guard an index that might not exist.
 */
export type NullTable = {
  /** A visually hidden caption, so the table is not announced as unlabelled. */
  caption: string;
  columns: string[];
  rows: string[][];
};

/** Copy for `app/not-found.tsx`. */
export type NotFoundContent = {
  title: string;
  body: string;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
  /**
   * Ids of two shapes from `data/shapes.ts` to re-use as card-local decoration.
   * They come from the same set as the page background, so a shape on the 404
   * page is recognisably the same shape the reader saw on the home page.
   */
  shapeIds: string[];
  table: NullTable;
};

/** Copy for `app/error.tsx`. */
export type ErrorContent = {
  title: string;
  body: string;
  retryLabel: string;
  homeAction: ActionLink;
};

/* --- loading splash ----------------------------------------------------------- */

/** Copy for `components/ui/Splash.tsx`. */
export type SplashContent = {
  /**
   * `sessionStorage` key marking the splash as seen.
   *
   * Session rather than local, deliberately: the splash is a greeting, not a
   * setting. Reloading or navigating back within the session must not replay it,
   * but coming back tomorrow should.
   */
  storageKey: string;
  /** Cycled under the progress bar, in order. The last one is the end state. */
  messages: string[];
};

/* --- command menu -------------------------------------------------------------- */

/** One command-menu row. Built at runtime from the data files, never authored here. */
export type CommandItem = {
  /** Stable key — also what the fuzzy matcher and the active-item id use. */
  id: string;
  label: string;
  /** Group heading this row sits under. */
  group: string;
  /** Extra text searched but not shown. */
  keywords?: string[];
  /** Short right-aligned hint, e.g. "Opens GitHub". */
  hint?: string;
  /** What Enter does. */
  run: () => void;
};

/** Everything the command menu needs from the data layer. */
export type CommandContent = {
  /** Accessible name of the dialog. */
  label: string;
  /** Visible text on the navbar button, and its accessible name. */
  triggerLabel: string;
  /** Icon-only variant of the trigger, used below `md`. */
  triggerIconLabel: string;
  /** `<input>` placeholder. */
  placeholder: string;
  /** Shown in place of the list when a query matches nothing. */
  emptyMessage: string;
  /** Group headings. */
  groups: {
    navigate: string;
    projects: string;
    actions: string;
  };
  /** Labels for the five action items. */
  actions: {
    toggleTheme: string;
    copyEmail: string;
    downloadCv: string;
    openGithub: string;
    openLinkedin: string;
  };
  /** Short right-aligned hints on the action items. */
  hints: {
    email: string;
    cv: string;
    github: string;
    linkedin: string;
  };
  /** The keyboard legend along the bottom of the dialog. */
  shortcuts: {
    move: string;
    select: string;
    close: string;
  };
};

/* --- analytics ----------------------------------------------------------------- */

/**
 * Which analytics backend to load.
 *
 * `vercel` is first-party and needs no domain; `plausible` is a single script tag
 * pointed at a `data-domain`. Anything else is treated as off, so a typo in an
 * environment variable disables tracking rather than throwing.
 */
export type AnalyticsProvider = "vercel" | "plausible";

/** Runtime configuration for `lib/analytics.ts`. */
export type AnalyticsConfig = {
  /**
   * Master switch. Also requires `NODE_ENV === "production"`, so a `npm run dev`
   * server never reports anything no matter what this is set to.
   */
  enabled: boolean;
  provider: AnalyticsProvider;
  /** Plausible only: the site identifier the script is registered against. */
  plausibleDomain: string;
  /** Plausible only: overridable for a self-hosted or proxied script. */
  plausibleScriptUrl: string;
};

/**
 * The custom events the site reports.
 *
 * A closed union rather than a free string: a typo becomes a compile error
 * rather than an event that silently never arrives in the dashboard.
 */
export type AnalyticsEvent =
  | "project_click"
  | "contact_click"
  | "cv_download"
  | "command_menu_open"
  | "theme_toggle";

export type SiteProfile = {
  /** Canonical origin, used for metadata, sitemap and robots.txt. */
  url: string;
  title: string;
  shortTitle: string;
  description: string;
  role: string;
  locale: string;
  /** Outbound addresses, shared by the contact buttons and the command menu. */
  links: SiteLinks;
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  marquee: MarqueeContent;
  copyright: string;
  notFound: NotFoundContent;
  errorPage: ErrorContent;
  splash: SplashContent;
  command: CommandContent;
  analytics: AnalyticsConfig;
};

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { ZodType } from "zod";

import { nav as staticNav, profile as staticProfile } from "@/data/profile";
import { projects as staticProjects } from "@/data/projects";
import { skillGroups as staticSkillGroups } from "@/data/skills";
import { stats as staticStats } from "@/data/stats";
import { site as staticSite } from "@/data/site";
import { connectToDatabase } from "@/lib/mongodb";
import {
  aboutContentSchema,
  contactContentSchema,
  heroContentSchema,
  marqueeContentSchema,
  navSchema,
  profileImagesSchema,
  projectSchema,
  siteLinksSchema,
  skillGroupSchema,
  statSchema,
} from "@/lib/schemas";
import type {
  ContactContent,
  ProfileImages,
  Project,
  SiteContent,
  SiteData,
  SiteLinks,
  SkillGroup,
  Stat,
} from "@/types";

/**
 * ============================================================================
 * CONTENT LAYER
 * ============================================================================
 * The single place the public site and the admin both read and write content.
 *
 * Everything lives in ONE MongoDB document — `siteContent` with `_id: "main"`:
 * the hero, about, contact text, links, marquee, navbar, profile images, and
 * the projects / skillGroups / stats lists. `getSiteData()` reads and validates
 * that document once per cache window; the narrower getters are views over it.
 *
 * Reads are cached with `"use cache"` + `cacheTag`, so the home page renders
 * from the Next cache instead of hitting Atlas on every request. After an
 * admin mutation, the server action calls `updateTag(contentTags.data)` plus
 * `revalidatePath("/")`, which refreshes the public pages without a rebuild.
 *
 * Every read degrades to the static files in `src/data/*` when the database is
 * unreachable, the document is missing, or a section fails validation — the
 * site can never break because of the database.
 */

/** Cache tags, kept here so read paths and admin writes agree on the names. */
export const contentTags = {
  /**
   * One tag for the whole document. Every section lives in the same row, so a
   * write to any of them invalidates all of it — a finer split would only risk
   * serving a half-updated page.
   */
  data: "site:data",
} as const;

/** The raw document shape: the fixed key plus arbitrary stored sections. */
type RawSiteDoc = { _id: string } & Record<string, unknown>;

/* --- read helpers ------------------------------------------------------------- */

/**
 * The single portfolio document, or `null` when the database is unreachable.
 * Unknown fields (`_id`, `updatedAt`, template leftovers) are ignored by the
 * per-section schemas.
 */
async function readSiteDoc(): Promise<RawSiteDoc | null> {
  const db = await connectToDatabase();
  if (!db) return null;

  try {
    return await db.collection<RawSiteDoc>("siteContent").findOne({ _id: "main" });
  } catch {
    return null;
  }
}

/** Parse one section, falling back to the static value when it is invalid. */
function parseOr<T>(schema: ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}

/**
 * Parse a stored list. Returns the fallback wholesale when any entry fails —
 * better than rendering a half-broken grid, and the same rule the old
 * per-collection reader used.
 */
function parseList<T>(schema: ZodType<T>, value: unknown, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;

  const parsed: T[] = [];
  for (const item of value) {
    const result = schema.safeParse(item);
    if (!result.success) return fallback;
    parsed.push(result.data);
  }
  return parsed;
}

/**
 * Temporary bridge for documents written before the lists moved into the single
 * document: read the old collection instead. Remove once the migration has run
 * everywhere (see `scripts/migrate-to-single-doc.ts`).
 */
async function legacyList<T>(
  collection: string,
  schema: ZodType<T>,
  fallback: T[],
): Promise<T[]> {
  const db = await connectToDatabase();
  if (!db) return fallback;

  try {
    const docs = await db.collection(collection).find({}).sort({ order: 1 }).toArray();
    return parseList(schema, docs, fallback);
  } catch {
    return fallback;
  }
}

/* --- public getters (cached) --------------------------------------------------- */

/**
 * Orders projects by priority: the lowest number wins, and rows without one
 * sink to the bottom instead of jumping to the top (Mongo sorts a missing
 * `priority` first, which is exactly wrong here). Ties keep their stored order,
 * because `Array#sort` is stable.
 */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const left = a.priority ?? Number.MAX_SAFE_INTEGER;
    const right = b.priority ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

/**
 * The whole portfolio as one object: chrome + projects + skills + stats.
 *
 * One cache entry, one document read. Every other getter below delegates here,
 * so the home page's `Promise.all` still resolves from a single cached object.
 */
export async function getSiteData(): Promise<SiteData> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.data);

  const doc = await readSiteDoc();
  if (!doc) return staticSiteData();

  const raw = (doc.siteData && typeof doc.siteData === "object") ? (doc.siteData as Record<string, unknown>) : doc;

  const projects = Array.isArray(raw.projects)
    ? parseList(projectSchema, raw.projects, staticProjects)
    : await legacyList("projects", projectSchema, staticProjects);
  const skillGroups = Array.isArray(raw.skillGroups)
    ? parseList(skillGroupSchema, raw.skillGroups, staticSkillGroups)
    : await legacyList("skillGroups", skillGroupSchema, staticSkillGroups);
  const stats = Array.isArray(raw.stats)
    ? parseList(statSchema, raw.stats, staticStats)
    : await legacyList("stats", statSchema, staticStats);

  return {
    ...buildSiteContent(raw),
    projects: sortProjects(projects),
    skillGroups,
    stats,
  };
}

export async function getProjects(): Promise<Project[]> {
  return (await getSiteData()).projects;
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  return (await getSiteData()).skillGroups;
}

export async function getStats(): Promise<Stat[]> {
  return (await getSiteData()).stats;
}

export async function getSiteContent(): Promise<SiteContent> {
  const { hero, about, contact, links, marquee, nav, images } = await getSiteData();
  return { hero, about, contact, links, marquee, nav, images };
}

/* --- section builders ---------------------------------------------------------- */

/** Validates each editable section independently so one bad field only loses that section. */
function buildSiteContent(doc: Record<string, unknown>): SiteContent {
  const fallback = staticSiteContent();

  const links = parseOr(siteLinksSchema, doc.links, fallback.links);

  const storedContact = contactContentSchema.safeParse(doc.contact);
  const contact = storedContact.success
    ? buildContact(storedContact.data.heading, storedContact.data.body, links)
    : buildContact(fallback.contact.heading, fallback.contact.body, links);

  const storedImages = profileImagesSchema.safeParse(doc.images);

  return {
    hero: parseOr(heroContentSchema, doc.hero, fallback.hero),
    about: parseOr(aboutContentSchema, doc.about, fallback.about),
    contact,
    links,
    marquee: parseOr(marqueeContentSchema, doc.marquee, fallback.marquee),
    nav: parseOr(navSchema, doc.nav, fallback.nav),
    images: storedImages.success ? mergeImages(storedImages.data) : fallback.images,
  };
}

/* --- fallbacks ---------------------------------------------------------------- */

function staticSiteContent(): SiteContent {
  return {
    hero: staticSite.hero,
    about: staticSite.about,
    contact: staticSite.contact,
    links: staticSite.links,
    marquee: staticSite.marquee,
    nav: staticNav,
    images: staticProfile,
  };
}

function staticSiteData(): SiteData {
  return {
    ...staticSiteContent(),
    projects: sortProjects(staticProjects),
    skillGroups: staticSkillGroups,
    stats: staticStats,
  };
}

/**
 * Stored profile images may be partial (a row written before a field existed),
 * so each asset is layered over its static default rather than replaced.
 */
function mergeImages(images: {
  avatar: ProfileImages["avatar"];
  heroImage: ProfileImages["heroImage"];
  heroBadge: string;
  ogImage?: ProfileImages["ogImage"];
}): ProfileImages {
  return {
    avatar: { ...staticProfile.avatar, ...images.avatar },
    heroImage: { ...staticProfile.heroImage, ...images.heroImage },
    heroBadge: images.heroBadge ?? staticProfile.heroBadge,
    ogImage: { ...staticProfile.ogImage, ...(images.ogImage ?? {}) },
  };
}

/**
 * Rebuilds the contact section's buttons from the shared links. Kept in lock
 * step with `src/data/site.ts` — if the label/icon set ever changes, both
 * places change.
 */
function buildContact(heading: string, body: string, links: SiteLinks): ContactContent {
  return {
    heading,
    body,
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
  };
}

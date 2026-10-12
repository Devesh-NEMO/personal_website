import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { ZodType } from "zod";

import { nav as staticNav } from "@/data/profile";
import { projects as staticProjects } from "@/data/projects";
import { skillGroups as staticSkillGroups } from "@/data/skills";
import { stats as staticStats } from "@/data/stats";
import { site as staticSite } from "@/data/site";
import { connectToDatabase } from "@/lib/mongodb";
import {
  projectSchema,
  siteContentDocSchema,
  skillGroupSchema,
  statSchema,
} from "@/lib/schemas";
import type {
  ContactContent,
  Project,
  SiteContent,
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
 * Reads are cached with `"use cache"` + `cacheTag`, so the home page renders
 * from the Next cache instead of hitting Atlas on every request. After an
 * admin mutation, the server action calls `updateTag(...)` for the affected
 * collection plus `revalidatePath("/")`, which refreshes the public page
 * without a rebuild (see the admin actions in phase 2/3).
 *
 * Every read degrades to the static files in `src/data/*` when the database
 * is unreachable, empty, or holding a document that fails validation — the
 * site can never break because of the database.
 */

/** Cache tags, kept here so read paths and admin writes agree on the names. */
export const contentTags = {
  projects: "site:projects",
  skillGroups: "site:skillGroups",
  stats: "site:stats",
  site: "site:siteContent",
} as const;

/* --- read helpers ------------------------------------------------------------- */

/**
 * All documents in a collection, ordered by `order`, without the internal
 * fields (`_id`, `order`, timestamps). Returns `null` when the database is
 * unreachable — the caller decides on the static fallback.
 */
async function fetchDocs(collection: string): Promise<unknown[] | null> {
  const db = await connectToDatabase();
  if (!db) return null;

  try {
    return (await db
      .collection(collection)
      .find(
        {},
        { projection: { _id: 0, createdAt: 0, updatedAt: 0, order: 0 } },
      )
      .sort({ order: 1 })
      .toArray()) as unknown[];
  } catch {
    return null;
  }
}

/**
 * Parse a list of raw documents with the collection's schema. Returns `null`
 * when any document fails — better to fall back wholesale than to render a
 * half-broken grid.
 */
function parseAll<T>(docs: unknown[], schema: ZodType<T>): T[] | null {
  const parsed: T[] = [];
  for (const doc of docs) {
    const result = schema.safeParse(doc);
    if (!result.success) return null;
    parsed.push(result.data);
  }
  return parsed;
}

/* --- public getters (cached) --------------------------------------------------- */

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects);

  const docs = await fetchDocs("projects");
  if (!docs || docs.length === 0) return staticProjects;

  const parsed = parseAll(docs, projectSchema);
  return parsed ?? staticProjects;
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.skillGroups);

  const docs = await fetchDocs("skillGroups");
  if (!docs || docs.length === 0) return staticSkillGroups;

  const parsed = parseAll(docs, skillGroupSchema);
  return parsed ?? staticSkillGroups;
}

export async function getStats(): Promise<Stat[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.stats);

  const docs = await fetchDocs("stats");
  if (!docs || docs.length === 0) return staticStats;

  const parsed = parseAll(docs, statSchema);
  return parsed ?? staticStats;
}

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.site);

  const db = await connectToDatabase();
  if (!db) return staticSiteContent();

  try {
    // The single editable-content document, keyed by string _id so upserts are
    // trivial and there can never be more than one. Typed loosely so the driver
    // accepts a string `_id` (its default is ObjectId) — the document is
    // validated by `siteContentDocSchema` below.
    const doc = await db
      .collection<{ _id: string; [key: string]: unknown }>("siteContent")
      .findOne({ _id: "main" });
    if (!doc) return staticSiteContent();

    const parsed = siteContentDocSchema.safeParse({
      hero: doc.hero,
      about: doc.about,
      contact: doc.contact,
      links: doc.links,
      marquee: doc.marquee,
      nav: doc.nav,
    });
    if (!parsed.success) return staticSiteContent();

    const { hero, about, contact, links, marquee, nav } = parsed.data;
    return {
      hero,
      about,
      // `actions` are not stored — derived from `links`, exactly like site.ts.
      contact: buildContact(contact.heading, contact.body, links),
      links,
      marquee,
      nav,
    };
  } catch {
    return staticSiteContent();
  }
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
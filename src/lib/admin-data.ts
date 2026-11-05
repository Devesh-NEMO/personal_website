import "server-only";

import { ObjectId, type Db } from "mongodb";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import type {
  ContactMessage,
  HeroContent,
  MarqueeContent,
  ProfileImages,
  ProfileNav,
  Project,
  SiteLinks,
  SkillGroup,
  Stat,
} from "@/types";

/**
 * ============================================================================
 * ADMIN DATA ACCESS
 * ============================================================================
 * Every mutation goes through here, and every mutation starts with
 * `requireAdmin()` — the check lives next to the write, not only in the page or
 * click handler that reached it. Reads used by the admin (`getMessages`,
 * `getCounts`) are here too.
 *
 * ALL site content lives in one document: `siteContent` with `_id: "main"`.
 * The hero, about, contact text, links, marquee, navbar, profile images and the
 * projects / skillGroups / stats lists are top-level keys on that row. Writers
 * below only `$set` the key they own, so saving a project never overwrites the
 * hero (or another project's list entry) written by a different admin page.
 *
 * Cache invalidation is deliberately NOT done here: `updateTag`/`revalidatePath`
 * may only run inside a Server Action, so the actions in `app/admin/actions.ts`
 * call them after a writer resolves.
 *
 * Each writer throws `DatabaseUnavailableError` when Atlas is unreachable, so
 * the action can surface a clear message instead of silently doing nothing.
 */

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("The database is not reachable. Check MONGODB_URI and Atlas network access.");
    this.name = "DatabaseUnavailableError";
  }
}

async function requireDb(): Promise<Db> {
  const db = await connectToDatabase();
  if (!db) throw new DatabaseUnavailableError();
  return db;
}

/* --- the single document ------------------------------------------------------ */

/** The raw portfolio row: the fixed key plus arbitrary stored sections. */
type SiteDoc = { _id: string } & Record<string, unknown>;

function siteCollection(db: Db) {
  return db.collection<SiteDoc>("siteContent");
}

async function readSiteDoc(db: Db): Promise<SiteDoc | null> {
  return siteCollection(db).findOne({ _id: "main" });
}

/**
 * Writes the given top-level keys into the single document, creating it on
 * first use. Callers pass only what they own, so a save is always a partial
 * update rather than a whole-row replacement.
 */
async function writeSiteDoc(db: Db, fields: Record<string, unknown>): Promise<void> {
  const now = new Date();
  const setFields: Record<string, unknown> = { updatedAt: now };
  for (const [key, value] of Object.entries(fields)) {
    setFields[`siteData.${key}`] = value;
  }
  await siteCollection(db).updateOne(
    { _id: "main" },
    {
      $set: setFields,
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );
}

/** Reads a stored list, tolerating a document written before the list existed. */
function readList<T>(doc: SiteDoc | null, key: string): T[] {
  const raw = (doc?.siteData && typeof doc.siteData === "object") ? (doc.siteData as Record<string, unknown>) : doc;
  const value = raw?.[key];
  return Array.isArray(value) ? ([...value] as T[]) : [];
}

/* --- projects ---------------------------------------------------------------- */

export async function saveProject(project: Project): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const projects = readList<Project>(doc, "projects");
  const now = new Date();

  /*
   * `undefined` values are dropped rather than spread: the driver would write
   * them as null, and a field the form did not send would blank out a column.
   */
  const { priority, ...fields } = project;
  const patch = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Partial<Project>;

  const index = projects.findIndex((item) => item.id === project.id);
  const existing = index >= 0 ? projects[index] : undefined;

  if (existing) {
    // An edit that leaves the number blank keeps the priority already stored —
    // the number belongs to the admin, not to the form's default value.
    const kept = typeof existing.priority === "number" ? existing.priority : 1;
    projects[index] = {
      ...existing,
      ...patch,
      id: project.id,
      priority: priority ?? kept,
      createdAt: existing.createdAt ?? now,
    };
  } else {
    /*
     * A brand-new project queues up behind everything already placed: one past
     * the highest priority in use. With no projects yet that is 1, which puts
     * the very first project on the home page where it belongs.
     */
    const highest = projects.reduce(
      (top, item) =>
        typeof item.priority === "number" ? Math.max(top, item.priority) : top,
      0,
    );
    projects.push({
      ...(patch as Omit<Project, "id">),
      id: project.id,
      priority: priority ?? (highest > 0 ? highest + 1 : 1),
      createdAt: now,
    });
  }

  await writeSiteDoc(db, { projects });
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const projects = readList<Project>(doc, "projects").filter((project) => project.id !== id);
  await writeSiteDoc(db, { projects });
}

/* --- skill groups ------------------------------------------------------------ */

export async function saveSkillGroup(group: SkillGroup): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const groups = readList<SkillGroup>(doc, "skillGroups");

  const index = groups.findIndex((item) => item.id === group.id);
  if (index >= 0) groups[index] = { ...groups[index], ...group };
  else groups.push(group);

  await writeSiteDoc(db, { skillGroups: groups });
}

export async function deleteSkillGroup(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const groups = readList<SkillGroup>(doc, "skillGroups").filter((group) => group.id !== id);
  await writeSiteDoc(db, { skillGroups: groups });
}

/* --- stats ------------------------------------------------------------------- */

export async function saveStat(stat: Stat): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const stats = readList<Stat>(doc, "stats");

  const index = stats.findIndex((item) => item.id === stat.id);
  if (index >= 0) stats[index] = { ...stats[index], ...stat };
  else stats.push(stat);

  await writeSiteDoc(db, { stats });
}

export async function deleteStat(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const doc = await readSiteDoc(db);
  const stats = readList<Stat>(doc, "stats").filter((stat) => stat.id !== id);
  await writeSiteDoc(db, { stats });
}

/* --- site content ------------------------------------------------------------ */

async function updateSiteContent(fields: Record<string, unknown>): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await writeSiteDoc(db, fields);
}

export async function saveHero(hero: HeroContent): Promise<void> {
  await updateSiteContent({ hero });
}

export async function saveAbout(paragraphs: string[]): Promise<void> {
  await updateSiteContent({ about: { paragraphs } });
}

export async function saveContact(input: {
  heading: string;
  body: string;
  links: SiteLinks;
}): Promise<void> {
  await updateSiteContent({
    contact: { heading: input.heading, body: input.body },
    links: input.links,
  });
}

export async function saveMarquee(marquee: MarqueeContent): Promise<void> {
  await updateSiteContent({ marquee });
}

export async function saveNav(nav: ProfileNav): Promise<void> {
  await updateSiteContent({ nav });
}

export async function saveProfileImages(images: ProfileImages): Promise<void> {
  await updateSiteContent({ images });
}

/* --- messages ---------------------------------------------------------------- */

/** A message as the admin list needs it: string id, ready for `key`/forms. */
export type StoredMessage = ContactMessage & {
  id: string;
  createdAt: Date | null;
};

/** Newest first. Returns [] (not the static fallback) when the DB is down. */
export async function getMessages(): Promise<StoredMessage[]> {
  const db = await connectToDatabase();
  if (!db) return [];

  try {
    const docs = await db
      .collection("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      id: String(doc._id),
      name: String(doc.name ?? ""),
      email: String(doc.email ?? ""),
      message: String(doc.message ?? ""),
      read: Boolean(doc.read),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : null,
    }));
  } catch {
    return [];
  }
}

/** Counts for the dashboard, plus the unread badge. */
export async function getCounts(): Promise<{
  projects: number;
  skills: number;
  stats: number;
  messages: number;
  unread: number;
  connected: boolean;
}> {
  const db = await connectToDatabase();
  if (!db) {
    return { projects: 0, skills: 0, stats: 0, messages: 0, unread: 0, connected: false };
  }

  try {
    const [doc, messages, unread] = await Promise.all([
      readSiteDoc(db),
      db.collection("messages").countDocuments(),
      db.collection("messages").countDocuments({ read: false }),
    ]);

    const raw = (doc?.siteData && typeof doc.siteData === "object") ? (doc.siteData as Record<string, unknown>) : doc;
    const size = (value: unknown) => (Array.isArray(value) ? value.length : 0);

    return {
      projects: size(raw?.projects),
      skills: size(raw?.skillGroups),
      stats: size(raw?.stats),
      messages,
      unread,
      connected: true,
    };
  } catch {
    return { projects: 0, skills: 0, stats: 0, messages: 0, unread: 0, connected: false };
  }
}

/**
 * Public: called by the contact form's server action (no `requireAdmin`).
 * Rate limiting and validation happen in the action, before this runs.
 */
export async function insertMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const db = await requireDb();
  await db.collection("messages").insertOne({
    ...input,
    read: false,
    createdAt: new Date(),
  });
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await db.collection("messages").updateOne({ _id: toObjectId(id) }, { $set: { read } });
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await db.collection("messages").deleteOne({ _id: toObjectId(id) });
}

/** Mongo ids arrive as strings; only hex ObjectIds are valid here. */
function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid message id");
  }
  return new ObjectId(id);
}

export async function getUnreadCount(): Promise<number> {
  await requireAdmin();
  try {
    const db = await requireDb();
    return await db.collection("messages").countDocuments({ read: false });
  } catch {
    // The badge is decorative: a dead database must never crash the admin shell
    // (which would otherwise take down every /admin page behind the layout).
    return 0;
  }
}

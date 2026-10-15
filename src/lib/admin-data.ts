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

/* --- projects ---------------------------------------------------------------- */

export async function saveProject(project: Project): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const collection = db.collection("projects");
  const now = new Date();

  const existing = await collection.findOne({ id: project.id });

  if (existing) {
    // `order` is intentionally not touched on edit: the list position is the
    // admin's, not the form's.
    await collection.updateOne(
      { id: project.id },
      { $set: { ...project, updatedAt: now } },
    );
    return;
  }

  await collection.updateOne(
    { id: project.id },
    {
      $set: { ...project, updatedAt: now },
      $setOnInsert: {
        _id: project.id,
        createdAt: now,
        order: await collection.countDocuments(),
      },
    },
    { upsert: true },
  );
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await db.collection("projects").deleteOne({ id });
}

/* --- skill groups ------------------------------------------------------------ */

export async function saveSkillGroup(group: SkillGroup): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const collection = db.collection("skillGroups");
  const now = new Date();

  const existing = await collection.findOne({ id: group.id });

  if (existing) {
    await collection.updateOne({ id: group.id }, { $set: { ...group, updatedAt: now } });
    return;
  }

  await collection.updateOne(
    { id: group.id },
    {
      $set: { ...group, updatedAt: now },
      $setOnInsert: {
        _id: group.id,
        createdAt: now,
        order: await collection.countDocuments(),
      },
    },
    { upsert: true },
  );
}

export async function deleteSkillGroup(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await db.collection("skillGroups").deleteOne({ id });
}

/* --- stats ------------------------------------------------------------------- */

export async function saveStat(stat: Stat): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const collection = db.collection("stats");
  const now = new Date();

  const existing = await collection.findOne({ id: stat.id });

  if (existing) {
    await collection.updateOne({ id: stat.id }, { $set: { ...stat, updatedAt: now } });
    return;
  }

  await collection.updateOne(
    { id: stat.id },
    {
      $set: { ...stat, updatedAt: now },
      $setOnInsert: {
        _id: stat.id,
        createdAt: now,
        order: await collection.countDocuments(),
      },
    },
    { upsert: true },
  );
}

export async function deleteStat(id: string): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  await db.collection("stats").deleteOne({ id });
}

/* --- site content ------------------------------------------------------------ */

/** The single editable document, keyed `_id: "main"`. */
function siteContentCollection(db: Db) {
  return db.collection<{ _id: string; [key: string]: unknown }>("siteContent");
}

async function updateSiteContent(fields: Record<string, unknown>): Promise<void> {
  await requireAdmin();
  const db = await requireDb();
  const now = new Date();
  await siteContentCollection(db).updateOne(
    { _id: "main" },
    {
      $set: { ...fields, updatedAt: now },
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );
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
    const [projects, skills, stats, messages, unread] = await Promise.all([
      db.collection("projects").countDocuments(),
      db.collection("skillGroups").countDocuments(),
      db.collection("stats").countDocuments(),
      db.collection("messages").countDocuments(),
      db.collection("messages").countDocuments({ read: false }),
    ]);
    return { projects, skills, stats, messages, unread, connected: true };
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

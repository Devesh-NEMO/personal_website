/**
 * `npm run migrate` — one-time move from the separate collections
 * (`projects`, `skillGroups`, `stats`) into the single `siteContent` document
 * (`_id: "main"`).
 *
 * Safe to run more than once:
 *   - a list already present on the document (even an empty one) is left alone,
 *     so a project deleted in the admin is never resurrected;
 *   - a missing list is filled from the legacy collection;
 *   - the old collections are NOT dropped — they are left in place as a backup.
 *
 * Requires MONGODB_URI in .env.local.
 */

import { connectToDatabase, disconnect } from "../src/lib/mongodb";

type RawDoc = Record<string, unknown>;

/** Drops Mongo bookkeeping so the embedded entries match the public types. */
function clean(docs: RawDoc[]): RawDoc[] {
  return docs.map((doc) => {
    const copy = { ...doc };
    delete copy._id;
    delete copy.updatedAt;
    return copy;
  });
}

async function main() {
  const db = await connectToDatabase();
  if (!db) {
    console.error(
      "Could not connect to the database. Is MONGODB_URI set in .env.local and is the cluster reachable?",
    );
    process.exit(1);
  }

  const siteColl = db.collection<{ _id: string; [key: string]: unknown }>("siteContent");
  const existing = await siteColl.findOne({ _id: "main" });

  const [legacyProjects, legacySkills, legacyStats] = await Promise.all([
    db.collection("projects").find({}).sort({ order: 1 }).toArray(),
    db.collection("skillGroups").find({}).sort({ order: 1 }).toArray(),
    db.collection("stats").find({}).sort({ order: 1 }).toArray(),
  ]);

  const projects = Array.isArray(existing?.projects)
    ? (existing.projects as RawDoc[])
    : clean(legacyProjects as RawDoc[]);
  const skillGroups = Array.isArray(existing?.skillGroups)
    ? (existing.skillGroups as RawDoc[])
    : clean(legacySkills as RawDoc[]);
  const stats = Array.isArray(existing?.stats)
    ? (existing.stats as RawDoc[])
    : clean(legacyStats as RawDoc[]);

  const now = new Date();
  await siteColl.updateOne(
    { _id: "main" },
    {
      $set: { projects, skillGroups, stats, updatedAt: now },
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );

  await disconnect();

  console.log("\nMigrated into the single siteContent document:");
  console.log(`  - projects: ${projects.length}`);
  console.log(`  - skillGroups: ${skillGroups.length}`);
  console.log(`  - stats: ${stats.length}`);
  console.log(
    "\nThe old collections were left in place as a backup. Drop them once the site is verified.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

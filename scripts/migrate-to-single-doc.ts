/**
 * `npm run migrate` — moves content into the single `siteContent` document
 * (`_id: "main"`), wrapping everything inside the `siteData` object.
 */

import { connectToDatabase, disconnect } from "../src/lib/mongodb";

type RawDoc = Record<string, unknown>;

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
    db.collection("projects").find({}).sort({ order: 1 }).toArray().catch(() => []),
    db.collection("skillGroups").find({}).sort({ order: 1 }).toArray().catch(() => []),
    db.collection("stats").find({}).sort({ order: 1 }).toArray().catch(() => []),
  ]);

  const rawExisting = (existing?.siteData && typeof existing.siteData === "object") ? (existing.siteData as RawDoc) : existing;

  const projects = Array.isArray(rawExisting?.projects)
    ? (rawExisting.projects as RawDoc[])
    : clean(legacyProjects as RawDoc[]);
  const skillGroups = Array.isArray(rawExisting?.skillGroups)
    ? (rawExisting.skillGroups as RawDoc[])
    : clean(legacySkills as RawDoc[]);
  const stats = Array.isArray(rawExisting?.stats)
    ? (rawExisting.stats as RawDoc[])
    : clean(legacyStats as RawDoc[]);

  const baseSiteData = (existing?.siteData && typeof existing.siteData === "object") ? (existing.siteData as RawDoc) : (existing || {});
  // remove top-level projects/skillGroups/stats from baseSiteData if they were flat
  delete baseSiteData._id;
  delete baseSiteData.createdAt;
  delete baseSiteData.updatedAt;
  delete baseSiteData.siteData;

  const now = new Date();
  await siteColl.updateOne(
    { _id: "main" },
    {
      $set: {
        siteData: {
          ...baseSiteData,
          projects,
          skillGroups,
          stats,
        },
        updatedAt: now,
      },
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );

  await disconnect();

  console.log("\nMigrated into siteContent under the siteData object:");
  console.log(`  - projects: ${projects.length}`);
  console.log(`  - skillGroups: ${skillGroups.length}`);
  console.log(`  - stats: ${stats.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/**
 * `npm run seed` — imports the current `src/data/*.ts` content into MongoDB.
 *
 * Idempotent by construction: every write is an `upsert` keyed on the stable
 * `id` (or the fixed `"main"` key for the single siteContent document), so
 * running it twice never duplicates rows, and re-running after editing a data
 * file updates the existing rows in place.
 *
 * Requires MONGODB_URI in .env.local.
 */

import { connectToDatabase, disconnect } from "../src/lib/mongodb";
import { nav, profile } from "../src/data/profile";
import { projects } from "../src/data/projects";
import { skillGroups } from "../src/data/skills";
import { stats } from "../src/data/stats";
import { site } from "../src/data/site";

async function main() {
  const db = await connectToDatabase();
  if (!db) {
    console.error(
      "Could not connect to the database. Is MONGODB_URI set in .env.local and is the cluster reachable?",
    );
    process.exit(1);
  }

  const now = new Date();
  const summary: string[] = [];

  const projectColl = db.collection("projects");
  const skillsColl = db.collection("skillGroups");
  const statsColl = db.collection("stats");
  // Typed loosely so the driver accepts the string `_id` used as the fixed key
  // for the single siteContent document.
  const siteColl = db.collection<{ _id: string; [key: string]: unknown }>(
    "siteContent",
  );

  // Projects — `_id` is the stable slug so the upsert key doubles as the key.
  let created = 0;
  let updated = 0;
  for (const [index, project] of projects.entries()) {
    const result = await projectColl.updateOne(
      { id: project.id },
      {
        $set: { ...project, order: index, updatedAt: now },
        $setOnInsert: { _id: project.id, createdAt: now },
      },
      { upsert: true },
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
    else if (result.matchedCount && !result.modifiedCount) updated += 1;
  }
  summary.push(`projects: ${projects.length} (${created} created, ${updated} updated)`);

  // Skill groups
  created = 0;
  updated = 0;
  for (const [index, group] of skillGroups.entries()) {
    const result = await skillsColl.updateOne(
      { id: group.id },
      {
        $set: { ...group, order: index, updatedAt: now },
        $setOnInsert: { _id: group.id, createdAt: now },
      },
      { upsert: true },
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
    else if (result.matchedCount && !result.modifiedCount) updated += 1;
  }
  summary.push(`skillGroups: ${skillGroups.length} (${created} created, ${updated} updated)`);

  // Stats
  created = 0;
  updated = 0;
  for (const [index, stat] of stats.entries()) {
    const result = await statsColl.updateOne(
      { id: stat.id },
      {
        $set: { ...stat, order: index, updatedAt: now },
        $setOnInsert: { _id: stat.id, createdAt: now },
      },
      { upsert: true },
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
    else if (result.matchedCount && !result.modifiedCount) updated += 1;
  }
  summary.push(`stats: ${stats.length} (${created} created, ${updated} updated)`);

  // Single editable site-content document (hero, about, contact text, links,
  // marquee, nav). Contact `actions` are derived from `links` on read, so only
  // heading + body are stored — same split as the data layer uses.
  const siteResult = await siteColl.updateOne(
    { _id: "main" },
    {
      $set: {
        hero: site.hero,
        about: site.about,
        contact: { heading: site.contact.heading, body: site.contact.body },
        links: site.links,
        marquee: site.marquee,
        nav,
        images: profile,
        updatedAt: now,
      },
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );
  summary.push(
    `siteContent: ${siteResult.upsertedCount ? "created" : "updated"} (hero, about, contact, links, marquee, nav, images)`,
  );

  // Messages are only ever created by the contact form, so there is nothing
  // to seed for that collection.

  await disconnect();

  console.log("\nSeeded:");
  for (const line of summary) console.log(`  - ${line}`);
  console.log(
    "\nDone. The public site reads this through its cache and will pick up the change on the next revalidation.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
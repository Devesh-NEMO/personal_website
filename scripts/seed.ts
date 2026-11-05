/**
 * `npm run seed` — imports the current `src/data/*.ts` content into the single
 * `siteContent` document (`_id: "main"`).
 *
 * Idempotent by construction: one `upsert` keyed on the fixed `"main"` key, so
 * running it twice never duplicates anything, and re-running after editing a
 * data file updates the document in place.
 *
 * Projects are handled carefully: the static list is intentionally empty (real
 * projects live only in the database), so seeding never wipes live work. A
 * non-empty static list replaces the stored one.
 *
 * Requires MONGODB_URI in .env.local.
 */

import { connectToDatabase, disconnect } from "../src/lib/mongodb";
import { nav, profile } from "../src/data/profile";
import { projects } from "../src/data/projects";
import { skillGroups } from "../src/data/skills";
import { stats } from "../src/data/stats";
import { site } from "../src/data/site";
import type { Project } from "../src/types";

async function main() {
  const db = await connectToDatabase();
  if (!db) {
    console.error(
      "Could not connect to the database. Is MONGODB_URI set in .env.local and is the cluster reachable?",
    );
    process.exit(1);
  }

  const now = new Date();
  const siteColl = db.collection<{ _id: string; [key: string]: unknown }>("siteContent");
  const existing = await siteColl.findOne({ _id: "main" });

  // Never resurrect an empty static list over live database work.
  const rawExisting = (existing?.siteData && typeof existing.siteData === "object") ? (existing.siteData as Record<string, unknown>) : existing;
  const storedProjects = Array.isArray(rawExisting?.projects)
    ? (rawExisting.projects as Project[])
    : [];
  const nextProjects =
    projects.length > 0
      ? projects.map((project, index) => ({
          ...project,
          priority: project.priority ?? index + 1,
          createdAt: project.createdAt ?? now,
        }))
      : storedProjects;

  // `order` keeps the array order explicit, matching the old collection sort.
  const nextSkills = skillGroups.map((group, index) => ({ ...group, order: index }));
  const nextStats = stats.map((stat, index) => ({ ...stat, order: index }));

  const result = await siteColl.updateOne(
    { _id: "main" },
    {
      $set: {
        siteData: {
          hero: site.hero,
          about: site.about,
          contact: { heading: site.contact.heading, body: site.contact.body },
          links: site.links,
          marquee: site.marquee,
          nav,
          images: profile,
          projects: nextProjects,
          skillGroups: nextSkills,
          stats: nextStats,
        },
        updatedAt: now,
      },
      $setOnInsert: { _id: "main", createdAt: now },
    },
    { upsert: true },
  );

  await disconnect();

  console.log("\nSeeded the single siteContent document:");
  console.log(`  - ${result.upsertedCount ? "created" : "updated"}`);
  console.log(`  - projects: ${nextProjects.length}`);
  console.log(`  - skillGroups: ${nextSkills.length}`);
  console.log(`  - stats: ${nextStats.length}`);
  console.log("  - hero, about, contact, links, marquee, nav, images");
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

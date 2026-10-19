import { About } from "@/components/About";
import { Marquee } from "@/components/background/Marquee";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import {
  getProjects,
  getSiteContent,
  getSkillGroups,
  getStats,
} from "@/lib/content";

/**
 * Single-page portfolio.
 *
 * The page stays a server component; it asks the content layer (MongoDB with
 * a static fallback) for every editable slice in one parallel fetch, then
 * hands each section its own data as props. Sections never touch the database
 * themselves, and the page stays fast because the getters are cached with
 * "use cache" — admin saves revalidate the tags on demand, so a rebuild is
 * never needed to publish an edit.
 */
export default async function HomePage() {
  const [projects, skillGroups, stats, siteContent] = await Promise.all([
    getProjects(),
    getSkillGroups(),
    getStats(),
    getSiteContent(),
  ]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:brutal-pill focus:bg-accent focus:px-4 focus:py-2 focus:font-extrabold"
      >
        Skip to content
      </a>

      <Navbar profile={siteContent.nav} />

      <main id="main">
        <Hero hero={siteContent.hero} stats={stats} images={siteContent.images} />
        {/* The scrolling skills strip. Its own margin provides the separation
            from the hero above and the about section below. */}
        <Marquee marquee={siteContent.marquee} />
        <About paragraphs={siteContent.about.paragraphs} images={siteContent.images} />
        <Projects projects={projects} />
        <Skills groups={skillGroups} />
        <Contact contact={siteContent.contact} />
      </main>

      <Footer />
    </>
  );
}
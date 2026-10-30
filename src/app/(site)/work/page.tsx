import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getProjects, getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "All projects",
  description:
    "The full archive of data analyst and data scientist case studies — every project that is not on the home page.",
};

/**
 * The full project archive.
 *
 * The home page shows the six lowest priorities; this page shows the lot, so no
 * case study is ever unreachable. It lives inside the `(site)` group for the
 * backdrop and analytics, and carries its own <Navbar> because the one-pager
 * renders the navbar in `page.tsx` rather than the layout.
 */
export default async function WorkPage() {
  const [projects, siteContent] = await Promise.all([
    getProjects(),
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

      {/* `basePath="/"` so the section links resolve to /#about and friends
          instead of looking for anchors this page does not have. */}
      <Navbar profile={siteContent.nav} basePath="/" />

      <main id="main">
        <Section id="top" className="pt-10 sm:pt-20">
          <Reveal direction="up" className="flex flex-col items-start gap-5">
            <p className="text-sm font-extrabold tracking-[0.18em] uppercase">
              Archive
            </p>

            <h1 className="max-w-3xl text-4xl leading-[1.05] font-black tracking-[-0.03em] sm:text-5xl md:text-6xl">
              Every project, in one place
              <span className="text-accent">.</span>
            </h1>

            <span className="heading-underline" aria-hidden="true" />

            <p className="max-w-2xl text-base leading-relaxed font-medium tracking-tight text-fg/80 sm:text-lg">
              {projects.length} case studies, newest ideas first. The home page
              keeps the six that matter most — the rest live here, so nothing
              gets buried.
            </p>

            <Link
              href="/#work"
              className="inline-flex items-center gap-2 pt-1 text-sm font-extrabold tracking-tight underline decoration-[3px] underline-offset-4 transition-colors hover:decoration-accent"
            >
              <span aria-hidden="true">←</span> Back to the highlights
            </Link>
          </Reveal>
        </Section>

        <Section id="projects" className="pt-0">
          <ProjectGrid projects={projects} />
        </Section>
      </main>

      <Footer />
    </>
  );
}

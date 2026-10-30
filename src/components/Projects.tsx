import Link from "next/link";

import { ProjectGrid } from "@/components/ProjectGrid";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion } from "@/lib/constants";
import type { Project } from "@/types";

/**
 * How many projects the home page shows. The content layer hands them over
 * already sorted by priority, so this is just a slice off the top — the rest
 * live on /work.
 */
const HOME_SLOTS = 6;

/**
 * Work section: the six lowest-priority projects, plus a link to the full
 * archive when there are more.
 *
 * The cards themselves are <ProjectGrid>, shared with /work, so the two pages
 * can never drift apart. Everything here is the framing: the heading, the
 * count line and the "See more" pill.
 */
export function Projects({ projects }: { projects: Project[] }) {
  const visible = projects.slice(0, HOME_SLOTS);
  const remaining = projects.length - visible.length;

  return (
    <Section id="work">
      <SectionHeading eyebrow="Work">Selected projects</SectionHeading>

      <ProjectGrid projects={visible} />

      {remaining > 0 ? (
        <Reveal direction="up" delay={motion.stagger} className="mt-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-medium tracking-tight text-fg/70">
              Showing {visible.length} of {projects.length} projects.
            </p>

            {/* A Next.js Link rather than <Button>: the shared button renders a
                plain <a> for non-hash hrefs, which would reload the whole app
                just to see the archive. */}
            <Link
              href="/work"
              className={
                "brutal-pill brutal-border inline-flex items-center justify-center gap-2 bg-accent px-6 py-3 " +
                "text-base font-extrabold tracking-tight text-accent-ink shadow-brutal " +
                "transition-[transform,box-shadow,background-color] duration-150 " +
                "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-mint hover:text-fg hover:shadow-brutal-lg " +
                "active:translate-x-0 active:translate-y-0 active:shadow-none"
              }
            >
              See {remaining} more {remaining === 1 ? "project" : "projects"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      ) : null}
    </Section>
  );
}

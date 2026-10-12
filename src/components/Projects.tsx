import Image from "next/image";

import { Section } from "@/components/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { trackAttrs } from "@/lib/analytics";
import { motion } from "@/lib/constants";
import { toneOrder } from "@/lib/tone";
import type { Project } from "@/types";

/**
 * Case study grid. One column on mobile, two from `sm`, three from `lg`.
 *
 * The cards come from the content layer. The tone is used when set, otherwise
 * the palette cycles mint → peach → periwinkle → pink down the grid.
 */
export function Projects({ projects }: { projects: Project[] }) {
  return (
    <Section id="work">
      <SectionHeading eyebrow="Work">Selected projects</SectionHeading>

      <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          /* `as="li"` so the reveal *is* the grid item — no extra wrapper div,
             which would otherwise break the equal-height row and the
             definition of the list semantics. The 80ms stagger comes straight
             from motion.stagger. */
          <Reveal
            as="li"
            key={project.id}
            className="flex"
            delay={index * motion.stagger}
          >
            <Card
              tone={project.tone ?? toneOrder[index % toneOrder.length]}
              interactive
              /* overflow-hidden lets the thumbnail clip to the card's 16px
                 radius while its own 3px bottom border stays crisp. */
              className="flex w-full flex-col overflow-hidden"
            >
              {project.image ? (
                /* 16:9 via aspect-ratio, so the space is reserved before the
                   file loads and the card heights stay even. */
                <div className="relative aspect-[16/9] w-full border-b-[3px] border-fg bg-surface">
                  <Image
                    src={project.image}
                    alt={project.imageAlt ?? project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-4 p-6">
              <h3 className="text-xl font-black tracking-tight">{project.title}</h3>

              <p className="text-sm leading-relaxed font-medium tracking-tight">
                {project.description}
              </p>

              {/* Outcome bullets — the measurable result of the work. */}
              <ul className="flex flex-col gap-2 text-sm font-semibold tracking-tight">
                {project.results.map((result) => (
                  <li key={result} className="flex gap-2">
                    <span aria-hidden="true" className="font-black">
                      →
                    </span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>

              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Tag variant="filled">{tag}</Tag>
                  </li>
                ))}
              </ul>

              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                /* Built from the title so the visible "View project" is always
                   contained in the accessible name (axe label-content-name-mismatch). */
                aria-label={`View project: ${project.title}`}
                className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold tracking-tight underline decoration-[3px] underline-offset-4 transition-colors hover:decoration-accent"
                {...trackAttrs("project_click", { name: project.title })}
              >
                View project
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
              </div>
            </Card>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { motion } from "@/lib/constants";
import type { SkillGroup } from "@/types";

const stickerRotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

/** Grouped skill boxes, each a card of pill tags. */
export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <Section id="skills">
      <SectionHeading eyebrow="Skills">Tools I reach for</SectionHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((group, index) => (
          <Reveal key={group.id} delay={index * motion.stagger}>
            <div className="group relative">
              <div
                className={`brutal-border rounded-card ${group.tone === "mint" ? "bg-mint" : group.tone === "peach" ? "bg-peach" : group.tone === "periwinkle" ? "bg-periwinkle" : "bg-pink"} p-6 shadow-brutal transition-transform duration-150 group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-brutal-lg sm:p-8`}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="heading-underline" aria-hidden="true" />
                    <h3 className="font-display text-xl font-black tracking-tight sm:text-2xl">
                      {group.title}
                    </h3>
                  </div>
                  <span
                    className={`brutal-pill brutal-border hidden px-3 py-1 text-xs font-extrabold tracking-tight shadow-brutal sm:inline-flex ${stickerRotations[index % stickerRotations.length]}`}
                    style={{
                      backgroundColor:
                        group.tone === "mint"
                          ? "var(--surface)"
                          : group.tone === "peach"
                            ? "var(--surface)"
                            : group.tone === "periwinkle"
                              ? "var(--surface)"
                              : "var(--surface)",
                    }}
                  >
                    {group.items.length} items
                  </span>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Tag variant="filled">{item}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import { Section } from "@/components/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { motion } from "@/lib/constants";
import type { SkillGroup } from "@/types";

/** Grouped skill boxes, each a card of pill tags. */
export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <Section id="skills">
      <SectionHeading eyebrow="Skills">Tools I reach for</SectionHeading>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {groups.map((group, index) => (
          /* h-full on the wrapper keeps the cards in a row equal height, the
             same as the grid's own stretch did before. */
          <Reveal key={group.id} delay={index * motion.stagger} className="h-full">
            <Card
              tone={group.tone}
              interactive
              className="flex h-full flex-col gap-4 p-6"
            >
              <h3 className="text-lg font-black tracking-tight">{group.title}</h3>

              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Tag variant="filled">{item}</Tag>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import { ProfileImage } from "@/components/ProfileImage";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";
import { motion } from "@/lib/constants";
import type { ProfileImages } from "@/types";

/**
 * Short bio section: profile photo on the left, the bio paragraphs on the
 * right (supplied by the content layer). Stacks vertically on mobile.
 */
export function About({
  paragraphs,
  images,
}: {
  paragraphs: string[];
  images?: ProfileImages;
}) {
  const profileImages = images ?? profile;

  return (
    <Section id="about">
      <SectionHeading eyebrow="About">A bit about me</SectionHeading>

      <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-[auto_1fr] sm:gap-12">
        {/* Square profile photo with a 20px radius and the same hard shadow as
            every other surface. ProfileImage swaps in the initials if the file
            is missing, so this can never render as a broken image.

            The reveal is `left`, which adds the slight counter-tilt that
            settles flat — the wrapper carries the transform so the inner
            absolutely-positioned frame is untouched. */}
        <Reveal direction="left" className="relative size-48 shrink-0 sm:size-64">
          <div className="brutal-border absolute inset-0 overflow-hidden rounded-[20px] bg-periwinkle shadow-brutal">
            <ProfileImage
              asset={profileImages.avatar}
              sizes="(max-width: 640px) 128px, 160px"
            />
          </div>
        </Reveal>

        <div className="flex flex-col gap-5 text-base leading-relaxed font-medium tracking-tight sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={motion.stagger * (index + 1)}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

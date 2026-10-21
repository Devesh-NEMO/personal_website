import { ProfileImage } from "@/components/ProfileImage";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { aboutDecor } from "@/data/about";
import { profile } from "@/data/profile";
import { motion } from "@/lib/constants";
import type { ProfileImages } from "@/types";

/**
 * Splits the first sentence off the bio.
 *
 * The opening line is a statement in its own right, so it is set oversized in
 * the display face and pulled out of the paragraph — the rest of the copy stays
 * in the note card below it. Nothing is lost: the sentence is *moved*, not
 * repeated.
 *
 * If the copy has no sentence break (an admin edit, say), there is no lead to
 * pull out and the whole bio is rendered as paragraphs instead, so the section
 * can never end up with an empty card.
 */
function splitLead(paragraphs: string[]): {
  lead: string | null;
  rest: string[];
} {
  const [first, ...others] = paragraphs;
  if (!first) return { lead: null, rest: [] };

  const match = first.match(/^([\s\S]*?[.!?])\s+([\s\S]+)$/);
  if (!match) return { lead: null, rest: paragraphs };

  return { lead: match[1], rest: [match[2], ...others] };
}

/**
 * The sticker labels under the photo.
 *
 * Each one gets its own palette tone and its own slight angle, so the row
 * reads as stickers slapped onto the page rather than as a list of chips.
 */
const stickerTones = [
  "bg-peach -rotate-3",
  "bg-mint rotate-2",
  "bg-pink -rotate-1",
];

/**
 * Short bio, dressed as a collage.
 *
 * Left: the photo as a tilted polaroid, with a monogram stamp over its
 * corner, a caption under it, and a row of sticker labels. Right: the opening
 * sentence as an oversized statement on a peach card, and the rest of the bio
 * in a plain note card.
 *
 * The point of the split is that the two halves answer different questions —
 * the left says who this is, the right says what the work involves — so the
 * section no longer reads as one long block of text beside a picture.
 */
export function About({
  paragraphs,
  images,
}: {
  paragraphs: string[];
  images?: ProfileImages;
}) {
  const profileImages = images ?? profile;
  const { lead, rest } = splitLead(paragraphs);

  return (
    <Section id="about">
      <SectionHeading eyebrow="About">A bit about me</SectionHeading>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
        {/* ── the collage ────────────────────────────────────────────────── */}
        <Reveal direction="left" className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:mx-0">
            {/* Monogram stamp, slapped over the photo's top-left corner. The
                accent is the loudest colour in the palette and this is the one
                place in the section that can carry it. */}
            <span className="brutal-border absolute -top-5 -left-4 z-10 grid size-16 -rotate-6 place-items-center rounded-[16px] bg-accent font-display text-2xl font-black tracking-tight text-accent-ink shadow-brutal">
              {profileImages.avatar.fallback}
            </span>

            {/* The polaroid: a white frame with a hair of padding under the
                image for the caption, tilted so it reads as a pasted-in
                photograph rather than a panel. */}
            <figure className="brutal-border -rotate-2 rounded-[20px] bg-surface p-3 pb-4 shadow-brutal">
              <div className="relative aspect-square overflow-hidden rounded-[12px] bg-periwinkle">
                <ProfileImage
                  asset={profileImages.avatar}
                  sizes="(max-width: 640px) 288px, 336px"
                />
              </div>
              <figcaption className="px-1 pt-3 text-center font-display text-base font-bold tracking-tight">
                {aboutDecor.caption}
              </figcaption>
            </figure>

            {/* Sticker labels, each on its own tone and angle. */}
            <ul className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              {aboutDecor.stickers.map((label, index) => (
                <li
                  key={label}
                  className={stickerTones[index % stickerTones.length]}
                >
                  <span className="brutal-pill brutal-border inline-flex items-center px-3.5 py-1.5 text-xs font-extrabold tracking-tight shadow-brutal">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── the copy ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* The opening sentence, oversized. */}
          {lead ? (
            <Reveal direction="right">
              <Card tone="peach" className="p-6 sm:p-8">
                <p className="font-display text-2xl leading-[1.15] font-black tracking-tight sm:text-3xl">
                  {lead}
                </p>
              </Card>
            </Reveal>
          ) : null}

          {/* Everything else, on a plain surface so the paragraphs stay the
              quietest thing in the section. */}
          {rest.length > 0 ? (
            <Reveal direction="up" delay={motion.stagger}>
              <div className="brutal-border rounded-card bg-surface p-6 shadow-brutal sm:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="heading-underline" aria-hidden="true" />
                  <h3 className="text-sm font-extrabold uppercase tracking-[0.18em]">
                    The long version
                  </h3>
                </div>

                <div className="flex flex-col gap-4 text-base leading-relaxed font-medium tracking-tight sm:text-lg">
                  {rest.map((paragraph, index) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

import { Button } from "@/components/ui/Button";
import { ProfileImage } from "@/components/ProfileImage";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/Section";
import { StatTile } from "@/components/ui/StatTile";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { stats } from "@/data/stats";
import { motion } from "@/lib/constants";

/**
 * Above-the-fold hero: name, positioning line, two calls to action and the
 * stat tiles. The heading is assembled from the data file so the highlighted
 * word can be swapped without touching markup.
 *
 * The hero is the one place that does not wait for a scroll: it is already on
 * screen, so its reveal sequence plays on load against a fixed timeline in
 * `motion.hero` rather than against scroll position.
 */
export function Hero() {
  const { hero } = site;

  return (
    <Section id="top" className="pt-8 sm:pt-24">
      {/* Text and photo sit side by side from lg, photo stacks below on mobile.
          The gaps step up rather than staying at one large value, because a
          single 40px gap is a big slice of a 844px-tall phone screen. */}
      <div className="flex flex-col items-start gap-6 sm:gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex flex-1 flex-col items-start gap-5 sm:gap-8">
          <Reveal direction="up" delay={motion.hero.eyebrow}>
            <p className="brutal-pill brutal-border bg-periwinkle px-4 py-1.5 text-sm font-extrabold tracking-tight">
              {hero.eyebrow}
            </p>
          </Reveal>

          {/* Tight tracking (-0.03em) applied to the hero heading only.
              `data-hero-pop` is the opt-in trigger for the "talk." overshoot
              in globals.css; --hero-pop-delay lines it up with the timeline. */}
          <Reveal
            direction="up"
            delay={motion.hero.heading}
            data-hero-pop
            style={{ "--hero-pop-delay": `${motion.hero.highlight}ms` }}
          >
            <h1 className="max-w-4xl text-4xl leading-[1.05] font-black tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-7xl">
              {hero.greeting}{" "}
              {/* The name gets its own serif face and violet colour so it reads
                  as a signature inside the heading. */}
              <span className="font-name text-violet">{hero.name}</span>{" "}
              {hero.preHighlight}{" "}
              {/* Rotated orange-red block, defined in globals.css. */}
              <span className="hero-highlight">{hero.highlight}</span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={motion.hero.intro}>
            <p className="max-w-2xl text-base leading-relaxed font-medium tracking-tight sm:text-xl">
              {hero.intro}
            </p>
          </Reveal>

          <Reveal direction="up" delay={motion.hero.actions}>
            <div className="flex flex-wrap gap-4">
              <Button href={hero.primaryAction.href} variant="primary">
                {hero.primaryAction.label}
              </Button>
              <Button href={hero.secondaryAction.href} variant="secondary">
                {hero.secondaryAction.label}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal direction="right" delay={motion.hero.photo}>
          {/*
            The outer div only reserves the box; the rotation, border and shadow
            live on the inner frame so the sticker badge (positioned outside the
            photo) is not clipped by the frame's overflow-hidden.
          */}
          <div className="relative size-44 shrink-0 sm:size-56 lg:size-64">
            <div className="absolute inset-0 rotate-2 overflow-hidden rounded-[20px] border-[3px] border-fg bg-mint shadow-brutal">
              {/* Above the fold, so it is preloaded rather than lazy-loaded. */}
              <ProfileImage
                asset={profile.heroImage}
                sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 256px"
                preload
              />
            </div>

            {/* Sticker badge, counter-rotated so it reads as deliberately askew.
                Nudged inward on mobile: at -left-4 it hung only 3px from the
                viewport edge once the photo shrank to size-40. */}
            <span className="brutal-pill brutal-border absolute -bottom-4 -left-2 z-10 rotate-[-3deg] bg-accent px-3 py-1.5 text-xs font-extrabold text-accent-ink shadow-brutal sm:-left-4 sm:text-sm">
              {profile.heroBadge}
            </span>
          </div>
        </Reveal>
      </div>

      {/* Mobile-first: 2 columns, then 4. One column stacked four 108px cards
          into 492px of scroll before any number was visible; two columns halve
          that and the values still fit. A definition list because each tile is
          a label/value pair; StatTile supplies the <dt>/<dd> pair. */}
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:mt-20 lg:grid-cols-4">
        {stats.map((stat, index) => (
          /* StatTile renders its own <Reveal> because its card has to *be* the
             <dl>'s direct child — a wrapper here would break the dl markup. */
          <StatTile
            key={stat.id}
            stat={stat}
            delay={motion.hero.stats + index * motion.stagger}
          />
        ))}
      </dl>
    </Section>
  );
}

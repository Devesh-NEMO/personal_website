import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { cardSurface } from "@/lib/tone";
import type { Stat } from "@/types";

type StatTileProps = {
  stat: Stat;
  /**
   * Matches the stagger on the surrounding grid, so the number starts counting
   * at the same moment its tile begins to fade up. Defaults to no delay, which
   * is what a standalone tile wants.
   */
  delay?: number;
};

/**
 * A single hero statistic: big value over a short label, on its own card so the
 * number carries the visual weight.
 *
 * Rendered as a <dt>/<dd> pair because the parent is a definition list. The
 * <dt> (label) comes first in the DOM for correct screen-reader order; the tile
 * flips it with `flex-col-reverse` so the number still sits on top visually.
 *
 * Note the absence of <Card>. Definition lists only tolerate a *single* <div>
 * between the <dl> and its <dt>/<dd> pair — putting a <Card> inside a separate
 * <Reveal> wrapper would nest two divs and fail the `definition-list` and
 * `dlitem` checks. So <Reveal> is the card here, styled from the shared
 * `cardSurface()` that <Card> also uses, which keeps the two identical.
 */
export function StatTile({ stat, delay = 0 }: StatTileProps) {
  return (
    <Reveal
      as="div"
      delay={delay}
      className={cn(
        cardSurface(stat.tone),
        "flex h-full flex-col-reverse justify-between gap-1 px-4 py-5 sm:px-5 sm:py-6",
      )}
    >
      <dt className="text-sm font-bold tracking-tight">{stat.label}</dt>
      {/* The figure is display type, not prose, so it takes the heading face. */}
      <dd className="font-display text-3xl font-black leading-none tracking-tight sm:text-4xl">
        <CountUp value={stat.value} delay={delay} />
      </dd>
    </Reveal>
  );
}

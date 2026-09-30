import { site } from "@/data/site";

/**
 * How many times the item sequence is repeated to fill one marquee run.
 *
 * The loop is seamless because the track holds two identical runs and slides by
 * exactly half of its own width. That only works while a single run is at least
 * as wide as the viewport, and CSS cannot know how wide its own text is at
 * author time — so the content is repeated instead, and this is the number that
 * decides how far it has to go.
 *
 * Six passes of the five-item sequence measures roughly 3600px, which covers any
 * display this site will realistically be seen on. Raise it if you lengthen
 * `site.marquee.items` substantially; if the strip ever shows a gap on the right
 * at very wide viewports, this is the number that is too low.
 */
const REPEATS = 6;

/**
 * The scrolling skills strip between the hero and the about section.
 *
 * A server component: the whole thing is one CSS animation on `transform`, so
 * it ships no JavaScript and works with the page's animations switched off.
 *
 * The three nested elements are load-bearing, not decoration — the band is
 * exactly one viewport wide while only the track inside it is allowed to
 * overflow, because a rotated element's bounding box grows with its width and
 * clipping a 3000px-wide band to its own height would cut the text in half. See
 * the comment in globals.css before restructuring this.
 *
 * The visible strip is `aria-hidden`, because a marquee announced six times
 * over is worse than no marquee at all. What assistive tech gets instead is a
 * single `sr-only` list of the same words, which is the part that carries
 * meaning.
 */
export function Marquee() {
  const { items, separator } = site.marquee;

  // Trailing separator, so the join between repeats reads the same as the joins
  // inside a repeat — otherwise the seam shows up as a wider gap.
  const run = `${items.join(` ${separator} `)} ${separator} `.repeat(REPEATS);

  return (
    <div className="marquee">
      <span className="sr-only">{`Skills and tools: ${items.join(", ")}.`}</span>

      <div className="marquee-band">
        <div className="marquee-track" aria-hidden="true">
          <span className="marquee-run">{run}</span>
          <span className="marquee-run">{run}</span>
        </div>
      </div>
    </div>
  );
}

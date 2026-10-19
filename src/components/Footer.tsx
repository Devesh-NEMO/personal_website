import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

/**
 * Site footer.
 *
 * Deliberately minimal: a single row over one rule — the wordmark, the
 * copyright and the back-to-top link. Nothing here competes with the contact
 * card above it.
 */
export function Footer() {
  return (
    <footer className="border-t-[3px] border-fg px-5 py-10 sm:px-8">
      <Reveal
        direction="none"
        className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left"
      >
        <p className="text-lg font-black tracking-tight">
          {site.shortTitle}
          <span className="text-accent">.</span>
        </p>

        <p className="text-sm font-medium tracking-tight opacity-70">{site.copyright}</p>

        <a
          href="#top"
          className="text-sm font-extrabold tracking-tight underline decoration-[3px] underline-offset-4 transition-colors hover:decoration-accent"
        >
          Back to top ↑
        </a>
      </Reveal>
    </footer>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

/** Site footer: copyright line plus a back-to-top link. */
export function Footer() {
  return (
    <footer className="border-t-[3px] border-fg px-5 py-10 sm:px-8">
      {/* `none` is a plain fade — the brief asks for no movement down here. */}
      <Reveal
        direction="none"
        className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row"
      >
        <p className="text-sm font-bold tracking-tight">{site.copyright}</p>

        <a
          href="#top"
          className="text-sm font-extrabold tracking-tight underline decoration-[3px] underline-offset-4 transition-colors hover:decoration-accent"
        >
          Back to top
        </a>
      </Reveal>
    </footer>
  );
}

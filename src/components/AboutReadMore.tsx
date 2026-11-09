"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * The long-form bio, collapsed behind a "Read more" disclosure.
 *
 * The paragraph area has the same fixed height in both states, so clicking
 * "Read more" never resizes the card or shifts the page. Collapsed it shows
 * the first paragraph; expanded the remaining paragraphs are revealed inside
 * that same box and reached by scrolling it internally.
 */
export function AboutReadMore({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();
  const hasMore = paragraphs.length > 1;
  const visible = expanded ? paragraphs : paragraphs.slice(0, 1);

  return (
    <div className="flex flex-col gap-5">
      <div
        id={regionId}
        className="flex h-56 flex-col gap-4 overflow-y-auto overscroll-contain pr-2 text-base leading-relaxed font-medium tracking-tight touch-pan-y [scrollbar-color:var(--fg)_transparent] [scrollbar-width:thin] sm:h-60 sm:text-lg"
      >
        {visible.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>

      {hasMore ? (
        <div>
          <Button
            variant="secondary"
            className="px-5 py-2 text-sm"
            onClick={() => setExpanded((value) => !value)}
            ariaExpanded={expanded}
            ariaControls={regionId}
          >
            {expanded ? "Show less" : "Read more"}
            <svg
              aria-hidden="true"
              className={`size-4 transition-transform duration-150 ${
                expanded ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

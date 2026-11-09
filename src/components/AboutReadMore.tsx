"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * The long-form bio, collapsed behind a "Read more" disclosure.
 *
 * Collapsed it shows only the first paragraph, so the About section keeps a
 * predictable height no matter how much copy is stored. Expanded, every
 * paragraph sits inside a fixed-height scroll area: the card grows to a
 * comfortable ceiling and the copy scrolls internally instead of stretching
 * the page.
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
        className={[
          "flex flex-col gap-4 text-base leading-relaxed font-medium tracking-tight sm:text-lg",
          expanded
            ? "max-h-80 overflow-y-auto overscroll-contain pr-2"
            : "",
        ].join(" ")}
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

"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * The long-form bio, collapsed behind a "Read more" disclosure.
 * 
 * All paragraphs are always rendered in the DOM. The box has a fixed smaller
 * height when collapsed and expands to a comfortable fixed reading height when
 * expanded, with internal scrolling in both states so the card never grows.
 */
export function AboutReadMore({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();
  const hasMore = paragraphs.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <div
        id={regionId}
        className={[
          "flex flex-col gap-4 text-base leading-relaxed font-medium tracking-tight sm:text-lg",
          "overflow-y-scroll overscroll-none pr-3 touch-pan-y transition-all duration-300",
          "isolate will-change-scroll",
          "[scrollbar-width:auto]",
          "[scrollbar-color:var(--fg)_var(--surface)]",
          "[&::-webkit-scrollbar]:w-3",
          "[&::-webkit-scrollbar-track]:bg-surface [&::-webkit-scrollbar-track]:border [&::-webkit-scrollbar-track]:border-fg/20",
          "[&::-webkit-scrollbar-thumb]:bg-fg [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-fg [&::-webkit-scrollbar-thumb]:rounded-md",
          "[&::-webkit-scrollbar-thumb]:hover:bg-accent",
          expanded ? "h-60 sm:h-72" : "h-32 sm:h-36",
        ].join(" ")}
        onWheel={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const element = e.currentTarget;
          element.scrollTop += e.deltaY;
        }}
      >
        {paragraphs.map((paragraph, index) => (
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

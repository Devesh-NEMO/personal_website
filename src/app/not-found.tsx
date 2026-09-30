import type { Metadata } from "next";

import { Section } from "@/components/Section";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Custom 404 page.
 *
 * Neo-brutalist card centred on the animated background: giant "404" in weight
 * 900, with the "0" replaced by an empty data table icon, a "missing data point"
 * heading, two buttons, and a decorative query-result table showing "NULL" in
 * the last column.
 *
 * Two shapes borrowed from the background set dress the card — shapes.ts ids
 * are passed in from site.notFound.shapeIds, so a visitor recognises the same
 * silhouettes they saw on the home page.
 */

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  const { notFound } = site;

  return (
    <Section id="not-found" className="flex min-h-[80vh] items-center justify-center">
      <div className="brutal-border relative mx-auto flex w-full max-w-2xl flex-col gap-8 overflow-hidden rounded-card bg-peach px-8 py-16 text-center shadow-brutal sm:px-12 sm:py-20">
        {/* Shapes positioned absolutely, z-index below text. */}
        <NotFoundShapes ids={notFound.shapeIds} />

        {/* The giant 404, with the first "0" replaced by an icon. */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-8xl font-black leading-none tracking-tighter sm:text-9xl">
          <span>4</span>
          <EmptyTableIcon className="size-20 sm:size-24" />
          <span>4</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {notFound.title}
          </h1>
          <p className="mx-auto max-w-md text-base font-medium leading-relaxed tracking-tight sm:text-lg">
            {notFound.body}
          </p>
        </div>

        {/* The decorative table. */}
        <QueryResultTable
          caption={notFound.table.caption}
          columns={notFound.table.columns}
          rows={notFound.table.rows}
        />

        <div className="relative z-10 flex flex-wrap justify-center gap-4">
          <Button href={notFound.primaryAction.href} variant="primary">
            {notFound.primaryAction.label}
          </Button>
          <Button href={notFound.secondaryAction.href} variant="secondary">
            {notFound.secondaryAction.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/**
 * Two shapes from the floating background set, absolutely positioned behind the
 * 404 text. Ids are data-driven so the exact pair can be edited in site.ts
 * without touching this component.
 */
function NotFoundShapes({ ids }: { ids: string[] }) {
  // Imported here rather than module-scope, so the 404 bundle does not include
  // every shape the page doesn't use.
  const { backgroundShapes } = require("@/data/shapes") as typeof import("@/data/shapes");

  const shapes = ids
    .map((id) => backgroundShapes.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  if (shapes.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {shapes.map((shape, index) => (
        <div
          key={shape.id}
          className="deco-shape absolute opacity-20"
          data-kind={shape.kind}
          data-tone={shape.tone}
          style={{
            ...(index === 0
              ? { top: "8%", left: "4%", width: 80, height: 80 }
              : { bottom: "12%", right: "6%", width: 96, height: 96 }),
            ["--size" as string]: `${index === 0 ? 80 : 96}px`,
            ["--rotate" as string]: `${shape.rotate}deg`,
          }}
        >
          <div className="deco-float" style={{ animation: "none" }}>
            {shape.kind === "squiggle" ? (
              <svg className="deco-squiggle" viewBox="0 0 120 120" aria-hidden="true">
                <path d="M10 76 C 28 24, 48 24, 64 58 S 94 98, 112 44" />
                <path d="M10 76 C 28 24, 48 24, 64 58 S 94 98, 112 44" />
              </svg>
            ) : (
              <div className="deco-body" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * An empty database table icon — the "0" replacement in "404".
 *
 * Three horizontal rows with a 3px border, the middle row crossed out, rendered
 * inline so the stroke colour is currentColor and follows the text.
 */
function EmptyTableIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="8" />
      <line x1="10" y1="35" x2="90" y2="35" />
      <line x1="10" y1="65" x2="90" y2="65" />
      <line x1="25" y1="50" x2="75" y2="50" />
      <line x1="30" y1="45" x2="70" y2="55" />
    </svg>
  );
}

/**
 * The decorative query-result table showing "page | status | NULL".
 *
 * A real `<table>` with a visually hidden caption, so a screen reader announces
 * it as intended decoration rather than an unlabelled grid. Deliberately tiny
 * (12px type) and set in the body face, so it reads as a snippet rather than
 * competing with the heading.
 */
function QueryResultTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="relative z-10 mx-auto">
      <table className="brutal-border mx-auto rounded-card bg-surface text-xs font-mono shadow-brutal">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-[3px] border-fg">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left font-extrabold uppercase tracking-wide">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-4 py-2 font-semibold",
                    cell === "NULL" && "italic opacity-60",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

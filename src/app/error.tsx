"use client";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/Section";
import { site } from "@/data/site";

/**
 * Error boundary.
 *
 * Renders when something throws during a section's render. The `reset` callback
 * attempts a re-render, which works for transient failures (a network timeout,
 * say) and does nothing if the error is persistent — in which case the console
 * has the full trace and the visitor has an escape route.
 *
 * Must be a client component because it reads `reset()`, which is a function.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { errorPage } = site;

  return (
    <Section id="error" className="flex min-h-[80vh] items-center justify-center">
      <div className="brutal-border mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-card bg-pink px-8 py-16 text-center shadow-brutal sm:px-12 sm:py-20">
        {/* Giant broken-chart icon in place of an error code. */}
        <BrokenChartIcon className="mx-auto size-24 sm:size-32" />

        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {errorPage.title}
          </h1>
          <p className="mx-auto max-w-md text-base font-medium leading-relaxed tracking-tight sm:text-lg">
            {errorPage.body}
          </p>
          {error.digest && (
            <p className="text-sm font-mono opacity-60">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={reset} variant="primary">
            {errorPage.retryLabel}
          </Button>
          <Button href={errorPage.homeAction.href} variant="secondary">
            {errorPage.homeAction.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/**
 * A broken line chart — three dots connected by lines, with a broken segment
 * marked by an X.
 */
function BrokenChartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Axes */}
      <line x1="15" y1="15" x2="15" y2="85" />
      <line x1="15" y1="85" x2="85" y2="85" />
      
      {/* Data points */}
      <circle cx="25" cy="60" r="4" fill="currentColor" />
      <circle cx="50" cy="35" r="4" fill="currentColor" />
      <circle cx="75" cy="50" r="4" fill="currentColor" />
      
      {/* Lines between points, with a break */}
      <line x1="25" y1="60" x2="45" y2="40" />
      <line x1="55" y1="38" x2="75" y2="50" />
      
      {/* X marking the broken segment */}
      <line x1="46" y1="36" x2="54" y2="44" strokeWidth="4" />
      <line x1="54" y1="36" x2="46" y2="44" strokeWidth="4" />
    </svg>
  );
}

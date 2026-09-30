import { Section } from "@/components/Section";

/**
 * Loading placeholder — skeleton loaders matching the page structure.
 *
 * Rendered by Next.js while a route segment is loading. The real page is a
 * single static export, so this is almost never seen in production — it exists
 * for the case where someone is waiting on a slow connection or a CDN cache
 * miss, and as a fallback if the build is configured for dynamic rendering.
 *
 * Three brutal-bordered blocks with a pulse animation: one for the hero, one
 * for the card grid, and one for the stat tiles. Each matches the layout it
 * stands in for, so the shift when the real content arrives is minimal.
 */
export default function LoadingPage() {
  return (
    <>
      {/* Hero skeleton */}
      <Section id="loading-hero">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <div className="skeleton h-6 w-48 rounded-card" />
            <div className="skeleton h-24 w-full rounded-card sm:h-32" />
            <div className="skeleton h-20 w-full rounded-card" />
            <div className="flex gap-4">
              <div className="skeleton h-12 w-32 rounded-card" />
              <div className="skeleton h-12 w-32 rounded-card" />
            </div>
          </div>
          <div className="skeleton aspect-square w-full rounded-card lg:aspect-auto lg:h-full" />
        </div>
      </Section>

      {/* Card grid skeleton */}
      <Section id="loading-projects">
        <div className="mb-12 space-y-4">
          <div className="skeleton h-8 w-48 rounded-card" />
          <div className="skeleton h-2 w-14 rounded-card" />
        </div>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton flex flex-col gap-4 rounded-card p-6">
              <div className="skeleton h-6 w-3/4 rounded-card" />
              <div className="skeleton h-20 w-full rounded-card" />
              <div className="skeleton h-4 w-full rounded-card" />
              <div className="skeleton h-4 w-5/6 rounded-card" />
            </div>
          ))}
        </div>
      </Section>

      {/* Stat tiles skeleton */}
      <Section id="loading-stats">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-card" />
          ))}
        </div>
      </Section>
    </>
  );
}

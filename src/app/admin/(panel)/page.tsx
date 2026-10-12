import Link from "next/link";
import { connection } from "next/server";

import { getCounts } from "@/lib/admin-data";
import { cn } from "@/lib/cn";

/** Admin navigations block on the server (see the `(panel)` layout). */
export const instant = false;

/**
 * Dashboard: a connection status banner and quick links with counts.
 *
 * Counts are read live (not cached) so the admin always sees the true state.
 */
export default async function AdminDashboardPage() {
  // Live DB reads are per-request. `connection()` marks the segment dynamic so
  // Next does not attempt to prerender it (the Mongo driver touches `new Date()`,
  // which is not allowed while prerendering).
  await connection();
  const counts = await getCounts();

  const cards = [
    { href: "/admin/projects", label: "Projects", value: counts.projects },
    { href: "/admin/skills", label: "Skill groups", value: counts.skills },
    { href: "/admin/stats", label: "Stats", value: counts.stats },
    { href: "/admin/messages", label: "Messages", value: counts.messages, badge: counts.unread },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          Edit the content that appears on the public site.
        </p>
      </header>

      {counts.connected ? null : (
        <div className="brutal-border rounded-card bg-pink p-5 shadow-brutal">
          <p className="font-extrabold tracking-tight">Database unreachable</p>
          <p className="mt-1 text-sm font-medium tracking-tight">
            The public site is serving its <code>src/data</code> fallback. Check{" "}
            <code>MONGODB_URI</code> and the Atlas network allowlist. Counts and saves will not work
            until the connection is restored.
          </p>
        </div>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className={cn(
                "brutal-border rounded-card flex items-center justify-between gap-3 bg-surface p-5 shadow-brutal",
                "transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-mint",
              )}
            >
              <span className="font-extrabold tracking-tight">{card.label}</span>
              <span className="flex items-center gap-2">
                {card.badge ? (
                  <span className="brutal-pill brutal-border bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-ink">
                    {card.badge} new
                  </span>
                ) : null}
                <span className="text-lg font-black tracking-tight">{card.value}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

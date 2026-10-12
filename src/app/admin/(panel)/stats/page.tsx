import Link from "next/link";

import { deleteStatAction } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatForm } from "@/components/admin/ListForms";
import { cn } from "@/lib/cn";
import { getStats } from "@/lib/content";

/** Admin navigations block on the server (see the `(panel)` layout). */
export const instant = false;

/** Stats manager: the hero's stat tiles, list plus create/edit form. */
export default async function StatsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [stats, { edit }] = await Promise.all([getStats(), searchParams]);
  const editing = edit ? stats.find((stat) => stat.id === edit) : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Stats</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          The figures shown beside the hero.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black tracking-tight">
          All stats <span className="text-fg/60">({stats.length})</span>
        </h2>

        {stats.length === 0 ? (
          <p className="text-sm font-medium text-fg/70">No stats yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stats.map((stat) => (
              <li
                key={stat.id}
                className="brutal-border rounded-card flex flex-wrap items-center justify-between gap-3 bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold tracking-tight">
                    {stat.value} — {stat.label}
                  </p>
                  <p className="truncate text-xs font-medium text-fg/60">{stat.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/stats?edit=${stat.id}`}
                    className={cn(
                      "brutal-pill brutal-border bg-mint px-3.5 py-1.5 text-sm font-extrabold tracking-tight",
                      "transition-colors duration-150 hover:bg-accent hover:text-accent-ink",
                    )}
                  >
                    Edit
                  </Link>
                  <ConfirmDialog
                    action={deleteStatAction}
                    fields={{ id: stat.id }}
                    title="Delete stat?"
                    body={`“${stat.label}” will be removed from the public site immediately.`}
                    triggerLabel="Delete"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight">
            {editing ? `Edit “${editing.label}”` : "New stat"}
          </h2>
          {editing ? (
            <Link href="/admin/stats" className="text-sm font-bold underline">
              Cancel edit
            </Link>
          ) : null}
        </div>

        <div className="brutal-border rounded-card bg-surface p-6 shadow-brutal">
          <StatForm key={editing?.id ?? "new"} stat={editing} />
        </div>
      </section>
    </div>
  );
}

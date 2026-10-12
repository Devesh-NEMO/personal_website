import Link from "next/link";

import { deleteSkillGroupAction } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SkillGroupForm } from "@/components/admin/ListForms";
import { cn } from "@/lib/cn";
import { getSkillGroups } from "@/lib/content";

/** Admin navigations block on the server (see the `(panel)` layout). */
export const instant = false;

/** Skills manager: list plus create/edit form, keyed by `?edit=<id>`. */
export default async function SkillsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [groups, { edit }] = await Promise.all([getSkillGroups(), searchParams]);
  const editing = edit ? groups.find((group) => group.id === edit) : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Skills</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          The grouped skill cards in the Skills section.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black tracking-tight">
          All groups <span className="text-fg/60">({groups.length})</span>
        </h2>

        {groups.length === 0 ? (
          <p className="text-sm font-medium text-fg/70">No skill groups yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {groups.map((group) => (
              <li
                key={group.id}
                className="brutal-border rounded-card flex flex-wrap items-center justify-between gap-3 bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold tracking-tight">{group.title}</p>
                  <p className="truncate text-xs font-medium text-fg/60">
                    {group.items.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/skills?edit=${group.id}`}
                    className={cn(
                      "brutal-pill brutal-border bg-mint px-3.5 py-1.5 text-sm font-extrabold tracking-tight",
                      "transition-colors duration-150 hover:bg-accent hover:text-accent-ink",
                    )}
                  >
                    Edit
                  </Link>
                  <ConfirmDialog
                    action={deleteSkillGroupAction}
                    fields={{ id: group.id }}
                    title="Delete skill group?"
                    body={`“${group.title}” will be removed from the public site immediately.`}
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
            {editing ? `Edit “${editing.title}”` : "New skill group"}
          </h2>
          {editing ? (
            <Link href="/admin/skills" className="text-sm font-bold underline">
              Cancel edit
            </Link>
          ) : null}
        </div>

        <div className="brutal-border rounded-card bg-surface p-6 shadow-brutal">
          <SkillGroupForm key={editing?.id ?? "new"} group={editing} />
        </div>
      </section>
    </div>
  );
}

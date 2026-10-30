import Link from "next/link";

import { deleteProjectAction } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { cn } from "@/lib/cn";
import { getProjects } from "@/lib/content";

/**
 * Admin pages are allowed to block on the server. `instant = false` is set on
 * every admin page, not just the `(panel)` layout: the layout only opts out
 * navigations *into* /admin from outside, while navigations between admin pages
 * are validated per-segment.
 */
export const instant = false;

/** How many of the lowest priorities the home page shows. */
const HOME_SLOTS = 6;

/** "12 Mar 2026" — the date the project was first added. */
const addedFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Projects manager: the list plus a create/edit form. `?edit=<id>` switches the
 * form into edit mode; without it the form creates a new project.
 */
export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [projects, { edit }] = await Promise.all([getProjects(), searchParams]);
  const editing = edit ? projects.find((project) => project.id === edit) : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Projects</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          The case studies in the Work section.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight">
            All projects <span className="text-fg/60">({projects.length})</span>
          </h2>
          <p className="mt-1 text-sm font-medium tracking-tight text-fg/70">
            The lowest {HOME_SLOTS} priorities appear on the home page; the rest sit
            behind “See more”.
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm font-medium text-fg/70">No projects yet. Create one below.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {projects.map((project, index) => {
              const onHomePage = index < HOME_SLOTS;

              return (
                <li
                  key={project.id}
                  className="brutal-border rounded-card flex flex-wrap items-center justify-between gap-3 bg-surface p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* The number does the sorting, so it is the first thing
                        the eye should land on in the row. */}
                    <span
                      className={cn(
                        "brutal-pill brutal-border inline-flex min-w-11 shrink-0 justify-center px-2 py-1 text-sm font-extrabold tracking-tight",
                        onHomePage ? "bg-periwinkle" : "bg-bg",
                      )}
                      title={`Priority ${project.priority ?? "unset"}`}
                    >
                      <span className="sr-only">Priority </span>
                      <span aria-hidden="true">#</span>
                      {project.priority ?? "—"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-extrabold tracking-tight">{project.title}</p>
                      <p className="truncate text-xs font-medium text-fg/60">
                        {project.createdAt
                          ? `Added ${addedFormat.format(project.createdAt)}`
                          : project.id}
                        {onHomePage ? " · On the home page" : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects?edit=${project.id}`}
                      className={cn(
                        "brutal-pill brutal-border bg-mint px-3.5 py-1.5 text-sm font-extrabold tracking-tight",
                        "transition-colors duration-150 hover:bg-accent hover:text-accent-ink",
                      )}
                    >
                      Edit
                    </Link>
                    <ConfirmDialog
                      action={deleteProjectAction}
                      fields={{ id: project.id }}
                      title="Delete project?"
                      body={`“${project.title}” will be removed from the public site immediately.`}
                      triggerLabel="Delete"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="new-project" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight">
            {editing ? `Edit “${editing.title}”` : "New project"}
          </h2>
          {editing ? (
            /* Goes straight to the empty form instead of reloading the page. */
            <Link
              href="/admin/projects#new-project"
              className="brutal-pill brutal-border inline-flex items-center gap-1.5 bg-mint px-3.5 py-1.5 text-sm font-extrabold tracking-tight transition-colors duration-150 hover:bg-accent hover:text-accent-ink"
            >
              <span aria-hidden="true">+</span> New project
            </Link>
          ) : null}
        </div>

        <div className="brutal-border rounded-card bg-surface p-6 shadow-brutal">
          {/* `key` remounts the form when switching between create/edit so the
              uncontrolled inputs pick up the new defaults. */}
          <ProjectForm key={editing?.id ?? "new"} project={editing} />
        </div>
      </section>
    </div>
  );
}

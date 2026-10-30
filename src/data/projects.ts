import type { Project } from "@/types";

/**
 * Fallback case studies, used only when MongoDB is unreachable or empty.
 *
 * Intentionally empty: real projects live in the database and are managed from
 * the admin panel. The template's placeholder rows used to sit here, which
 * meant they reappeared on the public site whenever the database could not be
 * reached — confusing, because they look like real work.
 *
 * Adding a project: do it in /admin/projects, not here.
 */
export const projects: Project[] = [];

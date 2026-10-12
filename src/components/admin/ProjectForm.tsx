"use client";

import { useActionState } from "react";

import { saveProjectAction } from "@/app/admin/actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TagInput } from "@/components/admin/TagInput";
import { Textarea } from "@/components/admin/Textarea";
import { ToneSelect } from "@/components/admin/ToneSelect";
import { idleFormState, type FormState } from "@/lib/form-state";
import type { Project } from "@/types";

/**
 * Create/edit form for a project. Pass `project` to edit — the id becomes
 * read-only because it is the row's key.
 */
export function ProjectForm({ project }: { project?: Project }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveProjectAction,
    idleFormState,
  );
  const editing = Boolean(project);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="ID (slug)"
          htmlFor="project-id"
          required
          hint="Lowercase letters, numbers and dashes. The row's key; cannot change later."
          error={err("id")}
        >
          <Input
            id="project-id"
            name="id"
            defaultValue={project?.id}
            readOnly={editing}
            required
            pattern="[a-z0-9-]+"
            className={editing ? "opacity-70" : undefined}
          />
        </Field>

        <Field label="Title" htmlFor="project-title" required error={err("title")}>
          <Input id="project-title" name="title" defaultValue={project?.title} required />
        </Field>
      </div>

      <Field label="Description" htmlFor="project-description" required error={err("description")}>
        <Textarea
          id="project-description"
          name="description"
          defaultValue={project?.description}
          rows={3}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Outcome 1" htmlFor="project-result-0" error={err("results")}>
          <Textarea id="project-result-0" name="results" defaultValue={project?.results[0]} rows={2} />
        </Field>
        <Field label="Outcome 2" htmlFor="project-result-1">
          <Textarea id="project-result-1" name="results" defaultValue={project?.results[1]} rows={2} />
        </Field>
      </div>

      <Field label="Tags" hint="Short tech labels, e.g. SQL, Python, dbt.">
        <TagInput name="tags" defaultValue={project?.tags} placeholder="Add a tag…" />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Link" htmlFor="project-href" hint="Where the card points. May be empty." error={err("href")}>
          <Input id="project-href" name="href" defaultValue={project?.href} placeholder="https://… or #" />
        </Field>
        <Field label="Card colour" htmlFor="project-tone">
          <ToneSelect id="project-tone" defaultValue={project?.tone} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Image path"
          htmlFor="project-image"
          hint="Optional, e.g. /images/projects/foo.png. Leave empty for no thumbnail."
        >
          <Input id="project-image" name="image" defaultValue={project?.image} />
        </Field>
        <Field label="Image alt" htmlFor="project-image-alt">
          <Input id="project-image-alt" name="imageAlt" defaultValue={project?.imageAlt} />
        </Field>
      </div>

      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <div>
        <SubmitButton pendingLabel="Saving…">
          {editing ? "Save changes" : "Create project"}
        </SubmitButton>
      </div>

      {/* `pending` is unused here but keeps the hook contract explicit. */}
      <span className="sr-only" aria-live="polite">
        {pending ? "Saving" : ""}
      </span>
    </form>
  );
}

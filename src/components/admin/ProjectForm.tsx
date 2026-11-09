"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveProjectAction } from "@/app/admin/actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
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
        <Field label="Live Link" htmlFor="project-href" hint="Where the live project card points." error={err("href")}>
          <Input id="project-href" name="href" defaultValue={project?.href} placeholder="https://…" />
        </Field>
        <Field label="GitHub Repo Link" htmlFor="project-github" hint="Optional GitHub repository URL." error={err("githubHref")}>
          <Input id="project-github" name="githubHref" defaultValue={project?.githubHref} placeholder="https://github.com/…" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Card colour" htmlFor="project-tone">
          <ToneSelect id="project-tone" defaultValue={project?.tone} />
        </Field>
      </div>

      <Field
        label="Priority"
        htmlFor="project-priority"
        hint="1–6 appear on the home page. Everything above 6 lives on the “See more” page. Lowest number shows first."
        error={err("priority")}
      >
        <Input
          id="project-priority"
          name="priority"
          type="number"
          min={1}
          max={999}
          step={1}
          inputMode="numeric"
          defaultValue={project?.priority ?? ""}
          placeholder="Next free number"
          className="max-w-40"
        />
      </Field>

      <MultiImageUploader
        label="Project images"
        hint="Upload 2-4 images (JPG, PNG, WebP, GIF, AVIF or SVG). The first is the card cover; visitors swipe through the rest."
        name="imagesJson"
        folder="portfolio/projects"
        max={4}
        error={err("images")}
        initialImages={
          project?.images && project.images.length > 0
            ? project.images
            : project?.image
              ? [{ src: project.image, alt: project.imageAlt, publicId: project.imagePublicId }]
              : []
        }
      />

      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving…">
          {editing ? "Save changes" : "Create project"}
        </SubmitButton>

        {/* While editing, this is the way out that does not involve saving the
            project first: it switches the page back to create mode. */}
        {editing ? (
          <Link
            href="/admin/projects#new-project"
            className={
              "brutal-pill brutal-border inline-flex items-center justify-center gap-2 bg-surface px-6 py-3 " +
              "text-base font-extrabold tracking-tight shadow-brutal " +
              "transition-[transform,box-shadow,background-color] duration-150 " +
              "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-peach hover:shadow-brutal-lg " +
              "active:translate-x-0 active:translate-y-0 active:shadow-none"
            }
          >
            <span aria-hidden="true">+</span> New project
          </Link>
        ) : null}
      </div>

      {/* `pending` is unused here but keeps the hook contract explicit. */}
      <span className="sr-only" aria-live="polite">
        {pending ? "Saving" : ""}
      </span>
    </form>
  );
}

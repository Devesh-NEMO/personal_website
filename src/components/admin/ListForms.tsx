"use client";

import { useActionState } from "react";

import { saveSkillGroupAction, saveStatAction } from "@/app/admin/actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TagInput } from "@/components/admin/TagInput";
import { ToneSelect } from "@/components/admin/ToneSelect";
import { idleFormState, type FormState } from "@/lib/form-state";
import type { SkillGroup, Stat } from "@/types";

/**
 * Forms for the two simple list entities. They live together because they
 * share almost all of their shape — one has `items`, the other a `value`.
 */

export function SkillGroupForm({ group }: { group?: SkillGroup }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveSkillGroupAction,
    idleFormState,
  );
  const editing = Boolean(group);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="ID (slug)"
          htmlFor="skill-id"
          required
          hint="Lowercase letters, numbers and dashes."
          error={err("id")}
        >
          <Input
            id="skill-id"
            name="id"
            defaultValue={group?.id}
            readOnly={editing}
            required
            pattern="[a-z0-9-]+"
            className={editing ? "opacity-70" : undefined}
          />
        </Field>
        <Field label="Title" htmlFor="skill-title" required error={err("title")}>
          <Input id="skill-title" name="title" defaultValue={group?.title} required />
        </Field>
      </div>

      <Field label="Skills" hint="Press Enter after each one." error={err("items")}>
        <TagInput name="items" defaultValue={group?.items} placeholder="Add a skill…" />
      </Field>

      <Field label="Card colour" htmlFor="skill-tone">
        <ToneSelect id="skill-tone" defaultValue={group?.tone} />
      </Field>

      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <div>
        <SubmitButton pendingLabel="Saving…">
          {editing ? "Save changes" : "Create skill group"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function StatForm({ stat }: { stat?: Stat }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveStatAction, idleFormState);
  const editing = Boolean(stat);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="ID (slug)"
          htmlFor="stat-id"
          required
          hint="Lowercase letters, numbers and dashes."
          error={err("id")}
        >
          <Input
            id="stat-id"
            name="id"
            defaultValue={stat?.id}
            readOnly={editing}
            required
            pattern="[a-z0-9-]+"
            className={editing ? "opacity-70" : undefined}
          />
        </Field>
        <Field label="Label" htmlFor="stat-label" required error={err("label")}>
          <Input id="stat-label" name="label" defaultValue={stat?.label} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Value" htmlFor="stat-value" required error={err("value")}>
          <Input id="stat-value" name="value" defaultValue={stat?.value} required />
        </Field>
        <Field label="Card colour" htmlFor="stat-tone">
          <ToneSelect id="stat-tone" defaultValue={stat?.tone} />
        </Field>
      </div>

      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <div>
        <SubmitButton pendingLabel="Saving…">{editing ? "Save changes" : "Create stat"}</SubmitButton>
      </div>
    </form>
  );
}

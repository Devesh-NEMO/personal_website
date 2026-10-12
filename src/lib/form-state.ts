import type { FieldErrors } from "@/lib/schemas";

/**
 * Shared form state for the `useActionState` hooks.
 *
 * These live here — not in the action modules — because a `"use server"` file
 * may only export async functions. Both the actions and the client forms import
 * from this plain module.
 */

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
};

export const idleFormState: FormState = { status: "idle" };

/** Same shape, named for the public contact form. */
export type ContactState = FormState;
export const idleContactState: ContactState = { status: "idle" };

export type LoginState = { error?: string };
export const idleLoginState: LoginState = {};

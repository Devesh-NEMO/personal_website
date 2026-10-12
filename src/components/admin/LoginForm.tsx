"use client";

import { useActionState } from "react";

import { login } from "@/app/admin/actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/Input";
import { Button } from "@/components/ui/Button";
import { idleLoginState, type LoginState } from "@/lib/form-state";

const initialState: LoginState = idleLoginState;

/** The email + password form. Errors are shown inline; success redirects. */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Email" htmlFor="admin-email" required>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
        />
      </Field>

      <Field label="Password" htmlFor="admin-password" required>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

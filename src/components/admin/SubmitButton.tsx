"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

type SubmitButtonProps = {
  children: string;
  /** Text shown while the surrounding <form> action is in flight. */
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

/**
 * A submit button wired to its form's pending state via `useFormStatus`.
 *
 * Must be rendered *inside* the <form> whose action it submits — that is what
 * lets it disable itself and change its label while the action runs.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
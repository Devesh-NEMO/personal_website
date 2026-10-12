"use client";

import { useEffect, useId, useState } from "react";

import { SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { cardSurface } from "@/lib/tone";

type ConfirmDialogProps = {
  /** Server action the confirmation form posts to. */
  action: (formData: FormData) => void | Promise<void>;
  /** Hidden fields sent with the action (e.g. the row being deleted). */
  fields: Record<string, string>;
  title: string;
  body: string;
  triggerLabel: string;
  confirmLabel?: string;
  pendingLabel?: string;
};

/**
 * A destructive-action confirmation.
 *
 * The trigger opens a modal; confirming submits the server action. Gating is
 * purely client-side ergonomics — the action re-checks the session itself, so a
 * forged POST still cannot delete anything.
 *
 * The surface is built with `cardSurface()` rather than <Card> because a dialog
 * needs to carry role/aria/onClick, and <Card> only takes children/tone/class.
 */
export function ConfirmDialog({
  action,
  fields,
  title,
  body,
  triggerLabel,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
          // Clicking the backdrop (not the card) dismisses.
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(cardSurface("pink"), "w-full max-w-sm p-6")}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="text-lg font-black tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed font-medium tracking-tight">{body}</p>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" autoFocus onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <form action={action}>
                {Object.entries(fields).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
                <SubmitButton pendingLabel={pendingLabel}>{confirmLabel}</SubmitButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

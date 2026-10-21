"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitMessage } from "@/app/(site)/contact-actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Button } from "@/components/ui/Button";  
import { idleContactState, type ContactState } from "@/lib/form-state";
/**
 * The public contact form.
 *
 * Lives in its own card in the right-hand column of the contact section, beside
 * the direct links. On success the fields reset and a confirmation shows;
 * errors appear inline per field.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitMessage,
    idleContactState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef} 
      action={formAction}
      className="mt-5 flex w-full flex-col gap-4 text-left"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" error={state.fieldErrors?.name?.[0]}>
          <Input id="contact-name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="contact-email" error={state.fieldErrors?.email?.[0]}>
          <Input id="contact-email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>

      <Field label="Message" htmlFor="contact-message" error={state.fieldErrors?.message?.[0]}>
        <Textarea id="contact-message" name="message" rows={5} required />
      </Field>

      {/* Honeypot: hidden from people, tempting to bots. Must stay empty. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

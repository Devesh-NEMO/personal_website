"use client";

import { useActionState } from "react";

import {
  saveAboutAction,
  saveContactAction,
  saveHeroAction,
  saveMarqueeAction,
  saveNavAction,
} from "@/app/admin/actions";
import { Alert } from "@/components/admin/Alert";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/Input";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TagInput } from "@/components/admin/TagInput";
import { Textarea } from "@/components/admin/Textarea";
import { idleFormState, type FormState } from "@/lib/form-state";
import type {
  ContactContent,
  HeroContent,
  MarqueeContent,
  ProfileNav,
  SiteLinks,
} from "@/types";

/**
 * The profile page's forms. Each section is its own <form> with its own server
 * action, so a save only touches the part it edits — writing `hero` never
 * clobbers `about`.
 */

function Status({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  return <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>;
}

export function HeroForm({ hero }: { hero: HeroContent }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveHeroAction, idleFormState);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Eyebrow" htmlFor="hero-eyebrow" error={err("eyebrow")}>
          <Input id="hero-eyebrow" name="eyebrow" defaultValue={hero.eyebrow} />
        </Field>
        <Field label="Greeting" htmlFor="hero-greeting" error={err("greeting")}>
          <Input id="hero-greeting" name="greeting" defaultValue={hero.greeting} />
        </Field>
      </div>

      <Field label="Name" htmlFor="hero-name" error={err("name")}>
        <Input id="hero-name" name="name" defaultValue={hero.name} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Line before the highlight" htmlFor="hero-pre" error={err("preHighlight")}>
          <Input id="hero-pre" name="preHighlight" defaultValue={hero.preHighlight} />
        </Field>
        <Field label="Highlighted word" htmlFor="hero-highlight" error={err("highlight")}>
          <Input id="hero-highlight" name="highlight" defaultValue={hero.highlight} />
        </Field>
      </div>

      <Field label="Intro paragraph" htmlFor="hero-intro" error={err("intro")}>
        <Textarea id="hero-intro" name="intro" defaultValue={hero.intro} rows={3} />
      </Field>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-extrabold tracking-tight">Primary button</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Label" htmlFor="hero-primary-label">
            <Input id="hero-primary-label" name="primaryLabel" defaultValue={hero.primaryAction.label} />
          </Field>
          <Field label="Link" htmlFor="hero-primary-href">
            <Input id="hero-primary-href" name="primaryHref" defaultValue={hero.primaryAction.href} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-extrabold tracking-tight">Secondary button</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Label" htmlFor="hero-secondary-label">
            <Input
              id="hero-secondary-label"
              name="secondaryLabel"
              defaultValue={hero.secondaryAction.label}
            />
          </Field>
          <Field label="Link" htmlFor="hero-secondary-href">
            <Input
              id="hero-secondary-href"
              name="secondaryHref"
              defaultValue={hero.secondaryAction.href}
            />
          </Field>
        </div>
      </fieldset>

      <Status state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save hero</SubmitButton>
      </div>
    </form>
  );
}

export function AboutForm({ paragraphs }: { paragraphs: string[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveAboutAction, idleFormState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Bio paragraphs"
        htmlFor="about-paragraphs"
        hint="Separate paragraphs with a blank line."
        error={state.fieldErrors?.paragraphs?.[0]}
      >
        <Textarea
          id="about-paragraphs"
          name="paragraphs"
          defaultValue={paragraphs.join("\n\n")}
          rows={10}
        />
      </Field>
      <Status state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save about</SubmitButton>
      </div>
    </form>
  );
}

export function ContactSectionForm({
  contact,
  links,
}: {
  contact: ContactContent;
  links: SiteLinks;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveContactAction, idleFormState);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Heading" htmlFor="contact-heading" error={err("heading")}>
        <Input id="contact-heading" name="heading" defaultValue={contact.heading} />
      </Field>
      <Field label="Body" htmlFor="contact-body" error={err("body")}>
        <Textarea id="contact-body" name="body" defaultValue={contact.body} rows={3} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="link-email" error={err("email")}>
          <Input id="link-email" name="email" type="email" defaultValue={links.email} />
        </Field>
        <Field label="CV path" htmlFor="link-cv" hint="Optional, e.g. /cv.pdf" error={err("cv")}>
          <Input id="link-cv" name="cv" defaultValue={links.cv} />
        </Field>
        <Field label="GitHub URL" htmlFor="link-github" error={err("github")}>
          <Input id="link-github" name="github" defaultValue={links.github} />
        </Field>
        <Field label="LinkedIn URL" htmlFor="link-linkedin" error={err("linkedin")}>
          <Input id="link-linkedin" name="linkedin" defaultValue={links.linkedin} />
        </Field>
      </div>

      <Status state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save contact</SubmitButton>
      </div>
    </form>
  );
}

export function MarqueeForm({ marquee }: { marquee: MarqueeContent }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveMarqueeAction, idleFormState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Items" hint="The words that scroll by, in order." error={state.fieldErrors?.items?.[0]}>
        <TagInput name="items" defaultValue={marquee.items} placeholder="Add a word…" />
      </Field>
      <Field label="Separator" htmlFor="marquee-separator" error={state.fieldErrors?.separator?.[0]}>
        <Input id="marquee-separator" name="separator" defaultValue={marquee.separator} />
      </Field>
      <Status state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save marquee</SubmitButton>
      </div>
    </form>
  );
}

export function NavForm({ nav }: { nav: ProfileNav }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveNavAction, idleFormState);
  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Logo" htmlFor="nav-logo" error={err("logo")}>
          <Input id="nav-logo" name="logo" defaultValue={nav.logo} />
        </Field>
        <Field label="Menu label" htmlFor="nav-menu-label" error={err("menuLabel")}>
          <Input id="nav-menu-label" name="menuLabel" defaultValue={nav.menuLabel} />
        </Field>
        <Field label="Menu close label" htmlFor="nav-menu-close" error={err("menuCloseLabel")}>
          <Input id="nav-menu-close" name="menuCloseLabel" defaultValue={nav.menuCloseLabel} />
        </Field>
      </div>

      <Field
        label="Links"
        htmlFor="nav-links"
        hint="One per line as “Label | #anchor”."
        error={err("links")}
      >
        <Textarea
          id="nav-links"
          name="links"
          rows={6}
          defaultValue={nav.links.map((link) => `${link.label} | ${link.href}`).join("\n")}
        />
      </Field>

      <Status state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save navigation</SubmitButton>
      </div>
    </form>
  );
}

import { Section } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { trackAttrs } from "@/lib/analytics";
import type { ContactContent } from "@/types";

/** Centred call to action with the contact form and the direct-link buttons. */
export function Contact({ contact }: { contact: ContactContent }) {
  return (
    <Section id="contact">
      {/* `scale` fades the whole card up from 95%. */}
      <Reveal direction="scale">
        <div className="brutal-border rounded-card bg-pink px-6 py-16 text-center shadow-brutal sm:px-12">
          <SectionHeading align="center" className="mb-8">
            {contact.heading}
          </SectionHeading>

          <p className="mx-auto max-w-xl text-base leading-relaxed font-medium tracking-tight sm:text-lg">
            {contact.body}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {contact.actions.map((action, index) => {
              const method = action.label.toLowerCase();
              return (
                <Button
                  key={action.label}
                  href={action.href}
                  external={action.external}
                  ariaLabel={action.ariaLabel}
                  variant={index === 0 ? "primary" : "secondary"}
                  /* Small spring on hover, layered on the existing lift via the
                     `scale` property so the two do not overwrite each other. */
                  className="btn-bounce"
                  {...trackAttrs("contact_click", { method })}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>

          {/* Direct links stay; the form adds a way to send a message without
              leaving the page. */}
          <ContactForm />
        </div>
      </Reveal>
    </Section>
  );
}

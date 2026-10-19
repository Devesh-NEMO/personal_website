import { Section } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { trackAttrs } from "@/lib/analytics";
import type { ContactContent } from "@/types";

/**
 * Contact: one card split into two columns.
 *
 * Left holds the pitch — the heading, the intro line and the direct links as a
 * stacked list. Right holds the message form on its own neutral surface, so the
 * two ways to get in touch (open your mail client, or write here) read as
 * parallel choices instead of one long centred column.
 *
 * The columns stack in source order on narrow screens, which puts the pitch and
 * the links first and the form after them.
 */
export function Contact({ contact }: { contact: ContactContent }) {
  return (
    <Section id="contact">
      {/* `scale` fades the whole card up from 95%. */}
      <Reveal direction="scale">
        <div className="brutal-border rounded-card bg-periwinkle p-6 shadow-brutal sm:p-10 lg:p-12">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left column: heading, pitch and the direct links. */}
            <div className="flex flex-col gap-6">
              <SectionHeading className="mb-0">{contact.heading}</SectionHeading>

              <p className="max-w-md text-base leading-relaxed font-medium tracking-tight sm:text-lg">
                {contact.body}
              </p>

              <ul className="flex flex-col gap-3">
                {contact.actions.map((action) => {
                  const method = action.label.toLowerCase();
                  return (
                    <li key={action.label}>
                      <a
                        href={action.href}
                        aria-label={action.ariaLabel}
                        {...(action.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        {...trackAttrs("contact_click", { method })}
                        className="group flex items-center justify-between gap-4 rounded-[12px] border-[3px] border-fg bg-surface px-4 py-3 font-extrabold tracking-tight shadow-brutal transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-mint"
                      >
                        <span>{action.label}</span>
                        <span
                          aria-hidden="true"
                          className="text-lg transition-transform duration-150 group-hover:translate-x-1"
                        >
                          {action.external ? "↗" : "→"}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right column: the form on its own card. */}
            <div className="brutal-border rounded-card bg-surface p-5 shadow-brutal sm:p-6">
              <h3 className="text-lg font-black tracking-tight">Send a message</h3>
              <p className="mt-1 text-sm font-medium tracking-tight opacity-80">
                No mail client handy? Write it here and I&rsquo;ll reply within a
                day or two.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

import {
  AboutForm,
  ContactSectionForm,
  HeroForm,
  MarqueeForm,
  NavForm,
} from "@/components/admin/ProfileForms";
import { getSiteContent } from "@/lib/content";

/** Admin navigations block on the server (see the `(panel)` layout). */
export const instant = false;

/**
 * Profile editor.
 *
 * Five independent forms over the single `siteContent` document. Each form has
 * its own action, so saving one section does not overwrite the others.
 */
export default async function ProfileAdminPage() {
  const content = await getSiteContent();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Profile</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          The hero, bio, contact section and site chrome.
        </p>
      </header>

      <Section title="Hero" description="The first thing visitors see.">
        <HeroForm hero={content.hero} />
      </Section>

      <Section title="About" description="The bio paragraphs.">
        <AboutForm paragraphs={content.about.paragraphs} />
      </Section>

      <Section title="Contact" description="Heading, body and the direct links.">
        <ContactSectionForm contact={content.contact} links={content.links} />
      </Section>

      <Section title="Marquee" description="The scrolling word strip.">
        <MarqueeForm marquee={content.marquee} />
      </Section>

      <Section title="Navigation" description="Logo and the sticky navbar links.">
        <NavForm nav={content.nav} />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
        <p className="text-sm font-medium tracking-tight text-fg/70">{description}</p>
      </div>
      <div className="brutal-border rounded-card bg-surface p-6 shadow-brutal">{children}</div>
    </section>
  );
}

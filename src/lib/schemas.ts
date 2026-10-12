import { z } from "zod";

/**
 * Server-side validation schemas.
 *
 * The public TypeScript types stay the source of truth for *shapes*; these
 * schemas add the *constraints* (required, max length, format) and double as
 * the read-time guard: anything the data layer returns from MongoDB has passed
 * `safeParse`, so a structurally bad document falls back to the static data
 * rather than breaking a render.
 */

/** Field-path → messages map, for surfacing errors under form fields. */
export type FieldErrors = Record<string, string[] | undefined>;

/** Shape-safe slice of a zod error, so this helper survives zod minor versions. */
type ZodIssueLike = { path: PropertyKey[]; message: string };

export function fieldErrors(error: { issues: ZodIssueLike[] }): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export const cardToneSchema = z.enum(["mint", "peach", "periwinkle", "pink"]);

const actionLinkSchema = z.object({
  label: z.string().trim().min(1).max(120),
  href: z.string().trim().min(1).max(500),
  external: z.boolean().optional(),
  ariaLabel: z.string().trim().max(200).optional(),
});

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().max(120),
  greeting: z.string().trim().max(60),
  name: z.string().trim().max(120),
  preHighlight: z.string().trim().max(120),
  highlight: z.string().trim().max(60),
  intro: z.string().trim().max(600),
  primaryAction: actionLinkSchema,
  secondaryAction: actionLinkSchema,
});

export const aboutContentSchema = z.object({
  paragraphs: z.array(z.string().trim().max(2000)).min(1).max(20),
});

/**
 * Heading + body only. `actions` are not stored — the data layer rebuilds them
 * from `links` on read, the same way the static `site.ts` derives them.
 */
const contactContentSchema = z.object({
  heading: z.string().trim().max(200),
  body: z.string().trim().max(2000),
});

export const siteLinksSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
  github: z.string().trim().url("Enter a valid URL").max(300),
  linkedin: z.string().trim().url("Enter a valid URL").max(300),
  /** Path to a CV, e.g. "/cv.pdf". Empty means "not published". */
  cv: z.string().trim().max(500),
});

export const marqueeContentSchema = z.object({
  items: z.array(z.string().trim().max(40)).min(1).max(30),
  separator: z.string().trim().max(10),
});

export const navLinkSchema = z.object({
  label: z.string().trim().max(60),
  href: z.string().trim().max(200),
});

/** The navbar content (logo, links, menu labels). */
export const navSchema = z.object({
  logo: z.string().trim().max(20),
  links: z.array(navLinkSchema).min(1).max(12),
  menuLabel: z.string().trim().max(30),
  menuCloseLabel: z.string().trim().max(30),
});

export const imageAssetSchema = z.object({
  src: z.string().trim().min(1, "Image URL or path is required").max(1000),
  alt: z.string().trim().max(300).default(""),
  width: z.number().int().positive().default(600),
  height: z.number().int().positive().default(600),
  tone: cardToneSchema.default("mint"),
  fallback: z.string().trim().max(20).default("DK"),
  publicId: z.string().trim().max(300).optional(),
});

export const profileImagesSchema = z.object({
  avatar: imageAssetSchema,
  heroImage: imageAssetSchema,
  heroBadge: z.string().trim().max(60).default("Open to work"),
  ogImage: z
    .object({
      src: z.string().trim().min(1).max(1000),
      alt: z.string().trim().max(300).default(""),
      width: z.number().int().positive().default(1200),
      height: z.number().int().positive().default(630),
      publicId: z.string().trim().max(300).optional(),
    })
    .optional(),
});

/**
 * Shape of the single `siteContent` document in MongoDB.
 */
export const siteContentDocSchema = z.object({
  hero: heroContentSchema,
  about: aboutContentSchema,
  contact: contactContentSchema,
  links: siteLinksSchema,
  marquee: marqueeContentSchema,
  nav: navSchema,
  images: profileImagesSchema.optional(),
});

export const projectSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(1000),
  /*
   * The public type promises exactly two outcome bullets, and the admin form
   * renders exactly two inputs. min(1) rather than exactly-2 keeps reads
   * tolerant of rows written before the constraint existed.
   */
  results: z
    .array(z.string().trim().min(1, "A result bullet can't be empty").max(300))
    .min(1)
    .max(10),
  tags: z.array(z.string().trim().max(40)).max(20),
  href: z.string().trim().max(500),
  tone: cardToneSchema,
  image: z.string().trim().max(1000).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  imagePublicId: z.string().trim().max(300).optional(),
  /** Not part of the public Project type — sorting order for the grid/admin. */
  order: z.number().int().min(0).optional(),
});

export const skillGroupSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1, "Title is required").max(120),
  items: z.array(z.string().trim().min(1, "A skill can't be empty").max(60)).min(1).max(60),
  tone: cardToneSchema,
  order: z.number().int().min(0).optional(),
});

export const statSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  label: z.string().trim().min(1, "Label is required").max(120),
  value: z.string().trim().min(1, "Value is required").max(60),
  tone: cardToneSchema,
  order: z.number().int().min(0).optional(),
});

/** A message submitted through the public contact form. */
export const contactMessageInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(4000),
  /** Honeypot: rendered as a field humans can't see; must stay empty. */
  website: z.string().max(0).optional(),
});

export const loginInputSchema = z.object({
  email: z.string().trim().min(1).email("Enter a valid email").max(200),
  password: z.string().min(1, "Password is required").max(200),
});

export type SiteContentDoc = z.infer<typeof siteContentDocSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupSchema>;
export type StatInput = z.infer<typeof statSchema>;
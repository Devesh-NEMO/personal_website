"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  DatabaseUnavailableError,
  deleteMessage,
  deleteProject,
  deleteSkillGroup,
  deleteStat,
  saveAbout,
  saveContact,
  saveHero,
  saveMarquee,
  saveNav,
  saveProject,
  saveSkillGroup,
  saveStat,
  saveProfileImages,
  setMessageRead,
} from "@/lib/admin-data";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { contentTags } from "@/lib/content";
import type { FormState, LoginState } from "@/lib/form-state";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";
import {
  aboutContentSchema,
  fieldErrors,
  heroContentSchema,
  loginInputSchema,
  marqueeContentSchema,
  navSchema,
  projectSchema,
  siteLinksSchema,
  skillGroupSchema,
  statSchema,
} from "@/lib/schemas";
import type { ProfileImages, Project, SkillGroup, Stat } from "@/types";

/**
 * Server actions for the admin area.
 *
 * Each mutating action validates its input with zod, calls a writer in
 * `lib/admin-data.ts` (which re-checks the session next to the write), then
 * invalidates the public cache with `updateTag` + `revalidatePath`. The tag
 * invalidation lives here because `updateTag` may only run inside an action.
 *
 * Note: a `"use server"` module may only export async functions, so the
 * `FormState`/`LoginState` types and their idle values live in
 * `lib/form-state.ts` and are imported by the client forms.
 */

const DB_DOWN = "The database is not reachable right now. Your change was not saved.";

/** Turns an unknown thrown value into a user-facing message. */
function toMessage(error: unknown): string {
  if (error instanceof DatabaseUnavailableError) return DB_DOWN;
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Invalidate the home page after a content change. */
function refreshPublicContent(tag: string): void {
  updateTag(tag);
  revalidatePath("/");
}

/* --- auth -------------------------------------------------------------------- */

const GENERIC_ERROR = "Invalid email or password";

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_ERROR };

  const key = `login:${await getClientIp()}`;
  const limit = checkRateLimit(key, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const valid = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!valid) return { error: GENERIC_ERROR };

  resetRateLimit(key);
  await createSession(parsed.data.email);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* --- projects ---------------------------------------------------------------- */

export async function saveProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = projectSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    results: formData
      .getAll("results")
      .map(String)
      .map((result) => result.trim())
      .filter((result) => result !== ""),
    tags: formData
      .getAll("tags")
      .map(String)
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ""),
    href: formData.get("href"),
    tone: formData.get("tone"),
    image: emptyToUndefined(formData.get("image")),
    imageAlt: emptyToUndefined(formData.get("imageAlt")),
    imagePublicId: emptyToUndefined(formData.get("imagePublicId")),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveProject(parsed.data as Project);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.projects);
  return { status: "success", message: "Project saved." };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await deleteProject(String(formData.get("id") ?? ""));
  refreshPublicContent(contentTags.projects);
}

/* --- skills ------------------------------------------------------------------ */

export async function saveSkillGroupAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = skillGroupSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    items: formData.getAll("items").map(String).filter((item) => item.trim() !== ""),
    tone: formData.get("tone"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveSkillGroup(parsed.data as SkillGroup);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.skillGroups);
  return { status: "success", message: "Skill group saved." };
}

export async function deleteSkillGroupAction(formData: FormData): Promise<void> {
  await deleteSkillGroup(String(formData.get("id") ?? ""));
  refreshPublicContent(contentTags.skillGroups);
}

/* --- stats ------------------------------------------------------------------- */

export async function saveStatAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = statSchema.safeParse({
    id: formData.get("id"),
    label: formData.get("label"),
    value: formData.get("value"),
    tone: formData.get("tone"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveStat(parsed.data as Stat);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.stats);
  return { status: "success", message: "Stat saved." };
}

export async function deleteStatAction(formData: FormData): Promise<void> {
  await deleteStat(String(formData.get("id") ?? ""));
  refreshPublicContent(contentTags.stats);
}

/* --- site content ------------------------------------------------------------ */

export async function saveHeroAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = heroContentSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    greeting: formData.get("greeting"),
    name: formData.get("name"),
    preHighlight: formData.get("preHighlight"),
    highlight: formData.get("highlight"),
    intro: formData.get("intro"),
    primaryAction: {
      label: formData.get("primaryLabel"),
      href: formData.get("primaryHref"),
    },
    secondaryAction: {
      label: formData.get("secondaryLabel"),
      href: formData.get("secondaryHref"),
    },
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveHero(parsed.data);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "Hero saved." };
}

export async function saveAboutAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Blank lines separate paragraphs in the textarea.
  const paragraphs = String(formData.get("paragraphs") ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const parsed = aboutContentSchema.safeParse({ paragraphs });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveAbout(parsed.data.paragraphs);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "About saved." };
}

export async function saveContactAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const links = siteLinksSchema.safeParse({
    email: formData.get("email"),
    github: formData.get("github"),
    linkedin: formData.get("linkedin"),
    cv: formData.get("cv") ?? "",
  });

  if (!links.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(links.error) };
  }

  const heading = String(formData.get("heading") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!heading || !body) {
    return { status: "error", message: "Heading and body are both required." };
  }

  try {
    await saveContact({ heading, body, links: links.data });
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "Contact section saved." };
}

export async function saveMarqueeAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = marqueeContentSchema.safeParse({
    items: formData.getAll("items").map(String).filter((item) => item.trim() !== ""),
    separator: formData.get("separator"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveMarquee(parsed.data);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "Marquee saved." };
}

export async function saveNavAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // One "Label | /href" per line.
  const links = String(formData.get("links") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), href: rest.join("|").trim() };
    })
    .filter((link) => link.label && link.href);

  const parsed = navSchema.safeParse({
    logo: formData.get("logo"),
    menuLabel: formData.get("menuLabel"),
    menuCloseLabel: formData.get("menuCloseLabel"),
    links,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveNav(parsed.data);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "Navigation saved." };
}

export async function saveProfileImagesAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const heroImageSrc = String(formData.get("heroImageSrc") || "").trim();
  const heroImageAlt = String(formData.get("heroImageAlt") || "").trim();
  const heroImagePublicId = emptyToUndefined(formData.get("heroImagePublicId"));
  const heroBadge = String(formData.get("heroBadge") || "Open to work").trim();

  const avatarSrc = String(formData.get("avatarSrc") || "").trim();
  const avatarAlt = String(formData.get("avatarAlt") || "").trim();
  const avatarPublicId = emptyToUndefined(formData.get("avatarPublicId"));

  if (!heroImageSrc) {
    return {
      status: "error",
      message: "Hero image is required. Please choose or upload a photo.",
      fieldErrors: { heroImage: ["Hero image is required"] },
    };
  }

  if (!avatarSrc) {
    return {
      status: "error",
      message: "About section photo is required. Please choose or upload a photo.",
      fieldErrors: { avatar: ["About section photo is required"] },
    };
  }

  const images: ProfileImages = {
    heroImage: {
      src: heroImageSrc,
      alt: heroImageAlt || "Devesh Kumar profile photo",
      width: 600,
      height: 600,
      tone: "mint",
      fallback: "DK",
      publicId: heroImagePublicId,
    },
    heroBadge: heroBadge || "Open to work",
    avatar: {
      src: avatarSrc,
      alt: avatarAlt || "Devesh Kumar about photo",
      width: 800,
      height: 800,
      tone: "periwinkle",
      fallback: "DK",
      publicId: avatarPublicId,
    },
    ogImage: {
      src: heroImageSrc,
      alt: heroImageAlt || "Devesh Kumar",
      width: 1200,
      height: 630,
      publicId: heroImagePublicId,
    },
  };

  try {
    await saveProfileImages(images);
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }

  refreshPublicContent(contentTags.site);
  return { status: "success", message: "Profile photos saved successfully." };
}

/* --- messages ---------------------------------------------------------------- */

export async function markMessageAction(formData: FormData): Promise<void> {
  await setMessageRead(String(formData.get("id") ?? ""), formData.get("read") === "true");
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await deleteMessage(String(formData.get("id") ?? ""));
  revalidatePath("/admin/messages");
}

/** Treat an empty form field as absent rather than an empty string. */
function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (value === null) return undefined;
  const text = String(value).trim();
  return text === "" ? undefined : text;
}

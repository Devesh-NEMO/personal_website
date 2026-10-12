"use server";

import { insertMessage } from "@/lib/admin-data";
import type { ContactState } from "@/lib/form-state";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNotificationEmail } from "@/lib/email";
import { contactMessageInputSchema, fieldErrors } from "@/lib/schemas";

/**
 * Public contact form action.
 *
 * Rate-limited per IP, honeypot-protected (the `website` field must stay
 * empty), and zod-validated. No authentication — this is the one public way to
 * write to the database. The `ContactState` type and its idle value live in
 * `lib/form-state.ts` because a `"use server"` module may only export async
 * functions.
 */

export async function submitMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactMessageInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    // Honeypot: a real visitor never fills this; a non-empty value fails the
    // schema's max(0) and the submission is rejected.
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form and try again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const key = `contact:${await getClientIp()}`;
  const limit = checkRateLimit(key, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return {
      status: "error",
      message: "Too many messages sent. Please try again a little later.",
    };
  }

  try {
    await insertMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    // Send notification email
    await sendNotificationEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
  } catch {
    return {
      status: "error",
      message: "Could not send your message right now. Please email me directly instead.",
    };
  }

  return { status: "success", message: "Thanks! Your message has been sent." };
}

import { connection } from "next/server";

import { deleteMessageAction, markMessageAction } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getMessages } from "@/lib/admin-data";
import { cn } from "@/lib/cn";

/** Admin navigations block on the server (see the `(panel)` layout). */
export const instant = false;

/**
 * Inbox for contact-form messages.
 *
 * Read/unread and delete are plain form posts (no dialog needed for a toggle).
 * The list is newest first.
 */
export default async function MessagesAdminPage() {
  // Live DB read: mark the segment dynamic so it is never prerendered.
  await connection();
  const messages = await getMessages();
  const unread = messages.filter((message) => !message.read).length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Messages</h1>
        <p className="mt-1 text-sm font-medium tracking-tight text-fg/80">
          {messages.length} total
          {unread > 0 ? ` · ${unread} unread` : ""}
        </p>
      </header>

      {messages.length === 0 ? (
        <p className="text-sm font-medium text-fg/70">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={cn(
                "brutal-border rounded-card flex flex-col gap-4 p-5 shadow-brutal",
                message.read ? "bg-surface" : "bg-peach",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-extrabold tracking-tight">
                  {message.name}
                  {message.read ? null : (
                    <span className="brutal-pill brutal-border ml-2 bg-accent px-2 py-0.5 text-xs text-accent-ink">
                      New
                    </span>
                  )}
                </p>
                <time className="text-xs font-medium text-fg/60" dateTime={message.createdAt?.toISOString()}>
                  {formatDate(message.createdAt)}
                </time>
              </div>

              <a
                href={`mailto:${message.email}`}
                className="text-sm font-bold underline break-all"
              >
                {message.email}
              </a>

              <p className="text-sm leading-relaxed font-medium tracking-tight whitespace-pre-wrap">
                {message.message}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <form action={markMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                  <SubmitButton pendingLabel="Updating…">
                    {message.read ? "Mark unread" : "Mark read"}
                  </SubmitButton>
                </form>
                <ConfirmDialog
                  action={deleteMessageAction}
                  fields={{ id: message.id }}
                  title="Delete message?"
                  body={`The message from ${message.name} will be permanently removed.`}
                  triggerLabel="Delete"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Stable, locale-independent timestamp (UTC). */
function formatDate(date: Date | null): string {
  if (!date) return "—";
  const value = date.toISOString();
  return `${value.slice(0, 10)} ${value.slice(11, 16)} UTC`;
}

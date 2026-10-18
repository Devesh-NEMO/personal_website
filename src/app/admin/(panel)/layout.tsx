import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { getUnreadCount } from "@/lib/admin-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";

/**
 * No admin page is ever indexed. The layout sets it once for every child; the
 * proxy also sends an X-Robots-Tag header as a belt-and-braces measure.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin navigations are allowed to block on the server.
 *
 * `requireAdmin()` reads the session cookie, which is request-time data, so
 * these routes cannot be instant. `instant = false` opts the whole admin tree
 * out of the static-shell check — exactly the "still migrating" escape hatch
 * the Cache Components auth guide recommends.
 *
 * This layout flag only exempts navigations *into* /admin from outside. The
 * framework validates navigations between sibling admin pages per-segment, so
 * every page under this layout also exports `instant = false`.
 */
export const instant = false;

/**
 * Guarded admin shell.
 *
 * `requireAdmin()` runs on the server for every navigation, so an expired or
 * forged cookie lands on the login page before any admin markup renders. The
 * per-action checks in `actions.ts` are the real enforcement for writes.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  const unreadCount = await getUnreadCount();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b-[3px] border-fg bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="text-lg font-black tracking-tight">
              Admin<span className="text-accent">.</span>
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href="/"
                className="brutal-pill brutal-border bg-surface px-4 py-2 text-sm font-extrabold tracking-tight transition-colors duration-150 hover:bg-mint"
              >
                View site <span aria-hidden="true">↗</span>
              </Link>
              <ThemeToggle />
              <form action={logout}>
                <Button type="submit" variant="secondary" className="px-4 py-2 text-sm">
                  Log out
                </Button>
              </form>
            </div>
          </div>
          <AdminNav unreadCount={unreadCount} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

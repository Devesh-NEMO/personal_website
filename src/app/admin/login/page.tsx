import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { cn } from "@/lib/cn";
import { getSession } from "@/lib/auth";
import { cardSurface } from "@/lib/tone";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

/**
 * Login reads the session cookie to skip the form for a signed-in visitor, so
 * this segment is also allowed to block on the server — see the note on the
 * `(panel)` layout.
 */
export const instant = false;

/**
 * Admin sign-in.
 *
 * Lives outside the `(panel)` route group so it renders without the guarded
 * layout — otherwise it would redirect to itself. If a valid session already
 * exists, skip straight to the dashboard.
 */
export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className={cn(cardSurface("periwinkle"), "w-full max-w-md p-8")}>
        <h1 className="text-2xl font-black tracking-tight">
          Admin<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 mb-6 text-sm font-medium tracking-tight text-fg/80">
          Sign in to edit the site.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

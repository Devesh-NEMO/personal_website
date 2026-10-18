import { AnimatedBackground } from "@/components/background/AnimatedBackground";

/**
 * Admin-area chrome shared by the login page and the guarded panel.
 *
 * The backdrop is the same `AnimatedBackground` the public `(site)` layout
 * mounts, so the admin reads as part of the same site. It is fixed,
 * `pointer-events: none` and `z-index: -1` (see the `.bg-anim` rule in
 * globals.css), so it never intercepts clicks on the admin forms. The auth
 * guard, navigation and metadata stay in the child layouts.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AnimatedBackground />
      {children}
    </>
  );
}

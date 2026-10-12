import { Analytics } from "@/components/analytics/Analytics";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Toast } from "@/components/ui/Toast";
import { Splash } from "@/components/ui/Splash";

/**
 * Public-site chrome.
 *
 * Everything here is page furniture that has no business on the admin area:
 * the animated backdrop, momentum scrolling, analytics, the first-visit splash
 * and the toast. The admin renders under the root layout only, so it gets the
 * fonts and theme but none of this.
 *
 * (The marquee and the command menu are part of individual public pages, not
 * this layout, so they are absent from admin pages automatically.)
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/*
        Fixed, pointer-events-none backdrop: drifting dot grid, morphing hero
        blob, floating shapes and a cursor glow. Everything it moves is a
        compositor property, so it never affects layout, clicks or CLS. The
        one exception is the blob's border-radius morph, which is a paint
        property on purpose — see the note in globals.css section 7.
      */}
      <AnimatedBackground />
      {/*
        Momentum scrolling. Client-side and null-rendering, so it costs no
        layout and nothing for coarse-pointer devices.
      */}
      <SmoothScroll />
      {/*
        Analytics: delegated click listener for `data-track` elements, plus
        the Vercel tags when that is the configured provider. Both are gated
        on `isAnalyticsEnabled()`, so a build with analytics switched off
        ships neither the listener nor the SDK.
      */}
      <Analytics />
      {/*
        First-visit splash: the logo, a stepped progress bar, and a line of
        cycling text. Session-storage gated and skipped entirely with reduced
        motion, so it is never blocking.
      */}
      <Splash />
      {/*
        Toast notification. Mounted once, controlled by `toast.show()` from
        anywhere. Primarily for the command menu's "Copied!" message.
      */}
      <Toast />
      {children}
    </>
  );
}
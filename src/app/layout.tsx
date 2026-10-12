import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Script from "next/script";

import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { motionCssVars, analytics } from "@/lib/constants";

import "./globals.css";

/**
 * Root layout: the shell every route shares — fonts, theme, metadata and the
 * document skeleton. The *public* page furniture (animated background, splash,
 * analytics, smooth scroll, toast) lives in `(site)/layout.tsx` so the admin
 * area renders under this shell only, with none of that chrome.
 */

/**
 * Two typefaces, kept deliberately different in voice.
 *
 *  - **Display** (headings, the big stat figures) — Bricolage Grotesque. A
 *    variable grotesque with a slightly narrow, flat-terminaled look that goes
 *    genuinely heavy at 700-800, which is where the design's `font-black`
 *    headings live. Its heavier end tops out at 800, so `font-black` resolves
 *    to 800 here; that is the intended weight for a display face, not a clamp
 *    to be worked around.
 *  - **Body** (paragraphs, labels, buttons, nav) — Inter. Even colour and a tall
 *    x-height, so it stays readable at the 14-18px sizes the copy uses.
 *
 * `next/font` self-hosts both: no render-blocking request to Google, and it
 * derives a size-adjusted fallback per face so the swap does not shift layout.
 * Each is published as a CSS variable on <html> and read by `--font-sans` and
 * `--font-display` in globals.css, which keep a system stack behind them for
 * the case where the webfont never arrives.
 */
const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

// Named `--font-heading-face` rather than `--font-display` so it cannot collide
// with (or be referenced by) the `--font-display` token Tailwind generates in
// globals.css from its own `--font-*` namespace.
//
// `axes: ["wdth"]` asks next/font to keep the width axis alongside the default
// `wght` one. Bricolage is wide at 900, which pushed the hero heading onto a
// third line; the axis lets globals.css condense it via `font-stretch`, which
// composes with `font-weight` instead of overriding it the way
// `font-variation-settings` would.
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-heading-face",
});

/**
 * Applied before first paint to avoid a flash of the wrong theme.
 *
 * Priority: an explicit saved choice, then the OS preference. Kept tiny and
 * synchronous so the first painted frame is already the correct palette.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  // Absolute origin for every relative URL (OG, canonical, sitemap).
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.shortTitle}`,
  },
  description: site.description,
  applicationName: site.title,
  keywords: [
    "data analyst",
    "data scientist",
    "SQL",
    "Python",
    "dashboards",
    "forecasting",
    "portfolio",
  ],
  authors: [{ name: site.shortTitle }],
  creator: site.shortTitle,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.title,
    title: site.title,
    description: site.description,
    locale: site.locale,
    images: [
      {
        url: profile.ogImage.src,
        width: profile.ogImage.width,
        height: profile.ogImage.height,
        alt: profile.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [profile.ogImage.src],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Paints the browser chrome in the page's cream background.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF3D6" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1A16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the theme script mutates <html> before React
    // hydrates, so the class list intentionally differs from the server HTML.
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
          Plausible analytics script, rendered only when that provider is
          configured. The Vercel pair is in <Analytics />, which is also gated.
        */}
        {analytics.enabled &&
          analytics.provider === "plausible" &&
          analytics.plausibleDomain && (
            <Script
              defer
              data-domain={analytics.plausibleDomain}
              src={analytics.plausibleScriptUrl}
            />
          )}
      </head>
      {/*
        The motion tokens are published as CSS custom properties on <body> so
        the CSS-driven animations in globals.css read the same numbers that the
        React components use. lib/constants.ts stays the single source of truth
        — no duration is written in two places.
      */}
      <body
        className="min-h-dvh bg-bg text-fg antialiased"
        style={motionCssVars}
      >
        {children}
      </body>
    </html>
  );
}
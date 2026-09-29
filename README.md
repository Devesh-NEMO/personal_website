# Data Analyst / Data Scientist Portfolio

A single-page portfolio built with **Next.js 16 (App Router)**, **TypeScript** and **Tailwind CSS v4**, in a bold neo-brutalist style: 3px borders, hard offset shadows with zero blur, and a cream / orange-red / pastel palette. Dark mode follows the OS by default and has a manual toggle.

All content lives in typed files under `src/data` — nothing is hardcoded in a component.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script            | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Dev server with hot reload           |
| `npm run build`   | Production build (fully static)       |
| `npm run start`   | Serve the production build           |
| `npm run lint`    | ESLint                               |
| `npx tsc --noEmit`| Type check                           |

## Adding your images

Drop your files into `public/images/` with these exact names. The placeholder art
currently in the repo can be replaced 1:1 — keep the same filenames and nothing
else needs to change.

| File                              | Dimensions | Format  | Purpose                    | Max size |
| --------------------------------- | ---------- | ------- | -------------------------- | -------- |
| `public/images/avatar.jpg`        | 400 × 400  | jpg     | About section photo        | 200 KB   |
| `public/images/hero.jpg`          | 600 × 600  | jpg     | Hero photo                 | 200 KB   |
| `public/images/og-image.png`      | 1200 × 630 | png     | Social / Open Graph preview| 200 KB   |
| `public/images/projects/<slug>.png` | 1280 × 720 | png  | Project card thumbnails    | 200 KB   |

Notes:

- **Formats:** jpg, png and webp are all accepted. jpg is best for the two
  photos, png for the thumbnails and OG image (flat colour compresses better).
- **Aspect ratios are fixed by the layout** — the avatar and hero are cropped to
  a square, the thumbnails to 16:9, both via `object-cover`. Anything outside
  those ratios is cropped centrally rather than squashed.
- **Project thumbnails are optional.** Leave the `image` field out of a project
  in `src/data/projects.ts` and the thumbnail area collapses entirely, leaving
  no gap. The filename must match the project's `id`.
- **Alt text lives in the data files**, not in the components — update
  `profile.avatar.alt`, `profile.heroImage.alt` and each `imageAlt` as well as
  dropping in the file. Describe what the picture actually shows.
- If an image is missing or fails to decode, the design falls back to the
  initials on the card colour rather than showing a broken image. This is
  handled automatically, so a bad path degrades gracefully instead of breaking
  the layout.

The paths themselves are in `src/data/profile.ts` and `src/data/projects.ts`.

## Making it yours

Everything editable is a data file, typed against `src/types/index.ts`:

| File                     | Contents                                              |
| ------------------------ | ----------------------------------------------------- |
| `src/data/site.ts`       | Name, role, nav links, hero copy, bio, contact, footer |
| `src/data/profile.ts`    | Avatar, hero image, OG image — with alt text and sizes  |
| `src/data/projects.ts`   | Case studies, results, tags, links, thumbnails         |
| `src/data/skills.ts`     | The four skill clusters and their tags                 |
| `src/data/stats.ts`      | The four hero stat tiles                               |

Set your deployment origin so the sitemap, `robots.txt` and OG URLs are correct:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Design system

Tokens live in `src/app/globals.css`. This project uses **Tailwind v4**, which is
CSS-first — there is no `tailwind.config.ts`. Colours are declared as CSS custom
properties and mapped to utilities with `@theme inline`, so `bg-mint`,
`shadow-brutal` and `rounded-card` all resolve from there and flip automatically
in dark mode.

Light: background `#FFF3D6`, text `#1B1B1B`, accent `#FF5C39`, cards mint
`#A8E6CF` / peach `#FFD3B6` / periwinkle `#C7CEEA` / pink `#FFAAA5`.
Dark: background `#1C1A16`, text `#FFF3D6`, card surface `#2A2620`, with muted
card colours.

Borders are 3px in the current text colour, shadows are `6px 6px 0` with no blur
and grow to `8px 8px 0` as cards lift 2px on hover, cards use a 16px radius, and
buttons and tags are fully rounded (999px).

### Typography

Two typefaces, wired up in `src/app/layout.tsx` with `next/font/google` and
exposed to CSS as two custom properties:

| Role | Face | Used for |
| --- | --- | --- |
| Display | Bricolage Grotesque | `h1`–`h6`, and the big stat figures |
| Body | Inter | paragraphs, labels, buttons, nav, tags |

`next/font` self-hosts both, so there is no render-blocking request to Google.
It also derives a size-adjusted fallback per face (`size-adjust`,
`ascent-override`, and friends) which is what keeps the swap from shifting
layout. Both files are preloaded and land well before first paint.

The split is a single base-layer rule rather than a class on every heading:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--display-stack);
  font-stretch: var(--display-stretch);
}
```

Anything that is display type but not a heading opts in with the `font-display`
utility — the hero stat figures do. That utility is written by hand with
`@utility` rather than being auto-generated, so the face and its width always
travel together; the auto-generated version would only have set `font-family`
and left a stat figure at full width next to condensed headings.

Two details worth knowing before you change either number:

- **`font-stretch`, not `font-variation-settings`.** Bricolage is wide at weight
  900, and the hero heading needed roughly 130px more than its first line had
  spare, so it spilled onto a third line and pushed the stat tiles below the
  fold on a phone. `--display-stretch: 85%` maps onto the face's `wdth` axis and
  restores the original line count. `font-variation-settings` would also have
  worked but takes `wght` over from `font-weight`, which would break the
  `font-black` / `font-extrabold` utilities.
- **Bricolage tops out at weight 800**, so `font-black` (900) on a heading
  resolves to 800. That is the intended weight for a display face, not a clamp
  to work around — but it does mean the heading face tops out at 800 while
  Inter (used for UI text) goes to 900.

Both faces sit behind a system stack, so the page is still readable if a
webfont never arrives.

### Accessibility notes

The palette is verified against WCAG AA rather than assumed:

- Body text clears 4.5:1 on every card surface in both themes (light 9.5:1+,
  dark 6.8:1+).
- The hero highlight and focus ring are large-text/UI elements and clear 3:1.
- Buttons use ink on the orange accent (5.6:1) instead of white, which only
  reached 2.8:1 in dark mode. The hero highlight keeps white, where the large
  text size makes 3:1 the correct threshold.
- Section eyebrows are ink rather than orange, because orange text on the pastel
  cards cannot reach 4.5:1 at 14px.
- Dark mode cards are muted, not just darkened, so contrast holds in both.
- `prefers-reduced-motion` disables smooth scrolling, transitions and the card
  lift. The toggle holds no React state, so there is no hydration mismatch and no
  flash of the wrong theme on load.

Verified with Lighthouse: 100 accessibility, 100 best practices, 100 SEO, and
zero cumulative layout shift.

## Animations

Every entrance is built from a small `<Reveal>` wrapper on
[IntersectionObserver](https://developer.mozilla.org/docs/Web/API/Intersection_Observer)
plus CSS transitions. There is no animation library, and only `transform` and
`opacity` are ever animated — so nothing an element does on the way in can
trigger layout or shift the page.

```tsx
<Reveal delay={index * 80} direction="up" as="li">
  <Card>{/* … */}</Card>
</Reveal>
```

| Prop        | Values                                                              | Default |
| ----------- | ------------------------------------------------------------------- | ------- |
| `direction` | `up` `down` `left` `right` `scale` `scaleX` `none`                    | `up`    |
| `delay`     | milliseconds to wait after the element scrolls into view            | `0`     |
| `as`        | the element to render (`div`, `li`, `span`, …)                      | `div`   |

It fires **once per element**, at 15% visibility, and disconnects its observer
afterwards — scrolling back up never re-animates anything. Pass
`index * motion.stagger` to stagger a grid.

### Changing how it feels

Every duration, easing and delay lives in **`src/lib/constants.ts`**. That file
is the only place to edit. `layout.tsx` republishes the CSS-driven subset onto
`<body>` as custom properties, so a change there moves both the React
transitions and the CSS keyframes at once — no number is ever written twice.

```ts
motion = {
  duration: 520,   // standard entrance
  ease: "…",       // decelerating curve
  stagger: 80,     // ms between items in a list
  distance: 24,    // px an entrance travels
  hero: { … },     // the hero's load-time timeline
}
```

### Turning animations off

`prefers-reduced-motion: reduce` is honoured in **two** independent layers, so
reduced motion holds even if only one of them runs:

- **In JavaScript** — `<Reveal>` never applies the hidden state and `<CountUp>`
  never starts counting, so nothing animates in the first place.
- **In CSS** — every reveal is pinned to its final, visible state, the hero
  pop is switched off, and hover transitions are neutralised.

To disable the motion regardless of the visitor's setting, delete the two
`@media (prefers-reduced-motion: reduce)` blocks in `src/app/globals.css`
(around sections 3 and 10) — the elements are then simply always visible.

### No-JavaScript and print

- **No JavaScript** — the server renders every element in its *visible* state.
  The hidden state is only applied after hydration, once a layout effect has
  confirmed the element is below the fold. So the page is complete and readable
  before, and without, hydration, and there is no flash of hidden content.
- **Print** — reveals only play on scroll, so some sections are always sitting
  at `opacity: 0`. A `@media print` block forces them visible, otherwise
  printing or saving a PDF would emit blank sections.

### Server and client components

Section components stay server-rendered. The only client components are the
animated leaves — `<Reveal>`, `<CountUp>`, `<ScrollProgress>` and the
scroll-aware `<NavShell>` — so the animation cost is a few kilobytes on a page
that is otherwise almost entirely static HTML.

## Project structure

```
src/
├── app/
│   ├── globals.css        # design tokens, dark mode, type pairing, base styles
│   ├── layout.tsx         # metadata, OG tags, fonts, pre-paint theme script
│   ├── page.tsx           # single page, section order
│   ├── sitemap.ts         # /sitemap.xml
│   ├── robots.ts          # /robots.txt
│   └── icon.svg           # favicon
├── components/
│   ├── ui/                # Button, Card, CountUp, Reveal, SectionHeading, StatTile, Tag
│   ├── layout/            # NavShell, ScrollProgress
│   ├── About, Contact, Footer, Hero, Navbar, Projects, Section, Skills
│   ├── ProfileImage.tsx   # next/image with initials fallback
│   └── ThemeToggle.tsx    # dark mode toggle
├── data/                  # all content (see table above)
├── hooks/                 # useInView, useActiveSection, usePrefersReducedMotion
├── lib/                   # cn(), constants.ts (motion), tone map, blur placeholders
└── types/                 # shared TypeScript types
```

The section components, `Navbar` and every data file are server-rendered and
fully static. Only the animated leaves and the theme toggle ship JavaScript.

## Deploying to Vercel

1. Push the repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
   Vercel detects Next.js and needs no build settings.
2. Add `NEXT_PUBLIC_SITE_URL` under **Project → Settings → Environment
   Variables**, set to your production domain.
3. Deploy. Every route prerenders as static content, so the site is served from
   the CDN with no server cost.

For any other host, `npm run build` emits a self-contained `.next` directory to
serve with `npm run start` or any Node host.

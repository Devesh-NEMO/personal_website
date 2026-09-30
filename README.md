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
| `public/images/main.jpg`          | 600 × 600  | jpg     | Hero photo                 | 200 KB   |
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
| `src/data/site.ts`       | Name, role, hero copy, bio, contact, footer, marquee words |
| `src/data/profile.ts`    | Avatar, hero image, OG image — with alt text and sizes, plus the `nav` links — see [Navbar](#navbar) |
| `src/data/projects.ts`   | Case studies, results, tags, links, thumbnails         |
| `src/data/skills.ts`     | The four skill clusters and their tags                 |
| `src/data/stats.ts`      | The four hero stat tiles                               |
| `src/data/shapes.ts`     | The floating background shapes — see [Background animation](#background-animation) |

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
(around sections 5 and 11) — the elements are then simply always visible.

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

## Smooth scrolling

`SmoothScroll` (in `src/components/layout/`) adds momentum to wheel input with
[Lenis](https://github.com/darkroomengineering/lenis) — it eases the scroll
position toward the wheel's target instead of jumping to it.

Worth being clear about what this is and is not. The page had **no scroll jank to
fix**: no blur filters, nothing that reflows on scroll, one one-shot animation,
and everything animated is `transform` or `opacity` on the compositor. What native
scrolling lacks is *inertia* — a trackpad flick stops the instant the OS decides
it has. That is the gap this fills.

Three things it deliberately does **not** do, each of which would be a bug if
reversed:

- **Touch is left alone.** Phones and tablets already have OS-level momentum with
  real physics, and intercepting it with JS reliably feels *worse*. The component
  checks `(hover: hover) and (pointer: fine)` before initialising, so a phone
  never constructs Lenis and keeps the browser's own scrolling untouched. A
  hybrid touchscreen laptop passes, which is right — it has a trackpad.
- **Anchors are left alone.** Lenis's `anchors` option calls `scrollTo` from a
  click handler *without* calling `preventDefault()`, so Next.js `<Link>` would
  scroll to the same hash at the same time. In-page navigation therefore keeps
  using `scroll-behavior: smooth` from globals.css, and the `scroll-mt-24` /
  `scroll-padding-top` offsets still apply.
- **The navbar stays `position: sticky`.** Lenis scrolls the real window rather
  than transforming a wrapper, which is why the sticky navbar, the
  IntersectionObserver reveals and the progress bar all keep working untouched.

It also omits `lenis/dist/lenis.css` on purpose. That stylesheet sets
`scroll-behavior: auto !important` on `html.lenis-smooth`, which would kill the
native smooth anchor scrolling above. Lenis writes the scroll position with
`behavior: "instant"`, so the CSS property never conflicts with it anyway.

`prefers-reduced-motion` is handled by Lenis's own `respectReducedMotion` option
(its default, set explicitly here for clarity): lerp is forced to `1` so scrolling
tracks the input 1:1, and programmatic scrolls become instant. It reads the media
query live, so changing the OS setting takes effect without a reload.

Cost is one extra client chunk, **9.2KB gzipped**, isolated from all app code. The
easing strength is `motion.scrollLerp` in `lib/constants.ts` — lower is smoother
and floatier, higher tracks the wheel more literally. Lenis defaults to `0.1`,
which felt laggy on a page this short, so it sits just above at `0.12`.

## Background animation

The page sits on a fixed decorative layer behind everything: a drifting dot grid,
a morphing accent blob behind the hero heading, eight floating shapes, and a
soft glow that trails the cursor. A skills strip scrolls between the hero and the
about section.

| File | Role |
| --- | --- |
| `components/background/AnimatedBackground.tsx` | the fixed layer; owns the pause-on-hidden flag |
| `components/background/FloatingShapes.tsx` | renders the shape set, drives the parallax |
| `components/background/CursorGlow.tsx` | pointer-follow glow, desktop only |
| `components/background/Marquee.tsx` | the scrolling skills strip (a server component) |
| `data/shapes.ts` | the shape set — **this is the file you edit** |
| `hooks/useParallax.ts` | scroll-linked drift, rAF-coalesced |
| `hooks/usePageVisible.ts` | Page Visibility API, hydration-safe |

### Adding or changing a shape

Append an entry to `backgroundShapes` in `src/data/shapes.ts`. Nothing else needs
touching — the shape appears, animated, with the right colour, and the parallax
hook picks it up by its `data-parallax` value.

```ts
{
  id: "top-circle",       // unique
  kind: "circle",         // circle | square | triangle | plus | squiggle | star
  tone: "mint",           // mint | peach | periwinkle | pink | accent
  size: 124,              // px
  x: 0.02,                // 0-1 of viewport width, from the left
  y: 0.03,                // 0-1 of viewport height, from the top
  rotate: 0,              // starting rotation, degrees
  duration: 9,            // seconds per float cycle
  delay: 0,               // seconds before it starts
  parallax: 0.2,          // fraction of size per 1000px scrolled; + falls, − rises
  opacity: 0.5,           // keep low — these pass behind body text
  hideOnMobile: true,     // omit on about half the set
}
```

The `kind` is drawn entirely in CSS, so a shape costs no image and no request. The
squiggle is the exception: a wave has too many vertices to be a `clip-path`
polygon, so it is a stroked SVG path, drawn twice to get the same hard 3px
outline the others get from an inset fill.

Two placement rules keep the shapes out of the way, and they are worth preserving:

- **`x` under 0.08 or over 0.88, `y` under 0.21 or over 0.79.** The layer is
  `position: fixed`, so a shape holds the same corner of the *viewport* forever.
  Confining the set to the corners leaves the middle of the screen — where the
  body copy and buttons are — clean.
- **Sizes between 56 and 124px.** A corner is 12% of a 1000px viewport, and the
  hero's text column is 936px of that window at every width below `lg`.

Shapes still pass behind text at some scroll positions. That is inherent to a
fixed decoration layer and cannot be designed away, only reduced. What *is*
guaranteed is contrast: everything sits at `z-index: -1`, and the `opacity` values
are capped low enough that body text clears WCAG AA over every shape, in both
palettes.

### Turning animations off

Two independent switches, and neither needs a component edit:

- **Per visitor.** `prefers-reduced-motion: reduce` is honoured in CSS, not in
  JavaScript — so it is correct on the first painted frame, before hydration, and
  keeps working with scripting disabled. All loops stop, the shapes stay on screen
  as static decoration, and the marquee stops mid-strip. The cursor glow is not
  merely paused; it is never constructed.
- **Globally.** To drop the whole layer, delete `<AnimatedBackground />` from
  `src/app/layout.tsx`. To keep the layer but stop everything moving, add
  `[data-anim-paused="true"]` to `<html>` — that is the attribute the page already
  sets when the tab is hidden, so it is the supported hook to reach for. To remove
  just the shapes, empty `backgroundShapes` in `data/shapes.ts`.

For a subtler result, raise the `opacity` values in `data/shapes.ts` toward `0.15`.
The shapes keep their silhouettes and 3px outlines but recede into the page.

### Why it is cheap

Every loop is a `transform` or `opacity` animation, which the compositor runs
without touching layout or paint. The three decisions that keep it that way:

- **The dot grid drifts by `transform`, not `background-position`.** They look
  identical, but `background-position` cannot be composited — the browser would
  re-rasterise a full-viewport gradient on every frame of a 60-second loop,
  forever. The layer is oversized by more than the 56px travel (exactly two 28px
  grid cells, which is what makes the loop seamless), and translated.
- **The hero blob's `border-radius` morph is the one deliberate exception.** A blob
  that morphs has to interpolate `border-radius`, and that is a paint property. It
  is affordable only because it is the single such element: one solid fill, no
  border, no shadow, no blend mode. `clip-path` and animated radial gradients
  repaint the same area just as often, and the two-blob `mix-blend-mode`
  alternative trades the repaint for a per-frame blend pass over everything behind
  it.
- **Scroll parallax writes to `element.style` inside one rAF loop**, never React
  state, and only when the scroll position actually moved. Scrolling produces zero
  re-renders. `will-change` is on the four continuously-animating elements only;
  the shapes are not promoted, because their child is already composited and nine
  extra permanent layers is not worth a decorative flourish.

A hidden tab gets `data-anim-paused` on `<html>`, which sets
`animation-play-state: paused` on every loop at once — `paused` rather than `none`,
so returning to the tab resumes mid-cycle instead of snapping. The parallax rAF
loop and the cursor glow stop outright.

## Navbar

A full-width `position: sticky` bar — logo left, a link capsule in the middle,
theme toggle right. Inside the capsule, one accent pill slides between the links
to mark the section the reader is in. Below `md` the capsule gives way to a Menu
button and a panel that opens underneath.

| File | Role |
| --- | --- |
| `components/layout/Navbar.tsx` | the server component — reads the data, hands it down |
| `components/layout/NavShell.tsx` | the client shell — active section, shrink on scroll, open state |
| `components/layout/NavLinks.tsx` | the capsule — reused, vertical, in the mobile panel |
| `components/layout/MobileMenu.tsx` | the `md` panel, focus trap, scroll lock |
| `hooks/useSlidingIndicator.ts` | measures the pill's target; the only thing that writes its style |
| `hooks/useScrolled.ts` | boolean: has the page passed the shrink threshold |
| `hooks/useLockBodyScroll.ts` | ref-counted `overflow: hidden` + `lenis.stop()` |
| `data/profile.ts` → `nav` | **this is the file you edit** |

### Changing what it shows

Edit the `nav` object in `src/data/profile.ts`. Nothing else needs to change:

```ts
export const nav: ProfileNav = {
  logo: "DK.",
  links: [
    { label: "About", href: "#about" },   // href must match the section's id
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],
  menuLabel: "Menu",       // mobile Menu button, closed
  menuCloseLabel: "Close", // …and open
};
```

Add or remove a `links` entry and the capsule, the mobile panel and the active
highlight all follow. The only constraint is that `href` matches the `id` on the
section it points at — that is what `useActiveSection` watches, so a mismatched
id gives you a link that never lights up.

### The sliding highlight

One absolutely positioned pill, measured from the DOM and written as inline
styles. It looks like the slow way to do it, and it is the only one that stays
correct through a webfont swap or a resize — the alternatives cannot express
"move to wherever this link is *now*". Four things it has to get right:

- **No slide on first paint.** The pill is placed by a layout effect *before* the
  transition is enabled, and enabling it is a separate state update. Without the
  split it visibly flies in from the capsule's left edge on every page load.
- **`restingId` is a prop, not state.** The active section is passed in and only
  consulted when nothing is hovered. Copying it into state would let the pill
  disagree with `active` for a frame after every hover released.
- **A `ResizeObserver` on the capsule and each link.** A `resize` event is not
  enough — `next/font` swaps the typeface after hydration, which changes every
  link's width without resizing the window.
- **Only `transform` and one size are written.** Both are composited; `left` and
  `top` would force a layout on every frame of the slide.

Hover and keyboard focus pull the pill off the active link and hand it back on
the way out, but they never touch `aria-current` — pointing at a link is not
being in that section. The pill is `aria-hidden`; the only thing that marks the
current link for assistive tech is `aria-current="location"`, and the only thing
that recolours it is `data-lit`, set in the same render that positions the pill.

### Two deliberate deviations

- **The lit link is `--accent-ink`, not white.** White on `--accent` is 3.13:1
  at 14px and fails AA. `--accent-ink` is the pairing the rest of the site
  already uses for normal text on an accent plate and clears 5.33:1 in both
  themes.
- **The panel is absolutely positioned.** The bar is in flow, so a panel in flow
  would push the whole page down by its own height every time it opened. Taken
  out of flow it overlays the content instead — which is what a dropdown menu is.

### Reduced motion

The global `prefers-reduced-motion: reduce` block in `globals.css` already
collapses every transition to ~0, which covers the shrink, the pill's slide and
the panel. The one extra rule there drops the pill's overshoot easing, so it
cannot be caught travelling past its resting place.

## Project structure

```
src/
├── app/
│   ├── globals.css        # design tokens, dark mode, type pairing, background keyframes
│   ├── layout.tsx         # metadata, OG tags, fonts, pre-paint theme script
│   ├── page.tsx           # single page, section order
│   ├── sitemap.ts         # /sitemap.xml
│   ├── robots.ts          # /robots.txt
│   └── icon.svg           # favicon
├── components/
│   ├── background/        # AnimatedBackground, FloatingShapes, CursorGlow, Marquee
│   ├── ui/                # Button, Card, CountUp, Reveal, SectionHeading, StatTile, Tag
│   ├── layout/            # Navbar, NavShell, NavLinks, MobileMenu,
│   │                      #   ScrollProgress, SmoothScroll
│   ├── About, Contact, Footer, Hero, Projects, Section, Skills
│   ├── ProfileImage.tsx   # next/image with initials fallback
│   └── ThemeToggle.tsx    # dark mode toggle
├── data/                  # all content (see table above) + shapes.ts
├── hooks/                 # useInView, useActiveSection, useParallax, usePageVisible,
│                          #   usePrefersReducedMotion, useScrolled,
│                          #   useSlidingIndicator, useLockBodyScroll
├── lib/                   # cn(), constants.ts (motion), tone map, blur placeholders
└── types/                 # shared TypeScript types
```

The section components, `Navbar`, `Marquee` and every data file are
server-rendered and fully static. Only the animated leaves, the theme toggle, the
background layer and the smooth-scroll harness ship JavaScript.

## Deploying to Vercel

1. Push the repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
   Vercel detects Next.js and needs no build settings.
2. Add `NEXT_PUBLIC_SITE_URL` under **Project → Settings → Environment
   Variables**, set to your production domain.
3. Deploy. Every route prerenders as static content, so the site is served from
   the CDN with no server cost.

For any other host, `npm run build` emits a self-contained `.next` directory to
serve with `npm run start` or any Node host.

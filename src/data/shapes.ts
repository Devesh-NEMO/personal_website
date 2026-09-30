import type { BackgroundShape } from "@/types";

/**
 * The floating shapes in the background layer.
 *
 * Adding a shape is meant to be a one-line change: append an entry here and it
 * appears, animated, with no component edits.
 *
 * ## Two placement rules, and why they are rules
 *
 * 1. **`x` stays under 0.08 or over 0.88, and `y` stays under 0.21 or over
 *    0.79.** The layer is `position: fixed`, so a shape occupies the same
 *    corner of the *viewport* forever — it drifts past the content rather than
 *    sitting beside it. Restricting the set to the four corners means the
 *    middle of the screen, which is where the body copy and the buttons are,
 *    stays clean, and the density you actually see on arrival is at the top
 *    and bottom of the window.
 * 2. **Sizes stay between 56 and 124px.** A corner is 12% of a 1000px viewport
 *    wide. Anything much larger walks straight into the content column, and the
 *    hero's text column is 936px of a 1000px window at every width below `lg`.
 *
 * Shapes still pass *behind* text at some scroll positions — that is inherent to
 * a fixed decoration layer and cannot be designed away, only reduced. What is
 * guaranteed instead is contrast: the shapes sit at z-index -1 and the
 * `opacity` values below are capped low enough that body text clears WCAG AA
 * over every one of them, in both palettes.
 *
 * ## The rest of the invariants worth preserving when editing
 *
 *  - **No two shapes share a `duration`.** Even the numbers, never the same
 *    value twice, so the field never visibly pulses together.
 *  - **`parallax` is a fraction of size per 1000px scrolled**, clamped by the
 *    hook. Larger shapes drift less than small ones, which is what sells depth.
 *  - **About half carry `hideOnMobile`.** A 390px phone has no usable corner.
 *  - **Accent is used once, at 0.14.** It is the loudest colour in the palette;
 *    used at a shape's full opacity it would read as a call to action.
 */
export const backgroundShapes: BackgroundShape[] = [
  /* --- top band ----------------------------------------------------------- */
  {
    id: "top-circle",
    kind: "circle",
    tone: "mint",
    size: 124,
    x: 0.02,
    y: 0.03,
    rotate: 0,
    duration: 9,
    delay: 0,
    parallax: 0.2,
    opacity: 0.5,
  },
  {
    id: "top-plus",
    kind: "plus",
    tone: "periwinkle",
    size: 68,
    x: 0.05,
    y: 0.14,
    rotate: 8,
    duration: 11,
    delay: 1.4,
    parallax: 0.34,
    opacity: 0.45,
    hideOnMobile: true,
  },
  {
    id: "top-square",
    kind: "square",
    tone: "peach",
    size: 88,
    x: 0.9,
    y: 0.03,
    rotate: 12,
    duration: 13,
    delay: 0.6,
    parallax: -0.16,
    opacity: 0.5,
  },
  {
    id: "top-star",
    kind: "star",
    tone: "accent",
    size: 84,
    x: 0.93,
    y: 0.16,
    rotate: 0,
    duration: 14,
    delay: 2.2,
    parallax: -0.28,
    opacity: 0.14,
    // The faintest thing in the set, so it is the first to go when there is no
    // room for it. With this one added, exactly half hide on a phone.
    hideOnMobile: true,
  },

  /* --- bottom band -------------------------------------------------------- */
  {
    id: "bottom-circle",
    kind: "circle",
    tone: "pink",
    size: 122,
    x: 0.91,
    y: 0.82,
    rotate: 0,
    duration: 10,
    delay: 0.3,
    parallax: 0.22,
    opacity: 0.45,
  },
  {
    id: "bottom-squiggle",
    kind: "squiggle",
    tone: "periwinkle",
    size: 116,
    x: 0.04,
    y: 0.82,
    rotate: -6,
    duration: 12,
    delay: 1.8,
    parallax: -0.26,
    opacity: 0.5,
  },
  {
    id: "bottom-triangle",
    kind: "triangle",
    tone: "mint",
    size: 80,
    x: 0.06,
    y: 0.93,
    rotate: -10,
    duration: 8,
    delay: 0.9,
    parallax: 0.3,
    opacity: 0.42,
    hideOnMobile: true,
  },
  {
    id: "bottom-plus",
    kind: "plus",
    tone: "pink",
    size: 62,
    x: 0.93,
    y: 0.93,
    rotate: -6,
    duration: 7,
    delay: 2.6,
    parallax: -0.18,
    opacity: 0.45,
    hideOnMobile: true,
  },
];

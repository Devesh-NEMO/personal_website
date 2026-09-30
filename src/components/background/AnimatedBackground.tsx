"use client";

import { useEffect } from "react";

import { CursorGlow } from "@/components/background/CursorGlow";
import { FloatingShapes } from "@/components/background/FloatingShapes";
import { usePageVisible } from "@/hooks/usePageVisible";

/**
 * The animated backdrop: drifting dot grid, morphing hero blob, floating shapes
 * and the cursor-follow glow.
 *
 * One fixed layer behind the whole page, `pointer-events: none` so nothing here
 * is ever a click target, and `aria-hidden` because it is decoration with no
 * information in it.
 *
 * ## Why this is a client component
 *
 * The only thing it needs JavaScript for is the pause-on-hidden switch. CSS
 * loops live or die by `animation-play-state`, and only JavaScript can see the
 * Page Visibility API.
 *
 * The flag goes on `<html>` rather than on the layer, because the marquee strip
 * is in the page flow instead of inside the layer and needs to stop too. One
 * document-level attribute covers every loop on the page.
 *
 * `paused` rather than `none`, deliberately: a tab that comes back resumes
 * mid-cycle instead of snapping to a keyframe boundary, which at 25s for the
 * marquee would be a visible jump.
 *
 * ## What this component deliberately does *not* do
 *
 * Reduced motion is handled entirely in CSS, by the `prefers-reduced-motion`
 * block in globals.css. That is strictly better than an attribute set from
 * JavaScript: it is correct on the very first painted frame, before hydration,
 * and it keeps working if the script never runs at all. The grid and the blob
 * are pure CSS and need no JavaScript — without it they simply stop drifting.
 */
export function AnimatedBackground() {
  const pageVisible = usePageVisible();

  useEffect(() => {
    const root = document.documentElement;

    if (pageVisible) root.removeAttribute("data-anim-paused");
    else root.setAttribute("data-anim-paused", "true");
  }, [pageVisible]);

  return (
    <div className="bg-anim" aria-hidden="true">
      {/* Dot grid. Oversized and translated, not re-tiled — see the CSS. */}
      <div className="bg-anim__grid" />

      {/* Large accent wash behind the hero heading. */}
      <div className="bg-anim__blob" />

      <FloatingShapes />
      <CursorGlow />
    </div>
  );
}

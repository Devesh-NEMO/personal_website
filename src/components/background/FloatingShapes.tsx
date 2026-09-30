"use client";

import { useRef } from "react";

import { backgroundShapes } from "@/data/shapes";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useParallax } from "@/hooks/useParallax";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A hand-drawn wave, in a 120x120 box.
 *
 * The one silhouette that cannot be a `clip-path` polygon — a squiggle has too
 * many vertices to be worth listing, and hand-tuning a 40-point polygon to look
 * like a wave is the wrong trade. Drawn as a stroked path instead, twice: once
 * wide in the text colour and once narrow in the fill, which is the SVG
 * equivalent of the inset trick the CSS shapes use for their 3px outline.
 */
const SQUIGGLE_PATH =
  "M10 76 C 28 24, 48 24, 64 58 S 94 98, 112 44";

/**
 * The floating shapes in the background layer.
 *
 * Client-side only because of the parallax. The server renders the full,
 * correct markup — every shape is visible on the first painted frame, with
 * JavaScript or without, and without it they simply stop drifting.
 *
 * Three nested elements per shape, each owning exactly one CSS property, so the
 * scroll handler and the keyframes never contend for the same value:
 *
 *   .deco-shape    position, and the transform JS writes on scroll
 *     .deco-float  the transform the float keyframes animate
 *       body / svg the silhouette: fill, 3px outline, clip-path
 */
export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();

  useParallax(containerRef, !reducedMotion && pageVisible);

  return (
    <div ref={containerRef} className="deco-shapes" aria-hidden="true">
      {backgroundShapes.map((shape) => (
        <div
          key={shape.id}
          className="deco-shape"
          data-parallax={shape.parallax}
          data-kind={shape.kind}
          data-tone={shape.tone}
          data-hide-sm={shape.hideOnMobile ? "" : undefined}
          style={
            {
              left: `${shape.x * 100}%`,
              top: `${shape.y * 100}%`,
              "--size": `${shape.size}px`,
              "--rotate": `${shape.rotate}deg`,
              "--float-duration": `${shape.duration}s`,
              "--float-delay": `${shape.delay}s`,
              "--shape-opacity": shape.opacity,
            } as React.CSSProperties
          }
        >
          <div className="deco-float">
            {shape.kind === "squiggle" ? (
              <svg
                className="deco-squiggle"
                viewBox="0 0 120 120"
                aria-hidden="true"
              >
                <path d={SQUIGGLE_PATH} />
                <path d={SQUIGGLE_PATH} />
              </svg>
            ) : (
              <div className="deco-body" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

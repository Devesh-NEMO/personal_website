"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

/** Minimum horizontal drag (px) before a gesture counts as a swipe. */
const SWIPE_THRESHOLD = 40;

type Slide = { src: string; alt?: string };

/**
 * The project card gallery.
 *
 * A self-contained carousel — no dependency — with arrow buttons, dots, and
 * pointer/touch swiping. With a single image it renders the image alone and no
 * controls. The slides sit on a sliding track so a swipe reads as motion rather
 * than a jump cut.
 */
export function ProjectCarousel({ images, label }: { images: Slide[]; label: string }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const count = images.length;
  const multiple = count > 1;

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      className="group relative aspect-[16/9] w-full overflow-hidden border-b-[3px] border-fg bg-mint"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label} images`}
      onPointerDown={
        multiple
          ? (event) => {
              startX.current = event.clientX;
            }
          : undefined
      }
      onPointerUp={
        multiple
          ? (event) => {
              if (startX.current === null) return;
              const delta = event.clientX - startX.current;
              startX.current = null;
              if (Math.abs(delta) < SWIPE_THRESHOLD) return;
              goTo(index + (delta < 0 ? 1 : -1));
            }
          : undefined
      }
      onPointerCancel={() => {
        startX.current = null;
      }}
      style={multiple ? { touchAction: "pan-y" } : undefined}
    >
      <div
        className="flex size-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((slide, slideIndex) => (
          <div
            key={`${slide.src}-${slideIndex}`}
            className="relative size-full shrink-0"
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt || label}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={slide.src.endsWith(".svg")}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {multiple ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border-[2px] border-fg bg-surface/90 text-base font-black shadow-brutal transition-transform hover:-translate-y-[calc(50%+2px)] active:translate-y-[-50%]"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border-[2px] border-fg bg-surface/90 text-sm font-black shadow-brutal transition-transform hover:-translate-y-[calc(50%+2px)] active:translate-y-[-50%]"
          >
            <span aria-hidden="true">→</span>
          </button>

          <span className="brutal-pill absolute right-2 top-2 border-[2px] border-fg bg-surface/90 px-2 py-0.5 text-[10px] font-black tracking-tight">
            {index + 1}/{count}
          </span>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((slide, slideIndex) => (
              <button
                key={`dot-${slide.src}-${slideIndex}`}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Show image ${slideIndex + 1} of ${count}`}
                aria-current={slideIndex === index}
                className={cn(
                  "size-2.5 rounded-full border-[2px] border-fg transition-colors",
                  slideIndex === index ? "bg-fg" : "bg-surface hover:bg-peach",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

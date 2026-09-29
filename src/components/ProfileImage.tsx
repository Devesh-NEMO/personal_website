"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { blurDataUrl } from "@/lib/blur";
import { cn } from "@/lib/cn";
import { toneBackground } from "@/lib/tone";
import type { ImageAsset } from "@/types";

type ProfileImageProps = {
  asset: ImageAsset;
  /** Required by next/image so it can pick the right candidate width. */
  sizes: string;
  /**
   * Preload an above-the-fold image (the hero). Note: Next 16 deprecated the
   * older `priority` prop in favour of this one.
   */
  preload?: boolean;
  /** Classes applied to the <img> itself (e.g. object-cover). */
  className?: string;
};

/**
 * An image that never renders as a broken box.
 *
 * Uses next/image with `fill`, so the parent must be positioned and sized — that
 * reserves the layout space up front and keeps CLS at zero. If the file is
 * missing the optimiser returns HTTP 400; the initials then render on the
 * card's tone colour, so the box is identical either way.
 */
export function ProfileImage({
  asset,
  sizes,
  preload = false,
  className,
}: ProfileImageProps) {
  const [failed, setFailed] = useState(false);

  /*
   * `onError` alone is not enough. A missing file 400s immediately, so the
   * error event can fire *before* React hydrates and attaches the handler —
   * which leaves a broken <img> on screen forever. Checking the node as it is
   * attached catches that case: `complete` is true for a settled load and
   * `naturalWidth` is 0 only when it failed.
   */
  const attach = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div
        role="img"
        /* Leads with the initials so the visible text is contained in the
           accessible name (axe label-content-name-mismatch). */
        aria-label={`${asset.fallback} — ${asset.alt}`}
        className={cn("grid size-full place-items-center", toneBackground[asset.tone])}
      >
        <span className="text-4xl font-black tracking-tighter sm:text-5xl">
          {asset.fallback}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      fill
      sizes={sizes}
      preload={preload}
      placeholder="blur"
      blurDataURL={blurDataUrl(asset.tone)}
      onError={() => setFailed(true)}
      ref={attach}
      className={cn("object-cover", className)}
    />
  );
}

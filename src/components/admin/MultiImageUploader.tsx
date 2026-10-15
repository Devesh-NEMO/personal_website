"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { controlClasses } from "@/components/admin/Field";
import { uploadImageAction } from "@/lib/cloudinary-upload";
import { cn } from "@/lib/cn";

type Item = {
  /** Local React key — never submitted. */
  id: string;
  url: string;
  publicId: string;
  alt: string;
};

type MultiImageUploaderProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Name of the hidden input that carries the gallery to the server action. */
  name: string;
  initialImages?: { src: string; alt?: string; publicId?: string }[];
  folder?: string;
  /** Upper bound on the gallery size. Defaults to 4. */
  max?: number;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,image/svg+xml";

/**
 * Admin control for a project image gallery (2-4 images).
 *
 * Each file is uploaded to Cloudinary one at a time; results accumulate in local
 * state. The whole list is mirrored into a single hidden JSON input so the
 * wrapping <form> submits it alongside the other fields. Images can be
 * reordered (the first is the cover), removed, and given alt text.
 */
export function MultiImageUploader({
  label,
  hint,
  error,
  name,
  initialImages = [],
  folder = "portfolio/projects",
  max = 4,
}: MultiImageUploaderProps) {
  const [images, setImages] = useState<Item[]>(() =>
    initialImages.map((image, index) => ({
      id: `seed-${index}`,
      url: image.src,
      publicId: image.publicId ?? "",
      alt: image.alt ?? "",
    })),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const nextId = () => `new-${idCounter.current++}`;
  const remaining = max - images.length;
  const atMax = remaining <= 0;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const chosen = Array.from(fileList).slice(0, remaining);
    if (chosen.length === 0) return;

    setUploadError(null);
    startTransition(async () => {
      for (const file of chosen) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const result = await uploadImageAction(formData);
        if (!result.success) {
          setUploadError(result.message);
          break;
        }
        setImages((prev) => [
          ...prev,
          { id: nextId(), url: result.url, publicId: result.publicId, alt: "" },
        ]);
      }
    });
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleAlt = (id: string, alt: string) => {
    setImages((prev) => prev.map((image) => (image.id === id ? { ...image, alt } : image)));
  };

  /** Move an image one slot left/right. Slot 0 is the card cover. */
  const handleMove = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const serialized = JSON.stringify(
    images.map((image) => ({
      src: image.url,
      alt: image.alt.trim() || undefined,
      publicId: image.publicId || undefined,
    })),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-extrabold tracking-tight">{label}</label>
        <span className="text-xs font-semibold text-fg/60">
          {images.length}/{max} images
        </span>
      </div>

      {hint ? (
        <p className="text-xs leading-relaxed font-medium tracking-tight text-fg/70">{hint}</p>
      ) : null}

      {/* The gallery as one JSON string, read by saveProjectAction. */}
      <input type="hidden" name={name} value={serialized} />

      <div className="brutal-border rounded-[14px] bg-surface p-4 shadow-[3px_3px_0_var(--shadow-color)]">
        {images.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="flex flex-col gap-3 rounded-[12px] border-[2px] border-fg bg-mint/20 p-3 sm:flex-row sm:items-start"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-[10px] border-[2px] border-fg bg-mint/30">
                  {image.url.startsWith("http") || image.url.startsWith("/") ? (
                    <Image
                      src={image.url}
                      alt={image.alt || `${label} ${index + 1}`}
                      fill
                      sizes="96px"
                      unoptimized={image.url.endsWith(".svg")}
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-[10px] font-bold text-fg/70">
                      Preview unavailable
                    </div>
                  )}
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded-full border-[2px] border-fg bg-peach px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight">
                      Cover
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-tight text-fg/70">
                      Alt text
                    </span>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(event) => handleAlt(image.id, event.target.value)}
                      placeholder="Describe what this image shows"
                      className={cn(controlClasses, "text-sm")}
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move image ${index + 1} earlier`}
                      className="brutal-pill brutal-border bg-surface px-2.5 py-1 text-xs font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      ← Earlier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label={`Move image ${index + 1} later`}
                      className="brutal-pill brutal-border bg-surface px-2.5 py-1 text-xs font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      Later →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(image.id)}
                      aria-label={`Remove image ${index + 1}`}
                      className="brutal-pill brutal-border bg-accent px-2.5 py-1 text-xs font-extrabold text-accent-ink shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="rounded-full border-[2px] border-fg bg-mint/40 p-3">
              <svg
                aria-hidden="true"
                className="size-6 text-fg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight">
                {isPending ? "Uploading to Cloudinary…" : "No images chosen yet"}
              </p>
              <p className="mt-0.5 text-xs text-fg/70">
                Upload 2-4 JPG, PNG, WebP, GIF, AVIF or SVG files (max 5 MB each)
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isPending || atMax}
            onClick={() => fileInputRef.current?.click()}
            className="brutal-pill brutal-border bg-peach px-4 py-1.5 text-xs font-black shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            {isPending ? "Uploading…" : atMax ? `Maximum ${max} images` : "Add image"}
          </button>
          {images.length > 0 && !atMax ? (
            <span className="text-xs font-medium text-fg/60">
              You can add {remaining} more.
            </span>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
          disabled={isPending || atMax}
          className="hidden"
        />
      </div>

      {uploadError ? (
        <p
          role="alert"
          className="brutal-pill w-fit bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-ink"
        >
          {uploadError}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="brutal-pill w-fit bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { uploadImageAction } from "@/lib/cloudinary-upload";
import { cn } from "@/lib/cn";
import { controlClasses } from "@/components/admin/Field";

type ImageUploaderProps = {
  label: string;
  hint?: string;
  error?: string;
  urlName: string;
  publicIdName?: string;
  altName?: string;
  defaultUrl?: string;
  defaultPublicId?: string;
  defaultAlt?: string;
  folder?: string;
  aspect?: "square" | "video";
};

/**
 * Admin image upload control with Cloudinary integration.
 *
 * Supports file selection (JPG, PNG, WebP, GIF, AVIF, SVG), live preview,
 * replacement, alt text editing, and removal.
 * Hidden inputs sync the final Cloudinary URL and public ID with form submissions.
 */
export function ImageUploader({
  label,
  hint,
  error,
  urlName,
  publicIdName,
  altName,
  defaultUrl = "",
  defaultPublicId = "",
  defaultAlt = "",
  folder = "portfolio",
  aspect = "square",
}: ImageUploaderProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [publicId, setPublicId] = useState(defaultPublicId);
  const [alt, setAlt] = useState(defaultAlt);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (result.success) {
        setUrl(result.url);
        setPublicId(result.publicId);
      } else {
        setUploadError(result.message);
      }

      // Reset the file input so the same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  const handleRemove = () => {
    setUrl("");
    setPublicId("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isSquare = aspect === "square";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-extrabold tracking-tight">{label}</label>
        {url ? (
          <span className="text-xs font-semibold text-fg/60">
            {url.includes("cloudinary.com") ? "Hosted on Cloudinary" : "Existing image"}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p className="text-xs leading-relaxed font-medium tracking-tight text-fg/70">{hint}</p>
      ) : null}

      {/* Hidden inputs submitted with the wrapping <form> */}
      <input type="hidden" name={urlName} value={url} />
      {publicIdName ? <input type="hidden" name={publicIdName} value={publicId} /> : null}

      {/* Preview and Controls Container */}
      <div className="brutal-border rounded-[14px] bg-surface p-4 shadow-[3px_3px_0_var(--shadow-color)]">
        {url ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Image Preview Box */}
            <div
              className={cn(
                "relative shrink-0 overflow-hidden rounded-[10px] border-[2px] border-fg bg-mint/30 shadow-brutal",
                isSquare ? "size-32 sm:size-36" : "aspect-[16/9] w-full sm:w-48",
              )}
            >
              {url.startsWith("http") || url.startsWith("/") ? (
                <Image
                  src={url}
                  alt={alt || label}
                  fill
                  sizes="200px"
                  unoptimized={url.endsWith(".svg")}
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-xs font-bold text-fg/70">
                  Preview unavailable
                </div>
              )}
            </div>

            {/* Actions & Alt Text */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="brutal-pill brutal-border bg-peach px-3 py-1 text-xs font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  {isPending ? "Uploading…" : "Replace image"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRemove}
                  className="brutal-pill brutal-border bg-surface px-3 py-1 text-xs font-extrabold text-accent shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  Remove image
                </button>
              </div>

              {altName ? (
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${urlName}-alt`} className="text-xs font-bold tracking-tight">
                    Alt text (accessibility)
                  </label>
                  <input
                    id={`${urlName}-alt`}
                    name={altName}
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder={`Describe the ${label.toLowerCase()}…`}
                    className={controlClasses}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* Empty State / Upload Trigger */
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
                {isPending ? "Uploading to Cloudinary…" : `No ${label.toLowerCase()} chosen`}
              </p>
              <p className="mt-0.5 text-xs text-fg/70">
                Upload JPG, PNG, WebP, GIF, AVIF or SVG (max 5 MB)
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="brutal-pill brutal-border bg-peach px-4 py-1.5 text-xs font-black shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              {isPending ? "Uploading…" : "Choose image file"}
            </button>
          </div>
        )}

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
          onChange={handleFileChange}
          disabled={isPending}
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

"use server";

import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth";

/**
 * Server-side Cloudinary helper.
 *
 * Configured exclusively with server-only environment variables
 * (no NEXT_PUBLIC_ prefix). Secrets never reach the client.
 */
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export type UploadResult =
  | {
      success: true;
      url: string;
      publicId: string;
      width?: number;
      height?: number;
    }
  | {
      success: false;
      message: string;
    };

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Authenticated server action to upload an image to Cloudinary.
 *
 * Enforces admin authorization, 5 MB file size limit, allowed MIME formats,
 * and restricts target folders server-side.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized. Please log in as admin." };
  }

  const client = getCloudinary();
  if (!client) {
    return {
      success: false,
      message:
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { success: false, message: "No image file provided." };
  }

  if (file.size === 0) {
    return { success: false, message: "Selected file is empty." };
  }

  if (file.size > MAX_BYTES) {
    return {
      success: false,
      message: `File exceeds the 5 MB limit (size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // Check file type
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const validExtension = /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(fileName);

  if (!ALLOWED_MIME_TYPES.has(mimeType) && !validExtension) {
    return {
      success: false,
      message: "Unsupported format. Allowed formats: JPG, PNG, WebP, GIF, AVIF, SVG.",
    };
  }

  // Sanitize folder path server-side: only allow portfolio folders
  const rawFolder = String(formData.get("folder") || "portfolio").trim();
  const safeFolder = rawFolder.startsWith("portfolio") ? rawFolder : `portfolio/${rawFolder}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const safeMime = mimeType || "image/jpeg";
    const dataUri = `data:${safeMime};base64,${base64}`;

    const uploadResponse = await client.uploader.upload(dataUri, {
      folder: safeFolder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Cloudinary upload failed";
    console.error("Cloudinary upload error:", error);
    return { success: false, message: `Upload failed: ${errMessage}` };
  }
}

/**
 * Delete a Cloudinary asset by public ID.
 * Must only be called after confirming the asset is no longer referenced.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    await requireAdmin();
    const client = getCloudinary();
    if (!client || !publicId) return false;

    const result = await client.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Failed to delete Cloudinary asset:", error);
    return false;
  }
}

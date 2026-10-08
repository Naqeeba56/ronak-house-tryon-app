import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "try-on-results";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/=]+)$/i;

function normalizeImageType(contentType: string | undefined) {
  const mimeType = contentType?.split(";")[0].trim().toLowerCase();
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType && ["image/png", "image/jpeg", "image/webp"].includes(mimeType)) return mimeType;
  throw new Error("The generated file is not a supported image.");
}

export async function storeGeneratedTryOn(admin: SupabaseClient, userId: string, imageUrl: string) {
  let imageBytes: Uint8Array;
  let contentType: string;
  const dataUrl = imageUrl.match(DATA_URL_PATTERN);

  if (dataUrl) {
    contentType = normalizeImageType(dataUrl[1]);
    imageBytes = Buffer.from(dataUrl[2], "base64");
  } else {
    const parsedUrl = new URL(imageUrl);
    if (parsedUrl.protocol !== "https:") {
      throw new Error("The generated image URL must use HTTPS.");
    }

    const response = await fetch(parsedUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("Could not download the generated image.");

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) throw new Error("The generated image is too large to save.");

    contentType = normalizeImageType(response.headers.get("content-type") ?? undefined);
    imageBytes = new Uint8Array(await response.arrayBuffer());
  }

  if (imageBytes.byteLength === 0 || imageBytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("The generated image is empty or too large to save.");
  }

  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const storagePath = `${userId}/${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, imageBytes, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return { storagePath, contentType };
}

export async function createTryOnImageUrl(admin: SupabaseClient, storagePath: string) {
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not create a private image link.");
  return data.signedUrl;
}
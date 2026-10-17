import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "try-on-results";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/=]+)$/i;

function normalizeImageType(contentType: string | undefined) {
  const mimeType = contentType?.split(";")[0].trim().toLowerCase();
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType && ["image/png", "image/jpeg", "image/webp"].includes(mimeType)) return mimeType;
  throw new Error("The generated file is not a supported image.");
}

export async function storeGeneratedTryOn(
  admin: SupabaseClient,
  userId: string,
  generatedImageUrl: string,
  sourceImageDataUrl: string,
) {
  const generatedImage = await loadImageBytes(generatedImageUrl);
  const sourceMatch = sourceImageDataUrl.match(DATA_URL_PATTERN);
  if (!sourceMatch) throw new Error("The source photo is invalid.");
  const sourceImage = Buffer.from(sourceMatch[2], "base64");
  const [sourceMetadata, generatedMetadata] = await Promise.all([
    sharp(sourceImage).rotate().metadata(),
    sharp(generatedImage).rotate().metadata(),
  ]);
  if (!sourceMetadata.width || !sourceMetadata.height || !generatedMetadata.width || !generatedMetadata.height) {
    throw new Error("The generated image dimensions are invalid.");
  }
  const sourceAspectRatio = sourceMetadata.width / sourceMetadata.height;
  const generatedAspectRatio = generatedMetadata.width / generatedMetadata.height;
  if (Math.abs(sourceAspectRatio - generatedAspectRatio) / sourceAspectRatio > 0.015) {
    throw new Error("The generated image framing does not match the original photo.");
  }

  const imageBytes = await sharp(generatedImage).rotate().webp({ quality: 90, effort: 4 }).toBuffer();
  if (imageBytes.length > MAX_IMAGE_BYTES) throw new Error("The generated image is too large to save.");

  const storagePath = `${userId}/${randomUUID()}.webp`;
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, imageBytes, {
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return { storagePath, contentType: "image/webp" };
}

async function loadImageBytes(imageUrl: string) {
  const dataUrl = imageUrl.match(DATA_URL_PATTERN);
  if (dataUrl) return Buffer.from(dataUrl[2], "base64");

  const parsedUrl = new URL(imageUrl);
  if (parsedUrl.protocol !== "https:") throw new Error("The generated image URL must use HTTPS.");
  const response = await fetch(parsedUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error("Could not download the generated image.");
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error("The generated image is too large to save.");
  normalizeImageType(response.headers.get("content-type") ?? undefined);
  const imageBytes = Buffer.from(await response.arrayBuffer());
  if (!imageBytes.length || imageBytes.length > MAX_IMAGE_BYTES) {
    throw new Error("The generated image is empty or too large to save.");
  }
  return imageBytes;
}

export async function createTryOnImageUrl(admin: SupabaseClient, storagePath: string) {
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not create a private image link.");
  return data.signedUrl;
}
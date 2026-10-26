import { NextResponse } from "next/server";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_ADMIN_EMAIL, GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { buildTryOnPrompt, OUTFITS, type OutfitKey } from "@/lib/outfit-prompts";
import { siteUrl } from "@/lib/site-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTryOnImageUrl, storeGeneratedTryOn } from "@/lib/supabase/try-on-images";

const MAX_IMAGE_DATA_URL_LENGTH = 4_000_000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const AICREDITS_BASE_URL = (process.env.AICREDITS_BASE_URL || "https://api.aicredits.in/v1").replace(/\/+$/, "");
const OUTFIT_KEYS_BY_CATEGORY: Record<string, OutfitKey> = {
  Shirt: "male-shirt",
  Pant: "male-pant",
  "Indo-Western Jacket": "male-indo-western-jacket",
  "2-Piece Suit": "male-two-piece-suit",
  "3-Piece Suit": "male-three-piece-suit",
  Blazer: "male-blazer",
  "Nehru Jacket": "male-nehru-jacket",
  Sherwani: "male-sherwani",
  Kurta: "male-kurta",
  Pathani: "male-pathani",
  "Jodhpuri suit": "male-jodhpuri-suit",
  Saree: "female-saree",
  "Salwar suit": "female-salwar-suit",
  Lehenga: "female-lehenga",
};

type GenerateRequest = {
  garmentType?: string;
  garmentImage?: string;
  modelImage?: string;
  modelPresetId?: string;
  modelGender?: "male" | "female";
};

type ImagePart = {
  type?: string;
  data?: string;
  url?: string;
  mime_type?: string;
  mimeType?: string;
  image_url?: { url?: string };
};

type ChatCompletionResponse = {
  error?: string | { message?: string };
  choices?: Array<{
    message?: {
      content?: string | ImagePart[];
      images?: Array<{ image_url?: { url?: string }; url?: string }>;
    };
  }>;
};
type ChatMessage = NonNullable<ChatCompletionResponse["choices"]>[number]["message"];
type TryOnReservation = {
  reservation_id: string;
  source: string;
  free_remaining: number;
  pack_remaining: number;
};

type ValidatedImage = { bytes: Buffer; mimeType: "image/png" | "image/jpeg" | "image/webp" };

async function validateImageBytes(
  bytes: Buffer,
  mimeType: ValidatedImage["mimeType"],
): Promise<ValidatedImage | undefined> {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return undefined;

  try {
    const metadata = await sharp(bytes).metadata();
    const expectedFormat = mimeType === "image/jpeg" ? "jpeg" : mimeType.slice("image/".length);
    if (metadata.format !== expectedFormat) return undefined;
  } catch {
    return undefined;
  }

  return { bytes, mimeType };
}

async function validateImageDataUrl(value: unknown): Promise<ValidatedImage | undefined> {
  if (typeof value !== "string" || value.length > MAX_IMAGE_DATA_URL_LENGTH) return undefined;
  const match = value.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/]+={0,2})$/i);
  if (!match) return undefined;

  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString("base64") !== match[2]) return undefined;

  const inputMimeType = match[1].toLowerCase();
  const mimeType = inputMimeType === "image/jpg" ? "image/jpeg" : inputMimeType as ValidatedImage["mimeType"];
  return validateImageBytes(bytes, mimeType);
}

async function loadOutfitStyleImage(imagePath: string): Promise<ValidatedImage | undefined> {
  const response = await fetch(new URL(imagePath, siteUrl));
  if (!response.ok) return undefined;

  const responseMimeType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!responseMimeType || !["image/png", "image/jpeg", "image/webp"].includes(responseMimeType)) {
    return undefined;
  }
  const mimeType = (responseMimeType === "image/jpg" ? "image/jpeg" : responseMimeType) as ValidatedImage["mimeType"];
  return validateImageBytes(Buffer.from(await response.arrayBuffer()), mimeType);
}

function getImageUrl(message: ChatMessage) {
  if (!message) return undefined;

  const imageUrl = message.images?.[0]?.image_url?.url ?? message.images?.[0]?.url;
  if (imageUrl) return imageUrl;

  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      const imageUrl = part.image_url?.url ?? part.url;
      if (imageUrl) return imageUrl;

      const mimeType = part.mime_type ?? part.mimeType;
      if (part.data && mimeType && /^image\/(png|jpeg|jpg|webp)$/i.test(mimeType)) {
        return `data:${mimeType};base64,${part.data}`;
      }
    }
  }
  return undefined;
}

async function refundTryOnReservation(
  supabase: SupabaseClient,
  userId: string,
  reservationId: string,
) {
  const { data, error } = await supabase.rpc("finish_tryon_reservation", {
    p_user_id: userId,
    p_reservation_id: reservationId,
    p_succeeded: false,
  });
  return !error && data === true;
}

export async function POST(request: Request) {
  const sessionClient = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to generate a try-on." }, { status: 401 });
  }
  const isAdmin = user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL;

  const token = process.env.AICREDITS_API_KEY;
  if (!token || token.includes("*") || token === "your_aicredits_key") {
    console.error("Try-on generation is unavailable because the image provider credential is not configured.");
    return NextResponse.json(
      { error: "Try-on generation isn’t available right now. Please contact support if this continues." },
      { status: 503 },
    );
  }
  const imageModel = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (!imageModel) {
    console.error("Try-on generation is unavailable because the image model is not configured.");
    return NextResponse.json(
      { error: "Try-on generation isn’t available right now. Please contact support if this continues." },
      { status: 503 },
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "We couldn’t process your request. Please review your selections and try again." }, { status: 400 });
  }

  const modelPreset = TRY_ON_MODEL_PRESETS.find(({ id }) => id === body.modelPresetId);
  if (body.modelPresetId && !modelPreset) {
    return NextResponse.json({ error: "Choose a valid model preset." }, { status: 400 });
  }
  if (body.modelGender && !["male", "female"].includes(body.modelGender)) {
    return NextResponse.json({ error: "Choose a valid model category." }, { status: 400 });
  }
  const selectedGender = modelPreset?.gender ?? body.modelGender;
  if (!selectedGender) {
    return NextResponse.json({ error: "Choose a male or female model category." }, { status: 400 });
  }
  const garmentPreset = GARMENT_PRESETS.find(
    ({ label, gender }) => label === body.garmentType && (gender ?? "male") === selectedGender,
  );
  if (!garmentPreset) {
    return NextResponse.json({ error: "Choose a valid outfit for the selected model category." }, { status: 400 });
  }
  const outfitKey = body.garmentType ? OUTFIT_KEYS_BY_CATEGORY[body.garmentType] : undefined;
  if (!outfitKey || OUTFITS[outfitKey].gender !== selectedGender) {
    return NextResponse.json({ error: "Choose a valid outfit for the selected model category." }, { status: 400 });
  }
  const styleImagePath = garmentPreset.thumbnails?.[selectedGender];
  if (!styleImagePath) {
    return NextResponse.json({ error: "This outfit style is currently unavailable. Please choose another style." }, { status: 400 });
  }
  if (!body.modelImage) {
    return NextResponse.json({ error: "Choose a male or female model preset, or upload a model image." }, { status: 400 });
  }

  const [modelImage, fabricImage, styleImage] = await Promise.all([
    validateImageDataUrl(body.modelImage),
    validateImageDataUrl(body.garmentImage),
    loadOutfitStyleImage(styleImagePath),
  ]);
  if (!modelImage) {
    return NextResponse.json({ error: "Upload a valid PNG, JPG, or WebP model image under 3 MB." }, { status: 400 });
  }
  if (!fabricImage) {
    return NextResponse.json({ error: "Upload a valid PNG, JPG, or WebP fabric image under 3 MB." }, { status: 400 });
  }
  if (!styleImage) {
    return NextResponse.json({ error: "Could not load the selected outfit style reference. Please try again." }, { status: 503 });
  }
  let reservation: TryOnReservation | null = null;
  if (!isAdmin) {
    const { data: reservations, error: reservationError } = await sessionClient.rpc("reserve_tryon_credit", {
      p_user_id: user.id,
    });
    if (reservationError) {
      return NextResponse.json({ error: "Try-on credits are not available right now." }, { status: 503 });
    }
    reservation = (reservations as TryOnReservation[] | null)?.[0] ?? null;
  }

  if (!isAdmin && !reservation) {
    return NextResponse.json(
      { error: "Your free try-on is used. Choose a plan to continue creating try-ons.", code: "TRYON_LIMIT_REACHED" },
      { status: 402 },
    );
  }

  let storagePath: string | null = null;
  let generationId: string | null = null;
  try {
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      { type: "text", text: "Image 1 (PERSON):" },
      { type: "image_url", image_url: { url: `data:${modelImage.mimeType};base64,${modelImage.bytes.toString("base64")}` } },
      { type: "text", text: "Image 2 (FABRIC):" },
      { type: "image_url", image_url: { url: `data:${fabricImage.mimeType};base64,${fabricImage.bytes.toString("base64")}` } },
      { type: "text", text: "Image 3 (OUTFIT STYLE REFERENCE):" },
      { type: "image_url", image_url: { url: `data:${styleImage.mimeType};base64,${styleImage.bytes.toString("base64")}` } },
      { type: "text", text: buildTryOnPrompt(outfitKey) },
    ];
    let outputUrl: string | undefined;
    let providerFailed = false;
    for (let attempt = 0; attempt < 2 && !outputUrl; attempt += 1) {
      const aicreditsResponse = await fetch(`${AICREDITS_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: imageModel,
          messages: [{ role: "user", content }],
        }),
      });
      if (!aicreditsResponse.ok) {
        console.error("The image generation provider rejected a try-on request.", { status: aicreditsResponse.status });
        providerFailed = true;
        break;
      }
      const result = (await aicreditsResponse.json()) as ChatCompletionResponse;
      outputUrl = getImageUrl(result.choices?.[0]?.message);
    }
    if (!outputUrl) {
      const refunded = !reservation || await refundTryOnReservation(sessionClient, user.id, reservation.reservation_id);
      if (!refunded) {
        return NextResponse.json({ error: "Generation failed and its credit could not be restored. Contact support before retrying." }, { status: 503 });
      }
      return NextResponse.json(
        { error: providerFailed ? "Image generation is temporarily unavailable. Please try again." : "The try-on could not be generated. Please try again." },
        { status: 502 },
      );
    }

    const stored = await storeGeneratedTryOn(
      sessionClient,
      user.id,
      outputUrl,
      `data:${modelImage.mimeType};base64,${modelImage.bytes.toString("base64")}`,
    );
    storagePath = stored.storagePath;

    const { data: generation, error: insertError } = await sessionClient
      .from("try_on_generations")
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        garment_type: garmentPreset.label,
        model_gender: modelPreset ? selectedGender : "custom",
      })
      .select("id")
      .single();
    if (insertError || !generation) throw insertError ?? new Error("Could not save this try-on.");
    generationId = generation.id;

    const signedImageUrl = await createTryOnImageUrl(sessionClient, storagePath);
    if (reservation) {
      const { data: reservationFinished, error: finishError } = await sessionClient.rpc("finish_tryon_reservation", {
        p_user_id: user.id,
        p_reservation_id: reservation.reservation_id,
        p_succeeded: true,
      });
      if (finishError || !reservationFinished) {
        throw finishError ?? new Error("Could not finalize the try-on credit.");
      }
    }

    return NextResponse.json({
      outputUrl: signedImageUrl,
      generationId,
      unlimited: isAdmin,
      freeRemaining: reservation?.free_remaining ?? 0,
      packRemaining: reservation?.pack_remaining ?? 0,
    });
  } catch (generationError) {
    console.error("Could not complete or save the generated try-on.", generationError);
    if (generationId) {
      await sessionClient.from("try_on_generations").delete().eq("id", generationId).eq("user_id", user.id);
    }
    if (storagePath) {
      await sessionClient.storage.from("try-on-results").remove([storagePath]);
    }
    const refunded = !reservation || await refundTryOnReservation(sessionClient, user.id, reservation.reservation_id);
    if (!refunded) {
      return NextResponse.json({ error: "Try-on failed and its credit could not be restored. Contact support before retrying." }, { status: 503 });
    }
    return NextResponse.json({ error: "Try-on generation or saving failed. Your credit was restored." }, { status: 502 });
  }
}

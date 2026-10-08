import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_ADMIN_EMAIL, GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTryOnImageUrl, storeGeneratedTryOn } from "@/lib/supabase/try-on-images";

const MAX_IMAGE_DATA_URL_LENGTH = 4_000_000;
const IMAGE_MODEL = "google/gemini-3.1-flash-lite-image";
const AICREDITS_BASE_URL = (process.env.AICREDITS_BASE_URL || "https://api.aicredits.in/v1").replace(/\/+$/, "");

type GenerateRequest = {
  garmentType?: string;
  garmentImage?: string;
  modelImage?: string;
  modelPresetId?: string;
  modelGender?: "male" | "female";
};

type ImagePart = {
  type?: string;
  text?: string;
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

function isImageDataUrl(value: unknown): value is string {
  return typeof value === "string" && /^data:image\/(png|jpeg|jpg|webp);base64,[a-z0-9+/=]+$/i.test(value);
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

  if (typeof message.content === "string") {
    const dataUrl = message.content.match(/data:image\/(?:png|jpeg|jpg|webp);base64,[a-z0-9+/=]+/i)?.[0];
    if (dataUrl) return dataUrl;

    const markdownUrl = message.content.match(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/i)?.[1];
    if (markdownUrl) return markdownUrl;

    const value = message.content.trim();
    try {
      if (new URL(value).protocol === "https:") return value;
    } catch {
      if (/^[a-z0-9+/]+={0,2}$/i.test(value) && value.length % 4 === 0) {
        return `data:image/png;base64,${value}`;
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
    return NextResponse.json(
      { error: "AICredits is not configured. Add AICREDITS_API_KEY to your local environment." },
      { status: 503 },
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "The generation request was not valid JSON." }, { status: 400 });
  }

  const garmentPreset = GARMENT_PRESETS.find(({ label }) => label === body.garmentType);
  if (!garmentPreset) {
    return NextResponse.json({ error: "Choose a valid garment type." }, { status: 400 });
  }

  const modelPreset = TRY_ON_MODEL_PRESETS.find(({ id }) => id === body.modelPresetId);
  if (body.modelPresetId && !modelPreset) {
    return NextResponse.json({ error: "Choose a valid model preset." }, { status: 400 });
  }
  if (body.modelGender && !["male", "female"].includes(body.modelGender)) {
    return NextResponse.json({ error: "Choose a valid model category." }, { status: 400 });
  }
  const selectedGender = modelPreset?.gender ?? body.modelGender;
  if (!selectedGender || garmentPreset.gender !== selectedGender) {
    return NextResponse.json({ error: "Choose an outfit from the selected category." }, { status: 400 });
  }

  let modelImage: string;
  if (body.modelImage) {
    if (!isImageDataUrl(body.modelImage) || body.modelImage.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json({ error: "Upload a PNG, JPG, or WebP model image under 3 MB." }, { status: 400 });
    }
    modelImage = body.modelImage;
  } else {
    return NextResponse.json({ error: "Choose a male or female model preset, or upload a model image." }, { status: 400 });
  }

  if (!isImageDataUrl(body.garmentImage) || body.garmentImage.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "Upload a PNG, JPG, or WebP garment image under 3 MB." }, { status: 400 });
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
    const imagePrompt = [
      "You are an expert fashion virtual try-on image editor. Edit the first reference image; do not create a different person or an unrelated outfit.",
      `Image 1 is ${modelPreset ? `a ${modelPreset.gender} model` : "the selected model"}. Preserve the model's identity, face, hair, body shape, pose, camera angle, lighting, and background.`,
      `The requested outfit is ${garmentPreset.description}. Make sure the output clearly shows the model wearing this exact garment type, replacing the original target clothing if necessary.`,
      `Image 2 is the reference garment. Dress the customer in ${garmentPreset.description}, using the garment photo as the source for its design, fabric, print, embroidery, colors, and details.`,
      `Adapt the reference garment naturally to ${garmentPreset.fabricTarget}, preserving its construction, cut, seams, fit, and folds while respecting the customer's pose and body proportions.`,
      "Do not change the customer's identity, skin, hair, or background. Do not add text, borders, or a collage. Produce one clear, high-quality, photorealistic full-body try-on image.",
    ].join(" ");
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      { type: "text", text: imagePrompt },
    ];
    content.push({ type: "image_url", image_url: { url: modelImage } });
    content.push({ type: "image_url", image_url: { url: body.garmentImage } });

    const aicreditsResponse = await fetch(`${AICREDITS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content }],
      }),
    });

    const result = (await aicreditsResponse.json()) as ChatCompletionResponse;
    if (!aicreditsResponse.ok) {
      const providerError = typeof result.error === "string" ? result.error : result.error?.message;
      const refunded = !reservation || await refundTryOnReservation(sessionClient, user.id, reservation.reservation_id);
      if (!refunded) {
        return NextResponse.json({ error: "Generation failed and its credit could not be restored. Contact support before retrying." }, { status: 503 });
      }
      return NextResponse.json(
        { error: providerError ?? "AICredits could not generate the try-on." },
        { status: aicreditsResponse.status },
      );
    }

    const outputUrl = getImageUrl(result.choices?.[0]?.message);
    if (!outputUrl) {
      const refunded = !reservation || await refundTryOnReservation(sessionClient, user.id, reservation.reservation_id);
      if (!refunded) {
        return NextResponse.json({ error: "Generation failed and its credit could not be restored. Contact support before retrying." }, { status: 503 });
      }
      return NextResponse.json({ error: "The selected AICredits model did not return an image." }, { status: 502 });
    }

    const stored = await storeGeneratedTryOn(sessionClient, user.id, outputUrl);
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
  } catch {
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

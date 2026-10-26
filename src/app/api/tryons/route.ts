import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_SIZES = [6, 8] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "8");

  if (!Number.isSafeInteger(page) || page < 1 || !PAGE_SIZES.includes(pageSize as (typeof PAGE_SIZES)[number])) {
    return NextResponse.json({ error: "Choose a valid Library page." }, { status: 400 });
  }
  const start = (page - 1) * pageSize;
  if (!Number.isSafeInteger(start)) {
    return NextResponse.json({ error: "Choose a valid Library page." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view your Library." }, { status: 401 });
  }

  const { data: generations, count, error: queryError } = await supabase
    .from("try_on_generations_with_retention")
    .select("id, storage_path, garment_type, model_gender, created_at, expires_at, days_remaining", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(start, start + pageSize - 1);

  if (queryError) {
    console.error("Could not load a Library page.", queryError);
    return NextResponse.json({ error: "Your Library could not be loaded. Please try again." }, { status: 500 });
  }

  const rows = generations ?? [];
  let signedUrls: Array<string | null> = [];
  if (rows.length) {
    const { data, error: signingError } = await supabase.storage
      .from("try-on-results")
      .createSignedUrls(rows.map(({ storage_path }) => storage_path), 60 * 60);
    if (signingError) {
      console.error("Could not sign images for a Library page.", signingError);
      return NextResponse.json({ error: "Saved images are temporarily unavailable. Please try again." }, { status: 502 });
    }
    signedUrls = data.map((item) => item.error ? null : item.signedUrl);
  }

  return NextResponse.json({
    images: rows.map((generation, index) => ({
      id: generation.id,
      garment_type: generation.garment_type,
      model_gender: generation.model_gender,
      created_at: generation.created_at,
      days_remaining: generation.days_remaining,
      imageUrl: signedUrls[index] ?? null,
    })),
    totalCount: count ?? 0,
  });
}

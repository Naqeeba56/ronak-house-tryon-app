import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to download this try-on." }, { status: 401 });
  }

  const { data: generation, error: queryError } = await supabase
    .from("try_on_generations")
    .select("storage_path, garment_type, expires_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (queryError || !generation) {
    return NextResponse.json({ error: "Try-on not found." }, { status: 404 });
  }
  if (new Date(generation.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This try-on has expired." }, { status: 410 });
  }

  const { data: image, error: downloadError } = await supabase.storage
    .from("try-on-results")
    .download(generation.storage_path);
  if (downloadError || !image) {
    return NextResponse.json({ error: "Could not download this try-on." }, { status: 502 });
  }

  const extension = image.type === "image/jpeg" ? "jpg" : image.type.split("/")[1] || "png";
  return new Response(image, {
    headers: {
      "Content-Type": image.type || "image/png",
      "Content-Disposition": `attachment; filename="fabricfit-${generation.garment_type.toLowerCase()}-${id}.${extension}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
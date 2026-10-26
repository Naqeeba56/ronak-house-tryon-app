import { NextResponse } from "next/server";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view your try-on balance." }, { status: 401 });
  }
  if (user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL) {
    return NextResponse.json({ unlimited: true, freeRemaining: 0, packRemaining: 0 });
  }

  const now = new Date().toISOString();
  const [entitlements, grants] = await Promise.all([
    supabase
      .from("tryon_entitlements")
      .select("free_tryon_used")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("tryon_credit_grants")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .gt("expires_at", now)
      .gt("credits_remaining", 0),
  ]);

  if (entitlements.error || grants.error) {
    return NextResponse.json({ error: "Your try-on balance is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  return NextResponse.json({
    freeRemaining: entitlements.data?.free_tryon_used ? 0 : 1,
    packRemaining: grants.data.reduce((total, grant) => total + grant.credits_remaining, 0),
  });
}
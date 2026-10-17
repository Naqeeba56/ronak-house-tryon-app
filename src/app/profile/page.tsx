import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProfileExperience from "@/components/profile/ProfileExperience";

export const metadata: Metadata = {
  title: "Your Account",
  description: "Manage your VTON Labs profile, balance, and saved looks.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/?auth=required");

  const isAdmin = user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL;
  let freeRemaining = 0;
  let packRemaining = 0;

  if (!isAdmin) {
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

    if (entitlements.error) throw entitlements.error;
    if (grants.error) throw grants.error;

    freeRemaining = entitlements.data?.free_tryon_used ? 0 : 1;
    packRemaining = grants.data.reduce((total, grant) => total + grant.credits_remaining, 0);
  }

  return (
    <ProfileExperience
      initialProfile={{
        email: user.email ?? "",
        fullName: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Your profile"),
        avatarUrl: typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : typeof user.user_metadata?.picture === "string"
            ? user.user_metadata.picture
            : null,
        freeRemaining,
        packRemaining,
        isAdmin,
      }}
    />
  );
}

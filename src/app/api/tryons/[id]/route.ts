import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to delete this try-on." }, { status: 401 });
  }

  const { data: generation, error: queryError } = await supabase
    .from("try_on_generations")
    .select("id, storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (queryError) {
    console.error("Could not load the user's try-on for deletion.", queryError);
    return NextResponse.json({ error: "We couldn’t delete this look. Please try again later." }, { status: 500 });
  }
  if (!generation) {
    return NextResponse.json({ error: "Try-on not found." }, { status: 404 });
  }

  const { error: storageError } = await supabase.storage
    .from("try-on-results")
    .remove([generation.storage_path]);
  if (storageError) {
    console.error("Could not remove the user's saved try-on image.", storageError);
    return NextResponse.json({ error: "We couldn’t delete this look. Please try again later." }, { status: 502 });
  }

  const { error: deleteError } = await supabase
    .from("try_on_generations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);
  if (deleteError) {
    console.error("Could not mark try-on as deleted after removing its image.", deleteError);
    return NextResponse.json({ error: "The image was removed, but its Library record could not be updated. Please contact support." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

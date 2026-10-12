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
    .maybeSingle();
  if (queryError) {
    return NextResponse.json({ error: "Could not load this try-on for deletion." }, { status: 500 });
  }
  if (!generation) {
    return NextResponse.json({ error: "Try-on not found." }, { status: 404 });
  }

  const { error: storageError } = await supabase.storage
    .from("try-on-results")
    .remove([generation.storage_path]);
  if (storageError) {
    return NextResponse.json({ error: "Could not remove the saved image. Please try again." }, { status: 502 });
  }

  const { error: deleteError } = await supabase
    .from("try_on_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (deleteError) {
    console.error("Could not remove try-on record after deleting its image.", deleteError);
    return NextResponse.json({ error: "The image was removed, but its Library record could not be deleted. Please contact support." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

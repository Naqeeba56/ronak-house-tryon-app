import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Retention cleanup is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: expired, error: queryError } = await admin
      .from("try_on_generations")
      .select("id, storage_path")
      .lt("expires_at", new Date().toISOString())
      .is("deleted_at", null)
      .limit(1000);
    if (queryError) throw queryError;
    if (!expired?.length) return NextResponse.json({ deleted: 0 });

    const { error: storageError } = await admin.storage
      .from("try-on-results")
      .remove(expired.map(({ storage_path }) => storage_path));
    if (storageError) throw storageError;

    const { error: deleteError } = await admin
      .from("try_on_generations")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", expired.map(({ id }) => id));
    if (deleteError) throw deleteError;

    return NextResponse.json({ deleted: expired.length });
  } catch {
    return NextResponse.json({ error: "Could not clean up expired try-ons." }, { status: 500 });
  }
}
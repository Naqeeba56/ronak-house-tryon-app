import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ResultActions } from "@/components/studio/ResultActions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/?auth=required");

  const { data: generation } = await supabase
    .from("try_on_generations_with_retention")
    .select("id, storage_path, garment_type, model_gender, created_at, expires_at, days_remaining")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!generation) notFound();

  const { data: image } = await supabase.storage
    .from("try-on-results")
    .createSignedUrl(generation.storage_path, 60 * 60);
  if (!image?.signedUrl) notFound();

  return (
    <section className="mx-auto min-h-[70vh] max-w-5xl px-4 py-8 text-slate-100 sm:px-6">
      <header className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Result</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Your try-on is ready</h1>
        <p className="mt-1 text-sm capitalize text-slate-400">{generation.model_gender} · {generation.garment_type} · saved for {generation.days_remaining} more days</p>
      </header>

      <div className="mx-auto max-w-2xl">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
          <Image src={image.signedUrl} alt={`Your ${generation.garment_type} try-on`} fill unoptimized className="object-contain" />
        </div>
        <ResultActions generationId={generation.id} />
        <p className="mt-3 text-center text-xs text-slate-500">
          Your saved copy is in <Link href="/library" className="text-indigo-300 hover:text-white">My Library</Link> for 30 days.
        </p>
      </div>
    </section>
  );
}
import Link from "next/link";
import { ArrowRight, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/Footer";
import LibraryGallery from "@/components/library/LibraryGallery";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/?auth=required");

  const { data: generations, error } = await supabase
    .from("try_on_generations_with_retention")
    .select("id, storage_path, garment_type, model_gender, created_at, expires_at, days_remaining")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const images = await Promise.all((generations ?? []).map(async (generation) => {
    const { data } = await supabase.storage.from("try-on-results").createSignedUrl(generation.storage_path, 60 * 60);
    return { ...generation, imageUrl: data?.signedUrl ?? null };
  }));

  return (
    <>
      <section className="mobile-compact mx-auto min-h-[70vh] max-w-7xl px-4 py-7 text-slate-100 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
              <LockKeyhole className="h-3.5 w-3.5" /> Private collection
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl">Your looks, saved.</h1>
            <p className="mt-2 text-sm text-slate-400">Keep your favorite try-ons close. Your images are only visible to you.</p>
          </div>
          <Link href="/studio" className="group inline-flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto sm:self-auto">
            <Sparkles className="h-4 w-4" /> Create a try-on <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3.5 sm:mb-7 sm:px-5 sm:py-4">
          <div><p className="text-sm font-semibold text-white">{error ? "Library unavailable" : `${images.length} ${images.length === 1 ? "look" : "looks"} saved`}</p><p className="mt-0.5 text-xs text-slate-500">Your try-on collection</p></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
            <Clock3 className="h-3.5 w-3.5 text-indigo-300" /> Images automatically expire after 30 days
          </span>
        </div>

        {error ? (
          <div role="alert" className="rounded-3xl border border-rose-400/25 bg-rose-400/5 p-6 text-sm leading-6 text-rose-200">
            <p className="font-semibold">Your Library couldn’t load.</p>
            <p className="mt-2 text-rose-200/80">Check that all three Supabase migrations have been applied in timestamp order. The required <code className="rounded bg-slate-950/60 px-1.5 py-0.5">try_on_generations_with_retention</code> view is created by <code className="rounded bg-slate-950/60 px-1.5 py-0.5">20261008000200_billing_plans_and_expiry.sql</code>. Apply only migrations that have not already succeeded, then reload.</p>
            <p className="mt-2 break-words text-xs text-rose-200/70">Supabase error: {error.message}</p>
          </div>
        ) : (
          <LibraryGallery images={images} />
        )}
      </section>
      <Footer />
    </>
  );
}

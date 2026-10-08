import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Download, ImageIcon, LockKeyhole, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
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
    <section className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 text-slate-100 sm:px-8 lg:px-10 lg:py-14">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
            <LockKeyhole className="h-3.5 w-3.5" /> Private collection
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your looks, saved.</h1>
          <p className="mt-2 text-sm text-slate-400">Keep your favorite try-ons close. Your images are only visible to you.</p>
        </div>
        <Link href="/studio" className="group inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:self-auto">
          <Sparkles className="h-4 w-4" /> Create a try-on <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/75 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><ImageIcon className="h-5 w-5" /></span>
          <div><p className="text-sm font-semibold text-white">{error ? "Library unavailable" : `${images.length} ${images.length === 1 ? "look" : "looks"} saved`}</p><p className="mt-0.5 text-xs text-slate-500">Your try-on collection</p></div>
        </div>
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
      ) : images.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-slate-950/15">
              <div className="media-overlay relative aspect-[4/4.5] overflow-hidden bg-slate-950">
                {image.imageUrl ? (
                  <Image src={image.imageUrl} alt={`${image.garment_type} try-on`} fill unoptimized className="object-contain transition duration-500 group-hover:scale-[1.02]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600"><ImageIcon className="h-8 w-8" /></div>
                )}
                <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/65 px-3 py-1.5 text-[11px] font-medium capitalize text-white backdrop-blur">{image.model_gender} look</span>
                {image.imageUrl && (
                  <a
                    href={image.imageUrl}
                    download={`fabricfit-${image.garment_type.toLowerCase()}-${image.id}.png`}
                    aria-label={`Download ${image.garment_type} try-on`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/65 text-white backdrop-blur transition hover:bg-indigo-600"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-white">{image.garment_type}</h2><p className="mt-1 text-xs text-slate-500">{new Date(image.created_at).toLocaleDateString()}</p></div>
                  <span className="shrink-0 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-300">{image.days_remaining}d left</span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, image.days_remaining / 30 * 100))}%` }} /></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/45 px-5 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"><ImageIcon className="h-6 w-6" /></span>
          <h2 className="mt-5 text-lg font-semibold text-white">Your first look is waiting.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">Create a virtual try-on and it’ll be saved here, ready whenever you need a little inspiration.</p>
          <Link href="/studio" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Open the Studio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
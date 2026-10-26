import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock3, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/Footer";
import BrandMark from "@/components/layout/BrandMark";
import LibraryGallery from "@/components/library/LibraryGallery";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Try-On Library",
  description: "View and manage your saved virtual try-on results.",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/?auth=required");
  const isAdmin = user.app_metadata?.role === "owner"
    || user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL;

  const { data: generations, count, error: queryError } = await supabase
    .from("try_on_generations_with_retention")
    .select("id, storage_path, garment_type, model_gender, created_at, expires_at, days_remaining", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 7);
  if (queryError) console.error("Could not load the authenticated user's Library.", queryError);

  let signingError: string | null = null;
  let signedUrls: Array<string | null> = [];
  if (generations?.length && !queryError) {
    const { data, error } = await supabase.storage
      .from("try-on-results")
      .createSignedUrls(generations.map(({ storage_path }) => storage_path), 60 * 60);
    if (error) {
      console.error("Could not create signed image links for the authenticated user's Library.", error);
      signingError = "Saved images are temporarily unavailable. Please reload the Library.";
    } else {
      signedUrls = data.map((item) => item.error ? null : item.signedUrl);
    }
  }
  const libraryUnavailable = Boolean(queryError || signingError);
  const images = (generations ?? []).map((generation, index) => ({
    ...generation,
    imageUrl: signedUrls[index] ?? null,
  }));
  const totalCount = count ?? images.length;

  return (
    <>
      <section className="mobile-compact mx-auto min-h-[70vh] max-w-7xl px-3.5 py-5 text-slate-100 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
        <header className="mb-3 flex flex-col justify-between gap-2 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
            <LockKeyhole className="h-3.5 w-3.5" /> Account-only collection
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl">Your looks, saved.</h1>
            <p className="mt-2 text-sm text-slate-400">Your saved results are available through your account.</p>
          </div>
          <Link href="/studio" className="group inline-flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto sm:self-auto">
            <BrandMark className="h-4 w-4" /> Create a try-on <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </header>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/75 px-3 py-2.5 sm:mb-7 sm:gap-3 sm:px-5 sm:py-4">
          <div><p className="text-sm font-semibold text-white">{libraryUnavailable ? "Library unavailable" : `${totalCount} ${totalCount === 1 ? "look" : "looks"} saved`}</p><p className="mt-0.5 text-xs text-slate-500">Your try-on collection</p></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
            <Clock3 className="h-3.5 w-3.5 text-indigo-300" /> Images automatically expire after 30 days
          </span>
        </div>

        {queryError ? (
          <ErrorAlert
            title="Your Library couldn’t load"
            description="We couldn’t load your saved looks. Please try again later."
            details={isAdmin && (
              <p className="mt-1 break-words text-gray-500">
                {queryError.message} Check that required database migrations have been applied.
              </p>
            )}
            className="w-full sm:w-full"
          />
        ) : (
          <>
            {signingError && <ErrorAlert description={signingError} className="mb-4 w-full sm:w-full" />}
            <LibraryGallery images={images} totalCount={totalCount} />
          </>
        )}
      </section>
      <Footer />
    </>
  );
}

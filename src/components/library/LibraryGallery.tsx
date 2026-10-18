"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, Image as ImageIcon, Trash2, X } from "lucide-react";
import { formatDisplayDate } from "@/lib/date-format";
import ErrorAlert from "@/components/ui/ErrorAlert";

export type LibraryImage = {
  id: string;
  garment_type: string;
  model_gender: string;
  created_at: string;
  days_remaining: number;
  imageUrl: string | null;
};

export default function LibraryGallery({ images: initialImages }: { images: LibraryImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [preview, setPreview] = useState<LibraryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryImage | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tryons/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete this try-on.");
      setImages((current) => current.filter(({ id }) => id !== deleteTarget.id));
      if (preview?.id === deleteTarget.id) setPreview(null);
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this try-on.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {error && <ErrorAlert description={error} className="mb-4 w-full sm:w-full" onDismiss={() => setError(null)} />}
      {failedImageIds.size > 0 && (
        <ErrorAlert
          description="Some saved images could not be loaded. Reload the Library to refresh their private image links."
          className="mb-4 w-full sm:w-full"
        />
      )}
      {images.length ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-slate-950/15 sm:rounded-3xl">
              <div className="media-overlay relative aspect-[4/4.5] overflow-hidden bg-slate-950">
                {image.imageUrl && !failedImageIds.has(image.id) ? (
                  <button type="button" onClick={() => setPreview(image)} aria-label={`View ${image.garment_type} try-on full screen`} className="absolute inset-0 h-full w-full cursor-zoom-in">
                    <Image
                      src={image.imageUrl}
                      alt={`${image.garment_type} try-on`}
                      fill
                      unoptimized
                      onError={() => setFailedImageIds((current) => new Set(current).add(image.id))}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain transition duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600"><ImageIcon className="h-8 w-8" /></div>
                )}
                <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/65 px-3 py-1.5 text-[11px] font-medium capitalize text-white backdrop-blur">{image.model_gender} look</span>
                <div className="absolute right-3 top-3 flex gap-2">
                  {image.imageUrl && (
                    <a href={`/api/tryons/${encodeURIComponent(image.id)}/download`} aria-label={`Download ${image.garment_type} try-on`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-indigo-600">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button type="button" onClick={() => { setError(null); setDeleteTarget(image); }} aria-label={`Delete ${image.garment_type} try-on`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-white">{image.garment_type}</h2><p className="mt-1 text-xs text-slate-500">{formatDisplayDate(image.created_at)}</p></div>
                  <span className="shrink-0 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-300">{image.days_remaining}d left</span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, image.days_remaining / 30 * 100))}%` }} /></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/45 px-4 py-10 text-center sm:px-5 sm:py-16">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"><ImageIcon className="h-6 w-6" /></span>
          <h2 className="mt-5 text-lg font-semibold text-white">Your first look is waiting.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">Create a virtual try-on and it’ll be saved here, ready whenever you need a little inspiration.</p>
          <a href="/studio" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500">Open the Studio</a>
        </div>
      )}

      {preview?.imageUrl && (
        <div role="dialog" aria-modal="true" aria-label={`${preview.garment_type} try-on`} onClick={() => setPreview(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
          <button type="button" onClick={() => setPreview(null)} aria-label="Close full-screen image" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-white"><X className="h-5 w-5" /></button>
          <Image
            src={preview.imageUrl}
            alt={`${preview.garment_type} try-on full screen`}
            fill
            unoptimized
            sizes="100vw"
            onClick={(event) => event.stopPropagation()}
            onError={() => {
              setFailedImageIds((current) => new Set(current).add(preview.id));
              setPreview(null);
            }}
            className="cursor-zoom-out object-contain p-4 sm:p-10"
          />
        </div>
      )}

      {deleteTarget && (
        <div role="presentation" className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-tryon-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
            <h2 id="delete-tryon-title" className="text-lg font-semibold text-white">Delete this try-on?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This removes the saved image from your Library and cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="min-h-11 rounded-full border border-slate-700 px-4 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void deleteImage()} disabled={isDeleting} className="min-h-11 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete image"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

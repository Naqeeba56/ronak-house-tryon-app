"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Image as ImageIcon, Trash2, X } from "lucide-react";
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

type LibraryPageResponse = {
  images: LibraryImage[];
  totalCount: number;
  error?: string;
};

export default function LibraryGallery({
  images: initialImages,
  totalCount: initialTotalCount,
}: {
  images: LibraryImage[];
  totalCount: number;
}) {
  const [images, setImages] = useState(initialImages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [preview, setPreview] = useState<LibraryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryImage | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipInitialPageRequest = useRef(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updatePageSize = () => {
      setPageSize(mediaQuery.matches ? 6 : 8);
      setPage(1);
    };
    updatePageSize();
    mediaQuery.addEventListener("change", updatePageSize);
    return () => mediaQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    if (skipInitialPageRequest.current) {
      skipInitialPageRequest.current = false;
      return;
    }

    const controller = new AbortController();
    setIsLoadingPage(true);
    setError(null);
    fetch(`/api/tryons?page=${page}&pageSize=${pageSize}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as LibraryPageResponse;
        if (!response.ok) {
          setError(result.error ?? "We couldn’t load your saved looks. Please try again.");
          return;
        }
        setImages(result.images);
        setTotalCount(result.totalCount);
        setFailedImageIds(new Set());
      })
      .catch((pageError: unknown) => {
        if (pageError instanceof DOMException && pageError.name === "AbortError") return;
        setError("We couldn’t load your saved looks. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPage(false);
      });

    return () => controller.abort();
  }, [page, pageSize, reloadVersion]);

  const pageCount = Math.ceil(totalCount / pageSize);
  const firstPageNumber = pageCount > 0 ? Math.max(1, Math.min(page - 2, pageCount - 4)) : 1;
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => firstPageNumber + index,
  );

  const deleteImage = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tryons/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "We couldn’t delete this look. Please try again.");
        return;
      }
      const remainingImages = images.filter(({ id }) => id !== deleteTarget.id);
      setImages(remainingImages);
      setTotalCount((current) => Math.max(0, current - 1));
      if (preview?.id === deleteTarget.id) setPreview(null);
      if (!remainingImages.length && totalCount > 1) {
        if (page > 1) setPage((current) => current - 1);
        else setReloadVersion((current) => current + 1);
      }
      setDeleteTarget(null);
    } catch {
      setError("We couldn’t delete this look. Please try again.");
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
        <>
          {isLoadingPage ? (
            <div
              className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
              aria-busy="true"
              aria-label="Loading saved looks"
              role="status"
            >
              {Array.from({ length: Math.min(pageSize, Math.max(1, totalCount - (page - 1) * pageSize)) }, (_, index) => (
                <article key={`library-skeleton-${index}`} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 sm:rounded-3xl">
                  <div className="aspect-[4/4.5] animate-pulse bg-slate-800/80" />
                  <div className="space-y-3 p-2.5 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="h-4 w-2/5 animate-pulse rounded bg-slate-700/80" />
                      <span className="h-5 w-12 animate-pulse rounded-full bg-slate-700/80" />
                    </div>
                    <span className="block h-3 w-1/3 animate-pulse rounded bg-slate-800" />
                    <span className="block h-1 animate-pulse rounded bg-slate-800" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <article key={image.id} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-slate-950/15 sm:rounded-3xl">
                  <div className="vton-image-frame-3d media-overlay relative aspect-[4/4.5] overflow-hidden bg-slate-950 shadow-inner">
                    {image.imageUrl && !failedImageIds.has(image.id) ? (
                      <>
                        <Image
                          src={image.imageUrl}
                          alt=""
                          aria-hidden="true"
                          fill
                          unoptimized
                          loading="lazy"
                          onError={() => setFailedImageIds((current) => new Set(current).add(image.id))}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="scale-125 object-cover opacity-75 blur-md"
                        />
                        <button type="button" onClick={() => setPreview(image)} aria-label={`View ${image.garment_type} try-on full screen`} className="absolute inset-0 h-full w-full cursor-zoom-in">
                          <Image
                            src={image.imageUrl}
                            alt={`${image.garment_type} try-on`}
                            fill
                            unoptimized
                            loading="lazy"
                            onError={() => setFailedImageIds((current) => new Set(current).add(image.id))}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="rounded-2xl object-contain transition duration-500"
                          />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600"><ImageIcon className="h-8 w-8" /></div>
                    )}
                    <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/15 bg-slate-950/65 px-2 py-1 text-[9px] font-medium capitalize text-white backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[11px]">{image.model_gender} look</span>
                    <div className="absolute right-2 top-2 flex gap-1 sm:right-3 sm:top-3 sm:gap-2">
                      {image.imageUrl && (
                        <a href={`/api/tryons/${encodeURIComponent(image.id)}/download`} aria-label={`Download ${image.garment_type} try-on`} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-indigo-600 sm:h-11 sm:w-11">
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </a>
                      )}
                      <button type="button" onClick={() => { setError(null); setDeleteTarget(image); }} aria-label={`Delete ${image.garment_type} try-on`} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-rose-600 sm:h-11 sm:w-11">
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xs font-semibold text-white sm:text-sm">{image.garment_type}</h2>
                        <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">{formatDisplayDate(image.created_at)}</p>
                      </div>
                      <span className="self-start rounded-full bg-indigo-500/10 px-2 py-1 text-[9px] font-semibold text-indigo-300 sm:shrink-0 sm:px-2.5 sm:text-[10px]">{image.days_remaining}d left</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800 sm:mt-4"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, image.days_remaining / 30 * 100))}%` }} /></div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {pageCount > 1 && (
            <nav aria-label="Library pages" className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/65 p-3 sm:flex-row sm:px-4">
              <p className="text-xs text-slate-400">
                Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount} looks
              </p>
              <div className="flex items-center gap-1.5" aria-busy={isLoadingPage}>
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || isLoadingPage}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    aria-label={`Page ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                    onClick={() => setPage(pageNumber)}
                    disabled={isLoadingPage}
                    className={`h-10 min-w-10 rounded-xl border px-2 text-sm font-semibold transition disabled:cursor-wait ${
                      pageNumber === page
                        ? "border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-950/25"
                        : "border-slate-700 text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-500/10"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page === pageCount || isLoadingPage}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          )}
        </>
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
          {/* Close button */}
          <button type="button" onClick={() => setPreview(null)} aria-label="Close full-screen image" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-white"><X className="h-5 w-5" /></button>
          {/* Download + Delete — visible on all screen sizes in the preview */}
          <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 gap-3" onClick={(e) => e.stopPropagation()}>
            <a
              href={`/api/tryons/${encodeURIComponent(preview.id)}/download`}
              aria-label={`Download ${preview.garment_type} try-on`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-white backdrop-blur transition hover:bg-indigo-600"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => { setDeleteTarget(preview); setPreview(null); }}
              aria-label={`Delete ${preview.garment_type} try-on`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-white backdrop-blur transition hover:bg-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
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
            className="cursor-zoom-out object-contain p-4 pb-20 sm:p-10"
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

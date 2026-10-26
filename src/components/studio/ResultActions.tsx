"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import ErrorAlert from "@/components/ui/ErrorAlert";

export function ResultActions({ generationId }: { generationId: string }) {
  const router = useRouter();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tryons/${encodeURIComponent(generationId)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "We couldn’t delete this look. Please try again.");
        setIsDeleting(false);
        return;
      }
      router.replace("/library");
    } catch {
      setError("We couldn’t delete this look. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <a href={`/api/tryons/${encodeURIComponent(generationId)}/download`} aria-label="Download try-on" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-indigo-600">
          <Download className="h-4 w-4" />
        </a>
        <button type="button" onClick={() => setIsConfirmingDelete(true)} aria-label="Delete try-on" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error && <ErrorAlert description={error} className="absolute bottom-3 left-3 right-3 w-auto sm:w-auto" />}
      {isConfirmingDelete && (
        <div role="presentation" className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="result-delete-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
            <h2 id="result-delete-title" className="text-lg font-semibold text-white">Delete this try-on?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This removes the saved image from your Library and cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting} className="min-h-11 rounded-full border border-slate-700 px-4 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void deleteImage()} disabled={isDeleting} className="min-h-11 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete image"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

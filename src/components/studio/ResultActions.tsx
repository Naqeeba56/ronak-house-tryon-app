"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LoaderCircle, Trash2 } from "lucide-react";
import { clearLatestGeneratedImage } from "@/lib/generated-image-storage";

export function ResultActions({ generationId }: { generationId: string }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaveResult = async () => {
    try {
      await clearLatestGeneratedImage();
    } catch {
      setError("Could not reset the Studio preview. Your saved Library image is safe.");
      return;
    }
    router.push("/studio");
  };

  const downloadImage = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tryons/${encodeURIComponent(generationId)}/download`);
      if (!response.ok) throw new Error("Could not download this try-on.");
      const imageBlob = await response.blob();
      const objectUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `fabricfit-try-on-${generationId}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
      await leaveResult();
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Could not download this try-on.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void downloadImage()}
          disabled={isDownloading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download
        </button>
        <button
          type="button"
          onClick={() => void leaveResult()}
          disabled={isDownloading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-rose-400/50 px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-400/10 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-center text-sm text-rose-300">{error}</p>}
    </div>
  );
}
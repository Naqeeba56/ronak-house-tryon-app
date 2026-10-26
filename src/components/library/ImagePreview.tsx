"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

export default function ImagePreview({
  imageUrl,
  alt,
  children,
}: {
  imageUrl: string;
  alt: string;
  children?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="vton-image-frame-3d media-overlay relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg shadow-black/20">
      <button type="button" onClick={() => setIsOpen(true)} aria-label="Open try-on image full screen" className="absolute inset-0 h-full w-full cursor-zoom-in">
        <Image src={imageUrl} alt={alt} fill sizes="(max-width: 768px) 100vw, 60vw" className="rounded-2xl object-contain" />
      </button>
      {children}
      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setIsOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close full-screen image" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-white"><X className="h-5 w-5" /></button>
          <Image src={imageUrl} alt={alt} fill sizes="100vw" onClick={(event) => event.stopPropagation()} className="cursor-zoom-out object-contain p-4 sm:p-10" />
        </div>
      )}
    </div>
  );
}

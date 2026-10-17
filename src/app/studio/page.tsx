"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import GeneratingIndicator from "@/components/studio/GeneratingIndicator";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { DEFAULT_MODEL_IMAGE_URL, GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  Crop,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { loading: () => null });

type UploadedImage = { name: string; dataUrl: string };
type GenerateResponse = {
  outputUrl?: string;
  generationId?: string;
  error?: string;
  code?: string;
  freeRemaining?: number;
  packRemaining?: number;
  unlimited?: boolean;
};

type TryOnBalance = { freeRemaining: number; packRemaining: number; unlimited?: boolean };

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

async function fetchTryOnBalance(): Promise<TryOnBalance> {
  const response = await fetch("/api/tryon-credits", { cache: "no-store" });
  if (!response.ok) throw new Error("Try-on balance is not available.");
  return (await response.json()) as TryOnBalance;
}

function readImage(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read this image."));
    };
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

async function fetchPresetImage(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Could not load the selected model preset.");

  const image = await response.blob();
  if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)) {
    throw new Error("The selected model preset is not a supported image.");
  }
  return readImage(image);
}

function PhotoUploadCard({
  title,
  image,
  sampleImageUrl,
  onChange,
  onRemove,
}: {
  title: string;
  image: UploadedImage | null;
  sampleImageUrl?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const previewUrl = image?.dataUrl ?? sampleImageUrl;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCropped, setIsCropped] = useState(false);

  return (
    <div className="vton-dropzone group relative flex min-h-48 flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-center">
      {previewUrl ? (
        <>
          <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl">
            <Image
              src={previewUrl}
              alt={`${title} preview`}
              fill
              loading="eager"
              unoptimized={Boolean(image)}
              sizes="(max-width: 640px) 100vw, 360px"
              className={`vton-image-enter transition duration-300 ${isCropped ? "object-cover" : "object-contain"}`}
            />
            <div className="vton-image-actions vton-glass absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full p-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="vton-secondary inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-[11px] font-semibold"
              >
                <RefreshCw className="h-3 w-3" /> Replace
              </button>
              <button
                type="button"
                aria-label={`${isCropped ? "Show full" : "Crop"} ${title.toLowerCase()} preview`}
                aria-pressed={isCropped}
                onClick={() => setIsCropped((cropped) => !cropped)}
                className="vton-secondary inline-flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Crop className="h-3.5 w-3.5" />
              </button>
              {image && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${title.toLowerCase()}`}
                  className="vton-secondary inline-flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <span className="max-w-full truncate text-sm font-medium text-slate-200">{image?.name ?? title}</span>
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center py-5">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500/15"><ImagePlus className="h-5 w-5" /></span>
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <span className="mt-1 text-xs text-slate-500">Browse image from your device</span>
        </button>
      )}
      <span className="mt-2 text-[11px] text-slate-500">PNG, JPG or WebP · up to 1.5 MB</span>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Upload ${title}`} className="sr-only" onChange={onChange} />
    </div>
  );
}

export default function StudioPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [garmentType, setGarmentType] = useState("Shirt");
  const [garmentImage, setGarmentImage] = useState<UploadedImage | null>(null);
  const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
  const [selectedModelPresetId, setSelectedModelPresetId] = useState<string | null>("try-on-male");
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [packRemaining, setPackRemaining] = useState<number | null>(null);
  const [isBalanceReady, setIsBalanceReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outfitPresets = GARMENT_PRESETS.filter(
    (preset) => (preset.gender ?? "male") === selectedGender,
  );
  const selectedPreset = outfitPresets.find(({ label }) => label === garmentType) ?? outfitPresets[0];
  const defaultModelPreset =
    TRY_ON_MODEL_PRESETS.find(({ gender }) => gender === selectedGender) ?? TRY_ON_MODEL_PRESETS[0];
  const selectedModelPreset =
    TRY_ON_MODEL_PRESETS.find(({ id }) => id === selectedModelPresetId) ?? defaultModelPreset;
  const previewModelImage = modelImage?.dataUrl ?? selectedModelPreset?.imageUrl ?? DEFAULT_MODEL_IMAGE_URL;

  useEffect(() => {
    let isMounted = true;
    const updateSession = async (user: { id: string } | null) => {
      if (!isMounted) return;
      setIsSignedIn(Boolean(user));
      setIsAuthReady(true);
      if (!user) {
        setFreeRemaining(null);
        setPackRemaining(null);
        setIsAdmin(false);
        setIsBalanceReady(false);
        return;
      }

      try {
        const balance = await fetchTryOnBalance();
        if (!isMounted) return;
        setFreeRemaining(balance.freeRemaining);
        setPackRemaining(balance.packRemaining);
        setIsAdmin(balance.unlimited === true);
        setIsBalanceReady(true);
      } catch {
        if (isMounted) setError("Could not load your try-on balance. Please try again later.");
      }
    };

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => void updateSession(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void updateSession(session?.user ?? null);
    });
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    setImage: (image: UploadedImage | null) => void,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Images must be 1.5 MB or smaller.");
      return;
    }

    try {
      setImage({ name: file.name, dataUrl: await readImage(file) });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not read this image.");
    }
  };

  const generateLook = async () => {
    if (!isSignedIn) {
      setIsAuthOpen(true);
      return;
    }
    if (!isBalanceReady) {
      setError("Your try-on balance is still loading.");
      return;
    }
    if ((!modelImage && !selectedModelPreset) || !garmentImage) {
      setError("Upload a customer photo or choose a sample, then upload a fabric photo.");
      return;
    }
    if (!isAdmin && (freeRemaining ?? 0) + (packRemaining ?? 0) < 1) {
      setError("Your free try-on is used. Choose a plan to continue creating try-ons.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const presetImageUrl = selectedModelPreset?.imageUrl;
      const presetImage = presetImageUrl
        ? await fetchPresetImage(presetImageUrl)
        : undefined;
      const modelImageDataUrl = modelImage?.dataUrl ?? presetImage;
      if (!modelImageDataUrl) throw new Error("Choose a model photo before generating your try-on.");
      const startResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentType: selectedPreset.label,
          modelImage: modelImageDataUrl,
          modelPresetId: modelImage ? undefined : selectedModelPreset?.id,
          modelGender: selectedGender,
          garmentImage: garmentImage.dataUrl,
        }),
      });
      const generated = (await startResponse.json()) as GenerateResponse;
      if (!startResponse.ok || !generated.outputUrl || !generated.generationId) {
        if (generated.code === "TRYON_LIMIT_REACHED") {
          setFreeRemaining(0);
          setPackRemaining(0);
        }
        throw new Error(generated.error ?? "The model could not generate this try-on.");
      }
      if (generated.unlimited) setIsAdmin(true);
      if (generated.freeRemaining !== undefined) setFreeRemaining(generated.freeRemaining);
      if (generated.packRemaining !== undefined) setPackRemaining(generated.packRemaining);
      router.push(`/result/${encodeURIComponent(generated.generationId)}`);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Image generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="vton-shell vton-ui min-h-[calc(100vh-7rem)]">
      <div className="mobile-compact mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Virtual fitting room
            </p>
            <h1 className="vton-heading mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl">Make the look yours.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Add your photo and a fabric swatch. We’ll create a private try-on preview just for you.</p>
          </div>
          <Link href="/library" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900 px-4 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:text-white sm:self-auto">
            <ImagePlus className="h-4 w-4" /> My Library
          </Link>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <div className="space-y-4 sm:space-y-5">
            <section className="vton-card rounded-2xl p-4 sm:rounded-3xl sm:p-7">
              <StepHeading number="01" title="Start with two photos" subtitle="A clear, full-body photo works best." />
              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                <PhotoUploadCard
                  title="Your photo"
                  image={modelImage}
                  sampleImageUrl={selectedModelPreset?.imageUrl}
                  onRemove={() => {
                    setModelImage(null);
                    setSelectedModelPresetId(defaultModelPreset.id);
                  }}
                  onChange={(event) => {
                    void handleImageUpload(event, (image) => {
                      setModelImage(image);
                      if (image) setSelectedModelPresetId(null);
                    });
                  }}
                />
                <PhotoUploadCard
                  title="Fabric photo"
                  image={garmentImage}
                  onRemove={() => setGarmentImage(null)}
                  onChange={(event) => void handleImageUpload(event, setGarmentImage)}
                />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Your photos are only used to create your try-on.</p>
            </section>

            <section className="vton-card rounded-2xl p-4 sm:rounded-3xl sm:p-7">
              <StepHeading number="02" title="Choose who’s trying it on" subtitle="We’ll show outfit ideas for your category." />
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1.5">
                {TRY_ON_MODEL_PRESETS.map((model) => (
                  <button
                    key={model.gender}
                    type="button"
                    aria-pressed={selectedGender === model.gender}
                    onClick={() => {
                      setSelectedGender(model.gender);
                      setGarmentType(model.gender === "female" ? "Saree" : "Shirt");
                      setSelectedModelPresetId(model.id);
                      setModelImage(null);
                      setError(null);
                    }}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${selectedGender === model.gender ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-200"}`}
                  >
                    <span aria-hidden="true">{model.gender === "male" ? "♂" : "♀"}</span>
                    {model.gender === "male" ? "Men" : "Women"}
                  </button>
                ))}
              </div>
            </section>

            <section className="vton-card rounded-2xl p-4 sm:rounded-3xl sm:p-7">
              <StepHeading number="03" title="Pick the outfit type" subtitle="We’ll tailor the try-on to the garment you upload." />
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {outfitPresets.map(({ label, thumbnails }) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={garmentType === label}
                    onClick={() => setGarmentType(label)}
                    className={`group flex min-h-18 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition hover:-translate-y-0.5 active:scale-[0.99] sm:min-h-20 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-3 ${garmentType === label ? "border-indigo-400/70 bg-indigo-500/10 text-white shadow-lg shadow-indigo-950/20" : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700"}`}
                  >
                    {thumbnails?.[selectedGender] ? (
                      <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-900" aria-hidden="true">
                        <Image src={thumbnails[selectedGender]} alt="" fill className="object-cover object-top transition duration-300 group-hover:scale-105" sizes="44px" />
                      </span>
                    ) : (
                      <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300" aria-hidden="true">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                    <span className="text-xs font-semibold leading-4 sm:text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <section className={`vton-card overflow-hidden rounded-2xl sm:rounded-3xl ${isGenerating ? "vton-generating" : ""}`}>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">Your setup</p>
                  <h2 className="mt-1 text-base font-semibold text-white">Almost ready</h2>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-slate-300">{selectedGender}</span>
              </div>
              <div className="media-overlay vton-studio-canvas relative aspect-[4/5]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={previewModelImage}
                    className="absolute inset-0"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image
                      src={previewModelImage}
                      alt={modelImage ? "Your uploaded photo" : `Full-body ${selectedGender} model facing the camera`}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      unoptimized={Boolean(modelImage)}
                      className={modelImage ? "object-cover" : "object-contain"}
                      sizes="(max-width: 1024px) 100vw, 420px"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="media-gradient-fade absolute inset-0" />
                <AnimatePresence initial={false}>
                  {isGenerating && <GeneratingIndicator />}
                </AnimatePresence>
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-200">Selected outfit</p>
                    <p className="mt-1 text-xl font-semibold text-white">{garmentType}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                <p className="text-sm leading-6 text-slate-400">{selectedPreset.description}</p>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                  <span className="text-xs text-slate-400">Try-ons available</span>
                  <span className="text-sm font-semibold text-white">{!isSignedIn ? "1 free after sign-in" : !isBalanceReady ? "Loading…" : isAdmin ? "Unlimited" : `${(freeRemaining ?? 0) + (packRemaining ?? 0)} remaining`}</span>
                </div>
                {error && <ErrorAlert description={error} className="w-full sm:w-full" onDismiss={() => setError(null)} />}
                <button
                  type="button"
                  onClick={() => void generateLook()}
                  disabled={isGenerating || !isAuthReady || (isSignedIn && (!isBalanceReady || (!isAdmin && (freeRemaining ?? 0) + (packRemaining ?? 0) === 0)))}
                  className="vton-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold shadow-lg shadow-indigo-600/15 disabled:cursor-wait disabled:opacity-60"
                >
                  {isGenerating ? <span className="vton-line-loader" aria-hidden="true" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Creating your try-on…" : !isAuthReady ? "Checking account…" : isSignedIn ? "Generate my try-on" : "Try on for free"}
                </button>
                {isSignedIn && !isAdmin && isBalanceReady && freeRemaining === 0 && packRemaining === 0 && (
                  <Link href="/pricing" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-indigo-400/40 px-4 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10">
                    Explore plans
                  </Link>
                )}
              </div>
            </section>
            <p className="mt-3 text-center text-xs text-slate-500">Your generated look will be saved to your private Library for 30 days.</p>
          </aside>
        </div>
      </div>
      {isAuthOpen && <AuthModal isOpen onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
}

function StepHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-xs font-bold text-indigo-300">{number}</span>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

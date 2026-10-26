"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Gift,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { HOME_OUTFIT_PREVIEWS } from "@/lib/home-outfit-previews";
import BrandLogo from "@/components/layout/BrandLogo";
import Footer from "@/components/layout/Footer";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { loading: () => null });

type Gender = "male" | "female";

const steps = [
  {
    title: "Pick a model",
    text: "Choose a studio model or upload your photo.",
  },
  {
    title: "Choose a style",
    text: "Tap a style to preview it on your selected model.",
  },
  {
    title: "Create your look",
    text: "Choose your fabric in Studio to create your try-on.",
  },
];

const homeHighlights = [
  {
    icon: Gift,
    title: "Your first try-on is free",
    description: "Create one outfit preview before choosing a plan.",
  },
  {
    icon: Sparkles,
    title: "AI-powered previews",
    description: "Preview sarees, lehengas, suits, and more on a model.",
  },
  {
    icon: CalendarCheck,
    title: "Credits roll over monthly",
    description: "Unused try-ons carry forward.",
  },
  {
    icon: ShieldCheck,
    title: "Private try-on library",
    description: "Your photos create the preview, and saved results stay private to your account.",
  },
];

export default function HomeExperience() {
  const reduceMotion = useReducedMotion();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>("female");
  const [selectedOutfit, setSelectedOutfit] = useState("Saree");
  const [comparePosition, setComparePosition] = useState(52);
  const outfitsRef = useRef<HTMLDivElement>(null);
  const outfits = GARMENT_PRESETS.filter(
    (outfit) => (outfit.gender ?? "male") === selectedGender,
  );
  const selectedOutfitPreset = outfits.find((outfit) => outfit.label === selectedOutfit) ?? outfits[0];
  const startingImage = selectedGender === "female"
    ? "/home-outfit-previews/sample-woman-updated.jpeg"
    : "/home-outfit-previews/mens/male-starting-look.webp";
  const outfitPreview = HOME_OUTFIT_PREVIEWS[`${selectedGender}:${selectedOutfitPreset.label}`]
    ?? selectedOutfitPreset.thumbnails?.[selectedGender]
    ?? TRY_ON_MODEL_PRESETS.find(({ gender }) => gender === selectedGender)?.imageUrl
    ?? TRY_ON_MODEL_PRESETS[0].imageUrl;
  const styleChoices = selectedGender === "female"
    ? ["Saree", "Salwar suit", "Lehenga"]
    : ["2-Piece Suit", "3-Piece Suit", "Sherwani"];

  useEffect(() => {
    let authPromptTimeout: number | undefined;
    if (new URLSearchParams(window.location.search).get("auth") === "required") {
      authPromptTimeout = window.setTimeout(() => setIsAuthOpen(true), 0);
    }
    return () => {
      if (authPromptTimeout !== undefined) window.clearTimeout(authPromptTimeout);
    };
  }, []);

  const chooseGender = (gender: Gender) => {
    setSelectedGender(gender);
    setSelectedOutfit(gender === "female" ? "Saree" : "2-Piece Suit");
  };

  const chooseOutfit = (label: string) => {
    setSelectedOutfit(label);
  };

  return (
    <div className="overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-40 top-8 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute -right-36 top-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-5 px-4 pb-6 pt-5 sm:gap-12 sm:px-8 sm:pb-16 sm:pt-14 lg:min-h-[690px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-10 lg:py-16">
          <div className="relative z-10 w-full min-w-0 max-w-xl">
            <div className="home-brand-badge inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-indigo-200 sm:text-xs">
              <BrandLogo />
              <span>AI VIRTUAL TRY-ON</span>
            </div>
            <h1 className="mt-3 text-[clamp(2.35rem,10vw,3.2rem)] font-semibold leading-[0.99] tracking-[-0.06em] text-white sm:mt-7 sm:text-6xl lg:text-[4.4rem]">
              Your style,{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                reimagined.
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-base leading-6 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              Your photo. Your fabric. A new look.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:gap-3">
              <Link
                href="/studio"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:bg-indigo-400 sm:min-h-12"
              >
                Try on an outfit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 sm:min-h-12"
              >
                See how it works
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="relative mt-4 overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-slate-900/90 to-fuchsia-500/10 p-2.5 shadow-xl shadow-indigo-950/10 sm:mt-7 sm:p-4">
              <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base">
                  Why try VTON Labs?
                </h2>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
                  {homeHighlights.map(({ icon: Icon, title, description }) => (
                    <article
                      key={title}
                      className="flex min-w-0 items-start gap-1.5 rounded-xl border border-white/10 bg-slate-950/35 p-2 transition hover:border-indigo-400/30 sm:gap-3 sm:rounded-2xl sm:p-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-400/15 bg-indigo-500/10 text-indigo-300 sm:h-10 sm:w-10 sm:rounded-xl">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <h3 className="text-[11px] font-semibold leading-4 text-white sm:text-sm sm:leading-5">{title}</h3>
                        <p className="text-[11px] leading-[1.15rem] text-slate-400 sm:text-xs sm:leading-normal">{description}</p>
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div id="style-explorer" className="relative mx-auto w-full min-w-0 max-w-[610px] scroll-mt-24 lg:mr-0">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-fuchsia-500/15 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-2 shadow-2xl shadow-black/40 backdrop-blur sm:rounded-[2rem] sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 sm:gap-3 sm:px-3 sm:pb-4">
                <div>
                  <p className="text-sm font-semibold text-white sm:text-base">
                    {selectedGender === "female" ? "Compare the outfit ideas" : "Explore a sample look"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedGender === "female" ? "Drag the divider to explore both looks" : "Choose a style to preview"}
                  </p>
                </div>
                <div className="flex shrink-0 rounded-full border border-slate-800 bg-slate-950 p-1" aria-label="Choose a model category">
                  {(["female", "male"] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      aria-pressed={selectedGender === gender}
                      onClick={() => chooseGender(gender)}
                      className={`min-h-10 rounded-full px-3.5 text-xs font-semibold capitalize transition active:scale-95 ${selectedGender === gender ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
                    >
                      {gender === "female" ? "Women" : "Men"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.35rem]">
                <div className="vton-image-frame-3d relative aspect-square overflow-hidden rounded-[1.35rem] border border-white/10 bg-transparent shadow-xl shadow-black/20 sm:aspect-[3/4]">
                  <>
                      <Image
                        src={startingImage}
                        alt={`Sample ${selectedGender} model in the starting look`}
                        fill
                        preload
                        className="rounded-[1.35rem] object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 610px"
                      />
                      <motion.div
                        key={`${selectedGender}-${selectedOutfit}`}
                        className="absolute inset-0"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
                        style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                      >
                        <Image
                          src={outfitPreview}
                          alt={`${selectedGender === "female" ? "Woman" : "Man"} wearing a ${selectedOutfitPreset.label}`}
                          fill
                          className="rounded-[1.35rem] object-contain"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 610px"
                        />
                      </motion.div>
                      <div
                        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
                        style={{ left: `${comparePosition}%` }}
                        aria-hidden="true"
                      >
                        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-indigo-600 shadow-lg">
                          <ArrowLeftRight className="h-5 w-5" />
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={comparePosition}
                        onChange={(event) => setComparePosition(Number(event.currentTarget.value))}
                        aria-label="Compare sample outfit styles"
                        aria-valuetext={`${selectedOutfitPreset.label} outfit reference on the left, sample ${selectedGender} starting look on the right`}
                        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0 focus-visible:rounded-[1.35rem] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                      />
                      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-slate-950/65 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur sm:left-4 sm:top-4 sm:text-xs">
                        {selectedOutfitPreset.label} idea
                      </div>
                      <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-slate-950/65 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur sm:right-4 sm:top-4 sm:text-xs">
                        Starting look
                      </div>
                  </>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400 sm:mt-2">
                <span>{selectedOutfitPreset.label} idea</span>
                <span className="hidden sm:inline">Outfit inspiration · make it yours in Studio</span>
              </div>
              {selectedGender === "female" ? (
                <div className="mt-1.5 grid grid-cols-3 gap-1 sm:mt-3 sm:gap-2">
                  {outfits.map((outfit) => (
                    <button
                      key={outfit.label}
                      type="button"
                      aria-pressed={selectedOutfit === outfit.label}
                      onClick={() => chooseOutfit(outfit.label)}
                      className={`min-h-9 rounded-lg border px-1.5 text-[11px] font-semibold transition active:scale-95 sm:min-h-11 sm:rounded-xl sm:px-2 sm:text-xs ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex min-w-0 items-center gap-1 sm:mt-3 sm:gap-1.5">
                  <button
                    type="button"
                    aria-label="Scroll outfit options left"
                    onClick={() => outfitsRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                    className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 active:scale-95 sm:h-10 sm:w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div ref={outfitsRef} className="style-explorer-outfits flex min-w-0 snap-x gap-1.5 overflow-x-auto scroll-smooth px-0.5 py-1 sm:gap-2">
                    {outfits.map((outfit) => (
                      <button
                        key={outfit.label}
                        type="button"
                        aria-pressed={selectedOutfit === outfit.label}
                        onClick={() => chooseOutfit(outfit.label)}
                        className={`min-h-9 shrink-0 snap-start rounded-full border px-2.5 text-[11px] font-medium transition active:scale-95 sm:min-h-10 sm:px-3 sm:text-xs ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
                      >
                        {outfit.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Scroll outfit options right"
                    onClick={() => outfitsRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                    className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 active:scale-95 sm:h-10 sm:w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="px-2 pt-3 text-[11px] leading-5 text-slate-500 sm:px-3">
                Make this look yours in Studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative isolate overflow-hidden border-y border-slate-800 bg-slate-900/40">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-9 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Three simple steps</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-4xl">From idea to try-on.</h2>
          </div>
          <ol className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 transition hover:border-indigo-400/30 sm:rounded-3xl ${index !== 1 ? "flex items-stretch sm:block" : ""}`}
              >
                {index === 1 ? (
                  <div className="vton-image-frame-3d relative flex flex-col bg-gradient-to-br from-indigo-500/10 via-slate-900 to-fuchsia-500/10 p-2.5 pt-10 sm:aspect-[4/5] sm:p-5 sm:pt-16">
                    <p className="mb-1.5 text-[11px] font-medium text-slate-400 sm:mb-3 sm:text-xs">Choose your outfit style</p>
                    <div className="grid grid-cols-3 gap-1.5 sm:min-h-0 sm:flex-1 sm:grid-cols-1 sm:grid-rows-3 sm:gap-2" role="group" aria-label="Choose an outfit style">
                      {styleChoices.map((style) => {
                        const preset = outfits.find((outfit) => outfit.label === style);
                        const thumbnail = HOME_OUTFIT_PREVIEWS[`${selectedGender}:${style}`]
                          ?? preset?.thumbnails?.[selectedGender];
                        return (
                          <button
                            key={style}
                            type="button"
                            aria-pressed={selectedOutfit === style}
                            onClick={() => chooseOutfit(style)}
                            className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1 text-center transition sm:min-h-0 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-left ${
                              selectedOutfit === style
                                ? "border-indigo-400 bg-indigo-500/15 text-white shadow-sm shadow-indigo-950/30"
                                : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-indigo-400/50 hover:bg-slate-900"
                            }`}
                          >
                            {thumbnail && (
                              <span className="relative h-9 w-7 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-900 sm:h-full sm:min-h-10 sm:max-h-16 sm:w-12 sm:rounded-lg">
                                <Image src={thumbnail} alt="" fill sizes="36px" className="object-contain" />
                              </span>
                            )}
                            <span className="max-w-full truncate text-[10px] font-semibold leading-3 sm:min-w-0 sm:text-sm sm:leading-normal">{style}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="vton-image-frame-3d relative aspect-[3/4] w-[38%] shrink-0 overflow-hidden bg-transparent sm:aspect-[3/4] sm:w-auto">
                    <Image
                      src={index === 0 ? startingImage : outfitPreview}
                      alt={index === 0
                        ? `Selected ${selectedGender} model`
                        : `${selectedGender === "female" ? "Model" : "Man"} preview wearing ${selectedOutfitPreset.label}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="home-step-number absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-slate-950/90 text-xs font-bold text-white shadow-lg shadow-black/20 sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:rounded-xl">
                  {index + 1}
                </span>
                <div className={`p-2.5 sm:p-5 ${index !== 1 ? "flex min-w-0 flex-1 flex-col justify-center" : ""}`}>
                  <h3 className="text-xs font-semibold leading-4 text-white sm:text-lg sm:leading-normal">{step.title}</h3>
                  <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-sm sm:leading-normal">{step.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>

        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-fuchsia-500/10 p-5 shadow-2xl shadow-indigo-950/20 sm:gap-8 sm:p-9 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Ready when you are</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Let’s create your next look.</h2>
          </div>
          <Link href="/studio" className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 text-sm font-semibold text-white transition hover:bg-indigo-400 md:w-auto">
            Start in the Studio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
      {isAuthOpen && <AuthModal isOpen onClose={() => setIsAuthOpen(false)} />}
      <Footer />
    </div>
  );
}

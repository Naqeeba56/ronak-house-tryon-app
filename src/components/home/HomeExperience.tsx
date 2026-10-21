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
  ChevronLeft,
  ChevronRight,
  Clock3,
  Layers3,
  ScanFace,
  ShieldCheck,
  Shirt,
} from "lucide-react";
import { GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { HOME_OUTFIT_PREVIEWS } from "@/lib/home-outfit-previews";
import BrandLogo from "@/components/layout/BrandLogo";
import BrandMark from "@/components/layout/BrandMark";
import Footer from "@/components/layout/Footer";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { loading: () => null });

type Gender = "male" | "female";

const reasons = [
  {
    icon: Layers3,
    title: "Three visual references",
    text: "Your photo, fabric, and outfit reference go into the same generation request.",
  },
  {
    icon: ScanFace,
    title: "Guided for try-ons",
    text: "The prompt gives the configured model context about the person and garment.",
  },
  {
    icon: Shirt,
    title: "Made for outfit ideas",
    text: "Explore styles including sarees, salwar suits, lehengas, and kurtas.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a model",
    text: "Use one of the studio models or upload a clear, full-body photo.",
  },
  {
    number: "02",
    title: "Add your fabric",
    text: "Upload a photo of the cloth you are considering, then choose an outfit type.",
  },
  {
    number: "03",
    title: "Generate your preview",
    text: "The configured image-generation model uses your photos and an outfit reference to create a look.",
  },
];

export default function HomeExperience() {
  const reduceMotion = useReducedMotion();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>("female");
  const [selectedOutfit, setSelectedOutfit] = useState("Salwar suit");
  const [comparePosition, setComparePosition] = useState(52);
  const outfitsRef = useRef<HTMLDivElement>(null);
  const outfits = GARMENT_PRESETS.filter(
    (outfit) => (outfit.gender ?? "male") === selectedGender,
  );
  const selectedOutfitPreset = outfits.find((outfit) => outfit.label === selectedOutfit) ?? outfits[0];
  const startingImage = selectedGender === "female"
    ? "/home-outfit-previews/sample-woman.webp"
    : "/home-outfit-previews/mens/male-starting-look.webp";
  const outfitPreview = HOME_OUTFIT_PREVIEWS[`${selectedGender}:${selectedOutfitPreset.label}`]
    ?? selectedOutfitPreset.thumbnails?.[selectedGender]
    ?? TRY_ON_MODEL_PRESETS.find(({ gender }) => gender === selectedGender)?.imageUrl
    ?? TRY_ON_MODEL_PRESETS[0].imageUrl;

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
    setSelectedOutfit(gender === "female" ? "Salwar suit" : "Kurta");
  };

  const chooseOutfit = (label: string) => {
    setSelectedOutfit(label);
  };

  const exploreOutfit = (label: string) => {
    chooseGender("female");
    setSelectedOutfit(label);
    document.getElementById("style-explorer")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-40 top-8 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute -right-36 top-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-10 pt-8 sm:gap-12 sm:px-8 sm:pb-16 sm:pt-14 lg:min-h-[690px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-10 lg:py-16">
          <div className="relative z-10 w-full min-w-0 max-w-xl">
            <div className="home-brand-badge inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-indigo-200 sm:text-xs">
              <BrandLogo />
              <span>AI VIRTUAL TRY-ON</span>
            </div>
            <h1 className="mt-5 text-[clamp(2.7rem,11vw,4.4rem)] font-semibold leading-[0.99] tracking-[-0.06em] text-white sm:mt-7 sm:text-6xl lg:text-[4.4rem]">
              Your style,{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                reimagined.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              Your photo. Your fabric. See an outfit idea take shape.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/studio"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Try on an outfit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <a
                href="#style-explorer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                See outfit ideas
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Start with a sample model. Sign in when you’re ready to generate.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400 sm:mt-9">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                A visual starting point
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
                Account-only saved results
              </span>
            </div>
          </div>

          <div id="style-explorer" className="relative mx-auto w-full min-w-0 max-w-[610px] scroll-mt-24 lg:mr-0">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-fuchsia-500/15 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-2.5 shadow-2xl shadow-black/40 backdrop-blur sm:rounded-[2rem] sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1.5 pb-3 sm:px-3 sm:pb-4">
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
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-slate-100">
                  <>
                      <Image
                        src={startingImage}
                        alt={`Sample ${selectedGender} model in the starting look`}
                        fill
                        preload
                        className="object-cover"
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
                          className={selectedGender === "female" ? "object-cover origin-bottom scale-[0.96]" : "object-cover"}
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

              <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
                <span>{selectedOutfitPreset.label} idea</span>
                <span>Sample images · not a generated result</span>
              </div>
              {selectedGender === "female" ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {outfits.map((outfit) => (
                    <button
                      key={outfit.label}
                      type="button"
                      aria-pressed={selectedOutfit === outfit.label}
                      onClick={() => chooseOutfit(outfit.label)}
                      className={`min-h-11 rounded-xl border px-2 text-xs font-semibold transition active:scale-95 ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex min-w-0 items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Scroll outfit options left"
                    onClick={() => outfitsRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                    className="inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div ref={outfitsRef} className="style-explorer-outfits flex min-w-0 snap-x gap-2 overflow-x-auto scroll-smooth px-0.5 py-1">
                    {outfits.map((outfit) => (
                      <button
                        key={outfit.label}
                        type="button"
                        aria-pressed={selectedOutfit === outfit.label}
                        onClick={() => chooseOutfit(outfit.label)}
                        className={`min-h-10 shrink-0 snap-start rounded-full border px-3 text-xs font-medium transition active:scale-95 ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
                      >
                        {outfit.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Scroll outfit options right"
                    onClick={() => outfitsRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                    className="inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="px-2 pt-3 text-[11px] leading-5 text-slate-500 sm:px-3">
                Outfit reference and sample model photo; not a generated try-on result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-8 sm:pb-16 lg:px-10" aria-label="What to expect">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 sm:grid-cols-3 sm:rounded-3xl">
          <div className="bg-slate-900/90 p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">Three visual references</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">Photo, fabric, and outfit style in one generation request.</p>
          </div>
          <div className="bg-slate-900/90 p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">Guided for try-ons</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">The selected model receives image references and outfit instructions.</p>
          </div>
          <div className="bg-slate-900/90 p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">Model choice can vary</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">This deployment’s configured model creates the preview; quality and timing vary.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Why this model fits try-ons</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                More visual context. Less guesswork.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              We don’t claim one model is best for every image. The model configured for this deployment receives your photo, fabric, and outfit reference together in one request. Results depend on the model and the images you provide.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:mt-10 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                key={title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-xl hover:shadow-indigo-950/15 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="outfit-inspiration-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Find your starting point</p>
              <h2 id="outfit-inspiration-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                What could your fabric become?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                Tap a look to see it in the style explorer, then bring your own fabric into the Studio.
              </p>
            </div>
            <Link href="/studio" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-indigo-300 transition hover:text-indigo-200 sm:self-auto">
              Explore all outfit types <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-9 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {GARMENT_PRESETS.filter(({ gender }) => gender === "female").map((outfit) => {
              const imageUrl = outfit.thumbnails?.female;
              if (!imageUrl) return null;
              return (
                <button
                  key={outfit.label}
                  type="button"
                  onClick={() => exploreOutfit(outfit.label)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-950/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400 sm:rounded-3xl"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-slate-800">
                    <Image
                      src={imageUrl}
                      alt={`${outfit.label} outfit inspiration`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/5 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                      <span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">Style inspiration</span>
                        <span className="mt-1 block text-xl font-semibold text-white sm:text-2xl">{outfit.label}</span>
                      </span>
                      <span className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition group-hover:bg-indigo-500">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
            <article aria-labelledby="custom-outfit-coming-soon" className="flex min-h-64 flex-col justify-between rounded-2xl border border-dashed border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-fuchsia-500/10 p-5 sm:min-h-0 sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center">
                  <BrandMark className="h-8 w-8" />
                </span>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
                  Coming soon
                </span>
              </div>
              <div className="mt-8 sm:mt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Custom styles</p>
                <h3 id="custom-outfit-coming-soon" className="mt-1 text-xl font-semibold text-white">Bring your own outfit image</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Custom outfit-image generation is not available yet. We’ll share it here when it’s ready.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">From idea to preview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your first try-on, step by step.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              No complicated setup. Bring a photo and fabric idea, and the Studio guides you through the rest.
            </p>
          </div>
          <ol className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:border-indigo-400/30 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-sm font-bold text-indigo-300">{step.number}</span>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
              </motion.li>
            ))}
          </ol>

          <div className="mt-5 grid gap-3 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-slate-950 to-fuchsia-500/5 p-5 sm:mt-7 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-5 sm:rounded-3xl sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/15 bg-indigo-400/10 text-indigo-200">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white sm:text-lg">What happens after you press generate?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Your images are sent to the image-generation model configured for the Studio. Generation time and output resolution can vary; the Studio keeps you informed while it works.
              </p>
            </div>
            <Link href="/studio" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400">
              See the Studio <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-fuchsia-500/10 p-5 shadow-2xl shadow-indigo-950/20 sm:gap-8 sm:p-9 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Your next outfit idea starts here</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Ready to see where your fabric could take you?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
              Open the Studio, choose a model and outfit, and create a visual starting point for your next decision.
            </p>
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

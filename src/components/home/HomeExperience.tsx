"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { GARMENT_PRESETS, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { HOME_OUTFIT_PREVIEWS } from "@/lib/home-outfit-previews";
import Footer from "@/components/layout/Footer";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { loading: () => null });

type Gender = "male" | "female";

export default function HomeExperience() {
  const reduceMotion = useReducedMotion();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>("male");
  const [selectedOutfit, setSelectedOutfit] = useState("Kurta");
  const outfitsRef = useRef<HTMLDivElement>(null);
  const outfits = GARMENT_PRESETS.filter(
    (outfit) => (outfit.gender ?? "male") === selectedGender,
  );
  const selectedOutfitPreset = outfits.find((outfit) => outfit.label === selectedOutfit) ?? outfits[0];
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
    setSelectedOutfit(gender === "female" ? "Saree" : "Kurta");
  };

  const chooseOutfit = (label: string) => {
    setSelectedOutfit(label);
  };

  return (
    <div className="overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative mx-auto grid min-h-0 max-w-7xl grid-cols-1 items-center gap-6 px-4 py-5 sm:gap-12 sm:px-8 sm:py-12 lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-10 lg:py-20">
        <div className="relative z-10 w-full min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 sm:px-3.5 sm:py-2 sm:text-xs">
            <span aria-hidden="true">✨</span>
            AI-POWERED VIRTUAL FITTING ROOM
          </div>
          <h1 className="mt-4 text-[clamp(2.3rem,10.5vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:mt-7 sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
            Visualize Any Fabric <span className="text-indigo-400">On You</span> Before You Buy or Stitch.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-5.5 text-slate-400 sm:mt-6 sm:text-lg sm:leading-7">
            Transform plain fabric swatches or outfit ideas into hyper-realistic, custom-fitted looks in seconds. Powered by advanced AI.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              href="/studio"
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500 sm:min-h-12 sm:w-auto"
            >
              Try On Your Outfit Now →
            </Link>
            <Link
              href="#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-6 text-sm font-semibold text-slate-200 transition hover:scale-[1.02] hover:border-slate-700 hover:bg-slate-900 active:scale-[0.98] sm:min-h-12 sm:w-auto"
            >
              See how it works
              <ArrowDown className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-5 text-slate-400 sm:mt-6 sm:gap-x-3 sm:text-sm sm:leading-6">
            <span>⚡ Instant 10-Second Render</span>
            <span>🔒 100% Private &amp; Secure</span>
            <span>🎁 1 Free Try-On Included</span>
          </div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[600px] lg:mr-0">
          <div className="absolute -inset-8 rounded-[3rem] bg-indigo-500/10 blur-3xl" />
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900 p-2.5 shadow-2xl shadow-slate-950/30 sm:rounded-[2rem] sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 pb-2.5 sm:gap-3 sm:px-3 sm:pb-4">
              <div>
                <p className="text-sm font-semibold text-white">Your style, your way</p>
                <p className="mt-1 text-xs text-slate-500">Choose a model and explore outfit ideas</p>
              </div>
              <div className="flex shrink-0 rounded-full border border-slate-800 bg-slate-950 p-1" aria-label="Choose a model category">
                {(["female", "male"] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    aria-pressed={selectedGender === gender}
                    onClick={() => chooseGender(gender)}
                    className={`min-h-10 rounded-full px-3 text-xs font-semibold capitalize transition active:scale-95 ${selectedGender === gender ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
                  >
                    {gender === "female" ? "Women" : "Men"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-100">
              <div className="media-overlay relative aspect-[4/5]">
                <motion.div
                  key={`${selectedGender}-${selectedOutfit}`}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
                >
                  <Image
                    src={outfitPreview}
                    alt={`${selectedGender} model wearing ${selectedOutfitPreset.label}`}
                    fill
                    preload
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                </motion.div>
                <div className="media-gradient-fade absolute inset-0" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> STYLE EXPLORER
                </div>
              </div>
            </div>
            {selectedGender === "female" ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {outfits.map((outfit) => (
                  <button
                    key={outfit.label}
                    type="button"
                    aria-pressed={selectedOutfit === outfit.label}
                    onClick={() => chooseOutfit(outfit.label)}
                    className={`min-h-11 rounded-xl border px-2 text-xs font-semibold transition active:scale-95 ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
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
                      className={`min-h-10 shrink-0 snap-start rounded-full border px-3 text-xs font-medium transition active:scale-95 ${selectedOutfit === outfit.label ? "border-indigo-400/60 bg-indigo-500/15 text-white" : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-100"}`}
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
            <p className="px-2 pt-3 text-[11px] text-slate-500 sm:px-3">
              Explore styles here. Your personal AI try-on starts in the Studio.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-8 lg:px-10 lg:pb-10" aria-labelledby="fabric-curiosity-heading">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-fuchsia-500/10 p-4 shadow-xl shadow-indigo-950/15 sm:gap-5 sm:rounded-3xl sm:p-8 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <h2 id="fabric-curiosity-heading" className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
              From Fabric Swatch to Perfect Fit in 3 Steps
            </h2>
            <p className="mt-2 text-sm leading-5.5 text-slate-300 sm:mt-3 sm:leading-6 sm:text-base">
              Stop guessing how unstitched material or online clothes will look on your body. See the drape, fit, and pattern on your personal photo instantly.
            </p>
          </div>
          <Link href="/studio" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 md:w-auto">
            See Your Look in the Studio →
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-800 bg-slate-900/45">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">How it works</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Your Virtual Try-On in 3 Simple Steps</h2>
            <p className="mt-3 text-sm leading-5.5 text-slate-400 sm:mt-4 sm:leading-6 sm:text-base">From your photo and fabric to a personalized look, getting started is simple.</p>
          </div>
          <ol className="mt-6 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {[
              { number: "01", title: "Upload Your Photo", text: "Drop a full-body photo or pick our studio AI model." },
              { number: "02", title: "Pick Fabric or Style", text: "Upload any cloth material photo." },
              { number: "03", title: "Instant Photorealistic Fit", text: "Our AI accurately drapes, stitches, and maps the fabric onto your exact body structure." },
            ].map((step, index) => (
              <motion.li
                key={step.number}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-950/20 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-sm font-bold text-indigo-300">{step.number}</span>
                <h3 className="mt-3 text-base font-semibold text-white sm:mt-5 sm:text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
              </motion.li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-indigo-400/15 bg-indigo-500/5 p-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5 sm:rounded-3xl sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-white sm:text-xl">Ready to See Yourself in Your Dream Outfit?</h3>
              <p className="mt-1 text-sm leading-5 text-slate-400 sm:leading-normal">Join thousands of fashion lovers creating custom looks before buying fabric.</p>
            </div>
            <Link href="/studio" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto">
              Open Virtual Studio →
            </Link>
          </div>
        </div>
      </section>
      {isAuthOpen && <AuthModal isOpen onClose={() => setIsAuthOpen(false)} />}
      <Footer />
    </div>
  );
}

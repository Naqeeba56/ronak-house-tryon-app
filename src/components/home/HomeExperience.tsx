"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Check, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { OUTFIT_PRESETS_BY_GENDER, TRY_ON_MODEL_PRESETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { loading: () => null });

type Gender = "male" | "female";

const OUTFIT_ICONS: Record<string, string> = {
  Shirt: "✳",
  Trousers: "◌",
  Blazer: "✦",
  "3-Piece Suit": "✧",
  "Nehru Jacket": "✦",
  "Indo-Western": "❋",
  Sherwani: "❋",
  Kurta: "✳",
  "Salwar Suit": "❋",
  Saree: "〰",
  Lehenga: "✿",
};

export default function HomeExperience() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>("female");
  const [selectedOutfit, setSelectedOutfit] = useState("Saree");
  const outfits = OUTFIT_PRESETS_BY_GENDER[selectedGender];
  const sampleModel = TRY_ON_MODEL_PRESETS.find((model) => model.gender === selectedGender)!;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsSignedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
    });
    if (new URLSearchParams(window.location.search).get("auth") === "required") {
      window.setTimeout(() => setIsAuthOpen(true), 0);
    }
    return () => listener.subscription.unsubscribe();
  }, []);

  const tryOnForFree = () => {
    if (isSignedIn) router.push("/studio");
    else setIsAuthOpen(true);
  };

  const chooseGender = (gender: Gender) => {
    setSelectedGender(gender);
    setSelectedOutfit(OUTFIT_PRESETS_BY_GENDER[gender][0].label);
  };

  return (
    <div className="overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-10 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            YOUR VIRTUAL FITTING ROOM
          </div>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.06] tracking-[-0.055em] text-white sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
            Find your
            <br />
            <span className="text-indigo-400">next look.</span>
            <br />
            Before you buy.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
            See how an outfit feels on you, not just on a hanger. Upload a photo, pick a style, and let AI do the fitting.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={tryOnForFree}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Try it on for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              See how it works
              <ArrowDown className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> One free try-on</span>
            <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-emerald-400" /> Private by design</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[600px] lg:mr-0">
          <div className="absolute -inset-8 rounded-[3rem] bg-indigo-500/10 blur-3xl" />
          <div className="relative rounded-[2rem] border border-slate-800 bg-slate-900 p-3 shadow-2xl shadow-slate-950/30 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 sm:px-3 sm:pb-4">
              <div>
                <p className="text-sm font-semibold text-white">Your style, your way</p>
                <p className="mt-1 text-xs text-slate-500">Choose a model and explore outfit ideas</p>
              </div>
              <div className="flex rounded-full border border-slate-800 bg-slate-950 p-1" aria-label="Choose a model category">
                {(["female", "male"] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    aria-pressed={selectedGender === gender}
                    onClick={() => chooseGender(gender)}
                    className={`min-h-8 rounded-full px-3 text-xs font-semibold capitalize transition ${selectedGender === gender ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    {gender === "female" ? "Women" : "Men"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-100">
              <div className="media-overlay relative aspect-[4/5]">
                <motion.div
                  key={sampleModel.id}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
                >
                  <Image
                    src={sampleModel.imageUrl}
                    alt={`Full-body ${selectedGender} model facing the camera`}
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                </motion.div>
                <div className="media-gradient-fade absolute inset-0" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> STYLE EXPLORER
                </div>
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200">Selected style</p>
                      <p className="mt-1 truncate text-lg font-semibold text-white">{selectedOutfit}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-indigo-200">
                      {OUTFIT_ICONS[selectedOutfit] ?? "✳"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {outfits.map((outfit) => (
                      <button
                        key={outfit.label}
                        type="button"
                        aria-pressed={selectedOutfit === outfit.label}
                        onClick={() => setSelectedOutfit(outfit.label)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${selectedOutfit === outfit.label ? "border-white/60 bg-white text-slate-950" : "border-white/20 bg-white/5 text-white/80 hover:bg-white/15"}`}
                      >
                        {outfit.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="px-2 pt-3 text-[11px] text-slate-500 sm:px-3">
              Explore styles here. Your personal AI try-on starts in the Studio.
            </p>
          </div>
          <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-medium text-slate-200 shadow-xl sm:flex lg:-right-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300"><WandSparkles className="h-4 w-4" /></span>
            Made for your photo
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-800 bg-slate-900/45">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">No guesswork</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A better fit starts with three simple steps.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">No complicated tools. Just your photo, an outfit, and a look you can make yours.</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { number: "01", title: "Add your photos", text: "Upload a photo of yourself and the outfit you want to try." },
              { number: "02", title: "Choose your style", text: "Browse outfit ideas made for your selected category." },
              { number: "03", title: "See your look", text: "Generate your try-on, then download it or find it in your Library." },
            ].map((step) => (
              <li key={step.number} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-indigo-400/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-sm font-bold text-indigo-300">{step.number}</span>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl border border-indigo-400/15 bg-indigo-500/5 p-6 sm:flex-row sm:p-8">
            <div>
              <h3 className="text-xl font-semibold text-white">Ready to see it on you?</h3>
              <p className="mt-1 text-sm text-slate-400">Your first try-on is on us after sign-in.</p>
            </div>
            <button type="button" onClick={tryOnForFree} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto">
              Start your free try-on <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      {isAuthOpen && <AuthModal isOpen onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
}

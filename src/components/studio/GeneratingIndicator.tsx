"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GeneratingIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="vton-generating flex items-center gap-4 rounded-2xl p-4"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 1.5, ease: "linear", repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-indigo-400/20 border-t-indigo-300"
        />
        <Sparkles className="h-5 w-5 text-indigo-300" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Creating your look</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Your outfit is being tailored to the model. This can take a little while.</p>
      </div>
    </motion.div>
  );
}

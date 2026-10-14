"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function GeneratingIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Generating your try-on"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="vton-generation-overlay"
    >
      <div className="vton-generation-content">
        <div className="vton-generating-loader" aria-hidden="true">
          {"Generating".split("").map((letter, index) => (
            <span className="vton-generating-letter" key={`${letter}-${index}`}>
              {letter}
            </span>
          ))}
          <span className="vton-generating-scan" />
        </div>
      </div>
    </motion.div>
  );
}

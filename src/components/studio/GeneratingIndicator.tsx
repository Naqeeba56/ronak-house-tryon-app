"use client";

import { motion, useReducedMotion } from "framer-motion";
import ThreadLoader from "@/components/ThreadLoader";

export default function GeneratingIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="vton-generation-overlay"
    >
      <ThreadLoader
        text="Crafting your look"
        detailText="Stitching every detail together..."
        fullScreen={false}
      />
    </motion.div>
  );
}

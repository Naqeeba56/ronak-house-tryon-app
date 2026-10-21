"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ErrorAlert from "@/components/ui/ErrorAlert";
import BrandMark from "@/components/layout/BrandMark";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const portalRoot = typeof document === "undefined" ? null : document.body;
  if (!portalRoot) return null;

  const supabase = createClient();

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  return createPortal(
    <AnimatePresence>
    {isOpen && <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-md sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mb-3 inline-flex p-2">
            <BrandMark className="h-10 w-10" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-white">Welcome to VTON Labs</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in or create your account securely with Google.</p>
        </div>

        {errorMsg && <ErrorAlert description={errorMsg} className="mb-4 w-full sm:w-full" onDismiss={() => setErrorMsg(null)} />}

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="vton-google-button mb-4 w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 262"
            aria-hidden="true"
            className="vton-google-button-icon"
          >
            <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
            <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
            <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
            <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
          </svg>
          <span className="vton-google-button-text">{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>
        <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">Google manages your sign-in securely. No passwords or email forms are stored by VTON Labs.</p>
      </motion.div>
    </motion.div>}
    </AnimatePresence>,
    portalRoot,
  );
}
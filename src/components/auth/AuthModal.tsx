"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-md sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6">
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
          <div className="inline-flex p-3 rounded-xl bg-indigo-600/20 text-indigo-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-white">Welcome to FabricFit AI</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in or create your account securely with Google.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="mb-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>
        <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">Google manages your sign-in securely. No passwords or email forms are stored by FabricFit AI.</p>
      </div>
    </div>,
    document.body,
  );
}
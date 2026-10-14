"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const setSessionUser = (nextUser: User | null) => {
      setUser(nextUser);
      setIsAuthReady(true);
    };
    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setSessionUser(null);
        return;
      }
      setSessionUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const isOwner = user?.app_metadata?.role === "owner"
    || user?.email?.trim().toLowerCase() === APP_ADMIN_EMAIL;

  const requireAuth = (event: MouseEvent<HTMLAnchorElement>) => {
    if (user) return;
    event.preventDefault();
    if (isAuthReady) setIsAuthOpen(true);
  };

  return (
    <>
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-400 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-7 sm:gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white transition-transform hover:scale-[1.01]"><Sparkles className="h-5 w-5 text-indigo-400" /> Ronak House <span className="text-indigo-400">TryON</span></Link>
            <p className="mt-4 max-w-xs text-sm leading-6">Preview your fabrics and outfits with a private virtual try-on.</p>
            <p className="mt-4 text-xs text-slate-600 sm:mt-6">© 2026 Ronak House TryON. Built for better fitting ideas.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product</p>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/studio" onClick={requireAuth} className="transition hover:text-white">Studio</Link>
              <Link href="/library" onClick={requireAuth} className="transition hover:text-white">Library</Link>
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              {isAuthReady && isOwner && <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/profile" onClick={requireAuth} className="transition hover:text-white">Profile &amp; billing</Link>
              {!user && <button type="button" onClick={() => setIsAuthOpen(true)} className="text-left transition hover:text-white">Sign in</button>}
              <a href="mailto:support@ronakhouse.com?subject=Ronak%20House%20TryON%20Support" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Contact support</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Ready to render?</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Your next collection can start with one fabric photo.</p>
            <Link href="/studio" onClick={requireAuth} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-white transition hover:scale-[1.02] hover:text-indigo-300 active:scale-[0.98] sm:mt-5">Open the studio <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

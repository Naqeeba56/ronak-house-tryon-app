"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import AuthModal from "@/components/auth/AuthModal";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [tryOnBalance, setTryOnBalance] = useState<number | "unlimited" | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("Open profile");
  useEffect(() => {
    const supabase = createClient();
    const updateUser = (user: { id?: string; email?: string | null; user_metadata?: { avatar_url?: string; picture?: string; full_name?: string; name?: string } } | null) => {
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(true);
      setAvatarUrl(user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null);
      setUserName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "Open profile");
      if (!user) {
        setTryOnBalance(null);
        return;
      }
      if (user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL) {
        setTryOnBalance("unlimited");
        return;
      }
      void fetch("/api/tryon-credits", { cache: "no-store" })
        .then(async (response) => response.ok ? response.json() as Promise<{ freeRemaining: number; packRemaining: number; unlimited?: boolean }> : null)
        .then((balance) => setTryOnBalance(balance ? balance.unlimited ? "unlimited" : balance.freeRemaining + balance.packRemaining : null))
        .catch(() => setTryOnBalance(null));
    };

    supabase.auth.getUser().then(({ data }) => updateUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => updateUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 bg-slate-950/90 px-2 pt-2 text-slate-200 backdrop-blur-xl sm:px-6 sm:pt-3">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 rounded-full border border-slate-800 bg-slate-900/95 px-2.5 shadow-lg shadow-slate-950/5 sm:min-h-16 sm:gap-3 sm:px-5">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-1.5 rounded-full text-sm font-bold tracking-tight text-white transition-colors hover:text-[#7e22ce] sm:gap-2 sm:text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15"><Sparkles className="h-4 w-4 text-indigo-400" /></span>
          <span className="vton-heading truncate">Ronak House<span className="text-indigo-400 group-hover:text-[#7e22ce]"> TryON</span></span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full bg-slate-950/60 p-1 text-sm font-medium md:flex">
          <NavLink href="/studio" active={pathname.startsWith("/studio") || pathname.startsWith("/result")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Studio</NavLink>
          <NavLink href="/library" active={pathname.startsWith("/library")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Library</NavLink>
          <NavLink href="/pricing" active={pathname.startsWith("/pricing")}>Pricing</NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated && tryOnBalance !== null && (
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-indigo-300 sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" /> {tryOnBalance === "unlimited" ? "Unlimited" : `${tryOnBalance} try-ons`}
            </span>
          )}
          <ThemeToggle />
          <div className="flex h-10 min-w-[5.5rem] items-center justify-end">
            <AnimatePresence mode="wait" initial={false}>
              {!isAuthReady ? (
                <motion.span key="checking" aria-hidden="true" className="h-9 w-9 rounded-full bg-slate-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              ) : isAuthenticated ? (
                <motion.div key="profile" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                  <Link href="/profile" aria-label={userName} title={userName} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-indigo-600 text-xs font-bold text-white transition hover:border-[#7e22ce] hover:ring-2 hover:ring-[#7e22ce]/40">
                    {avatarUrl ? <Image src={avatarUrl} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                  </Link>
                </motion.div>
              ) : (
                <motion.button key="signin" type="button" onClick={() => setIsAuthOpen(true)} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 420, damping: 30 }} className="min-h-10 rounded-full bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:scale-[1.02] hover:bg-[#7e22ce] active:scale-[0.98] sm:px-4">
                  Sign in
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-1 py-1.5 text-xs font-medium md:hidden">
        <NavLink href="/studio" active={pathname.startsWith("/studio") || pathname.startsWith("/result")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Studio</NavLink>
        <NavLink href="/library" active={pathname.startsWith("/library")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Library</NavLink>
        <NavLink href="/pricing" active={pathname.startsWith("/pricing")}>Pricing</NavLink>
      </nav>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
    </>
  );
}

function NavLink({
  href,
  active,
  isAuthReady = true,
  isAuthenticated = true,
  onAuthRequired,
  requiresAuth = false,
  children,
}: {
  href: string;
  active: boolean;
  isAuthReady?: boolean;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  requiresAuth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        if (requiresAuth && (!isAuthReady || !isAuthenticated)) {
          event.preventDefault();
          if (isAuthReady) onAuthRequired?.();
          return;
        }
      }}
      className={`vton-header-nav-link inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 transition-colors ${active ? "bg-[#7e22ce] text-white" : "text-slate-400 hover:bg-[#7e22ce] hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
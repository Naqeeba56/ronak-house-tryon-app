"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import BrandLogo from "@/components/layout/BrandLogo";
import BrandMark from "@/components/layout/BrandMark";
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
    {/* px-3 on mobile gives the pill breathing room from the screen edges;
        sm:px-5 adds more on tablet; sm:pt-2.5 on desktop gives a slightly
        larger gap above the pill so it feels grounded rather than glued to top */}
    <header className="sticky top-0 z-40 bg-slate-950/90 px-3 pt-1.5 text-slate-200 backdrop-blur-xl sm:px-5 sm:pt-2.5">
      {/* min-h-12 (48px) on mobile is a touch-friendly target; sm:min-h-[60px]
          on tablet/laptop gives the pill more vertical presence without bloating;
          px-3 → sm:px-5 keeps inner content from touching the pill edges */}
      <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-2 rounded-full border border-slate-800 bg-slate-900/95 px-3 shadow-lg shadow-slate-950/5 sm:min-h-[60px] sm:gap-3 sm:px-5">
        <Link href="/" aria-label="VTON Labs home" className="flex min-w-0 shrink items-center rounded-full">
          <BrandLogo priority />
        </Link>

        {/* Desktop nav — gap-1 p-1 keeps the pill-within-pill tight on laptop */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full bg-slate-950/60 p-1 text-sm font-medium md:flex">
          <NavLink href="/studio" active={pathname.startsWith("/studio") || pathname.startsWith("/result")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Studio</NavLink>
          <NavLink href="/library" active={pathname.startsWith("/library")} isAuthReady={isAuthReady} isAuthenticated={isAuthenticated} onAuthRequired={() => setIsAuthOpen(true)} requiresAuth>Library</NavLink>
          <NavLink href="/pricing" active={pathname.startsWith("/pricing")}>Pricing</NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isAuthenticated && tryOnBalance !== null && (
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 sm:inline-flex">
              <BrandMark className="h-3.5 w-3.5" /> {tryOnBalance === "unlimited" ? "Unlimited" : `${tryOnBalance} try-ons`}
            </span>
          )}
          <ThemeToggle />
          {/* h-9 w-9 on mobile keeps the avatar/button from overwhelming the bar;
              sm:h-10 sm:w-10 restores the original comfortable size on larger screens */}
          <div className="flex items-center justify-end">
            <AnimatePresence mode="wait" initial={false}>
              {!isAuthReady ? (
                <motion.span key="checking" aria-hidden="true" className="h-9 w-9 rounded-full bg-slate-800 sm:h-10 sm:w-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              ) : isAuthenticated ? (
                <motion.div key="profile" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                  <Link href="/profile" aria-label={userName} title={userName} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-indigo-600 text-xs font-bold text-white transition hover:border-[#7e22ce] hover:ring-2 hover:ring-[#7e22ce]/40 sm:h-10 sm:w-10">
                    {avatarUrl ? <Image src={avatarUrl} alt="" width={40} height={40} unoptimized className="h-full w-full rounded-full object-cover" /> : <User className="h-4 w-4" />}
                  </Link>
                </motion.div>
              ) : (
                <motion.button key="signin" type="button" onClick={() => setIsAuthOpen(true)} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 420, damping: 30 }} className="min-h-9 rounded-full bg-indigo-600 px-3.5 text-xs font-semibold text-white transition hover:scale-[1.02] hover:bg-[#7e22ce] active:scale-[0.98] sm:min-h-10 sm:px-4 sm:text-sm">
                  Sign in
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Mobile-only nav strip: more vertical padding (py-1) so the links feel
          tappable; gap-0.5 prevents overflow on very narrow screens */}
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-1 py-1 text-xs font-medium md:hidden">
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
      className={`vton-header-nav-link inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 transition-colors sm:min-h-10 ${active ? "bg-[#7e22ce] text-white" : "text-slate-400 hover:bg-[#7e22ce] hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import AuthModal from "@/components/auth/AuthModal";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tryOnBalance, setTryOnBalance] = useState<number | "unlimited" | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("Open profile");

  useEffect(() => {
    const supabase = createClient();
    const updateUser = (user: { id?: string; email?: string | null; user_metadata?: { avatar_url?: string; picture?: string; full_name?: string; name?: string } } | null) => {
      setIsAuthenticated(Boolean(user));
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
    <header className="sticky top-0 z-40 bg-slate-950/90 px-3 pt-3 text-slate-200 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-slate-800 bg-slate-900/95 px-3 shadow-lg shadow-slate-950/5 sm:min-h-16 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-full text-base font-bold tracking-tight text-white sm:text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15"><Sparkles className="h-4 w-4 text-indigo-400" /></span>
          <span>FabricFit<span className="text-indigo-400"> AI</span></span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full bg-slate-950/60 p-1 text-sm font-medium md:flex">
          <NavLink href="/studio" active={pathname.startsWith("/studio") || pathname.startsWith("/result")}>Studio</NavLink>
          {isAuthenticated && <NavLink href="/library" active={pathname.startsWith("/library")}>Library</NavLink>}
          <NavLink href="/pricing" active={pathname.startsWith("/pricing")}>Pricing</NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated && tryOnBalance !== null && (
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-indigo-300 sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" /> {tryOnBalance === "unlimited" ? "Unlimited" : `${tryOnBalance} try-ons`}
            </span>
          )}
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/profile" aria-label={userName} title={userName} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-indigo-600 text-xs font-bold text-white transition hover:ring-2 hover:ring-indigo-400/40">
              {avatarUrl ? <Image src={avatarUrl} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
            </Link>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="min-h-10 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-500">
              Sign in
            </button>
          )}
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-2 py-2 text-xs font-medium md:hidden">
        <NavLink href="/studio" active={pathname.startsWith("/studio") || pathname.startsWith("/result")}>Studio</NavLink>
        {isAuthenticated && <NavLink href="/library" active={pathname.startsWith("/library")}>Library</NavLink>}
        <NavLink href="/pricing" active={pathname.startsWith("/pricing")}>Pricing</NavLink>
      </nav>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  const pendingLabel = href === "/studio" ? "Opening Studio..." : href === "/library" ? "Opening Library..." : "Loading plans...";
  return (
    <Link href={href} prefetch={false} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-full px-3 py-2 transition-colors ${active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}>
      <NavLinkLabel pendingLabel={pendingLabel}>{children}</NavLinkLabel>
    </Link>
  );
}

function NavLinkLabel({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useLinkStatus();
  return (
    <span aria-live="polite" className="inline-flex items-center gap-1.5">
      {pending && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />}
      {pending ? pendingLabel : children}
    </span>
  );
}
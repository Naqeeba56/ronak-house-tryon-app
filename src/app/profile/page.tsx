"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import TryOnPackPurchaseButton from "@/components/billing/TryOnPackPurchaseButton";
import { createClient } from "@/lib/supabase/client";

type ProfileTab = "account" | "billing" | "library";

const PROFILE_TABS: { id: ProfileTab; label: string; icon: typeof User }[] = [
  { id: "account", label: "Account details", icon: User },
  { id: "billing", label: "Try-on balance", icon: CreditCard },
  { id: "library", label: "My library", icon: ImageIcon },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("Your profile");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [packRemaining, setPackRemaining] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const refreshBalance = async () => {
    const response = await fetch("/api/tryon-credits", { cache: "no-store" });
    if (!response.ok) return;
    const balance = (await response.json()) as { freeRemaining: number; packRemaining: number; unlimited?: boolean };
    setFreeRemaining(balance.freeRemaining);
    setPackRemaining(balance.packRemaining);
    setIsAdmin(balance.unlimited === true);
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const { data } = await createClient().auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace("/?auth=required");
        return;
      }
      if (!isMounted) return;
      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Your profile");
      setAvatarUrl(user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null);
      await refreshBalance();
    };
    void loadProfile();
    return () => { isMounted = false; };
  }, [router]);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileMessage(null);
    setIsSaving(true);
    const { error } = await createClient().auth.updateUser({ data: { full_name: fullName.trim() } });
    if (error) setProfileError(error.message);
    else setProfileMessage("Your profile has been updated.");
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setProfileError(error.message);
      setIsSigningOut(false);
      return;
    }
    router.push("/");
  };

  const initials = fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const totalBalance = isAdmin ? "Unlimited" : freeRemaining === null || packRemaining === null ? "…" : freeRemaining + packRemaining;

  return (
    <div className="mx-auto min-h-[75vh] max-w-7xl px-5 py-10 text-slate-100 sm:px-8 lg:px-10 lg:py-14">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Your space</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Account & preferences</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your profile, try-ons, and saved looks in one place.</p>
      </header>

      <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-indigo-500/15 text-lg font-semibold text-indigo-200">
              {avatarUrl ? <Image src={avatarUrl} alt={`${fullName} profile`} width={64} height={64} unoptimized className="h-full w-full object-cover" /> : initials || <User className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-indigo-300"><BadgeCheck className="h-3.5 w-3.5" /> FabricFit member</span>
              <h2 className="mt-1 truncate text-xl font-semibold text-white">{fullName}</h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-400"><Mail className="h-3.5 w-3.5 shrink-0" /> {email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between md:border-0 md:pt-0">
            <div className="sm:pr-3">
              <p className="text-xs text-slate-500">Available try-ons</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white"><Sparkles className="h-5 w-5 text-indigo-300" />{totalBalance}</p>
            </div>
            {!isAdmin && <TryOnPackPurchaseButton onPurchased={() => void refreshBalance()} />}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Profile sections" className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-2 lg:flex-col lg:self-start">
          {PROFILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition lg:w-full ${activeTab === id ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}
            >
              <Icon className="h-4 w-4" /> {label}
              {activeTab === id && <ArrowRight className="ml-auto hidden h-4 w-4 lg:block" />}
            </button>
          ))}
          <div className="hidden border-t border-slate-800 pt-2 lg:block">
            <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-60">
              <LogOut className="h-4 w-4" /> {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </nav>

        <div className="min-w-0">
          {activeTab === "account" && (
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white">Personal information</h2>
                  <p className="mt-1 text-sm text-slate-400">Keep the name associated with your try-on account up to date.</p>
                </div>
                <label className="block text-sm font-medium text-slate-300">
                  Full name
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10" />
                </label>
                <label className="mt-4 block text-sm font-medium text-slate-300">
                  Email address
                  <input value={email} disabled className="mt-2 min-h-11 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-slate-500" />
                </label>
                <button type="button" onClick={() => void handleSaveProfile()} disabled={isSaving || !fullName.trim()} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSaving ? "Saving…" : "Save changes"} {!isSaving && <ArrowRight className="h-4 w-4" />}
                </button>
                {profileMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{profileMessage}</p>}
                {profileError && <p role="alert" className="mt-3 text-sm text-rose-300">{profileError}</p>}
              </section>

              <section className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
                <h2 className="mt-5 text-lg font-semibold text-white">Your account, kept private.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Your sign-in is managed securely by Google. Your try-on photos and saved results belong to your account.</p>
                <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-slate-700 px-4 text-sm font-medium text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300 disabled:opacity-60 lg:hidden">
                  <LogOut className="h-4 w-4" /> {isSigningOut ? "Signing out…" : "Sign out"}
                </button>
              </section>
            </div>
          )}

          {activeTab === "billing" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold text-white">Your try-on balance</h2><p className="mt-1 text-sm text-slate-400">Credits are used when you generate a new look.</p></div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-300"><Sparkles className="h-4 w-4" /> {totalBalance} available</span>
              </div>
              {isAdmin ? (
                <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm font-medium text-emerald-300">Your admin account includes unlimited try-ons.</p>
              ) : (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <BalanceCard label="Free try-on" value={freeRemaining} detail="Included with your account" />
                    <BalanceCard label="Plan & top-up credits" value={packRemaining} detail="Available from paid plans" />
                  </div>
                  <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-5 sm:flex-row sm:items-center">
                    <div><p className="font-semibold text-white">Ready for another look?</p><p className="mt-1 text-sm text-slate-400">Find the plan that fits your wardrobe.</p></div>
                    <Link href="/pricing" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500">Explore plans <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === "library" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"><ImageIcon className="h-5 w-5" /></span>
              <h2 className="mt-5 text-lg font-semibold text-white">A home for your looks.</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">Your generated try-ons are saved privately and stay available in your Library for 30 days.</p>
              <Link href="/library" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-700 px-5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/50 hover:text-white">Open my Library <ArrowRight className="h-4 w-4" /></Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, detail }: { label: string; value: number | null; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value ?? "…"}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

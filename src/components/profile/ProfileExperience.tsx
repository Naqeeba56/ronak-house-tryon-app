"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import TryOnPackPurchaseButton from "@/components/billing/TryOnPackPurchaseButton";
import Footer from "@/components/layout/Footer";
import BrandMark from "@/components/layout/BrandMark";
import { createClient } from "@/lib/supabase/client";
import ErrorAlert from "@/components/ui/ErrorAlert";

type ProfileTab = "account" | "billing" | "library";
type InitialProfile = {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  freeRemaining: number;
  packRemaining: number;
  isAdmin: boolean;
};

const PROFILE_TABS: { id: ProfileTab; label: string; icon: typeof User }[] = [
  { id: "account", label: "Account details", icon: User },
  { id: "billing", label: "Try-on balance", icon: CreditCard },
  { id: "library", label: "My library", icon: ImageIcon },
];

export default function ProfileExperience({ initialProfile }: { initialProfile: InitialProfile }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [email] = useState(initialProfile.email);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [savedFullName, setSavedFullName] = useState(initialProfile.fullName);
  const [avatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(initialProfile.freeRemaining);
  const [packRemaining, setPackRemaining] = useState<number | null>(initialProfile.packRemaining);
  const [isAdmin, setIsAdmin] = useState(initialProfile.isAdmin);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showSavedTick, setShowSavedTick] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSaveProfile = async () => {
    setProfileError(null);
    const previousName = savedFullName;
    const nextName = fullName.trim();
    setFullName(nextName);
    setSavedFullName(nextName);
    setProfileMessage("Your profile has been updated.");
    setShowSavedTick(true);
    setIsSaving(true);
    try {
      const { error } = await createClient().auth.updateUser({ data: { full_name: nextName } });
      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      setFullName(previousName);
      setSavedFullName(previousName);
      setIsEditing(true);
      setProfileMessage(null);
      setProfileError(error instanceof Error ? error.message : "We couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelProfileEdit = () => {
    setFullName(savedFullName);
    setIsEditing(false);
    setProfileError(null);
    setProfileMessage(null);
    setShowSavedTick(false);
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
    <>
    <AnimatePresence>
      {profileError && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed right-4 top-20 z-[90]"
        >
          <ErrorAlert description={profileError} onDismiss={() => setProfileError(null)} />
        </motion.div>
      )}
    </AnimatePresence>
    <div className="mobile-compact mx-auto min-h-[75vh] max-w-7xl px-4 py-7 text-slate-100 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Your space</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Account & preferences</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your profile, try-ons, and saved looks in one place.</p>
      </header>

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:mb-8 sm:rounded-3xl sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-indigo-500/15 text-lg font-semibold text-indigo-200 sm:h-16 sm:w-16">
              {avatarUrl ? <Image src={avatarUrl} alt={`${fullName} profile`} width={64} height={64} unoptimized className="h-full w-full object-cover" /> : initials || <User className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-indigo-300"><BadgeCheck className="h-3.5 w-3.5" /> FabricFit member</span>
              <h2 className="mt-1 truncate text-xl font-semibold text-white">{fullName}</h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-400"><Mail className="h-3.5 w-3.5 shrink-0" /> {email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between md:border-0 md:pt-0">
            <div className="sm:pr-3">
              <p className="text-xs text-slate-500">Available try-ons</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white"><BrandMark className="h-5 w-5" />{totalBalance}</p>
            </div>
            {!isAdmin && <TryOnPackPurchaseButton onPurchased={() => void refreshBalance()} />}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Profile sections" className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 sm:gap-2 sm:p-2 lg:flex-col lg:self-start">
          {PROFILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-1.5 text-center text-[11px] font-medium transition active:scale-[0.98] sm:gap-2 sm:px-2 sm:text-xs lg:min-h-11 lg:flex-none lg:justify-start lg:gap-3 lg:px-3 lg:text-left lg:text-sm ${activeTab === id ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate sm:hidden">{id === "account" ? "Account" : id === "billing" ? "Balance" : "Library"}</span>
              <span className="hidden truncate sm:inline">{label}</span>
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
              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-7">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white">Personal information</h2>
                  <p className="mt-1 text-sm text-slate-400">Keep the name associated with your try-on account up to date.</p>
                </div>
                <label className="block text-sm font-medium text-slate-300">
                  Full name
                  <input value={fullName} readOnly={!isEditing} onChange={(event) => setFullName(event.target.value)} className={`mt-2 min-h-11 w-full rounded-xl border border-slate-800 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 ${isEditing ? "bg-slate-950 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10" : "cursor-default bg-slate-950/60"}`} />
                </label>
                <label className="mt-4 block text-sm font-medium text-slate-300">
                  Email address
                  <input value={email} disabled className="mt-2 min-h-11 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-slate-500" />
                </label>
                {isEditing ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={() => void handleSaveProfile()} disabled={isSaving || !fullName.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                      {isSaving ? "Saving…" : showSavedTick ? "Saved" : "Save Changes"}
                      <AnimatePresence mode="wait" initial={false}>
                        {showSavedTick ? <motion.span key="saved" initial={{ opacity: 0, scale: 0.5, rotate: -35 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.22 }}><Check className="h-4 w-4" /></motion.span> : <motion.span key="arrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ArrowRight className="h-4 w-4" /></motion.span>}
                      </AnimatePresence>
                    </button>
                    <button type="button" onClick={cancelProfileEdit} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700 px-5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setIsEditing(true); setProfileMessage(null); setProfileError(null); setShowSavedTick(false); }} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500">Edit</button>
                )}
                {profileMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{profileMessage}</p>}
              </section>

              <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
                <h2 className="mt-5 text-lg font-semibold text-white">Account and Library access.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Google manages sign-in. Saved try-on results are available through your authenticated account; submitted images are sent to the configured generation provider.</p>
                <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-slate-700 px-4 text-sm font-medium text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300 disabled:opacity-60 lg:hidden">
                  <LogOut className="h-4 w-4" /> {isSigningOut ? "Signing out…" : "Sign out"}
                </button>
              </section>
            </div>
          )}

          {activeTab === "billing" && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold text-white">Your try-on balance</h2><p className="mt-1 text-sm text-slate-400">Credits are used when you generate a new look.</p></div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-300"><BrandMark className="h-4 w-4" /> {totalBalance} available</span>
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
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">Your generated try-ons are saved to your account-only Library and stay available for up to 30 days.</p>
              <Link href="/library" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-700 px-5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/50 hover:text-white">Open my Library <ArrowRight className="h-4 w-4" /></Link>
            </section>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
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

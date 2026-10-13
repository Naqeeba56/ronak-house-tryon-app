import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-400 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-7 sm:gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white"><Sparkles className="h-5 w-5 text-indigo-400" /> Ronak House <span className="text-indigo-400">TryON</span></Link>
          <p className="mt-4 max-w-xs text-sm leading-6">Preview your fabrics and outfits with a private virtual try-on.</p>
          <p className="mt-4 text-xs text-slate-600 sm:mt-6">© 2026 Ronak House TryON. Built for better fitting ideas.</p>
        </div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product</p><div className="mt-4 grid gap-3 text-sm"><Link href="/studio" className="hover:text-white">Studio</Link><Link href="/pricing" className="hover:text-white">Pricing</Link><Link href="/dashboard" className="hover:text-white">Dashboard</Link></div></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p><div className="mt-4 grid gap-3 text-sm"><Link href="/profile" className="hover:text-white">Profile & billing</Link><Link href="/" className="hover:text-white">Sign in</Link><Link href="mailto:hello@fabricfit.ai" className="hover:text-white">Contact support</Link></div></div>
        <div className="border-t border-slate-800 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Ready to render?</p><p className="mt-3 text-sm leading-6 text-slate-300">Your next collection can start with one fabric photo.</p><Link href="/studio" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-white transition hover:text-indigo-300 sm:mt-5">Open the studio <ArrowUpRight className="h-4 w-4" /></Link></div>
      </div>
    </footer>
  );
}
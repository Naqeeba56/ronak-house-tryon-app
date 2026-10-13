import { Check, ShieldCheck, Sparkles } from "lucide-react";
import TryOnPackPurchaseButton from "@/components/billing/TryOnPackPurchaseButton";
import { TRYON_PLANS, type TryOnPlanId } from "@/lib/constants";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Try-On Plans & Pricing",
  description: "Compare Ronak House TryON plans and choose the right number of private AI outfit generations for your style.",
  alternates: { canonical: new URL("/pricing", siteUrl).toString() },
  openGraph: {
    title: "Try-On Plans & Pricing",
    description: "Compare Ronak House TryON plans and choose the right number of private AI outfit generations for your style.",
    url: new URL("/pricing", siteUrl).toString(),
  },
};

const PLAN_DETAILS: Record<TryOnPlanId, { description: string; buttonLabel: string }> = {
	starter: { description: "10 images · valid 30 days", buttonLabel: "Choose plan" },
	pro: { description: "90 images · valid 30 days", buttonLabel: "Choose plan" },
	topup: { description: "50 extra images · add-on when your monthly limit ends", buttonLabel: "Add top-up" },
};

export default function PricingPage() {
	return (
		<>
		<section className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 text-slate-100 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
			<header className="mx-auto max-w-3xl text-center">
				<p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
					<Sparkles className="h-3.5 w-3.5" /> Simple, transparent pricing
				</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:mt-5 sm:text-5xl">More looks. Less guesswork.</h1>
				<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
					Choose the plan that fits your style. Every try-on is private, and generated images stay in your Library for 30 days.
				</p>
			</header>

			<div className="mx-auto mt-7 grid max-w-6xl items-stretch gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
				<Plan planId="starter" />
				<Plan planId="pro" highlighted />
				<Plan planId="topup" />
			</div>
			<p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
				<ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure checkout powered by Razorpay · No recurring charges
			</p>
		</section>
		<Footer />
		</>
	);
}

function Plan({ planId, highlighted = false }: {
	planId: TryOnPlanId;
	highlighted?: boolean;
}) {
	const plan = TRYON_PLANS[planId];
	const details = PLAN_DETAILS[planId];

	return (
		<section className={`relative flex flex-col rounded-2xl border p-5 transition hover:-translate-y-1 sm:rounded-3xl sm:p-7 ${highlighted ? "border-indigo-400/70 bg-indigo-500/10 shadow-xl shadow-indigo-950/15" : "border-slate-800 bg-slate-900/80 hover:border-slate-700"}`}>
			{highlighted && <span className="absolute right-5 top-5 rounded-full bg-indigo-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">Best value</span>}
			<p className="flex items-center gap-2 text-sm font-semibold text-slate-300"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10"><Sparkles className="h-4 w-4 text-indigo-300" /></span> {plan.name}</p>
			<p className="mt-5 text-4xl font-semibold tracking-tight text-white sm:mt-7 sm:text-5xl">₹{plan.amountPaise / 100}</p>
			<p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{details.description}</p>
			<div className="my-6 h-px bg-slate-800" />
			<ul className="space-y-4 text-sm text-slate-300">
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>{plan.tryonCount} AI try-on generations</span></li>
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Private, personal Library</span></li>
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Images stored for 30 days</span></li>
			</ul>
			<div className="mt-auto pt-8">
				<TryOnPackPurchaseButton planId={planId} buttonLabel={details.buttonLabel} />
			</div>
		</section>
	);
}
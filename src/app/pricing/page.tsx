import { Check, ShieldCheck, Info } from "lucide-react";
import TryOnPackPurchaseButton from "@/components/billing/TryOnPackPurchaseButton";
import { TRYON_PLANS, type TryOnPlanId } from "@/lib/constants";
import Footer from "@/components/layout/Footer";
import BrandMark from "@/components/layout/BrandMark";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Try-On Plans & Pricing",
  description: "Compare VTON Labs try-on plans, image-model access, outfit presets, and 30-day Library storage.",
  alternates: { canonical: new URL("/pricing", siteUrl).toString() },
  openGraph: {
    title: "Try-On Plans & Pricing",
    description: "Compare VTON Labs try-on plans, image-model access, outfit presets, and 30-day Library storage.",
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
					<BrandMark className="h-3.5 w-3.5" /> Simple, transparent pricing
				</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:mt-5 sm:text-5xl">More looks. Less guesswork.</h1>
				<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
					Choose the number of try-ons that fits your needs. Each successful generation uses the image model configured for this deployment.
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
			<section aria-labelledby="included-features-heading" className="mx-auto mt-12 max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:mt-16 sm:p-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 id="included-features-heading" className="text-xl font-semibold text-white sm:text-2xl">What your try-ons include</h2>
					<p className="mt-2 text-sm leading-6 text-slate-400">Here’s what the current Studio flow supports—without promising model capabilities it cannot guarantee.</p>
				</div>
				<ul className="mt-6 grid gap-3 sm:grid-cols-2">
					<li className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" /><span>Use a studio model or upload a person photo and a fabric image.</span></li>
					<li className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" /><span>Choose from supported outfit presets, with a matching style reference and garment-specific generation instructions.</span></li>
					<li className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" /><span>Generation prompts ask the model to use your fabric image as the material reference. Visual fidelity can vary by image and model.</span></li>
					<li className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" /><span>Successful try-ons are saved to your account Library and retained for up to 30 days.</span></li>
				</ul>
				<p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
					The image model is selected through the deployment’s provider configuration; Google Nano Banana is not guaranteed. Output resolution, including HD or 1080p, is not guaranteed. Images are sent to that configured provider for generation; saved results are available through your authenticated account.
				</p>
			</section>
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
			<p className="flex items-center gap-2 text-sm font-semibold text-slate-300"><BrandMark className="h-7 w-7" /> {plan.name}</p>
			<p className="mt-5 text-4xl font-semibold tracking-tight text-white sm:mt-7 sm:text-5xl">₹{plan.amountPaise / 100}</p>
			<p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{details.description}</p>
			<div className="my-6 h-px bg-slate-800" />
			<ul className="space-y-4 text-sm text-slate-300">
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>{plan.tryonCount} AI try-on generations</span></li>
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Account-only Library access</span></li>
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Saved results retained for up to 30 days</span></li>
				<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Studio model and fabric-reference workflow</span></li>
			</ul>
			<div className="mt-auto pt-8">
				<TryOnPackPurchaseButton planId={planId} buttonLabel={details.buttonLabel} />
			</div>
		</section>
	);
}
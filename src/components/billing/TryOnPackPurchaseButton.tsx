"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import BrandMark from "@/components/layout/BrandMark";
import { APP_ADMIN_EMAIL, TRYON_PLANS, type TryOnPlanId } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import ErrorAlert from "@/components/ui/ErrorAlert";

type OrderResponse = {
  orderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  name?: string;
  email?: string;
  planName?: string;
  tryonCount?: number;
  error?: string;
};

type RazorpayPayment = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (payment: RazorpayPayment) => void;
  modal: { ondismiss: () => void };
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayOptions) => { open: () => void };
};

function loadRazorpayCheckout() {
  return new Promise<void>((resolve, reject) => {
    const razorpayWindow = window as RazorpayWindow;
    if (razorpayWindow.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-razorpay-checkout]");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Could not load Razorpay checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export default function TryOnPackPurchaseButton({
  planId = "starter",
  onPurchased,
  buttonLabel,
}: {
  planId?: TryOnPlanId;
  onPurchased?: () => void;
  buttonLabel?: string;
}) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(Boolean(data.user));
      setIsAdmin(data.user?.email?.trim().toLowerCase() === APP_ADMIN_EMAIL);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
      setIsAdmin(session?.user?.email?.trim().toLowerCase() === APP_ADMIN_EMAIL);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const verifyPayment = async (payment: RazorpayPayment) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/addition-pack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: payment.razorpay_order_id,
          paymentId: payment.razorpay_payment_id,
          signature: payment.razorpay_signature,
        }),
      });
      const result = (await response.json()) as { error?: string; addedTryons?: number; planName?: string };
      if (!response.ok) {
        setError(result.error ?? "We couldn’t verify your payment. If you were charged, please contact support.");
        return;
      }
      setMessage(`${result.addedTryons ?? TRYON_PLANS[planId].tryonCount} ${result.planName ?? TRYON_PLANS[planId].name} try-ons added to your account.`);
      onPurchased?.();
    } catch {
      setError("We couldn’t verify your payment. If you were charged, please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePack = async () => {
    setError(null);
    setMessage(null);
    if (!isSignedIn) {
      setIsAuthOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/addition-pack/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const order = (await response.json()) as OrderResponse;
      if (!response.ok || !order.orderId || !order.keyId || !order.amount || !order.currency) {
        setError(order.error ?? "Checkout is temporarily unavailable. Please try again later.");
        setIsLoading(false);
        return;
      }

      await loadRazorpayCheckout();
      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error("Razorpay checkout is unavailable.");

      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "VTON Labs",
        description: `${order.tryonCount ?? TRYON_PLANS[planId].tryonCount} virtual try-ons`,
        order_id: order.orderId,
        prefill: { name: order.name ?? "", email: order.email ?? "" },
        theme: { color: "#7657d5" },
        handler: (payment) => void verifyPayment(payment),
        modal: { ondismiss: () => setIsLoading(false) },
      });
      checkout.open();
    } catch {
      setError("Checkout is temporarily unavailable. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isAdmin ? (
        <p className="text-sm font-semibold text-emerald-300">Admin account · unlimited try-ons</p>
      ) : (
      <button
        type="button"
        onClick={() => void purchasePack()}
        disabled={isLoading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BrandMark className="h-4 w-4" />}
        {isLoading
          ? "Processing..."
          : buttonLabel
            ? buttonLabel
          : isSignedIn
            ? `${TRYON_PLANS[planId].name} · ₹${TRYON_PLANS[planId].amountPaise / 100}`
            : `Sign in · ₹${TRYON_PLANS[planId].amountPaise / 100}`}
      </button>
      )}
      {message && <p role="status" className="mt-2 text-xs text-emerald-300">{message}</p>}
      {error && <ErrorAlert description={error} className="mt-2 w-full sm:w-full" onDismiss={() => setError(null)} />}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
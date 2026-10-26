import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { APP_ADMIN_EMAIL, TRYON_PLANS, type TryOnPlanId } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VerifyRequest = {
  orderId?: string;
  paymentId?: string;
  signature?: string;
};

type RazorpayPaymentResponse = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

function isValidSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export async function POST(request: Request) {
  const sessionClient = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in before confirming a payment." }, { status: 401 });
  }
  if (user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin accounts have unlimited try-ons." }, { status: 403 });
  }

  let body: VerifyRequest;
  try {
    body = (await request.json()) as VerifyRequest;
  } catch {
    return NextResponse.json({ error: "We couldn’t verify your payment. Please try again." }, { status: 400 });
  }

  if (
    !body.orderId || !/^[a-zA-Z0-9_]+$/.test(body.orderId) ||
    !body.paymentId || !/^[a-zA-Z0-9_]+$/.test(body.paymentId) ||
    !body.signature || !/^[a-f0-9]{128}$/i.test(body.signature)
  ) {
    return NextResponse.json({ error: "The payment response is incomplete." }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error("Addition-pack payment verification is unavailable because payment processing is not configured.");
    return NextResponse.json({ error: "We couldn’t verify this payment right now. Please contact support." }, { status: 503 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    console.error("Addition-pack payment verification is unavailable because fulfillment is not configured.");
    return NextResponse.json({ error: "We couldn’t complete your purchase right now. Please contact support." }, { status: 503 });
  }

  try {
    const { data: order, error: orderError } = await sessionClient
      .from("tryon_pack_orders")
      .select("razorpay_order_id, amount_paise, status, razorpay_payment_id, plan_id, tryon_count")
      .eq("razorpay_order_id", body.orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (orderError || !order || !Object.hasOwn(TRYON_PLANS, order.plan_id)) {
      return NextResponse.json({ error: "This addition-pack order was not found." }, { status: 404 });
    }
    const plan = TRYON_PLANS[order.plan_id as TryOnPlanId];
    const validStoredOrder = order.amount_paise === plan.amountPaise && (
      order.tryon_count === plan.tryonCount ||
      (order.plan_id === "pro" && order.tryon_count === 90) ||
      (order.plan_id === "topup" && order.tryon_count === 50)
    );
    if (!validStoredOrder) {
      console.error("An addition-pack purchase has invalid stored order details.", { orderId: body.orderId });
      return NextResponse.json({ error: "We couldn’t verify this purchase. Please contact support." }, { status: 400 });
    }

    if (!isValidSignature(body.orderId, body.paymentId, body.signature, keySecret)) {
      return NextResponse.json({ error: "We couldn’t verify your payment. If you were charged, please contact support." }, { status: 400 });
    }

    const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(body.paymentId)}`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    const payment = (await paymentResponse.json()) as RazorpayPaymentResponse;
    if (
      !paymentResponse.ok || payment.order_id !== body.orderId ||
      payment.amount !== order.amount_paise || payment.currency !== "INR"
    ) {
      return NextResponse.json({ error: "Your payment is still being confirmed. Please check your payment status before trying again." }, { status: 400 });
    }

    let capturedPayment = payment;
    if (payment.status === "authorized") {
      const captureResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(body.paymentId)}/capture`, {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: order.amount_paise, currency: "INR" }),
      });
      capturedPayment = (await captureResponse.json()) as RazorpayPaymentResponse;
      if (!captureResponse.ok) {
        return NextResponse.json({ error: "Your payment is still processing. Please check its status or contact support before trying again." }, { status: 402 });
      }
    }
    if (capturedPayment.status !== "captured") {
      return NextResponse.json({ error: "Your payment is still processing. Please check its status or contact support before trying again." }, { status: 402 });
    }

    const { data: credited, error: creditError } = await admin.rpc("credit_tryon_pack", {
      p_razorpay_order_id: body.orderId,
      p_razorpay_payment_id: body.paymentId,
    });
    if (creditError || !credited) {
      if (creditError) console.error("Payment succeeded but try-on credits could not be applied.", creditError);
      return NextResponse.json({ error: "Payment received, but your try-ons aren’t available yet. Please contact support." }, { status: 503 });
    }

    return NextResponse.json({ success: true, addedTryons: order.tryon_count, planName: plan.name });
  } catch (verificationError) {
    console.error("Could not verify the addition-pack payment.", verificationError);
    return NextResponse.json({ error: "We couldn’t verify your payment. If you were charged, please contact support." }, { status: 503 });
  }
}
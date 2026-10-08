import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { APP_ADMIN_EMAIL, TRYON_PLANS, type TryOnPlanId } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RazorpayOrderResponse = {
  id?: string;
  amount?: number;
  currency?: string;
  error?: { description?: string };
};

export async function POST(request: Request) {
  const sessionClient = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in before buying an addition pack." }, { status: 401 });
  }
  if (user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin accounts have unlimited try-ons." }, { status: 403 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Paid-pack fulfillment is not configured yet." }, { status: 503 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Addition-pack payments are not configured yet." }, { status: 503 });
  }

  let requestBody: { planId?: string };
  try {
    requestBody = await request.json() as { planId?: string };
  } catch {
    return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
  }
  if (!requestBody.planId || !Object.hasOwn(TRYON_PLANS, requestBody.planId)) {
    return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
  }
  const planId = requestBody.planId as TryOnPlanId;
  const plan = TRYON_PLANS[planId];

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.amountPaise,
        currency: "INR",
        receipt: `tryon-${randomUUID()}`,
        notes: { user_id: user.id, product: planId },
      }),
    });
    const order = (await response.json()) as RazorpayOrderResponse;
    if (!response.ok || !order.id || order.amount !== plan.amountPaise || order.currency !== "INR") {
      return NextResponse.json(
        { error: order.error?.description ?? "Could not create the Razorpay order." },
        { status: response.ok ? 502 : response.status },
      );
    }

    const { error: insertError } = await sessionClient.from("tryon_pack_orders").insert({
      razorpay_order_id: order.id,
      user_id: user.id,
      amount_paise: plan.amountPaise,
      plan_id: planId,
      tryon_count: plan.tryonCount,
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount: plan.amountPaise,
      currency: "INR",
      planId,
      tryonCount: plan.tryonCount,
      planName: plan.name,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "FabricFit AI",
      email: user.email ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Could not prepare your addition-pack checkout." }, { status: 503 });
  }
}
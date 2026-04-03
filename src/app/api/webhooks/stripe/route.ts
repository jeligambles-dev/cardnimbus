import { type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { handleStripeWebhook } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    await handleStripeWebhook(event);
    return Response.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

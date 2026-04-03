import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";
import { PaymentProvider, PaymentStatus, OrderStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type Stripe from "stripe";

export async function createStripeCheckoutSession(
  orderId: string,
  amount: number,
  successUrl: string,
  cancelUrl: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  const idempotencyKey = `stripe-checkout-${orderId}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.titleSnapshot,
          images: item.imageSnapshot ? [item.imageSnapshot] : [],
        },
        unit_amount: Math.round(item.priceAtPurchase * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  const payment = await db.payment.create({
    data: {
      orderId,
      provider: PaymentProvider.STRIPE,
      providerPaymentId: session.id,
      amount: Math.round(amount * 100) / 100,
      currency: "USD",
      status: PaymentStatus.INITIATED,
      idempotencyKey,
    },
  });

  return { session, payment };
}

export async function createPayPalCheckoutOrder(orderId: string, amount: number) {
  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError("Order");
  }

  const idempotencyKey = `paypal-checkout-${orderId}`;

  const paypalOrder = await createPayPalOrder(amount, "USD");

  const payment = await db.payment.create({
    data: {
      orderId,
      provider: PaymentProvider.PAYPAL,
      providerPaymentId: paypalOrder.id,
      amount: Math.round(amount * 100) / 100,
      currency: "USD",
      status: PaymentStatus.INITIATED,
      idempotencyKey,
    },
  });

  return { paypalOrder, payment };
}

export async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) return;

    // Deduplication: check if already processed
    const alreadyProcessed = await db.auditLog.findFirst({
      where: {
        action: "stripe.checkout.session.completed",
        targetId: session.id,
      },
    });

    if (alreadyProcessed) return;

    await db.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: {
          orderId,
          provider: PaymentProvider.STRIPE,
          providerPaymentId: session.id,
        },
        data: {
          status: PaymentStatus.CONFIRMED,
          capturedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
    });

    await logAudit({
      actorType: "WEBHOOK",
      action: "stripe.checkout.session.completed",
      targetType: "Payment",
      targetId: session.id,
      details: { orderId, sessionId: session.id },
    });
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) return;

    await db.payment.updateMany({
      where: {
        orderId,
        provider: PaymentProvider.STRIPE,
        providerPaymentId: session.id,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    await logAudit({
      actorType: "WEBHOOK",
      action: "stripe.checkout.session.expired",
      targetType: "Payment",
      targetId: session.id,
      details: { orderId, sessionId: session.id },
    });
  }
}

export async function capturePayPalPayment(paypalOrderId: string) {
  const payment = await db.payment.findFirst({
    where: {
      providerPaymentId: paypalOrderId,
      provider: PaymentProvider.PAYPAL,
    },
  });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  const { status, captureId } = await capturePayPalOrder(paypalOrderId);

  if (status !== "COMPLETED") {
    throw new ValidationError(`PayPal capture returned unexpected status: ${status}`);
  }

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CONFIRMED,
        capturedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAID },
    });
  });

  await logAudit({
    actorType: "SYSTEM",
    action: "paypal.order.captured",
    targetType: "Payment",
    targetId: payment.id,
    details: { paypalOrderId, captureId, orderId: payment.orderId },
  });

  return { payment: await db.payment.findUnique({ where: { id: payment.id } }) };
}

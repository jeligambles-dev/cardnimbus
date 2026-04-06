import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { validateCart } from "@/services/cart.service";
import { validateCoupon, redeemCoupon } from "@/services/coupon.service";
import { createOrder } from "@/services/order.service";
import { isPaymentMethodEnabled } from "@/services/settings.service";

// PayPal API helpers
const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ValidationError("PayPal is not configured");
  }

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await res.json();
  return data.access_token;
}

async function createPayPalOrder(
  orderId: string,
  amount: number,
  successUrl: string,
  cancelUrl: string
) {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: `Card Nimbus Order ${orderId.slice(0, 8)}`,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            return_url: successUrl,
            cancel_url: cancelUrl,
            user_action: "PAY_NOW",
            brand_name: "Card Nimbus",
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[PayPal] createOrder error:", err);
    throw new Error("Failed to create PayPal order");
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    // Check if PayPal is enabled
    const enabled = await isPaymentMethodEnabled("paypal");
    if (!enabled) {
      throw new ValidationError("PayPal payments are not currently available");
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      items,
      shippingAddressId,
      billingAddressId,
      couponCode,
      shippingCost = 0,
    } = body as {
      items: { productId: string; quantity: number }[];
      shippingAddressId?: string;
      billingAddressId?: string;
      couponCode?: string;
      shippingCost?: number;
    };

    if (!items || items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const cartResult = await validateCart(items);
    if (!cartResult.valid) {
      throw new ValidationError(cartResult.errors.join("; "));
    }

    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, userId, cartResult.total);
      if (!couponResult.valid) {
        throw new ValidationError(couponResult.error ?? "Invalid coupon");
      }
      discountAmount = couponResult.discount;
      couponId = couponResult.couponId;
    }

    const order = await createOrder({
      buyerId: userId,
      items,
      shippingAddressId,
      billingAddressId,
      shippingCost,
      discountAmount,
    });

    if (couponId) {
      await redeemCoupon(couponId, userId, order.id);
    }

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
    const successUrl = `${origin}/orders/${order.id}?payment=success`;
    const cancelUrl = `${origin}/checkout?payment=cancelled&orderId=${order.id}`;

    const paypalOrder = await createPayPalOrder(
      order.id,
      order.totalAmount,
      successUrl,
      cancelUrl
    );

    // Find the approval link
    const approveLink = paypalOrder.links?.find(
      (l: { rel: string; href: string }) => l.rel === "payer-action" || l.rel === "approve"
    );

    if (!approveLink?.href) {
      throw new Error("PayPal did not return an approval URL");
    }

    return Response.json({ url: approveLink.href, orderId: order.id });
  } catch (error) {
    return errorResponse(error);
  }
}

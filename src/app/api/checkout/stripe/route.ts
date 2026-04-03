import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { validateCart } from "@/services/cart.service";
import { validateCoupon, redeemCoupon } from "@/services/coupon.service";
import { createOrder } from "@/services/order.service";
import { createStripeCheckoutSession } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
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

    // Validate cart
    const cartResult = await validateCart(items);
    if (!cartResult.valid) {
      throw new ValidationError(cartResult.errors.join("; "));
    }

    // Validate coupon if provided
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

    // Create order
    const order = await createOrder({
      buyerId: userId,
      items,
      shippingAddressId,
      billingAddressId,
      shippingCost,
      discountAmount,
    });

    // Redeem coupon after order creation
    if (couponId) {
      await redeemCoupon(couponId, userId, order.id);
    }

    // Build success/cancel URLs
    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
    const successUrl = `${origin}/orders/${order.id}?payment=success`;
    const cancelUrl = `${origin}/checkout?payment=cancelled&orderId=${order.id}`;

    // Create Stripe checkout session
    const { session: stripeSession } = await createStripeCheckoutSession(
      order.id,
      order.totalAmount,
      successUrl,
      cancelUrl
    );

    return Response.json({ url: stripeSession.url, orderId: order.id });
  } catch (error) {
    return errorResponse(error);
  }
}

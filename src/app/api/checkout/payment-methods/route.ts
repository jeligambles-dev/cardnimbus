import { errorResponse } from "@/lib/errors";
import { isPaymentMethodEnabled } from "@/services/settings.service";

export async function GET() {
  try {
    const [stripe, paypal] = await Promise.all([
      isPaymentMethodEnabled("stripe"),
      isPaymentMethodEnabled("paypal"),
    ]);
    return Response.json({ stripe, paypal });
  } catch (error) {
    return errorResponse(error);
  }
}

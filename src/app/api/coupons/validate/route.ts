import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { validateCoupon } from "@/services/coupon.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || typeof code !== "string") {
      throw new ValidationError("Coupon code is required");
    }

    if (typeof orderTotal !== "number" || orderTotal < 0) {
      throw new ValidationError("Valid order total is required");
    }

    const result = await validateCoupon(code, session.user.id, orderTotal);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

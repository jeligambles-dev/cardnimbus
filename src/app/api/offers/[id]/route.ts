import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { getOfferById, respondToOffer } from "@/services/offer.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const offer = await getOfferById(id);
    return Response.json(offer);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const { action, counterAmount, message } = body;

    if (!action || !["accept", "reject", "counter"].includes(action)) {
      throw new ValidationError("action must be one of: accept, reject, counter");
    }

    const updated = await respondToOffer(
      id,
      session.user.id!,
      action as "accept" | "reject" | "counter",
      counterAmount,
      message
    );

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

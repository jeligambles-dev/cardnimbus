import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { respondToOffer } from "@/services/submission.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const { action, counterPrice } = body;

    if (!action || !["accept", "reject", "counter"].includes(action)) {
      throw new ValidationError("action must be one of: accept, reject, counter");
    }

    const submission = await respondToOffer(
      id,
      session.user.id!,
      action as "accept" | "reject" | "counter",
      counterPrice !== undefined ? Number(counterPrice) : undefined
    );

    return Response.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}

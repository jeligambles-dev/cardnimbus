import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { purchaseAndPull } from "@/services/mystery.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id: collectionId } = await params;
    const userId = (session.user as { id?: string }).id;
    if (!userId) throw new UnauthorizedError();

    const body = await request.json();
    const { paymentId } = body;
    if (!paymentId || typeof paymentId !== "string") {
      throw new ValidationError("paymentId is required");
    }

    const result = await purchaseAndPull(collectionId, userId, paymentId);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

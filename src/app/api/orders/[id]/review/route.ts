import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { createReview } from "@/services/review.service";
import { ReviewType } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const reviewerId = (session.user as any).id as string;

    const { id: orderId } = await params;
    const body = await request.json();
    const { revieweeId, rating, comment, type } = body;

    if (!revieweeId) throw new ValidationError("revieweeId is required");
    if (rating === undefined) throw new ValidationError("rating is required");
    if (!type) throw new ValidationError("type is required");
    if (!(type in ReviewType)) throw new ValidationError("Invalid review type");

    const review = await createReview(
      orderId,
      reviewerId,
      revieweeId,
      Number(rating),
      typeof comment === "string" ? comment : undefined,
      type as ReviewType
    );

    return Response.json(review, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

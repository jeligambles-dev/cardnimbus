import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import {
  createSubmission,
  getUserSubmissions,
} from "@/services/submission.service";
import { CardCondition } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

    const result = await getUserSubmissions(session.user.id!, page);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const { cardId, images, description, estimatedCondition } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new ValidationError("images must be a non-empty array");
    }
    if (!estimatedCondition) {
      throw new ValidationError("estimatedCondition is required");
    }
    if (!(estimatedCondition in CardCondition)) {
      throw new ValidationError("Invalid estimatedCondition value");
    }

    const submission = await createSubmission({
      userId: session.user.id!,
      cardId: cardId ?? undefined,
      images,
      description: description ?? undefined,
      estimatedCondition: estimatedCondition as CardCondition,
    });

    return Response.json(submission, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

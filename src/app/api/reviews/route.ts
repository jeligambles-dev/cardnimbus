import { type NextRequest } from "next/server";
import { errorResponse, ValidationError } from "@/lib/errors";
import { getReviewsForUser } from "@/services/review.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    if (!userId) throw new ValidationError("userId query parameter is required");

    const page = searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const result = await getReviewsForUser(userId, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

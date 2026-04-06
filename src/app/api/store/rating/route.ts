import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const result = await db.review.aggregate({
      where: { isVisible: true, moderationStatus: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return Response.json({
      avg: result._avg.rating ?? 0,
      count: result._count.rating ?? 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

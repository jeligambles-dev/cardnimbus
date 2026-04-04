import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return Response.json({ slides });
  } catch (error) {
    return errorResponse(error);
  }
}

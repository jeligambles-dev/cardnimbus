import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids") ?? "";
    const ids = idsParam.split(",").filter(Boolean).slice(0, 20);

    if (ids.length === 0) {
      return Response.json({ listings: [] });
    }

    const listings = await db.listing.findMany({
      where: {
        id: { in: ids },
        moderationStatus: "APPROVED",
        saleStatus: "ACTIVE",
      },
      include: {
        seller: { include: { user: { select: { name: true, avatar: true } } } },
      },
    });

    // Preserve order from input ids
    const orderedListings = ids
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NonNullable<typeof l> => l !== undefined);

    return Response.json({ listings: orderedListings });
  } catch (error) {
    return errorResponse(error);
  }
}

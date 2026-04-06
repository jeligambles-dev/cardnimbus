import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "6"), 20);

    if (!query) {
      return Response.json({ hits: [] });
    }

    const halfLimit = Math.ceil(limit / 2);

    const [products, listings] = await Promise.all([
      db.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: halfLimit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          category: true,
          condition: true,
        },
      }),
      db.listing.findMany({
        where: {
          moderationStatus: "APPROVED",
          saleStatus: "ACTIVE",
          title: { contains: query, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: halfLimit,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          category: true,
          condition: true,
        },
      }),
    ]);

    const productHits = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      images: p.images,
      subtitle: [p.category.replace("_", " "), p.condition]
        .filter(Boolean)
        .join(" · "),
      type: "product" as const,
    }));

    const listingHits = listings.map((l) => ({
      id: l.id,
      name: l.title,
      slug: null,
      price: l.price,
      images: l.images,
      subtitle: ["Marketplace", l.category.replace("_", " "), l.condition]
        .filter(Boolean)
        .join(" · "),
      type: "listing" as const,
    }));

    const hits = [...productHits, ...listingHits].slice(0, limit);

    return Response.json({ hits });
  } catch (error) {
    return errorResponse(error);
  }
}

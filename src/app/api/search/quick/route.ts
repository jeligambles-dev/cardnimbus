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

    // Case-insensitive substring search on active products
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true,
        condition: true,
      },
    });

    const hits = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      images: p.images,
      subtitle: [p.category.replace("_", " "), p.condition]
        .filter(Boolean)
        .join(" · "),
    }));

    return Response.json({ hits });
  } catch (error) {
    return errorResponse(error);
  }
}

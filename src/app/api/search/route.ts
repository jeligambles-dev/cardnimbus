import { type NextRequest } from "next/server";
import { ProductCategory, CardCondition } from "@prisma/client";
import { search } from "@/services/search.service";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q") ?? "";
    const categoryParam = searchParams.get("category");
    const conditionParam = searchParams.get("condition");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const category =
      categoryParam && categoryParam in ProductCategory
        ? (categoryParam as ProductCategory)
        : undefined;

    const condition =
      conditionParam && conditionParam in CardCondition
        ? (conditionParam as CardCondition)
        : undefined;

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const result = await search(q, {
      category,
      condition,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

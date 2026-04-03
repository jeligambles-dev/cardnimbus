import { type NextRequest } from "next/server";
import { ProductCategory, CardCondition } from "@prisma/client";
import { getProducts } from "@/services/product.service";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;
    const categoryParam = searchParams.get("category");
    const conditionParam = searchParams.get("condition");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sortByParam = searchParams.get("sortBy");

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

    const sortBy =
      sortByParam === "price_asc" ||
      sortByParam === "price_desc" ||
      sortByParam === "name" ||
      sortByParam === "newest"
        ? sortByParam
        : undefined;

    const result = await getProducts({
      page,
      limit,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

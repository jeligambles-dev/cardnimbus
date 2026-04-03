import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors";
import {
  createListing,
  getListings,
  type CreateListingInput,
} from "@/services/listing.service";
import { CardCondition, ProductCategory } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const categoryParam = searchParams.get("category");
    const conditionParam = searchParams.get("condition");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sellerId = searchParams.get("sellerId") ?? undefined;

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

    const result = await getListings(
      { category, condition, minPrice, maxPrice, sellerId },
      page,
      limit
    );
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;

    // Must be a seller
    const sellerProfile = await db.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) {
      throw new ForbiddenError("You must be a seller to create listings");
    }

    const body = await request.json().catch(() => null);
    if (!body) throw new ValidationError("Invalid request body");

    if (!body.title || typeof body.title !== "string") {
      throw new ValidationError("title is required");
    }
    if (!body.price || typeof body.price !== "number") {
      throw new ValidationError("price is required and must be a number");
    }
    if (!body.category || !(body.category in ProductCategory)) {
      throw new ValidationError("valid category is required");
    }

    const input: CreateListingInput = {
      title: body.title,
      price: body.price,
      category: body.category as ProductCategory,
      cardId: typeof body.cardId === "string" ? body.cardId : undefined,
      description:
        typeof body.description === "string" ? body.description : undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
      condition:
        body.condition && body.condition in CardCondition
          ? (body.condition as CardCondition)
          : undefined,
    };

    const listing = await createListing(sellerProfile.id, input);
    return Response.json(listing, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";
import {
  getListingById,
  updateListing,
  type UpdateListingInput,
} from "@/services/listing.service";
import { CardCondition, ProductCategory } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);
    return Response.json(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const userId = (session.user as any).id as string;

    const sellerProfile = await db.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) {
      throw new ForbiddenError("You must be a seller to update listings");
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) throw new ValidationError("Invalid request body");

    const data: UpdateListingInput = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.description === "string") data.description = body.description;
    if (Array.isArray(body.images)) data.images = body.images;
    if (typeof body.price === "number") data.price = body.price;
    if (body.condition && body.condition in CardCondition)
      data.condition = body.condition as CardCondition;
    if (body.category && body.category in ProductCategory)
      data.category = body.category as ProductCategory;

    const listing = await updateListing(id, sellerProfile.id, data);
    return Response.json(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

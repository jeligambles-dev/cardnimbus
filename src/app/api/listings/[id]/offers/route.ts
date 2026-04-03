import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError, ForbiddenError } from "@/lib/errors";
import { createOffer, getOffersByListing } from "@/services/offer.service";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id: listingId } = await params;
    const body = await request.json();
    const { amount, message } = body;

    if (!amount || typeof amount !== "number") {
      throw new ValidationError("amount is required and must be a number");
    }

    const offer = await createOffer(listingId, session.user.id!, amount, message);
    return Response.json(offer, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id: listingId } = await params;

    // Verify the requester is the listing owner
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new ForbiddenError("Listing not found");
    }

    if (listing.seller.userId !== session.user.id) {
      throw new ForbiddenError("Only the listing owner can view offers");
    }

    const offers = await getOffersByListing(listingId);
    return Response.json(offers);
  } catch (error) {
    return errorResponse(error);
  }
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errors";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { listingId } = await request.json();
    if (!listingId) throw new ValidationError("listingId is required");

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { seller: { include: { user: true } } },
    });
    if (!listing) throw new NotFoundError("Listing");

    if (listing.saleStatus !== "ACTIVE" || listing.moderationStatus !== "APPROVED") {
      throw new ValidationError("Listing is not available for purchase");
    }

    if (listing.seller.userId === session.user.id) {
      throw new ValidationError("You cannot buy your own listing");
    }

    // Create the marketplace order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: session.user.id,
        type: "MARKETPLACE",
        status: "PENDING",
        totalAmount: listing.price,
        commission: 0,
        items: {
          create: {
            listingId: listing.id,
            sellerId: listing.seller.userId,
            quantity: 1,
            priceAtPurchase: listing.price,
            titleSnapshot: listing.title,
            imageSnapshot: listing.images[0] ?? null,
            conditionSnapshot: listing.condition,
          },
        },
      },
    });

    // Reserve the listing
    await db.listing.update({
      where: { id: listing.id },
      data: { saleStatus: "RESERVED" },
    });

    // Redirect to checkout page (Stripe integration handled there)
    return Response.json({
      checkoutUrl: `/checkout?order=${order.id}`,
      orderId: order.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

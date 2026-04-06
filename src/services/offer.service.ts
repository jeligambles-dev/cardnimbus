import { db } from "@/lib/db";
import { OfferStatus, ListingSaleStatus } from "@prisma/client";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";

export async function createOffer(
  listingId: string,
  buyerId: string,
  amount: number,
  message?: string
) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  if (listing.saleStatus !== ListingSaleStatus.ACTIVE) {
    throw new ValidationError("Listing is not available for offers");
  }

  if (listing.seller.userId === buyerId) {
    throw new ForbiddenError("Seller cannot make an offer on their own listing");
  }

  if (amount <= 0) {
    throw new ValidationError("Offer amount must be greater than zero");
  }

  return db.$transaction(async (tx) => {
    const offer = await tx.offer.create({
      data: {
        listingId,
        buyerId,
        amount,
        message,
        status: OfferStatus.PENDING,
      },
    });

    await tx.offerEvent.create({
      data: {
        offerId: offer.id,
        actorId: buyerId,
        type: "CREATED",
        amount,
        message,
      },
    });

    return offer;
  });
}

export async function getOffersByListing(listingId: string) {
  return db.offer.findMany({
    where: { listingId },
    include: {
      buyer: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOffersByBuyer(
  buyerId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [offers, total] = await Promise.all([
    db.offer.findMany({
      where: { buyerId },
      include: {
        listing: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.offer.count({ where: { buyerId } }),
  ]);

  return {
    offers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOffersBySeller(
  sellerUserId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [offers, total] = await Promise.all([
    db.offer.findMany({
      where: { listing: { seller: { userId: sellerUserId } } },
      include: {
        listing: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.offer.count({
      where: { listing: { seller: { userId: sellerUserId } } },
    }),
  ]);

  return {
    offers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOfferById(id: string) {
  const offer = await db.offer.findUnique({
    where: { id },
    include: {
      listing: true,
      buyer: {
        select: { id: true, name: true, avatar: true },
      },
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!offer) {
    throw new NotFoundError("Offer");
  }

  return offer;
}

export async function respondToOffer(
  offerId: string,
  actorId: string,
  action: "accept" | "reject" | "counter",
  counterAmount?: number,
  message?: string
) {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: {
        include: { seller: true },
      },
    },
  });

  if (!offer) {
    throw new NotFoundError("Offer");
  }

  if (offer.listing.seller.userId !== actorId) {
    throw new ForbiddenError("Only the seller can respond to this offer");
  }

  if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
    throw new ValidationError(`Offer is already ${offer.status.toLowerCase()}`);
  }

  return db.$transaction(async (tx) => {
    if (action === "accept") {
      const [updatedOffer] = await Promise.all([
        tx.offer.update({
          where: { id: offerId },
          data: { status: OfferStatus.ACCEPTED },
        }),
        tx.listing.update({
          where: { id: offer.listingId },
          data: { saleStatus: ListingSaleStatus.RESERVED },
        }),
        tx.offerEvent.create({
          data: {
            offerId,
            actorId,
            type: "ACCEPTED",
            amount: offer.amount,
            message,
          },
        }),
      ]);
      return updatedOffer;
    }

    if (action === "reject") {
      const [updatedOffer] = await Promise.all([
        tx.offer.update({
          where: { id: offerId },
          data: { status: OfferStatus.REJECTED },
        }),
        tx.offerEvent.create({
          data: {
            offerId,
            actorId,
            type: "REJECTED",
            message,
          },
        }),
      ]);
      return updatedOffer;
    }

    if (action === "counter") {
      if (!counterAmount || counterAmount <= 0) {
        throw new ValidationError("Counter amount must be greater than zero");
      }

      const [updatedOffer] = await Promise.all([
        tx.offer.update({
          where: { id: offerId },
          data: { status: OfferStatus.COUNTERED },
        }),
        tx.offerEvent.create({
          data: {
            offerId,
            actorId,
            type: "COUNTERED",
            amount: counterAmount,
            message,
          },
        }),
      ]);
      return updatedOffer;
    }

    throw new ValidationError("Invalid action");
  });
}

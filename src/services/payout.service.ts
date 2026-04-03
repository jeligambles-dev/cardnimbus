import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { stripe } from "@/lib/stripe";

export async function createPayout(
  sellerId: string,
  orderId: string | undefined,
  grossAmount: number,
  commissionRate: number
) {
  const seller = await db.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!seller) {
    throw new NotFoundError("SellerProfile");
  }

  const fee = Math.round(grossAmount * commissionRate * 100) / 100;
  const netAmount = Math.round((grossAmount - fee) * 100) / 100;

  return db.payout.create({
    data: {
      sellerId,
      orderId,
      grossAmount,
      fee,
      netAmount,
      status: PayoutStatus.PENDING,
    },
  });
}

export async function getSellerPayouts(
  sellerId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [payouts, total] = await Promise.all([
    db.payout.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.payout.count({ where: { sellerId } }),
  ]);

  return {
    payouts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function processPayoutViaStripe(payoutId: string) {
  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { seller: true },
  });

  if (!payout) {
    throw new NotFoundError("Payout");
  }

  if (payout.status !== PayoutStatus.PENDING) {
    throw new ValidationError(`Payout is already ${payout.status.toLowerCase()}`);
  }

  const stripeConnectId = payout.seller.stripeConnectId;
  if (!stripeConnectId) {
    throw new ValidationError("Seller does not have a Stripe Connect account");
  }

  try {
    await db.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.PROCESSING },
    });

    const transfer = await stripe.transfers.create({
      amount: Math.round(payout.netAmount * 100), // Stripe uses cents
      currency: "usd",
      destination: stripeConnectId,
      metadata: {
        payoutId,
        orderId: payout.orderId ?? "",
        sellerId: payout.sellerId,
      },
    });

    return db.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.COMPLETED,
        stripeTransferId: transfer.id,
      },
    });
  } catch (error) {
    await db.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.FAILED },
    });
    throw error;
  }
}

export async function getPayoutSummary(sellerId: string) {
  const payouts = await db.payout.findMany({
    where: { sellerId },
    select: {
      grossAmount: true,
      fee: true,
      netAmount: true,
      status: true,
    },
  });

  const totalEarned = payouts
    .filter((p) => p.status === PayoutStatus.COMPLETED)
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalFees = payouts
    .filter((p) => p.status === PayoutStatus.COMPLETED)
    .reduce((sum, p) => sum + p.fee, 0);

  const pendingPayouts = payouts
    .filter((p) => p.status === PayoutStatus.PENDING || p.status === PayoutStatus.PROCESSING)
    .reduce((sum, p) => sum + p.netAmount, 0);

  return {
    totalEarned: Math.round(totalEarned * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    pendingPayouts: Math.round(pendingPayouts * 100) / 100,
  };
}

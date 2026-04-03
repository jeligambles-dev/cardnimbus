import { db } from "@/lib/db";
import { DisputeStatus, EscrowStatus, OrderStatus, ListingSaleStatus, ListingModerationStatus } from "@prisma/client";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";
import { logAudit } from "@/lib/audit";
import { releaseEscrow, refundEscrow } from "@/services/escrow.service";

export async function fileDispute(
  orderId: string,
  userId: string,
  reason: string,
  evidence: string[] = []
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { dispute: true },
  });

  if (!order) throw new NotFoundError("Order");
  if (order.buyerId !== userId) throw new ForbiddenError("Only the buyer can file a dispute");
  if (order.dispute) throw new ValidationError("A dispute already exists for this order");

  const allowedStatuses: OrderStatus[] = [
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];
  if (!allowedStatuses.includes(order.status)) {
    throw new ValidationError(
      "Disputes can only be filed for orders with status PAID, SHIPPED, or DELIVERED"
    );
  }

  const [dispute] = await db.$transaction([
    db.dispute.create({
      data: {
        orderId,
        filedBy: userId,
        reason,
        evidence,
        status: DisputeStatus.OPEN,
      },
    }),
    db.escrowTransaction.updateMany({
      where: { orderId },
      data: { status: EscrowStatus.DISPUTED },
    }),
  ]);

  return dispute;
}

export async function getDisputeById(id: string) {
  const dispute = await db.dispute.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          buyerId: true,
        },
      },
      filer: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  if (!dispute) throw new NotFoundError("Dispute");
  return dispute;
}

export async function getUserDisputes(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [disputes, total] = await Promise.all([
    db.dispute.findMany({
      where: { filedBy: userId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.dispute.count({ where: { filedBy: userId } }),
  ]);

  return {
    disputes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminDisputes(
  filters: { status?: DisputeStatus } = {},
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const where = filters.status ? { status: filters.status } : {};

  const [disputes, total] = await Promise.all([
    db.dispute.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            buyerId: true,
          },
        },
        filer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.dispute.count({ where }),
  ]);

  return {
    disputes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function resolveDispute(
  disputeId: string,
  adminId: string,
  resolution: "buyer" | "seller",
  notes?: string
) {
  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: { order: true },
  });

  if (!dispute) throw new NotFoundError("Dispute");
  if (
    dispute.status === DisputeStatus.RESOLVED_BUYER ||
    dispute.status === DisputeStatus.RESOLVED_SELLER
  ) {
    throw new ValidationError("Dispute is already resolved");
  }

  const newStatus =
    resolution === "buyer"
      ? DisputeStatus.RESOLVED_BUYER
      : DisputeStatus.RESOLVED_SELLER;

  if (resolution === "buyer") {
    await refundEscrow(dispute.orderId);
    await db.order.update({
      where: { id: dispute.orderId },
      data: { status: OrderStatus.REFUNDED },
    });
  } else {
    await releaseEscrow(dispute.orderId);
  }

  const resolved = await db.dispute.update({
    where: { id: disputeId },
    data: {
      status: newStatus,
      adminNotes: notes,
      resolvedAt: new Date(),
    },
  });

  await logAudit({
    actorType: "ADMIN",
    actorId: adminId,
    action: `dispute.resolve.${resolution}`,
    targetType: "Dispute",
    targetId: disputeId,
    details: { resolution, notes },
  });

  // Check if seller should be suspended: >= 3 open disputes
  await checkAndSuspendSeller(dispute.order.buyerId, dispute.orderId);

  return resolved;
}

export async function escalateDispute(disputeId: string, adminId: string) {
  const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new NotFoundError("Dispute");

  const escalated = await db.dispute.update({
    where: { id: disputeId },
    data: { status: DisputeStatus.ESCALATED },
  });

  await logAudit({
    actorType: "ADMIN",
    actorId: adminId,
    action: "dispute.escalate",
    targetType: "Dispute",
    targetId: disputeId,
  });

  return escalated;
}

async function checkAndSuspendSeller(buyerId: string, orderId: string) {
  // Find seller(s) on this order
  const orderItems = await db.orderItem.findMany({
    where: { orderId },
    select: { sellerId: true },
  });

  const sellerIds = [
    ...new Set(orderItems.map((i) => i.sellerId).filter(Boolean)),
  ] as string[];

  for (const sellerId of sellerIds) {
    // Count open disputes against this seller across their orders
    const openDisputeCount = await db.dispute.count({
      where: {
        status: DisputeStatus.OPEN,
        order: {
          items: {
            some: { sellerId },
          },
        },
      },
    });

    if (openDisputeCount >= 3) {
      // Suspend all active listings for this seller
      const sellerProfile = await db.sellerProfile.findUnique({
        where: { userId: sellerId },
      });

      if (sellerProfile) {
        await db.listing.updateMany({
          where: {
            sellerId: sellerProfile.id,
            saleStatus: ListingSaleStatus.ACTIVE,
          },
          data: {
            saleStatus: ListingSaleStatus.INACTIVE,
            moderationStatus: ListingModerationStatus.SUSPENDED,
          },
        });
      }
    }
  }
}

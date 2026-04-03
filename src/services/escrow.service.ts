import { db } from "@/lib/db";
import { EscrowStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function createEscrowHold(orderId: string, amount: number) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new NotFoundError("Order");
  }

  const existing = await db.escrowTransaction.findUnique({ where: { orderId } });
  if (existing) {
    throw new ValidationError("Escrow already exists for this order");
  }

  return db.escrowTransaction.create({
    data: {
      orderId,
      amount,
      status: EscrowStatus.HELD,
    },
  });
}

export async function releaseEscrow(orderId: string) {
  const escrow = await db.escrowTransaction.findUnique({ where: { orderId } });
  if (!escrow) {
    throw new NotFoundError("EscrowTransaction");
  }

  if (escrow.status !== EscrowStatus.HELD) {
    throw new ValidationError(`Cannot release escrow with status ${escrow.status}`);
  }

  return db.escrowTransaction.update({
    where: { orderId },
    data: {
      status: EscrowStatus.RELEASED,
      releasedAt: new Date(),
    },
  });
}

export async function disputeEscrow(orderId: string) {
  const escrow = await db.escrowTransaction.findUnique({ where: { orderId } });
  if (!escrow) {
    throw new NotFoundError("EscrowTransaction");
  }

  if (escrow.status !== EscrowStatus.HELD) {
    throw new ValidationError(`Cannot dispute escrow with status ${escrow.status}`);
  }

  return db.escrowTransaction.update({
    where: { orderId },
    data: { status: EscrowStatus.DISPUTED },
  });
}

export async function refundEscrow(orderId: string) {
  const escrow = await db.escrowTransaction.findUnique({ where: { orderId } });
  if (!escrow) {
    throw new NotFoundError("EscrowTransaction");
  }

  if (escrow.status !== EscrowStatus.HELD && escrow.status !== EscrowStatus.DISPUTED) {
    throw new ValidationError(`Cannot refund escrow with status ${escrow.status}`);
  }

  return db.escrowTransaction.update({
    where: { orderId },
    data: { status: EscrowStatus.REFUNDED },
  });
}

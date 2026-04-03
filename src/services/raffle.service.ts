import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  RaffleStatus,
  ReservationStatus,
  RafflePurchaseStatus,
  VisibilityMode,
} from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/errors";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateRaffleInput {
  title: string;
  description?: string;
  prizeImages?: string[];
  prizeValue: number;
  ticketPrice: number;
  totalSlots: number;
  maxTicketsPerUser?: number;
  minFillThreshold?: number;
  drawMethod?: string;
  legalRegionRestriction?: string;
  publishedTermsVersion?: string;
  visibilityMode?: VisibilityMode;
  startsAt: Date;
  endsAt: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assertStatus(actual: RaffleStatus, expected: RaffleStatus) {
  if (actual !== expected) {
    throw new ValidationError(
      `Raffle must be ${expected} to perform this action (current: ${actual})`
    );
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createRaffle(adminId: string, input: CreateRaffleInput) {
  return db.raffle.create({
    data: {
      ...input,
      prizeImages: input.prizeImages ?? [],
      maxTicketsPerUser: input.maxTicketsPerUser ?? 1,
      minFillThreshold: input.minFillThreshold ?? 0.5,
      status: RaffleStatus.DRAFT,
    },
  });
}

export async function getRaffleById(id: string) {
  const raffle = await db.raffle.findUnique({
    where: { id },
    include: {
      winner: { select: { id: true, name: true, avatar: true } },
      _count: { select: { tickets: true } },
    },
  });
  if (!raffle) throw new NotFoundError("Raffle");
  return raffle;
}

export async function getActiveRaffles() {
  return db.raffle.findMany({
    where: {
      status: { in: [RaffleStatus.SCHEDULED, RaffleStatus.ACTIVE] },
    },
    orderBy: { endsAt: "asc" },
    include: {
      _count: { select: { tickets: true } },
    },
  });
}

export async function getRaffleHistory(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [raffles, total] = await Promise.all([
    db.raffle.findMany({
      where: { status: RaffleStatus.COMPLETED },
      orderBy: { drawnAt: "desc" },
      skip,
      take: limit,
      include: {
        winner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tickets: true } },
      },
    }),
    db.raffle.count({ where: { status: RaffleStatus.COMPLETED } }),
  ]);
  return { raffles, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function scheduleRaffle(id: string) {
  const raffle = await db.raffle.findUnique({ where: { id } });
  if (!raffle) throw new NotFoundError("Raffle");
  assertStatus(raffle.status, RaffleStatus.DRAFT);
  return db.raffle.update({
    where: { id },
    data: { status: RaffleStatus.SCHEDULED },
  });
}

export async function activateRaffle(id: string) {
  const raffle = await db.raffle.findUnique({ where: { id } });
  if (!raffle) throw new NotFoundError("Raffle");
  assertStatus(raffle.status, RaffleStatus.SCHEDULED);
  return db.raffle.update({
    where: { id },
    data: { status: RaffleStatus.ACTIVE },
  });
}

export async function reserveTickets(
  raffleId: string,
  userId: string,
  quantity: number
) {
  return db.$transaction(async (tx) => {
    const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundError("Raffle");
    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new ValidationError("Raffle is not active");
    }

    // Check user's existing confirmed tickets
    const existingTickets = await tx.raffleTicket.count({
      where: { raffleId, userId },
    });
    // Also count active reservations for this user
    const existingReservations = await tx.ticketReservation.aggregate({
      where: {
        raffleId,
        userId,
        status: ReservationStatus.RESERVED,
        expiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    });
    const pendingQty = existingReservations._sum.quantity ?? 0;

    if (
      existingTickets + pendingQty + quantity >
      raffle.maxTicketsPerUser
    ) {
      throw new ValidationError(
        `Exceeds max tickets per user (${raffle.maxTicketsPerUser})`
      );
    }

    const available = raffle.totalSlots - raffle.filledSlots;
    if (quantity > available) {
      throw new ValidationError(
        `Only ${available} slot(s) remaining`
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // +10 min

    const reservation = await tx.ticketReservation.create({
      data: {
        raffleId,
        userId,
        quantity,
        status: ReservationStatus.RESERVED,
        expiresAt,
      },
    });

    await tx.raffle.update({
      where: { id: raffleId },
      data: { filledSlots: { increment: quantity } },
    });

    return reservation;
  });
}

export async function confirmReservation(
  reservationId: string,
  paymentId: string
) {
  return db.$transaction(async (tx) => {
    const reservation = await tx.ticketReservation.findUnique({
      where: { id: reservationId },
      include: { raffle: true },
    });
    if (!reservation) throw new NotFoundError("Reservation");
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new ValidationError("Reservation is not in RESERVED state");
    }
    if (reservation.expiresAt < new Date()) {
      throw new ValidationError("Reservation has expired");
    }

    // Mark reservation confirmed
    await tx.ticketReservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CONFIRMED },
    });

    // Create purchase
    const purchase = await tx.rafflePurchase.create({
      data: {
        raffleId: reservation.raffleId,
        userId: reservation.userId,
        quantity: reservation.quantity,
        amount: reservation.quantity * reservation.raffle.ticketPrice,
        paymentId,
        status: RafflePurchaseStatus.CONFIRMED,
      },
    });

    // Find next ticket number base
    const maxTicket = await tx.raffleTicket.aggregate({
      where: { raffleId: reservation.raffleId },
      _max: { ticketNumber: true },
    });
    const startNumber = (maxTicket._max.ticketNumber ?? 0) + 1;

    // Create sequential tickets
    const ticketData = Array.from({ length: reservation.quantity }, (_, i) => ({
      raffleId: reservation.raffleId,
      purchaseId: purchase.id,
      userId: reservation.userId,
      ticketNumber: startNumber + i,
    }));
    await tx.raffleTicket.createMany({ data: ticketData });

    // Auto-freeze if now full
    const updatedRaffle = await tx.raffle.findUnique({
      where: { id: reservation.raffleId },
    });
    if (
      updatedRaffle &&
      updatedRaffle.filledSlots >= updatedRaffle.totalSlots
    ) {
      await tx.raffle.update({
        where: { id: reservation.raffleId },
        data: { status: RaffleStatus.FROZEN },
      });
    }

    return purchase;
  });
}

export async function expireReservation(reservationId: string) {
  return db.$transaction(async (tx) => {
    const reservation = await tx.ticketReservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) throw new NotFoundError("Reservation");
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new ValidationError("Reservation is not in RESERVED state");
    }

    await tx.ticketReservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.EXPIRED },
    });

    await tx.raffle.update({
      where: { id: reservation.raffleId },
      data: { filledSlots: { decrement: reservation.quantity } },
    });
  });
}

export async function freezeRaffle(id: string) {
  const raffle = await db.raffle.findUnique({ where: { id } });
  if (!raffle) throw new NotFoundError("Raffle");
  assertStatus(raffle.status, RaffleStatus.ACTIVE);
  return db.raffle.update({
    where: { id },
    data: { status: RaffleStatus.FROZEN },
  });
}

export async function drawWinner(id: string) {
  const raffle = await db.raffle.findUnique({ where: { id } });
  if (!raffle) throw new NotFoundError("Raffle");
  assertStatus(raffle.status, RaffleStatus.FROZEN);

  // Transition to DRAWING
  await db.raffle.update({
    where: { id },
    data: { status: RaffleStatus.DRAWING },
  });

  const tickets = await db.raffleTicket.findMany({
    where: { raffleId: id },
    orderBy: { ticketNumber: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  if (tickets.length === 0) {
    throw new ValidationError("No tickets sold — cannot draw winner");
  }

  const randomSeedBuf = randomBytes(32);
  const randomSeed = randomSeedBuf.toString("hex");
  // Derive winner index from seed (use big-endian 32-bit from first 4 bytes mod totalTickets)
  const seedValue = randomSeedBuf.readUInt32BE(0);
  const winnerIndex = seedValue % tickets.length;
  const winnerTicket = tickets[winnerIndex];

  const updated = await db.raffle.update({
    where: { id },
    data: {
      status: RaffleStatus.COMPLETED,
      winnerId: winnerTicket.userId,
      winningTicketNumber: winnerTicket.ticketNumber,
      randomSeed,
      drawnAt: new Date(),
    },
    include: {
      winner: { select: { id: true, name: true, avatar: true } },
    },
  });

  return updated;
}

export async function cancelRaffle(id: string, reason: string) {
  return db.$transaction(async (tx) => {
    const raffle = await tx.raffle.findUnique({ where: { id } });
    if (!raffle) throw new NotFoundError("Raffle");

    if (
      raffle.status === RaffleStatus.COMPLETED ||
      raffle.status === RaffleStatus.CANCELLED
    ) {
      throw new ValidationError("Cannot cancel a completed or already cancelled raffle");
    }

    await tx.raffle.update({
      where: { id },
      data: { status: RaffleStatus.CANCELLED, cancelReason: reason },
    });

    // Refund all confirmed purchases
    await tx.rafflePurchase.updateMany({
      where: {
        raffleId: id,
        status: RafflePurchaseStatus.CONFIRMED,
      },
      data: { status: RafflePurchaseStatus.REFUNDED },
    });
  });
}

export async function getRaffleOdds(raffleId: string, userId?: string) {
  const raffle = await db.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle) throw new NotFoundError("Raffle");

  const totalTickets = await db.raffleTicket.count({ where: { raffleId } });
  const oddsPerTicket = totalTickets > 0 ? 1 / totalTickets : 0;

  if (userId) {
    const userTickets = await db.raffleTicket.count({
      where: { raffleId, userId },
    });
    const personalOdds = totalTickets > 0 ? userTickets / totalTickets : 0;
    return {
      totalTickets,
      filledSlots: raffle.filledSlots,
      userTickets,
      oddsPerTicket,
      personalOdds,
    };
  }

  return {
    totalTickets,
    filledSlots: raffle.filledSlots,
    oddsPerTicket,
  };
}

export async function getRaffleParticipants(raffleId: string) {
  const raffle = await db.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle) throw new NotFoundError("Raffle");

  const tickets = await db.raffleTicket.findMany({
    where: { raffleId },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Group by userId
  const map = new Map<string, { userId: string; name: string | null; ticketCount: number }>();
  for (const ticket of tickets) {
    const existing = map.get(ticket.userId);
    if (existing) {
      existing.ticketCount++;
    } else {
      map.set(ticket.userId, {
        userId: ticket.userId,
        name: ticket.user.name,
        ticketCount: 1,
      });
    }
  }

  const participants = Array.from(map.values());

  // Respect visibility mode
  if (raffle.visibilityMode === VisibilityMode.ANONYMOUS) {
    return participants.map((p) => ({ ...p, name: "Anonymous", userId: "" }));
  }
  if (raffle.visibilityMode === VisibilityMode.PARTIAL) {
    return participants.map((p) => ({
      ...p,
      name: p.name ? p.name.slice(0, 2) + "***" : "Anonymous",
      userId: "",
    }));
  }

  // PUBLIC_NAMES — return as-is
  return participants;
}

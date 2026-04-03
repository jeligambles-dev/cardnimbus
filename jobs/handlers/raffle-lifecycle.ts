import { Job } from "bullmq";
import { db } from "@/lib/db";
import { RaffleStatus, ReservationStatus } from "@prisma/client";
import {
  activateRaffle,
  freezeRaffle,
  drawWinner,
  cancelRaffle,
  expireReservation,
} from "@/services/raffle.service";

export interface RaffleLifecycleJobData {
  action: "lifecycle" | "expire_reservations";
}

export async function handleRaffleLifecycle(
  job: Job<RaffleLifecycleJobData>
): Promise<void> {
  const { action } = job.data;

  if (action === "expire_reservations") {
    await processExpiredReservations();
  } else {
    await processRaffleLifecycle();
  }
}

async function processRaffleLifecycle(): Promise<void> {
  const now = new Date();

  // 1. Activate scheduled raffles whose startsAt <= now
  const scheduledRaffles = await db.raffle.findMany({
    where: {
      status: RaffleStatus.SCHEDULED,
      startsAt: { lte: now },
    },
    select: { id: true },
  });

  let activated = 0;
  for (const raffle of scheduledRaffles) {
    try {
      await activateRaffle(raffle.id);
      activated++;
    } catch (err) {
      console.error(
        `[raffle-lifecycle] Failed to activate raffle ${raffle.id}:`,
        err
      );
    }
  }

  // 2. Freeze active raffles that are fully filled
  const filledRaffles = await db.raffle.findMany({
    where: {
      status: RaffleStatus.ACTIVE,
    },
    select: { id: true, filledSlots: true, totalSlots: true },
  });

  let frozen = 0;
  for (const raffle of filledRaffles) {
    if (raffle.filledSlots >= raffle.totalSlots) {
      try {
        await freezeRaffle(raffle.id);
        frozen++;
      } catch (err) {
        console.error(
          `[raffle-lifecycle] Failed to freeze full raffle ${raffle.id}:`,
          err
        );
      }
    }
  }

  // 3. Process expired active raffles
  const expiredRaffles = await db.raffle.findMany({
    where: {
      status: RaffleStatus.ACTIVE,
      endsAt: { lte: now },
    },
    select: {
      id: true,
      filledSlots: true,
      totalSlots: true,
      minFillThreshold: true,
    },
  });

  let drawnCount = 0;
  let cancelledCount = 0;

  for (const raffle of expiredRaffles) {
    const threshold = raffle.minFillThreshold * raffle.totalSlots;
    const isFilled = raffle.filledSlots >= threshold;

    if (isFilled) {
      // Freeze then draw
      try {
        await freezeRaffle(raffle.id);
        await drawWinner(raffle.id);
        drawnCount++;
      } catch (err) {
        console.error(
          `[raffle-lifecycle] Failed to draw winner for raffle ${raffle.id}:`,
          err
        );
      }
    } else {
      // Cancel — did not meet minimum fill
      try {
        await cancelRaffle(
          raffle.id,
          `Raffle ended without meeting minimum fill threshold (${Math.round(raffle.minFillThreshold * 100)}%)`
        );
        cancelledCount++;
      } catch (err) {
        console.error(
          `[raffle-lifecycle] Failed to cancel raffle ${raffle.id}:`,
          err
        );
      }
    }
  }

  console.log(
    `[raffle-lifecycle] Lifecycle run: activated=${activated}, frozen=${frozen}, drawn=${drawnCount}, cancelled=${cancelledCount}`
  );
}

async function processExpiredReservations(): Promise<void> {
  const now = new Date();

  const staleReservations = await db.ticketReservation.findMany({
    where: {
      status: ReservationStatus.RESERVED,
      expiresAt: { lte: now },
    },
    select: { id: true },
  });

  let expired = 0;
  for (const res of staleReservations) {
    try {
      await expireReservation(res.id);
      expired++;
    } catch (err) {
      console.error(
        `[raffle-lifecycle] Failed to expire reservation ${res.id}:`,
        err
      );
    }
  }

  console.log(
    `[raffle-lifecycle] Expired ${expired} stale reservation(s)`
  );
}

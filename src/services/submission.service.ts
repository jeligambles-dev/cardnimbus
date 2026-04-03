import { CardCondition, Prisma, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError, UnauthorizedError } from "@/lib/errors";

export interface CreateSubmissionInput {
  userId: string;
  cardId?: string;
  images: string[];
  description?: string;
  estimatedCondition: CardCondition;
}

const submissionWithUserCard = {
  user: true,
  card: true,
  events: { orderBy: { createdAt: "asc" as const } },
} as const;

async function logEvent(
  submissionId: string,
  type: string,
  actorId?: string,
  payload?: Prisma.InputJsonValue
) {
  return db.cardSubmissionEvent.create({
    data: {
      submissionId,
      type,
      actorId,
      payload,
    },
  });
}

export async function createSubmission(input: CreateSubmissionInput) {
  const { userId, cardId, images, description, estimatedCondition } = input;

  // Fetch TCG prices from linked card if present
  let tcgPriceNM: number | undefined;
  let tcgPriceLP: number | undefined;
  let tcgPriceMP: number | undefined;
  let tcgPriceHP: number | undefined;

  if (cardId) {
    const card = await db.card.findUnique({ where: { id: cardId } });
    if (card) {
      tcgPriceNM = card.tcgPriceNM ?? undefined;
      tcgPriceLP = card.tcgPriceLP ?? undefined;
      tcgPriceMP = card.tcgPriceMP ?? undefined;
      tcgPriceHP = card.tcgPriceHP ?? undefined;
    }
  }

  const submission = await db.cardSubmission.create({
    data: {
      userId,
      cardId,
      images,
      description,
      estimatedCondition,
      tcgPriceNM,
      tcgPriceLP,
      tcgPriceMP,
      tcgPriceHP,
      status: SubmissionStatus.SUBMITTED,
    },
    include: submissionWithUserCard,
  });

  await logEvent(submission.id, "SUBMITTED", userId);

  return submission;
}

export async function getSubmissionById(id: string) {
  const submission = await db.cardSubmission.findUnique({
    where: { id },
    include: submissionWithUserCard,
  });

  if (!submission) throw new NotFoundError("Submission");
  return submission;
}

export async function getUserSubmissions(
  userId: string,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  const [submissions, total] = await Promise.all([
    db.cardSubmission.findMany({
      where: { userId },
      include: { card: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.cardSubmission.count({ where: { userId } }),
  ]);

  return {
    submissions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminSubmissions(
  filters: { status?: SubmissionStatus; assignedAdminId?: string },
  page = 1,
  limit = 20
) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.assignedAdminId
      ? { assignedAdminId: filters.assignedAdminId }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [submissions, total] = await Promise.all([
    db.cardSubmission.findMany({
      where,
      include: { user: true, card: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.cardSubmission.count({ where }),
  ]);

  return {
    submissions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function claimSubmission(submissionId: string, adminId: string) {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new NotFoundError("Submission");
  if (submission.status !== SubmissionStatus.SUBMITTED) {
    throw new ValidationError(
      "Submission must be in SUBMITTED status to be claimed"
    );
  }
  if (submission.assignedAdminId) {
    throw new ValidationError("Submission is already claimed by an admin");
  }

  const updated = await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      assignedAdminId: adminId,
      status: SubmissionStatus.UNDER_REVIEW,
    },
    include: submissionWithUserCard,
  });

  await logEvent(submissionId, "CLAIMED", adminId, { adminId });

  return updated;
}

export async function sendOffer(
  submissionId: string,
  adminId: string,
  offeredPrice: number,
  condition: CardCondition,
  notes?: string
) {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new NotFoundError("Submission");
  if (submission.status !== SubmissionStatus.UNDER_REVIEW) {
    throw new ValidationError(
      "Submission must be UNDER_REVIEW to send an offer"
    );
  }

  const offerExpiresAt = new Date();
  offerExpiresAt.setDate(offerExpiresAt.getDate() + 7);

  const updated = await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      offeredPrice,
      status: SubmissionStatus.OFFER_SENT,
      offerExpiresAt,
      ...(notes ? { adminNotes: notes } : {}),
    },
    include: submissionWithUserCard,
  });

  await logEvent(submissionId, "OFFER_SENT", adminId, {
    offeredPrice,
    condition,
    notes,
    offerExpiresAt: offerExpiresAt.toISOString(),
  });

  return updated;
}

export async function respondToOffer(
  submissionId: string,
  userId: string,
  action: "accept" | "reject" | "counter",
  counterPrice?: number
) {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new NotFoundError("Submission");
  if (submission.userId !== userId) {
    throw new UnauthorizedError("You do not own this submission");
  }
  if (submission.status !== SubmissionStatus.OFFER_SENT) {
    throw new ValidationError("Submission must be in OFFER_SENT status");
  }

  if (action === "accept") {
    const updated = await db.cardSubmission.update({
      where: { id: submissionId },
      data: {
        finalAcceptedPrice: submission.offeredPrice,
        status: SubmissionStatus.ACCEPTED,
      },
      include: submissionWithUserCard,
    });
    await logEvent(submissionId, "OFFER_ACCEPTED", userId, {
      finalAcceptedPrice: submission.offeredPrice,
    });
    return updated;
  }

  if (action === "reject") {
    const updated = await db.cardSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.REJECTED },
      include: submissionWithUserCard,
    });
    await logEvent(submissionId, "OFFER_REJECTED", userId);
    return updated;
  }

  // counter
  if (counterPrice === undefined) {
    throw new ValidationError("counterPrice is required for counter action");
  }

  const updated = await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      counterOfferPrice: counterPrice,
      status: SubmissionStatus.OFFER_SENT,
    },
    include: submissionWithUserCard,
  });
  await logEvent(submissionId, "OFFER_COUNTERED", userId, { counterPrice });
  return updated;
}

export async function rejectSubmission(
  submissionId: string,
  adminId: string,
  reason: string
) {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new NotFoundError("Submission");

  const updated = await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      status: SubmissionStatus.REJECTED,
      rejectionReason: reason,
    },
    include: submissionWithUserCard,
  });

  await logEvent(submissionId, "REJECTED", adminId, { reason });

  return updated;
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  actorId: string
) {
  const submission = await db.cardSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new NotFoundError("Submission");

  const now = new Date();
  const updated = await db.cardSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      ...(status === SubmissionStatus.RECEIVED ? { receivedAt: now } : {}),
      ...(status === SubmissionStatus.COMPLETED ? { completedAt: now } : {}),
    },
    include: submissionWithUserCard,
  });

  await logEvent(submissionId, `STATUS_UPDATED:${status}`, actorId, {
    status,
  });

  return updated;
}

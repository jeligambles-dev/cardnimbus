import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";
import { db } from "@/lib/db";
import { createRaffle, type CreateRaffleInput } from "@/services/raffle.service";
import { VisibilityMode } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  const user = session.user as { id: string; role: string };
  if (user.role !== "ADMIN") throw new ForbiddenError("Admin access required");
  return user;
}

export async function GET() {
  try {
    await requireAdmin();
    const raffles = await db.raffle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        winner: { select: { id: true, name: true } },
        _count: { select: { tickets: true, purchases: true } },
      },
    });
    return Response.json(raffles);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => ({}));

    const {
      title,
      description,
      prizeImages,
      prizeValue,
      ticketPrice,
      totalSlots,
      maxTicketsPerUser,
      minFillThreshold,
      drawMethod,
      legalRegionRestriction,
      publishedTermsVersion,
      visibilityMode,
      startsAt,
      endsAt,
    } = body as Record<string, unknown>;

    if (!title || typeof title !== "string")
      throw new ValidationError("title is required");
    if (!prizeValue || typeof prizeValue !== "number")
      throw new ValidationError("prizeValue is required");
    if (!ticketPrice || typeof ticketPrice !== "number")
      throw new ValidationError("ticketPrice is required");
    if (!totalSlots || typeof totalSlots !== "number")
      throw new ValidationError("totalSlots is required");
    if (!startsAt) throw new ValidationError("startsAt is required");
    if (!endsAt) throw new ValidationError("endsAt is required");

    const input: CreateRaffleInput = {
      title,
      description: typeof description === "string" ? description : undefined,
      prizeImages: Array.isArray(prizeImages)
        ? (prizeImages as string[])
        : undefined,
      prizeValue,
      ticketPrice,
      totalSlots,
      maxTicketsPerUser:
        typeof maxTicketsPerUser === "number" ? maxTicketsPerUser : undefined,
      minFillThreshold:
        typeof minFillThreshold === "number" ? minFillThreshold : undefined,
      drawMethod:
        typeof drawMethod === "string" ? drawMethod : undefined,
      legalRegionRestriction:
        typeof legalRegionRestriction === "string"
          ? legalRegionRestriction
          : undefined,
      publishedTermsVersion:
        typeof publishedTermsVersion === "string"
          ? publishedTermsVersion
          : undefined,
      visibilityMode:
        typeof visibilityMode === "string" &&
        Object.values(VisibilityMode).includes(visibilityMode as VisibilityMode)
          ? (visibilityMode as VisibilityMode)
          : undefined,
      startsAt: new Date(startsAt as string),
      endsAt: new Date(endsAt as string),
    };

    const raffle = await createRaffle(admin.id, input);
    return Response.json(raffle, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

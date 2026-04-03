import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { createCollection } from "@/services/mystery.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "ADMIN")
    throw new UnauthorizedError("Forbidden");
  return session;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));

    const [collections, total] = await Promise.all([
      db.mysteryCollection.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          versions: {
            orderBy: { version: "desc" },
            take: 1,
            select: {
              id: true,
              version: true,
              status: true,
              stockRemaining: true,
              guaranteedMinValue: true,
              effectiveFrom: true,
            },
          },
        },
      }),
      db.mysteryCollection.count(),
    ]);

    return Response.json({ collections, total, page, limit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const adminId = (session.user as { id?: string }).id ?? "";

    const body = await request.json();
    const { name, tier, price } = body;

    if (!name || typeof name !== "string")
      throw new ValidationError("Name is required");
    if (!tier || typeof tier !== "string")
      throw new ValidationError("Tier is required");
    if (typeof price !== "number" || price < 0)
      throw new ValidationError("Valid price is required");

    const collection = await createCollection(adminId, { name, tier, price });

    await logAudit({
      actorType: "ADMIN",
      actorId: adminId,
      action: "mystery_collection.create",
      targetType: "MysteryCollection",
      targetId: collection.id,
      details: { name: collection.name, tier: collection.tier },
    });

    return Response.json(collection, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

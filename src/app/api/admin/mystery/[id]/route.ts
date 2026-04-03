import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  createVersion,
  activateVersion,
} from "@/services/mystery.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "ADMIN")
    throw new UnauthorizedError("Forbidden");
  return session;
}

/**
 * PUT /api/admin/mystery/[id]
 *
 * Body shapes:
 *   { action: "create_version", pullRates, guaranteedMinValue, poolItems }
 *   { action: "activate_version", versionId }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const adminId = (session.user as { id?: string }).id ?? "";
    const { id: collectionId } = await params;

    const body = await request.json();
    const { action } = body;

    if (action === "create_version") {
      const { pullRates, guaranteedMinValue, poolItems } = body;

      if (!Array.isArray(pullRates) || pullRates.length === 0) {
        throw new ValidationError("pullRates must be a non-empty array");
      }
      if (typeof guaranteedMinValue !== "number") {
        throw new ValidationError("guaranteedMinValue must be a number");
      }
      if (!Array.isArray(poolItems) || poolItems.length === 0) {
        throw new ValidationError("poolItems must be a non-empty array");
      }

      const version = await createVersion(collectionId, adminId, {
        pullRates,
        guaranteedMinValue,
        poolItems,
      });

      await logAudit({
        actorType: "ADMIN",
        actorId: adminId,
        action: "mystery_collection.create_version",
        targetType: "MysteryCollectionVersion",
        targetId: version.id,
        details: { collectionId, version: version.version },
      });

      return Response.json(version, { status: 201 });
    }

    if (action === "activate_version") {
      const { versionId } = body;
      if (!versionId || typeof versionId !== "string") {
        throw new ValidationError("versionId is required");
      }

      const collection = await activateVersion(versionId, adminId);

      await logAudit({
        actorType: "ADMIN",
        actorId: adminId,
        action: "mystery_collection.activate_version",
        targetType: "MysteryCollection",
        targetId: collection.id,
        details: { versionId },
      });

      return Response.json(collection);
    }

    throw new ValidationError(
      `Unknown action "${action}". Use "create_version" or "activate_version".`
    );
  } catch (error) {
    return errorResponse(error);
  }
}

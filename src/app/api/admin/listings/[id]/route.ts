import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { logAudit } from "@/lib/audit";
import {
  approveListing,
  rejectListing,
  suspendListing,
} from "@/services/listing.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN")
    throw new UnauthorizedError("Forbidden");
  return session.user as { id: string };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body.action !== "string") {
      throw new ValidationError("action is required");
    }

    let listing;

    switch (body.action) {
      case "approve":
        listing = await approveListing(id, admin.id);
        await logAudit({
          actorType: "ADMIN",
          actorId: admin.id,
          action: "listing.approve",
          targetType: "Listing",
          targetId: id,
        });
        break;

      case "reject": {
        const reason =
          typeof body.reason === "string" && body.reason.trim()
            ? body.reason.trim()
            : undefined;
        if (!reason) throw new ValidationError("reason is required for rejection");
        listing = await rejectListing(id, admin.id, reason);
        await logAudit({
          actorType: "ADMIN",
          actorId: admin.id,
          action: "listing.reject",
          targetType: "Listing",
          targetId: id,
          details: { reason },
        });
        break;
      }

      case "suspend": {
        const reason =
          typeof body.reason === "string" && body.reason.trim()
            ? body.reason.trim()
            : undefined;
        if (!reason) throw new ValidationError("reason is required for suspension");
        listing = await suspendListing(id, admin.id, reason);
        await logAudit({
          actorType: "ADMIN",
          actorId: admin.id,
          action: "listing.suspend",
          targetType: "Listing",
          targetId: id,
          details: { reason },
        });
        break;
      }

      default:
        throw new ValidationError(
          `Unknown action: ${body.action}. Valid actions: approve, reject, suspend`
        );
    }

    return Response.json(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

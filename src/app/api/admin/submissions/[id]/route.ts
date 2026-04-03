import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  getSubmissionById,
  claimSubmission,
  sendOffer,
  rejectSubmission,
  updateSubmissionStatus,
} from "@/services/submission.service";
import { CardCondition, SubmissionStatus } from "@prisma/client";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN") throw new UnauthorizedError("Forbidden");
  return session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const submission = await getSubmissionById(id);
    return Response.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const { action, ...rest } = body;

    if (!action) throw new ValidationError("action is required");

    let result;

    switch (action) {
      case "claim": {
        result = await claimSubmission(id, session.user.id!);
        await logAudit({
          actorType: "USER",
          actorId: session.user.id!,
          action: "submission.claim",
          targetType: "CardSubmission",
          targetId: id,
        });
        break;
      }

      case "offer": {
        const { offeredPrice, condition, notes } = rest;
        if (offeredPrice === undefined) {
          throw new ValidationError("offeredPrice is required for offer action");
        }
        if (!condition) {
          throw new ValidationError("condition is required for offer action");
        }
        if (!(condition in CardCondition)) {
          throw new ValidationError("Invalid condition value");
        }
        result = await sendOffer(
          id,
          session.user.id!,
          Number(offeredPrice),
          condition as CardCondition,
          notes
        );
        await logAudit({
          actorType: "USER",
          actorId: session.user.id!,
          action: "submission.offer",
          targetType: "CardSubmission",
          targetId: id,
          details: { offeredPrice, condition, notes },
        });
        break;
      }

      case "reject": {
        const { reason } = rest;
        if (!reason) {
          throw new ValidationError("reason is required for reject action");
        }
        result = await rejectSubmission(id, session.user.id!, reason);
        await logAudit({
          actorType: "USER",
          actorId: session.user.id!,
          action: "submission.reject",
          targetType: "CardSubmission",
          targetId: id,
          details: { reason },
        });
        break;
      }

      case "update_status": {
        const { status } = rest;
        if (!status) {
          throw new ValidationError("status is required for update_status action");
        }
        if (!(status in SubmissionStatus)) {
          throw new ValidationError("Invalid status value");
        }
        result = await updateSubmissionStatus(
          id,
          status as SubmissionStatus,
          session.user.id!
        );
        await logAudit({
          actorType: "USER",
          actorId: session.user.id!,
          action: "submission.update_status",
          targetType: "CardSubmission",
          targetId: id,
          details: { status },
        });
        break;
      }

      default:
        throw new ValidationError(
          `Unknown action: ${action}. Must be one of: claim, offer, reject, update_status`
        );
    }

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

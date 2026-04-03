import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";
import {
  scheduleRaffle,
  activateRaffle,
  freezeRaffle,
  drawWinner,
  cancelRaffle,
} from "@/services/raffle.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  const user = session.user as { id: string; role: string };
  if (user.role !== "ADMIN") throw new ForbiddenError("Admin access required");
  return user;
}

type Action = "schedule" | "activate" | "freeze" | "draw" | "cancel";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action as Action | undefined;

    if (!action) throw new ValidationError("action is required");

    let result: unknown;
    switch (action) {
      case "schedule":
        result = await scheduleRaffle(id);
        break;
      case "activate":
        result = await activateRaffle(id);
        break;
      case "freeze":
        result = await freezeRaffle(id);
        break;
      case "draw":
        result = await drawWinner(id);
        break;
      case "cancel": {
        const reason =
          typeof body.reason === "string" ? body.reason : "Cancelled by admin";
        result = await cancelRaffle(id, reason);
        break;
      }
      default:
        throw new ValidationError(
          "action must be one of: schedule, activate, freeze, draw, cancel"
        );
    }

    return Response.json(result ?? { success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

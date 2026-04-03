import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { resolveDispute, escalateDispute } from "@/services/dispute.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN") throw new UnauthorizedError("Forbidden");
  return session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const adminId = (session.user as any).id as string;

    const { id } = await params;
    const body = await request.json();
    const { action, resolution, notes } = body;

    if (!action) throw new ValidationError("action is required");

    let result;

    switch (action) {
      case "resolve": {
        if (!resolution || (resolution !== "buyer" && resolution !== "seller")) {
          throw new ValidationError('resolution must be "buyer" or "seller"');
        }
        result = await resolveDispute(id, adminId, resolution, notes);
        break;
      }

      case "escalate": {
        result = await escalateDispute(id, adminId);
        break;
      }

      default:
        throw new ValidationError(
          `Unknown action: ${action}. Must be one of: resolve, escalate`
        );
    }

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

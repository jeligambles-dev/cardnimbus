import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { markNotificationRead } from "@/services/notification-v2.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    await markNotificationRead(id, session.user.id);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

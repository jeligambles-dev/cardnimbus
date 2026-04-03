import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { markAllRead } from "@/services/notification-v2.service";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    await markAllRead(session.user.id);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
